import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createSupabaseAdminClient } from '@/lib/supabase-server';

// Razorpay sends webhooks as raw text body — do NOT use NextRequest.json() here
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      console.error('Razorpay Webhook: Missing X-Razorpay-Signature header');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook authenticity using WEBHOOK_SECRET (different from API key secret)
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Razorpay Webhook: RAZORPAY_WEBHOOK_SECRET env var not set!');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Razorpay Webhook: Signature mismatch — possible spoofed request');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType: string = event.event;

    console.log('Razorpay Webhook: Received event ->', eventType);

    // Only process payment.captured (final confirmed state)
    if (eventType !== 'payment.captured') {
      return NextResponse.json({ received: true, message: 'Event ignored: ' + eventType });
    }

    const payment = event.payload?.payment?.entity;
    if (!payment) {
      console.error('Razorpay Webhook: No payment entity in payload');
      return NextResponse.json({ received: true });
    }

    const razorpay_payment_id: string = payment.id;
    const razorpay_order_id: string = payment.order_id;

    if (!razorpay_order_id) {
      console.error('Razorpay Webhook: No order_id on payment', razorpay_payment_id);
      return NextResponse.json({ received: true });
    }

    const supabaseAdmin = await createSupabaseAdminClient();

    // Find our pending order by Razorpay order ID
    const { data: existingOrder, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
      .single();

    if (fetchError || !existingOrder) {
      console.error('Razorpay Webhook: Order not found for razorpay_order_id:', razorpay_order_id, fetchError);
      return NextResponse.json({ received: true });
    }

    // Idempotency: If frontend handler already processed it, skip
    if (existingOrder.payment_status === 'paid') {
      console.log('Razorpay Webhook: Order already PAID, skipping ->', existingOrder.id);
      return NextResponse.json({ received: true, message: 'Already processed' });
    }

    // Mark order as PAID
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        payment_status: 'paid',
        razorpay_payment_id: razorpay_payment_id,
      })
      .eq('id', existingOrder.id);

    if (updateError) {
      // Return 500 so Razorpay retries the webhook
      console.error('Razorpay Webhook: DB update failed:', updateError);
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
    }

    console.log('Razorpay Webhook: Order PAID successfully ->', existingOrder.id, razorpay_payment_id);

    // Post-payment logic — wrapped so failures don't break the acknowledgement
    try {
      if (existingOrder.total_amount > 0) {

        // Award 20 loyalty points to buyer
        const { error: pointsError } = await supabaseAdmin
          .from('reward_points')
          .insert({
            user_id: existingOrder.user_id,
            points: 20,
            transaction_type: 'earned',
            description: 'Order Placed (Order #' + existingOrder.id.split('-')[0] + ')',
          });
        if (pointsError) console.error('Webhook: Buyer points failed:', pointsError);

        // Referral bonus for orders >= Rs 250
        if (existingOrder.total_amount >= 250) {
          const { count, error: countError } = await supabaseAdmin
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', existingOrder.user_id)
            .eq('payment_status', 'paid')
            .neq('id', existingOrder.id);

          if (!countError && count === 0) {
            const { data: profile } = await supabaseAdmin
              .from('profiles')
              .select('referred_by')
              .eq('id', existingOrder.user_id)
              .single();

            if (profile && profile.referred_by) {
              const { error: rpcError } = await supabaseAdmin.rpc('grant_referral_bonus', {
                referrer_uuid: profile.referred_by,
              });
              if (rpcError) console.error('Webhook: Referral bonus failed:', rpcError);
            }
          }
        }
      }

      // Deduct redeemed points
      if (existingOrder.points_used && existingOrder.points_used > 0) {
        const { error: deductError } = await supabaseAdmin
          .from('reward_points')
          .insert({
            user_id: existingOrder.user_id,
            points: existingOrder.points_used,
            transaction_type: 'redeemed',
            description: 'Used on Order #' + existingOrder.id.split('-')[0],
          });
        if (deductError) console.error('Webhook: Points deduction failed:', deductError);
      }

      // Increment promo code usage counter
      if (existingOrder.applied_promo) {
        const { error: promoError } = await supabaseAdmin.rpc('increment_promo_usage', {
          promo_code_param: existingOrder.applied_promo,
        });
        if (promoError) console.error('Webhook: Promo usage increment failed:', promoError);
      }

    } catch (err) {
      console.error('Webhook: Post-payment logic error:', err);
    }

    return NextResponse.json({ received: true, success: true });

  } catch (error) {
    console.error('Razorpay Webhook: Unhandled error:', error);
    // Return 500 so Razorpay retries
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
