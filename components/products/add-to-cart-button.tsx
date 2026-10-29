"use client"
import { toast } from "sonner";
import * as React from "react"
import { useCart } from "@/store/use-cart"
import { useUIStore } from "@/store/use-ui-store"
import { createSupabaseBrowserClient } from "@/lib/supabase-browser"

type AddToCartProps = {
  product: {
    id: string
    name: string
    price: number
    image: string
    variant?: string
    is_digital?: boolean
    slug?: string
  }
  customizationData?: any[]
  minPhotos?: number
}

export function AddToCartButton({ product, customizationData = [], minPhotos = 0 }: AddToCartProps) {
  const { addItem } = useCart()
  const { openCartDrawer, openAuthModal } = useUIStore()

  const handleAdd = async () => {
    // Intercept unauthenticated users with AuthModal
    const supabase = createSupabaseBrowserClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      openAuthModal()
      return
    }

    // Clean up the data to just store URLs and captions for the cart (if any)
    const cleanedCustomization = (customizationData || []).map(photo => ({
      cloudinaryUrl: photo.cloudinaryUrl,
      caption: photo.caption
    }))

    // Use a unique cart item ID
    const cartItemId = `${product.id}-${Date.now()}`

    addItem({
      id: cartItemId,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      is_digital: product.is_digital,
      variant: product.variant,
      customization_data: cleanedCustomization
    })
    
    openCartDrawer()
  }

  return (
    <button
      onClick={handleAdd}
      className="w-full bg-transparent border border-[#221F1C] text-[#221F1C] py-3.5 rounded-full font-medium hover:bg-[#F5F0E8] transition-colors text-center text-sm"
    >
      Add to Cart
    </button>
  )
}
