import { SectionHeading } from "@/components/ui/section-heading"
import { getFollowUps, updateFollowUpStatus } from "@/app/actions/follow-ups"
import { WhatsAppButton } from "@/components/admin/whatsapp-button"
import { formatDateTime } from "@/lib/utils"
import { FollowUpsSearchFilter } from "@/components/admin/followups-search-filter"
import { Info } from "lucide-react"

export const dynamic = "force-dynamic"
export const revalidate = 0

const STATUS_STYLES: Record<string, { bg: string, text: string, dot: string }> = {
  pending:   { bg: "bg-red-50",    text: "text-red-700",   dot: "bg-red-400" },
  contacted: { bg: "bg-blue-50",   text: "text-blue-700",  dot: "bg-blue-400" },
  recovered: { bg: "bg-green-50",  text: "text-green-700", dot: "bg-green-400" },
}

export default async function FollowUpsPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const params = await searchParams
  const search = params.search?.toLowerCase() || ""
  
  let followUps = await getFollowUps()

  if (search) {
    followUps = followUps.filter((f: any) => {
      const name = (f.customer_name || '').toLowerCase()
      const phone = (f.phone_number || '').toLowerCase()
      return name.includes(search) || phone.includes(search)
    })
  }

  const pending   = followUps.filter((f: any) => f.status === "pending").length
  const contacted = followUps.filter((f: any) => f.status === "contacted").length
  const recovered = followUps.filter((f: any) => f.status === "recovered").length

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <SectionHeading as="h1" className="text-[#221F1C]">Abandoned Carts & Leads</SectionHeading>
          <p className="text-sm text-[#9A8F85] mt-1">
            Customers who entered their details but didn't finish checkout
          </p>
        </div>
      </div>

      {/* Informative Guidance Banner for Admin */}
      <div className="mb-6 p-4 bg-[#FBF6EE] border border-[#DFBC94]/80 rounded-sm flex items-start gap-3 text-xs text-[#6B6259]">
        <Info className="w-4 h-4 text-[#DFBC94] shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-[#221F1C] mb-0.5">What are Abandoned Cart Leads?</p>
          <p className="leading-relaxed">
            These records represent customers who started entering their shipping details in checkout (Step 2) but did not complete payment. They are <strong>NOT</strong> confirmed or paid orders. You can use the WhatsApp button to follow up and assist them with completing their order.
          </p>
        </div>
      </div>

      <FollowUpsSearchFilter />

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Pending", count: pending, color: "border-red-200 bg-red-50", text: "text-red-700" },
          { label: "Contacted", count: contacted, color: "border-blue-200 bg-blue-50", text: "text-blue-700" },
          { label: "Recovered", count: recovered, color: "border-green-200 bg-green-50", text: "text-green-700" },
        ].map(s => (
          <div key={s.label} className={`border ${s.color} rounded-sm p-4`}>
            <p className={`font-serif text-3xl font-bold ${s.text}`}>{s.count}</p>
            <p className="text-xs text-[#9A8F85] uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E0D9CF] rounded-sm shadow-sm overflow-hidden">
        {followUps.length === 0 ? (
          <div className="py-20 text-center text-[#9A8F85]">
            <p className="text-5xl mb-4">🛒</p>
            <p className="font-serif text-xl text-[#221F1C] mb-2">No abandoned carts found!</p>
            <p className="text-sm">When customers start checking out, they'll appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F0E8] border-b border-[#E0D9CF]">
                <tr>
                  <th className="px-5 py-3.5 font-mono text-[10px] text-[#9A8F85] uppercase tracking-wider font-normal">Date</th>
                  <th className="px-5 py-3.5 font-mono text-[10px] text-[#9A8F85] uppercase tracking-wider font-normal">Customer</th>
                  <th className="px-5 py-3.5 font-mono text-[10px] text-[#9A8F85] uppercase tracking-wider font-normal">Total</th>
                  <th className="px-5 py-3.5 font-mono text-[10px] text-[#9A8F85] uppercase tracking-wider font-normal">Status</th>
                  <th className="px-5 py-3.5 font-mono text-[10px] text-[#9A8F85] uppercase tracking-wider font-normal">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0D9CF]">
                {followUps.map((f: any) => {
                  const style = STATUS_STYLES[f.status] || STATUS_STYLES.pending
                  return (
                    <tr key={f.id} className="hover:bg-[#FBF6EE]/50 transition-colors">
                      <td className="px-5 py-4">
                        <span className="text-[#6D635B] whitespace-nowrap">{formatDateTime(f.created_at)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-[#221F1C]">{f.customer_name}</p>
                        <p className="text-xs text-[#9A8F85]">{f.phone_number}</p>
                      </td>
                      <td className="px-5 py-4 text-[#221F1C] font-medium">
                        ₹{f.cart_total}
                      </td>
                      <td className="px-5 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border ${style.bg} border-${style.bg.replace('bg-', '')} ${style.text}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          <span className="text-[10px] uppercase font-medium tracking-wider">{f.status}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <WhatsAppButton 
                            phone={f.phone_number} 
                            customerName={f.customer_name} 
                          />
                          <form action={async () => {
                            "use server"
                            await updateFollowUpStatus(f.id, f.status === "pending" ? "contacted" : "recovered")
                          }}>
                            {f.status !== "recovered" && (
                              <button type="submit" className="text-xs text-[#8B6B43] hover:text-[#DFBC94] underline underline-offset-2">
                                Mark as {f.status === "pending" ? "Contacted" : "Recovered"}
                              </button>
                            )}
                          </form>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
