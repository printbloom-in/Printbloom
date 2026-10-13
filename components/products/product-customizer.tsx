"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/store/use-cart"
import { AddToCartButton } from "./add-to-cart-button"
import { WishlistButton } from "./wishlist-button"
import { productVariantsMap, ProductVariant } from "@/lib/pricing"
import { getPhotoRequirements, getEstimatedDelivery } from "@/lib/photo-requirements"
import { Info, Truck, MessageCircle } from "lucide-react"

export function ProductCustomizer({ product, slug, isWishlisted }: { product: any, slug: string, isWishlisted: boolean }) {
  const router = useRouter()
  const { addItem } = useCart()
  
  // Variants
  const variants = productVariantsMap[slug] || [{ label: "Default", price: product.starting_price || 999 }]
  const [selectedVariant, setSelectedVariant] = React.useState<ProductVariant>(variants[0])

  // Get photo requirements and delivery info
  const photoReq = getPhotoRequirements(slug, selectedVariant.label)
  const estimatedDelivery = getEstimatedDelivery(slug)
  const isDigital = slug === 'softcopy-magazine' || product?.is_digital

  // Pre-filled WhatsApp message for earlier delivery inquiry
  const whatsappUrl = `https://wa.me/918691094045?text=${encodeURIComponent(
    `Hi PrintBloom, I'm interested in ordering the ${product.name}. The estimated delivery is ${estimatedDelivery}, but I need it before that. Could you please confirm if an earlier delivery is possible?`
  )}`

  const handleBuyNow = () => {
    const cartItemId = `${product.id}-${selectedVariant.label}-${Date.now()}`

    addItem({
      id: cartItemId,
      productId: `${product.id}-${selectedVariant.label}`,
      name: product.name,
      price: selectedVariant.price,
      quantity: 1,
      image: product.main_image_url,
      is_digital: product.is_digital,
      variant: selectedVariant.label,
      customization_data: []
    })
    
    // Redirect directly to cart for faster checkout
    router.push("/cart")
  }

  return (
    <div className="flex flex-col mb-10 w-full">
      {/* Price Display */}
      <div className="mb-6">
        <span className="text-3xl font-medium text-[#221F1C]">₹{selectedVariant.price}</span>
        <p className="text-sm text-[#9A8F85] mt-1">Incl. of all taxes</p>
      </div>

      {/* Variant Selector */}
      {variants.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#221F1C] mb-2">Select Option</label>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <button
                key={variant.label}
                onClick={() => setSelectedVariant(variant)}
                className={`px-4 py-2 text-sm border rounded-sm transition-colors ${
                  selectedVariant.label === variant.label 
                    ? 'border-[#DFBC94] bg-[#DFBC94]/10 text-[#221F1C] font-medium' 
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {variant.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Photo Requirement (Display-Only) */}
      {photoReq.totalText !== "0" && (
        <div className="mb-5 p-4 bg-[#FBF6EE] border border-[#DFBC94]/60 rounded-sm flex items-start gap-3 text-sm text-[#6B6259]">
          <Info className="w-5 h-5 text-[#DFBC94] shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-[#221F1C] mb-1">
              Photos Required: {photoReq.totalText} photos recommended
            </p>
            {slug.includes("magazine") && (
              <p className="text-xs text-[#9A8F85] mb-1.5">
                Each physical page has a front and back side. For example, 8 printable sides = 4 pages.
              </p>
            )}
            <p className="text-xs text-[#6B6259]">
              No need to upload photos right now. After placing your order, our team will contact you on WhatsApp to collect your photos and personalisation details.
            </p>
          </div>
        </div>
      )}

      {/* Estimated Delivery Information */}
      <div className="mb-6 p-4 bg-white border border-[#E0D9CF] rounded-sm space-y-2">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#4B6B4F]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#9A8F85]">
            {isDigital ? "Digital Delivery" : "Estimated Delivery"}
          </span>
        </div>
        <p className="text-base font-medium text-[#221F1C]">
          {isDigital ? `Digital delivery: ${estimatedDelivery}` : estimatedDelivery}
        </p>
        <p className="text-xs text-[#9A8F85] leading-relaxed">
          Delivery timeline begins after we receive the required photos and personalisation details and the design is approved.
        </p>

        {/* Earlier Delivery Inquiry via WhatsApp */}
        <div className="pt-2 border-t border-[#E0D9CF]/60 flex items-center justify-between">
          <span className="text-xs text-[#6B6259]">Need it sooner?</span>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4B6B4F] hover:underline"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Ask about earlier delivery
          </a>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 w-full mt-2">
        <button 
          onClick={handleBuyNow}
          className="flex-1 bg-[#221F1C] text-white py-3.5 rounded-full font-medium hover:bg-black transition-colors text-center text-sm"
        >
          Buy Now
        </button>
        <div className="flex-1">
          <AddToCartButton 
            product={{
              id: `${product.id}-${selectedVariant.label}`,
              name: product.name,
              price: selectedVariant.price,
              image: product.main_image_url,
              variant: selectedVariant.label,
              slug: slug
            }}
            customizationData={[]}
            minPhotos={0}
          />
        </div>
        <WishlistButton 
          productSlug={slug}
          productName={product.name}
          productImageUrl={product.main_image_url}
          productPrice={selectedVariant.price}
          initialStatus={isWishlisted}
        />
      </div>
    </div>
  )
}
