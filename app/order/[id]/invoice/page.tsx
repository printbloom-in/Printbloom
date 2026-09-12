import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase-server"
import { notFound, redirect } from "next/navigation"
import { InvoiceActions } from "@/components/profile/invoice-actions"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  // 1. Security Check: Explicit getUser() check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/admin/login")
  }

  // Fetch the order using admin client to bypass RLS
  // (Authorization is enforced manually below — owner or admin only)
  const supabaseAdmin = await createSupabaseAdminClient()
  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select(`
      *,
      order_items (
        *
      )
    `)
    .eq("id", id)
    .single()

  if (error || !order) {
    console.error("[Invoice] Order fetch error:", JSON.stringify(error), "| id:", id)
    return (
      <div className="p-8 text-center font-mono">
        <h1>Error: Invoice not found.</h1>
      </div>
    )
  }

  // Fetch address separately to avoid PostgREST relationship errors
  let addr = null
  if (order.shipping_address_id) {
    const { data: addressData } = await supabaseAdmin
      .from("addresses")
      .select("*")
      .eq("id", order.shipping_address_id)
      .single()
    addr = addressData
  }

  // Authorization check: Must be owner OR admin
  const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",").map(e => e.trim().toLowerCase()) : [];
  const isAdmin = adminEmails.includes(user.email?.toLowerCase() || "")
  if (order.user_id !== user.id && !isAdmin) {
    return (
      <div className="p-8 text-center font-mono">
        <h1>Error: Access denied.</h1>
      </div>
    )
  }

  // Format date
  const orderDate = formatDate(order.created_at)

  // Calculate totals
  const subtotal = order.order_items?.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0) || order.total_amount
  const hasOnlyDigitalItems = order.order_items?.length > 0 && order.order_items.every((item: any) => item.product_name?.includes('Softcopy Magazine'))
  const shipping = hasOnlyDigitalItems ? 0 : 90
  const pointsUsed = order.points_used || 0;
  const discountAmount = Math.max(0, subtotal + shipping - pointsUsed - order.total_amount);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 font-sans">
      <div className="bg-white w-full max-w-3xl shadow-sm border border-[#E0D9CF] p-12 print:shadow-none print:border-none print:p-0">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 sm:gap-0 mb-8 sm:mb-12">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#221F1C] tracking-tight mb-2 uppercase">PrintBloom</h1>
            <p className="text-sm text-[#6B6259]">Email: printbloom.in@gmail.com</p>
            <p className="text-sm text-[#6B6259]">WhatsApp: +91 8691094045</p>
            <p className="text-sm text-[#6B6259]">Instagram: @printbloom.in</p>
            {/* <p className="text-sm text-[#6B6259]">Website: printbloom.in</p> */}
          </div>
          <div className="text-left sm:text-right">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#221F1C] mb-1">INVOICE</h2>
            <p className="font-mono text-sm text-[#6B6259]">Invoice No.: {order.invoice_no || `PB-${order.id.split('-')[0].toUpperCase()}`}</p>
            <p className="text-sm text-[#6B6259] mt-1">Order Date: {orderDate}</p>
            <p className="text-sm text-[#6B6259] mt-1">Payment Status: {order.payment_status?.toUpperCase() || 'PAID'}</p>
            <p className="text-sm text-[#6B6259]">Payment Method: UPI</p>
          </div>
        </div>

        {/* Addresses */}
        <div className="flex justify-between mb-12 border-t border-[#E0D9CF] pt-8">
          <div>
            <h3 className="text-xs font-semibold text-[#9A8F85] uppercase tracking-wider mb-3">Customer / Shipped To</h3>
            <p className="font-medium text-[#221F1C]">{addr?.full_name || order.customer_name || "Customer"}</p>
            <p className="text-sm text-[#6B6259]">{addr?.address_line_1 || "Address pending"}</p>
            {addr?.address_line_2 && <p className="text-sm text-[#6B6259]">{addr.address_line_2}</p>}
            <p className="text-sm text-[#6B6259]">{addr?.city ? `${addr.city}, ${addr.state} ${addr.pincode}` : ""}</p>
            <p className="text-sm text-[#6B6259] mt-1">{addr?.phone_number ? `Phone: ${addr.phone_number}` : (order.customer_phone ? `Phone: ${order.customer_phone}` : "")}</p>
            {order.user_email && <p className="text-sm text-[#6B6259]">Email: {order.user_email}</p>}
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-12">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E0D9CF]">
                <th className="py-3 text-sm font-semibold text-[#221F1C]">ITEM</th>
                <th className="py-3 text-sm font-semibold text-[#221F1C] text-center">QTY</th>
                <th className="py-3 text-sm font-semibold text-[#221F1C] text-right">UNIT PRICE</th>
                <th className="py-3 text-sm font-semibold text-[#221F1C] text-right">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items?.map((item: any, i: number) => {
                // Parse variant from product_name (e.g. "Custom Magazine — A5, 8 Pages")
                const [baseName, variant] = item.product_name ? item.product_name.split(' — ') : [item.product_id, null];
                return (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-4 text-sm text-[#221F1C]">
                      {baseName}
                      {variant && <span className="block text-xs text-[#6B6259] mt-0.5">{variant}</span>}
                    </td>
                    <td className="py-4 text-sm text-[#6B6259] text-center">{item.quantity}</td>
                    <td className="py-4 text-sm text-[#6B6259] text-right">₹{item.price || 0}</td>
                    <td className="py-4 text-sm text-[#221F1C] text-right">₹{(item.price || 0) * item.quantity}</td>
                  </tr>
                )
              })}
              {(!order.order_items || order.order_items.length === 0) && (
                <tr className="border-b border-gray-100">
                  <td className="py-4 text-sm text-[#221F1C]" colSpan={4}>Order items processing...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end border-b border-[#E0D9CF] pb-6 mb-6">
          <div className="w-full sm:w-1/2">
            <div className="flex justify-between py-2 text-sm text-[#6B6259]">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            {discountAmount > 0 ? (
              <div className="flex justify-between py-2 text-sm text-[#6B6259]">
                <span>Discount {order.applied_promo ? `(${order.applied_promo})` : ''}</span>
                <span>-₹{discountAmount}</span>
              </div>
            ) : null}

            <div className="flex justify-between py-2 text-sm text-[#6B6259]">
              <span>Shipping</span>
              <span>{shipping > 0 ? `₹${shipping}` : 'Free'}</span>
            </div>
            {pointsUsed > 0 && (
              <div className="flex justify-between py-2 text-sm text-[#DFBC94]">
                <span>Wallet Points Used</span>
                <span>-₹{pointsUsed}</span>
              </div>
            )}
            <div className="flex justify-between pt-4 mt-2 border-t border-dashed border-[#E0D9CF] text-base font-semibold text-[#221F1C]">
              <span>TOTAL PAID</span>
              <span>₹{order.total_amount}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-[#221F1C] space-y-4">
          <div>
            <p>Thank you for choosing PrintBloom 🤍</p>
            <p>Your memories mean a lot to us.</p>
          </div>
          
          <div className="text-[#6B6259] text-xs">
            <p className="font-medium text-[#221F1C] mb-1">Questions about your order?</p>
            <p>WhatsApp: +91 8691094045 | Email: printbloom.in@gmail.com</p>
          </div>

          <p className="text-xs text-[#9A8F85] mt-8 pt-4">
            <Link href="/policies/cancellation" className="hover:underline">
              *Personalised products are subject to PrintBloom's shipping, cancellation and refund policies.
            </Link>
          </p>
        </div>

      </div>

      <InvoiceActions />
    </div>
  )
}
