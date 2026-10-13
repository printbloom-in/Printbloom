"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"

export function OrdersSearchFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [status, setStatus] = useState(searchParams.get("status") || "all")

  // Debounced search update
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      
      if (searchTerm) {
        params.set("search", searchTerm)
      } else {
        params.delete("search")
      }
      
      if (status && status !== "all") {
        params.set("status", status)
      } else {
        params.delete("status")
      }
      
      router.push(`/admin/orders?${params.toString()}`)
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [searchTerm, status, router, searchParams])

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A8F85]" />
        <input 
          type="text" 
          placeholder="Search customer name..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-[#E0D9CF] rounded-sm text-sm focus:outline-none focus:border-[#DFBC94] transition-colors"
        />
      </div>
      
      <select 
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="px-4 py-2 border border-[#E0D9CF] rounded-sm text-sm bg-white focus:outline-none focus:border-[#DFBC94] transition-colors cursor-pointer text-[#221F1C]"
      >
        <option value="all">All Statuses</option>
        <option value="received">Order Received</option>
        <option value="designing">Designing</option>
        <option value="printing">Printing</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
        <option value="processing">Processing (Legacy)</option>
      </select>
    </div>
  )
}
