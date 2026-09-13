import * as React from "react"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getProductBySlug } from "@/app/actions/products"
import { checkWishlistStatus } from "@/app/actions/wishlist"
import { ProductCustomizer } from "@/components/products/product-customizer"
import { ProductMiniReviews } from "@/components/products/product-mini-reviews"
import { HowItWorksSteps } from "@/components/products/how-it-works-steps"
import { ProductCarousel } from "@/components/ui/product-carousel"
import { ShieldCheck, Award, Map, Clock, Plus } from "lucide-react"

export const revalidate = 3600

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // Try to fetch product, or use mock if missing so we can at least see the UI
  let product
  try {
    product = await getProductBySlug(slug)
  } catch (e) {
    product = null
  }

  if (!product) {
    // For demo purposes, we will mock the product if it doesn't exist in DB yet
    product = {
      id: "demo-id",
      name: slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
      starting_price: 50,
      main_image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      description: "A beautiful personalized item crafted just for you."
    }
  }

  // Check wishlist status
  const isWishlisted = await checkWishlistStatus(slug)

  // Force override old unsplash images
  let imageSrc = product.main_image_url
  if (slug === 'custom-magazine-a4' || slug === 'custom-magazine') {
    imageSrc = '/images/a4-product.png'
  } else if (slug === 'custom-magazine-a5') {
    imageSrc = 'https://res.cloudinary.com/gnltrlq1/image/upload/v1788039390/va7ck2ohbi9uhktrzmcx.jpg'
  } else if (slug === 'photo-frames') {
    imageSrc = 'https://res.cloudinary.com/gnltrlq1/image/upload/v1788039394/bo2fkgkljfrywzvr2wdl.jpg'
  }

  // Construct images array
  let productImages: string[] = []
  if (product.image_urls && product.image_urls.length > 0) {
    productImages = product.image_urls
  } else if (imageSrc) {
    productImages = [imageSrc]
  }

  return (
    <main className="flex flex-col min-h-screen pt-32 pb-24 px-4 md:px-8">
      <div className="container mx-auto max-w-6xl">
        
        {/* Breadcrumb */}
        <div className="text-sm text-[#9A8F85] mb-8">
          Home / Products / <span className="text-[#221F1C]">{product.name}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-12 lg:gap-20">
          
          {/* Left: Product Images */}
          <div className="w-full md:w-1/2">
            <ProductCarousel images={productImages} productName={product.name} />
          </div>

          {/* Right: Product Details */}
          <div className="w-full md:w-1/2 flex flex-col">
            <h1 className="font-serif text-3xl md:text-4xl text-[#221F1C] mb-4">
              {product.name}
            </h1>

            <ProductCustomizer 
              product={product} 
              slug={slug} 
              isWishlisted={isWishlisted} 
            />

            {/* Accordions */}
            <div className="mt-10 border-t border-[#E0D9CF] divide-y divide-[#E0D9CF]">
              <details className="group py-5 cursor-pointer" open>
                <summary className="flex justify-between items-center font-serif text-lg text-[#221F1C] list-none">
                  Product Description
                  <span className="transition group-open:rotate-45">
                    <Plus className="w-5 h-5 text-[#9A8F85]" />
                  </span>
                </summary>
                <div className="pt-4 text-sm text-[#6B6259] leading-relaxed whitespace-pre-wrap">
                  {product.description || "Beautifully crafted customized product to keep your memories safe. Made with premium materials and high quality printing."}
                </div>
              </details>
              
              <details className="group py-5 cursor-pointer">
                <summary className="flex justify-between items-center font-serif text-lg text-[#221F1C] list-none">
                  Return Policy
                  <span className="transition group-open:rotate-45">
                    <Plus className="w-5 h-5 text-[#9A8F85]" />
                  </span>
                </summary>
                <div className="pt-4 text-sm text-[#6B6259] leading-relaxed">
                  As this is a personalized product, we do not accept returns unless the item is damaged during transit.
                </div>
              </details>
            </div>

            {/* Trust Badges */}
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-center border-t border-[#E0D9CF] pt-8">
              <div className="flex flex-col items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-[#4B6B4F]" />
                <span className="text-[10px] text-[#9A8F85] uppercase tracking-wider">Secure Payments</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Award className="w-6 h-6 text-[#4B6B4F]" />
                <span className="text-[10px] text-[#9A8F85] uppercase tracking-wider">Assured Quality</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Map className="w-6 h-6 text-[#4B6B4F]" />
                <span className="text-[10px] text-[#9A8F85] uppercase tracking-wider">Made In India</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Clock className="w-6 h-6 text-[#4B6B4F]" />
                <span className="text-[10px] text-[#9A8F85] uppercase tracking-wider">Timely Delivery</span>
              </div>
            </div>

            {/* Real Customer Reviews */}
            <ProductMiniReviews productSlug={slug} />

          </div>
        </div>
        
        {/* Full-width 14-Step Process Section */}
        <HowItWorksSteps />
        
      </div>
    </main>
  )
}
