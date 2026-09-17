import { Resend } from "resend";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

const resend = new Resend(process.env.RESEND_API_KEY || "fallback_key");

export const EMAIL_TEMPLATE_IDS = {
  ORDER_CONFIRMED: process.env.RESEND_TEMPLATE_ORDER_CONFIRMED || "REPLACE_ME",
  ORDER_IN_PRODUCTION: process.env.RESEND_TEMPLATE_ORDER_IN_PRODUCTION || "REPLACE_ME",
  ORDER_SHIPPED: process.env.RESEND_TEMPLATE_ORDER_SHIPPED || "REPLACE_ME",
  ORDER_DELIVERED: process.env.RESEND_TEMPLATE_ORDER_DELIVERED || "REPLACE_ME",
};

export async function sendTransactionalEmail({
  orderId,
  emailType,
  customerEmail,
  customerName,
  orderNumber,
  orderDate,
  orderUrl = "https://www.printbloom.in"
}: {
  orderId: string;
  emailType: keyof typeof EMAIL_TEMPLATE_IDS;
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  orderDate?: string;
  orderUrl?: string;
}) {
  try {
    const supabaseAdmin = await createSupabaseAdminClient();
    const { data: existingEvent } = await supabaseAdmin
      .from("order_email_events")
      .select("id")
      .eq("order_id", orderId)
      .eq("email_type", emailType)
      .single();

    if (existingEvent) {
      console.log(`[Resend] Email ${emailType} already sent for order ${orderId}. Skipping.`);
      return { success: true, skipped: true };
    }

    const variables: Record<string, string> = {
      CUSTOMER_NAME: customerName || "there",
      ORDER_NUMBER: orderNumber || "PB-000000",
    };

    if (emailType === "ORDER_CONFIRMED") {
      variables.ORDER_DATE = orderDate || new Date().toLocaleDateString();
      variables.ORDER_URL = orderUrl;
    }

    // Skip if template IDs not configured yet
    if (EMAIL_TEMPLATE_IDS[emailType] === "REPLACE_ME") {
      console.log("[Resend] Template IDs not configured yet, skipping actual send.");
      return { success: false, error: "Templates not configured" };
    }

    const { data, error } = await resend.emails.send({
      from: "PrintBloom <orders@printbloom.in>",
      to: customerEmail,
      bcc: ["printbloom.in@gmail.com"],
      template: {
        id: EMAIL_TEMPLATE_IDS[emailType],
        variables,
      },
    });

    if (error) {
      console.error(`[Resend] Failed to send ${emailType} for order ${orderId}:`, error);
      return { success: false, error };
    }

    await supabaseAdmin.from("order_email_events").insert({
      order_id: orderId,
      email_type: emailType,
      status: "sent"
    });

    console.log(`[Resend] Successfully sent ${emailType} for order ${orderId}`);
    return { success: true, data };

  } catch (err) {
    console.error(`[Resend] Exception in sendTransactionalEmail for ${emailType}:`, err);
    return { success: false, error: err };
  }
}

export async function syncMarketingContact(email: string, firstName: string, lastName: string = "") {
  if (!email) return;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) {
    console.log("[Resend] No audience ID configured, skipping marketing sync.");
    return;
  }
  try {
    const { data, error } = await resend.contacts.create({
      email,
      firstName,
      lastName,
      unsubscribed: false,
      audienceId,
    });
    if (error) console.error(`[Resend] Failed to sync marketing contact ${email}:`, error);
    else console.log(`[Resend] Successfully synced marketing contact ${email}`);
  } catch (err) {
    console.error(`[Resend] Exception syncing marketing contact ${email}:`, err);
  }
}
