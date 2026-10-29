import * as React from "react"
import Image from "next/image"
import NextLink from "next/link"

// Fallback images for now since media_assets aren't wired up yet
const FALLBACK_IMAGES: Record<string, string> = {
  "custom-magazine": "/images/a4-product.png",
  "custom-magazine-a4": "/images/a4-product.png",
  "polaroid-set": "https://images.unsplash.com/photo-1518998053901-5348d3961a04?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "photo-frame": "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
}

export function ProductGrid({ products }: { products: any[] }) {
  // If no products (e.g. Supabase is empty), we can show a placeholder or nothing.
  if (!products || products.length === 0) {
    return <p className="text-text-muted">No products available at the moment.</p>
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-10 lg:gap-12">
      {products.map((product) => {
        let imageSrc = product.main_image_url || FALLBACK_IMAGES[product.slug] || FALLBACK_IMAGES["custom-magazine"]
        
        // Force override the A4 image, ignoring what's in the database
        if (product.slug === 'custom-magazine-a4' || product.slug === 'custom-magazine') {
          imageSrc = '/images/a4-product.png'
        }

        // Mobile layout rule per client spec:
        // A4 and A5 magazines: 1 card per row on mobile (col-span-2)
        // All other products: 2 cards per row on mobile (col-span-1)
        const isMagazine = product.slug === 'custom-magazine-a4' || 
                           product.slug === 'custom-magazine-a5' || 
                           product.slug === 'custom-magazine';

        return (
          <NextLink 
            key={product.slug} 
            href={`/products/${product.slug}`}
            className={`group flex flex-col h-full ${
              isMagazine ? 'col-span-2 md:col-span-1' : 'col-span-1'
            }`}
          >
            <div className={`relative w-full overflow-hidden bg-surface rounded-sm mb-3 sm:mb-5 shrink-0 ${
              isMagazine 
                ? 'aspect-[4/3] sm:aspect-[4/5] md:h-[420px]' 
                : 'aspect-square sm:aspect-[4/5] md:h-[420px]'
            }`}>
              <Image
                src={imageSrc}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
            </div>
            <div className="flex flex-col flex-1 space-y-1 sm:space-y-2">
              <h3 className="font-serif text-base sm:text-xl md:text-2xl text-ink group-hover:text-accent transition-colors line-clamp-1">
                {product.name}
              </h3>
              <p className="text-text-muted text-xs sm:text-sm line-clamp-2">
                {product.tagline}
              </p>
              <div className="flex items-center justify-between pt-1 sm:pt-2 mt-auto">
                <span className="font-mono text-xs sm:text-sm tracking-wide font-medium text-ink">
                  {product.starting_price_label?.toLowerCase().includes('from') 
                    ? product.starting_price_label 
                    : `From ${product.starting_price_label}`}
                </span>
                <span className="text-accent font-medium text-xs sm:text-sm group-hover:underline underline-offset-4 hidden sm:inline">
                  View Details &rarr;
                </span>
              </div>
            </div>
          </NextLink>
        )
      })}
    </div>
  )
}
