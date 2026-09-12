import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createSupabaseAdminClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('RAZORPAY_WEBHOOK_SECRET not set');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    if (eventType !== 'payment.captured') {
      return NextResponse.json({ received: true });
    }

    const payment = event.payload && event.payload.payment && event.payload.payment.entity;
    if (!payment) {
      return NextResponse.json({ received: true });
    }

    const razorpay_payment_id: string = payment.id;
    const razorpay_order_id: string = payment.order_id;

    if (!razorpay_order_id) {
      return NextResponse.json({ received: true });
    }

    const supabaseAdmin = await createSupabaseAdminClient();

    const { data: existingOrder, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
      .single();

    if (fetchError || !existingOrder) {
      console.error('Webhook: Order not found:', razorpay_order_id);
      return NextResponse.json({ received: true });
    }

    if (existingOrder.payment_status === 'paid') {
      return NextResponse.json({ received: true, message: 'Already processed' });
    }

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        payment_status: 'paid',
        razorpay_payment_id: razorpay_payment_id,
      })
      .eq('id', existingOrder.id);

    if (updateError) {
      console.error('Webhook: DB update failed:', updateError);
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
    }

    console.log('Webhook: Order PAID ->', existingOrder.id, razorpay_payment_id);

    try {
      if (existingOrder.total_amount > 0) {
        await supabaseAdmin.from('reward_points').insert({
          user_id: existingOrder.user_id,
          points: 20,
          transaction_type: 'earned',
          description: 'Order Placed (Order #' + existingOrder.id.split('-')[0] + ')',
        });

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
              await supabaseAdmin.rpc('grant_referral_bonus', {
                referrer_uuid: profile.referred_by,
              });
            }
          }
        }
      }

      if (existingOrder.points_used && existingOrder.points_used > 0) {
        await supabaseAdmin.from('reward_points').insert({
          user_id: existingOrder.user_id,
          points: existingOrder.points_used,
          transaction_type: 'redeemed',
          description: 'Used on Order #' + existingOrder.id.split('-')[0],
        });
      }

      if (existingOrder.applied_promo) {
        await supabaseAdmin.rpc('increment_promo_usage', {
          promo_code_param: existingOrder.applied_promo,
        });
      }
    } catch (err) {
      console.error('Webhook: Post-payment logic error:', err);
    }

    return NextResponse.json({ received: true, success: true });

  } catch (error) {
    console.error('Razorpay Webhook error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}