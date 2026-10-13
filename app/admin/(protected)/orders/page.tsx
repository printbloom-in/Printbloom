import { SectionHeading } from "@/components/ui/section-heading"
import { getAdminOrders } from "@/app/actions/admin-orders"
import NextLink from "next/link"
import { formatDate } from "@/lib/utils"
import { OrdersSearchFilter } from "@/components/admin/orders-search-filter"
import { ExportOrdersButton } from "@/components/admin/export-orders-button"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminOrdersList({ searchParams }: { searchParams: Promise<{ filter?: string; search?: string; status?: string }> }) {
  const params = await searchParams
  const filter = params.filter || 'all'
  const search = params.search?.toLowerCase() || ''
  const status = params.status || 'all'
  
  let orders = await getAdminOrders()

  // Apply Photos Filter
  if (filter === 'partial') {
    orders = orders.filter((o: any) => o.images_status === 'partial')
  } else if (filter === 'complete') {
    orders = orders.filter((o: any) => o.images_status === 'complete' || !o.images_status)
  }

  // Apply Search Filter (by Customer Name or Phone)
  if (search) {
    orders = orders.filter((o: any) => {
      const name = (o.customer_name || '').toLowerCase()
      const phone = (o.customer_phone || '').toLowerCase()
      const addrName = (o.addresses?.[0]?.full_name || o.addresses?.full_name || '').toLowerCase()
      return name.includes(search) || phone.includes(search) || addrName.includes(search)
    })
  }

  // Apply Status Filter
  if (status !== 'all') {
    orders = orders.filter((o: any) => o.status === status)
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <SectionHeading as="h1" className="text-[#221F1C]">All Orders</SectionHeading>
          <p className="text-sm text-[#9A8F85] mt-1">Manage and fulfill customer orders</p>
        </div>
        
        <div className="flex items-center gap-4">
          <ExportOrdersButton orders={orders} />
          
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-full border border-[#E0D9CF] shadow-sm">
            <NextLink href={`/admin/orders?filter=all${search ? `&search=${search}` : ''}${status !== 'all' ? `&status=${status}` : ''}`} className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${filter === 'all' ? 'bg-[#221F1C] text-white' : 'text-[#6B6259] hover:bg-[#F5F0E8]'}`}>
              All
            </NextLink>
            <NextLink href={`/admin/orders?filter=partial${search ? `&search=${search}` : ''}${status !== 'all' ? `&status=${status}` : ''}`} className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${filter === 'partial' ? 'bg-amber-100 text-amber-800' : 'text-[#6B6259] hover:bg-[#F5F0E8]'}`}>
              Partial Photos
            </NextLink>
            <NextLink href={`/admin/orders?filter=complete${search ? `&search=${search}` : ''}${status !== 'all' ? `&status=${status}` : ''}`} className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${filter === 'complete' ? 'bg-[#221F1C] text-white' : 'text-[#6B6259] hover:bg-[#F5F0E8]'}`}>
              Complete Photos
            </NextLink>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <OrdersSearchFilter />
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-[#E0D9CF] rounded-sm p-12 text-center">
          <p className="font-serif text-xl text-[#221F1C] mb-2">No orders found</p>
          <p className="text-sm text-[#9A8F85]">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="bg-white shadow-sm border border-[#E0D9CF] rounded-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#F5F0E8] border-b border-[#E0D9CF] text-xs font-mono text-[#9A8F85] uppercase tracking-wider">
              <tr>
                <th className="p-4 font-normal">Order ID</th>
                <th className="p-4 font-normal">Date</th>
                <th className="p-4 font-normal">Customer</th>
                <th className="p-4 font-normal">Total</th>
                <th className="p-4 font-normal">Status</th>
                <th className="p-4 font-normal">Photos</th>
                <th className="p-4 font-normal">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D9CF]">
              {orders.map((order: any) => {
                const addr = Array.isArray(order.addresses) ? order.addresses[0] : order.addresses;
                const customerName = order.customer_name || addr?.full_name || 'Unknown';
                return (
                  <tr key={order.id} className="hover:bg-[#FBF6EE]/50 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-[#221F1C] uppercase">#{order.id.split('-')[0]}</p>
                    </td>
                    <td className="p-4 text-sm text-[#6B6259]">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="p-4 text-sm text-[#221F1C] font-medium">
                      {customerName}
                    </td>
                    <td className="p-4 text-sm">
                      ₹{order.total_amount}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-sm font-medium uppercase
                        ${order.status === 'received' ? 'bg-emerald-100 text-emerald-800' :
                          order.status === 'processing' ? 'bg-amber-100 text-amber-800' : 
                          order.status === 'designing' ? 'bg-purple-100 text-purple-800' : 
                          order.status === 'printing' ? 'bg-pink-100 text-pink-800' : 
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {order.status === 'received' ? 'Order Received' : order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full border font-medium ${order.images_status === 'partial' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                        {order.images_status === 'partial' ? 'Partial' : 'Complete'}
                      </span>
                    </td>
                    <td className="p-4">
                      <a href={`/admin/orders/${order.id}`} className="text-xs text-[#DFBC94] hover:underline font-medium">
                        View Details &rarr;
                      </a>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  )
}
