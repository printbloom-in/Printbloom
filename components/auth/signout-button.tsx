"use client"
import * as React from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase-browser"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { useCart } from "@/store/use-cart"

export function SignOutButton({ className }: { className?: string }) {
  const supabase = createSupabaseBrowserClient()
  const router = useRouter()
  
  const handleSignOut = async () => {
    // Clear the cart so the next user/guest doesn't see old items
    useCart.getState().clearCart()
    
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <button 
      onClick={handleSignOut} 
      className={className || "flex items-center gap-2.5 text-red-600 hover:text-red-700 font-medium transition-colors px-3 py-2.5 md:py-3 md:px-4 rounded-xl hover:bg-red-50/80 w-full text-left"}
    >
      <LogOut className="w-4 h-4 md:w-5 md:h-5 shrink-0" /> 
      <span className="text-xs md:text-base font-medium">Sign Out</span>
    </button>
  )
}
