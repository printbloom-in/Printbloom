"use client"
import { toast } from "sonner";
import * as React from "react"
import { Heart } from "lucide-react"
import { toggleWishlist } from "@/app/actions/wishlist"
import { useUIStore } from "@/store/use-ui-store"
import { createSupabaseBrowserClient } from "@/lib/supabase-browser"

interface WishlistButtonProps {
  productSlug: string
  productName: string
  productImageUrl: string
  productPrice: number
  initialStatus: boolean
}

export function WishlistButton({ productSlug, productName, productImageUrl, productPrice, initialStatus }: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = React.useState(initialStatus)
  const [isLoading, setIsLoading] = React.useState(false)
  const { openAuthModal } = useUIStore()

  const handleToggle = async () => {
    // Intercept unauthenticated users with AuthModal
    const supabase = createSupabaseBrowserClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      openAuthModal()
      return
    }

    setIsLoading(true)
    try {
      const result = await toggleWishlist(productSlug, productName, productImageUrl, productPrice)
      if (result.error) {
        if (result.error.toLowerCase().includes("logged in")) {
          openAuthModal()
        } else {
          toast.error(result.error)
        }
      } else {
        setIsWishlisted(result.isWishlisted!)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button 
      onClick={handleToggle}
      disabled={isLoading}
      className={`flex items-center justify-center w-14 h-14 rounded-full border transition-all ${
        isWishlisted 
          ? "border-[#DFBC94] bg-[#DFBC94]/10 text-[#DFBC94]" 
          : "border-[#E0D9CF] text-[#9A8F85] hover:border-[#221F1C] hover:text-[#221F1C] bg-white"
      } disabled:opacity-50`}
      title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
    >
      <Heart className={`w-6 h-6 ${isWishlisted ? "fill-current" : ""}`} />
    </button>
  )
}
