import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature
    } = await request.json();

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Create an admin client to bypass RLS for updating securely
      const supabaseAdmin = await createSupabaseAdminClient();
      
      // 1. Fetch the existing pending order using the razorpay_order_id
      const { data: existingOrder, error: fetchError } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('razorpay_order_id', razorpay_order_id)
        .single();
        
      if (fetchError || !existingOrder) {
        console.error("Order not found for verification:", fetchError);
        return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
      }

      // Check if it's already paid (Idempotency)
      if (existingOrder.payment_status === 'paid') {
        return NextResponse.json({ success: true, message: "Payment already verified", orderId: existingOrder.id });
      }

      // 2. Update the order to 'paid' and store the payment ID
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({ 
          payment_status: 'paid',
          razorpay_payment_id: razorpay_payment_id
        })
        .eq('id', existingOrder.id);

      if (updateError) {
        console.error("Supabase update order error:", updateError);
        return NextResponse.json({ success: false, message: "DB Error: " + updateError.message }, { status: 500 });
      }

      // 3. Reward Points & Referral Logic
      try {
        if (existingOrder.total_amount > 0) {
          // A. Buyer points (20 points)
          const { error: pointsError } = await supabaseAdmin
            .from('reward_points')
            .insert({
              user_id: existingOrder.user_id,
              points: 20,
              transaction_type: 'earned',
              description: `Order Placed (Order #${existingOrder.id.split('-')[0]})`
            });
            
          if (pointsError) console.error("Failed to award buyer points:", pointsError);

          // B. Referral logic (40 points to referrer)
          // Minimum order value threshold for referral bonus: ₹250
          if (existingOrder.total_amount >= 250) {
            // Check if this is the user's FIRST paid order (excluding the current one)
            const { count, error: countError } = await supabaseAdmin
              .from('orders')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', existingOrder.user_id)
              .eq('payment_status', 'paid')
              .neq('id', existingOrder.id);
              
            if (!countError && count === 0) {
              // First paid order! Find if they were referred
              const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('referred_by')
                .eq('id', existingOrder.user_id)
                .single();
                
              if (profile && profile.referred_by) {
                const { error: rpcError } = await supabaseAdmin.rpc('grant_referral_bonus', {
                  referrer_uuid: profile.referred_by
                });
                if (rpcError) console.error("Failed to award referral points via RPC:", rpcError);
              }
            }
          }
        }

        // 4. Points Redemption Deduction
        if (existingOrder.points_used && existingOrder.points_used > 0) {
          const { error: deductError } = await supabaseAdmin
            .from('reward_points')
            .insert({
              user_id: existingOrder.user_id,
              points: existingOrder.points_used,
              transaction_type: 'redeemed',
              description: `Used on Order #${existingOrder.id.split('-')[0]}`
            });
            
          if (deductError) console.error("Failed to deduct redeemed points:", deductError);
        }

        // 5. Promo Code Usage Tracking
        if (existingOrder.applied_promo) {
          const { error: promoError } = await supabaseAdmin.rpc('increment_promo_usage', {
            promo_code_param: existingOrder.applied_promo
          });
          
          if (promoError) console.error("Failed to increment promo usage:", promoError);
        }
      } catch (err) {
        console.error("Error in points/referral/redemption logic:", err);
      }

      // SEND ORDER CONFIRMED EMAIL
      try {
        const { sendTransactionalEmail } = await import("@/lib/email");
        const { data: userRecord } = await supabaseAdmin.auth.admin.getUserById(existingOrder.user_id);
        const customerEmail = userRecord?.user?.email;
        
        let customerName = "PrintBloom Customer";
        if (existingOrder.shipping_address_id) {
          const { data: addr } = await supabaseAdmin.from("addresses").select("full_name").eq("id", existingOrder.shipping_address_id).single();
          if (addr) customerName = addr.full_name;
        }

        if (customerEmail) {
          const shortOrderId = "PB-" + existingOrder.id.split("-")[0].toUpperCase();
          const orderDate = new Date(existingOrder.created_at || new Date()).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
          });
          
          sendTransactionalEmail({
            orderId: existingOrder.id,
            emailType: "ORDER_CONFIRMED",
            customerEmail,
            customerName,
            orderNumber: shortOrderId,
            orderDate,
            orderUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/profile?tab=orders`
          }); // Not awaiting so it doesn't block response
        }
      } catch (err) {
        console.error("Failed to trigger Order Confirmed email:", err);
      }

      return NextResponse.json({ success: true, message: "Payment verified successfully", orderId: existingOrder.id });
    } else {
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
    }
  } catch (error) {
    console.error("Payment verification failed:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
