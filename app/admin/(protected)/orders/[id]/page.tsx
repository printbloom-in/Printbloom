import { getAdminOrderById, updateOrderStatus, updateImagesStatus } from "@/app/actions/admin-orders"
import { getFlipbooksByEnquiry } from "@/app/actions/flipbooks"
import { notFound } from "next/navigation"
import NextLink from "next/link"
import { ArrowLeft, Download, Copy, Image as ImageIcon } from "lucide-react"
import { OrderCustomizationClient } from "@/components/admin/order-customization-client"
import { formatDateTime } from "@/lib/utils"

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [order, flipbooks] = await Promise.all([
    getAdminOrderById(id),
    getFlipbooksByEnquiry(id)
  ])

  if (!order) {
    return notFound()
  }

  const handleUpdateStatus = async (formData: FormData) => {
    "use server"
    const status = formData.get("status") as string
    await updateOrderStatus(order.id, status)
  }

  const handleUpdateImagesStatus = async (formData: FormData) => {
    "use server"
    const images_status = formData.get("images_status") as string
    await updateImagesStatus(order.id, images_status)
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <a href="/admin/orders" className="inline-flex items-center gap-2 text-sm font-medium text-[#9A8F85] hover:text-[#DFBC94] transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </a>

      {/* Flipbooks Section */}
      {flipbooks.length > 0 && (
        <div className="mb-8 p-4 bg-[#FBF6EE] border border-[#E0D9CF] rounded-sm">
          <h3 className="text-sm font-serif text-[#221F1C] mb-3">Digital Flipbooks Generated</h3>
          <div className="flex flex-col gap-2">
            {flipbooks.map((fb) => (
              <div key={fb.id} className="flex justify-between items-center bg-white p-3 border border-[#E0D9CF] rounded-sm">
                <span className="font-medium text-sm text-[#221F1C]">{fb.title}</span>
                <a 
                  href={`/flipbook/${fb.id}`} 
                  target="_blank" 
                  className="text-xs text-white bg-[#DFBC94] px-3 py-1.5 rounded-sm hover:bg-[#A5411F]"
                >
                  View Flipbook ↗
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl text-[#221F1C] mb-2 uppercase">Order #{order.id.split('-')[0]}</h1>
          <p className="text-[#6B6259]">Placed on {formatDateTime(order.created_at)}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Images Status Updater */}
          <form action={handleUpdateImagesStatus} className="flex items-center gap-2 bg-white p-2 rounded-full border border-[#E0D9CF] shadow-sm">
            <ImageIcon className="w-4 h-4 text-[#9A8F85] ml-2" />
            <select 
              name="images_status" 
              defaultValue={order.images_status || 'complete'}
              className={`text-sm font-medium bg-transparent border-none focus:ring-0 cursor-pointer ${order.images_status === 'partial' ? 'text-amber-600' : 'text-green-600'}`}
            >
              <option value="partial">Partial Photos</option>
              <option value="complete">All Photos Received</option>
            </select>
            <button type="submit" className="bg-[#F5F0E8] text-[#221F1C] text-xs font-medium px-4 py-2 rounded-full hover:bg-[#E0D9CF] transition-colors">
              Save
            </button>
          </form>

          {/* Status Updater */}
          <form action={handleUpdateStatus} className="flex items-center gap-3 bg-white p-2 rounded-full border border-[#E0D9CF] shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9A8F85] ml-3">Order Status</span>
            <select 
              name="status" 
              defaultValue={order.status}
              className="text-sm font-medium bg-transparent border-none focus:ring-0 cursor-pointer text-[#221F1C]"
            >
              <option value="received">Order Received</option>
              <option value="designing">Designing</option>
              <option value="printing">Printing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="processing">Processing (Legacy)</option>
              <option value="pending">Pending (Legacy)</option>
            </select>
            <button type="submit" className="bg-[#DFBC94] text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-[#c9a67f] transition-colors">
              Update
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Items and Customizations */}
        <div className="lg:col-span-2 space-y-8">
          {order.order_items.map((item: any) => (
            <div key={item.id} className="bg-white border border-[#E0D9CF] rounded-sm overflow-hidden">
              <div className="p-5 border-b border-[#E0D9CF] bg-white flex gap-5 items-center">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.product_name} className="w-20 h-20 object-cover rounded-sm shadow-sm border border-[#E0D9CF]/50" />
                ) : (
                  <div className="w-20 h-20 bg-[#F5F0E8] rounded-sm flex items-center justify-center text-xs text-[#9A8F85] border border-[#E0D9CF]/50">No img</div>
                )}
                <div>
                  <h3 className="font-medium text-[#221F1C]">{item.product_name}</h3>
                  <p className="text-sm text-[#6B6259]">Qty: {item.quantity} × ₹{item.price}</p>
                </div>
              </div>

              {/* Customization Grid */}
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-[#221F1C]">Customer's Uploaded Photos</h4>
                  <NextLink 
                    href={`/admin/orders/${order.id}/create-flipbook`}
                    className="bg-[#221F1C] text-white hover:bg-black px-3 py-1.5 rounded-sm text-xs font-medium transition-colors flex items-center gap-2"
                  >
                    <span>📕</span> Create Flipbook
                  </NextLink>
                </div>
                
                {!item.customization_data || item.customization_data.length === 0 ? (
                  <p className="text-sm text-[#9A8F85]">No photos uploaded for this item.</p>
                ) : (
                  <OrderCustomizationClient customizations={item.customization_data} orderItemId={item.id} orderId={order.id} />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right Col: Customer Details */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E0D9CF] rounded-sm p-6">
            <h3 className="font-serif text-lg text-[#221F1C] border-b border-[#E0D9CF] pb-2 mb-4">Customer</h3>
            <p className="text-sm font-medium text-[#221F1C]">{order.customer_name}</p>
            <p className="text-sm text-[#6B6259]">{order.customer_phone}</p>
            <p className="text-sm text-[#6B6259] mt-1">{order.user_email}</p>
          </div>

          {(order.addresses && Array.isArray(order.addresses) ? order.addresses[0] : order.addresses) && (
            <div className="bg-white border border-[#E0D9CF] rounded-sm p-6">
              <h3 className="font-serif text-lg text-[#221F1C] border-b border-[#E0D9CF] pb-2 mb-4">Shipping Address</h3>
              {(() => {
                const addr = Array.isArray(order.addresses) ? order.addresses[0] : order.addresses;
                return (
                  <>
                    <p className="text-sm font-medium text-[#221F1C]">{addr.full_name}</p>
                    <p className="text-sm text-[#6B6259] mt-1">{addr.address_line_1} {addr.address_line_2}</p>
                    <p className="text-sm text-[#6B6259]">{addr.city}, {addr.state} {addr.pincode}</p>
                    <p className="text-sm text-[#6B6259] mt-2">Phone: {addr.phone_number}</p>
                  </>
                )
              })()}
            </div>
          )}

          <div className="bg-white border border-[#E0D9CF] rounded-sm p-6 shadow-sm">
            <h3 className="font-serif text-lg text-[#221F1C] border-b border-[#E0D9CF] pb-3 mb-5">Payment Details</h3>
            {(() => {
              const subtotal = order.order_items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
              const hasOnlyDigitalItems = order.order_items.length > 0 && order.order_items.every((item: any) => item.product_name?.includes('Softcopy Magazine'));
              const deliveryFee = hasOnlyDigitalItems ? 0 : 90;
              const pointsUsed = order.points_used || 0;
              const discountAmount = Math.max(0, subtotal + deliveryFee - pointsUsed - order.total_amount);

              return (
                <>
                  <div className="space-y-3 pb-4 border-b border-[#E0D9CF] border-dashed">
                    <div className="flex justify-between text-[#6B6259] text-sm">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between text-[#6B6259] text-sm">
                      <span>Delivery Fee</span>
                      <span>+₹{deliveryFee.toFixed(2)}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-600 text-sm">
                        <span>Discount {order.applied_promo ? `(${order.applied_promo})` : ''}</span>
                        <span>-₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    {pointsUsed > 0 && (
                      <div className="flex justify-between text-[#DFBC94] font-medium text-sm">
                        <span>Wallet Points Used</span>
                        <span>-₹{pointsUsed.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between font-medium text-lg mt-4 pt-4 border-t border-[#E0D9CF]">
                    <span>Total</span>
                    <span>₹{order.total_amount.toFixed(2)}</span>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}
