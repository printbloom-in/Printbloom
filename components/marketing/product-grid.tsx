import * as React from "react"
import Image from "next/image"
import NextLink from "next/link"

// Fallback images for products
const FALLBACK_IMAGES: Record<string, string> = {
  "custom-magazine": "/images/a4-product.png",
  "custom-magazine-a5": "/images/a4-product.png",
  "custom-magazine-a4": "/images/a4-product.png",
  "polaroid-set": "https://images.unsplash.com/photo-1518998053901-5348d3961a04?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "photo-frame": "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
}

export function ProductGrid({ products }: { products: any[] }) {
  if (!products || products.length === 0) {
    return <p className="text-text-muted">No products available at the moment.</p>
  }

  // Identify physical magazines (A5 and A4)
  const isA5 = (p: any) => p.slug === 'custom-magazine-a5' || p.slug === 'custom-magazine';
  const isA4 = (p: any) => p.slug === 'custom-magazine-a4';

  const a5Product = products.find(isA5);
  const a4Product = products.find(isA4);
  const physicalMagazines = [a5Product, a4Product].filter(Boolean) as any[];

  // All other products (softcopy, polaroids, frames, etc.)
  const otherProducts = products.filter(p => !isA5(p) && !isA4(p));

  const getProductImage = (product: any) => {
    if (product.slug === 'custom-magazine-a4' || product.slug === 'custom-magazine' || product.slug === 'custom-magazine-a5') {
      return '/images/a4-product.png'
    }
    return product.main_image_url || FALLBACK_IMAGES[product.slug] || FALLBACK_IMAGES["custom-magazine"]
  }

  return (
    <div className="space-y-12 md:space-y-16">
      
      {/* 
        PHYSICAL MAGAZINES SHOWCASE (A5 & A4)
        - Desktop: Prominent 2-column showcase side-by-side with distinct presentation
        - Mobile: Exactly 1 full-width card per row (A5 first row, A4 second row)
      */}
      {physicalMagazines.length > 0 && (
        <div className="space-y-4">
          <div className="hidden md:flex items-center justify-between pb-2 border-b border-[#E0D9CF]/60">
            <span className="font-mono text-xs uppercase tracking-widest text-[#DFBC94] font-medium">
              Signature Physical Keepsakes
            </span>
            <span className="text-xs text-[#9A8F85] font-mono">
              Printed on archival 170gsm luster paper
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
            {physicalMagazines.map((product) => {
              const imageSrc = getProductImage(product);
              const isA4Card = isA4(product);

              return (
                <NextLink
                  key={product.slug}
                  href={`/products/${product.slug}`}
                  className="group flex flex-col h-full bg-white/70 hover:bg-white rounded-2xl p-4 sm:p-6 border border-[#E0D9CF] hover:border-[#DFBC94] transition-all duration-300 shadow-xs hover:shadow-md"
                >
                  {/* Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-[#221F1C] bg-[#DFBC94]/20 border border-[#DFBC94]/40 px-3 py-1 rounded-full font-medium">
                      {isA4Card ? "Grand Format • Maximum Detail" : "Signature Format • Most Popular"}
                    </span>
                    <span className="font-mono text-xs text-[#9A8F85]">
                      {isA4Card ? "A4 (21 × 29.7 cm)" : "A5 (14.8 × 21 cm)"}
                    </span>
                  </div>

                  {/* Image container: object-contain with gentle padding so cover & text never clip */}
                  <div className="relative w-full aspect-[4/3] sm:aspect-[4/5] md:aspect-[16/11] lg:h-[380px] bg-[#F7F4EE] rounded-xl mb-4 sm:mb-5 overflow-hidden flex items-center justify-center p-4 sm:p-6 border border-[#E0D9CF]/50">
                    <Image
                      src={imageSrc}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03] drop-shadow-sm"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 space-y-1.5 sm:space-y-2">
                    <h3 className="font-serif text-xl sm:text-2xl md:text-3xl text-ink group-hover:text-accent transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-text-muted text-xs sm:text-sm line-clamp-2 leading-relaxed">
                      {product.tagline || (isA4Card 
                        ? "Our largest, most immersive magazine keepsake. Perfect for weddings, milestone anniversaries, and grand stories." 
                        : "Our most-loved format. Fits naturally in your hands and looks stunning on any coffee table or bedside.")}
                    </p>
                    <div className="flex items-center justify-between pt-3 mt-auto border-t border-[#E0D9CF]/40">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-[#9A8F85] block font-mono">Starting At</span>
                        <span className="font-mono text-sm sm:text-base font-medium text-ink">
                          {product.starting_price_label?.toLowerCase().includes('from') 
                            ? product.starting_price_label 
                            : `From ${product.starting_price_label}`}
                        </span>
                      </div>
                      <span className="text-accent font-medium text-xs sm:text-sm group-hover:underline underline-offset-4 flex items-center gap-1">
                        Customize &rarr;
                      </span>
                    </div>
                  </div>
                </NextLink>
              )
            })}
          </div>
        </div>
      )}

      {/* 
        ALL REMAINING PRODUCTS
        - Desktop: Regular 3-column product grid
        - Mobile: Exactly 2 cards per row
      */}
      {otherProducts.length > 0 && (
        <div className="space-y-6">
          {physicalMagazines.length > 0 && (
            <div className="pt-6 border-t border-[#E0D9CF]/60 flex items-center justify-between">
              <h2 className="font-serif text-xl sm:text-2xl text-[#221F1C]">
                More Keepsakes & Gifts
              </h2>
              <span className="font-mono text-xs text-[#9A8F85]">
                {otherProducts.length} {otherProducts.length === 1 ? "gift" : "gifts"}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
            {otherProducts.map((product) => {
              const imageSrc = getProductImage(product);

              return (
                <NextLink 
                  key={product.slug} 
                  href={`/products/${product.slug}`}
                  className="group flex flex-col h-full bg-white/60 hover:bg-white rounded-xl p-3 sm:p-5 border border-[#E0D9CF] hover:border-[#DFBC94] transition-all duration-300 shadow-xs hover:shadow-md"
                >
                  {/* Image container: object-contain with gentle padding so edges/borders of frames & polaroids never cut */}
                  <div className="relative w-full aspect-square sm:aspect-[4/5] md:h-[280px] bg-[#F7F4EE] rounded-lg mb-3 sm:mb-4 overflow-hidden flex items-center justify-center p-3 sm:p-4 border border-[#E0D9CF]/40">
                    <Image
                      src={imageSrc}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 space-y-1 sm:space-y-1.5">
                    <h3 className="font-serif text-sm sm:text-lg md:text-xl text-ink group-hover:text-accent transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-text-muted text-xs sm:text-sm line-clamp-2 leading-relaxed">
                      {product.tagline}
                    </p>
                    <div className="flex items-center justify-between pt-2 mt-auto">
                      <span className="font-mono text-xs sm:text-sm tracking-wide font-medium text-ink">
                        {product.starting_price_label?.toLowerCase().includes('from') 
                          ? product.starting_price_label 
                          : `From ${product.starting_price_label}`}
                      </span>
                      <span className="text-accent font-medium text-xs hidden sm:inline group-hover:underline underline-offset-4">
                        View &rarr;
                      </span>
                    </div>
                  </div>
                </NextLink>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
