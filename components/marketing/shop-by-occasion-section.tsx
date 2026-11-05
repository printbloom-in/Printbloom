import * as React from "react"
import Image from "next/image"
import { Link } from "@/components/ui/link"
import { SectionHeading } from "@/components/ui/section-heading"
import { FadeIn, FadeInStagger, FadeInStaggerItem } from "@/components/ui/fade-in"

const occasions = [
  {
    title: "Anniversary",
    image: "/images/anniversary.png",
    href: "/products?occasion=anniversary"
  },
  {
    title: "Birthdays",
    image: "/images/birthday.jpg",
    href: "/products?occasion=birthday"
  },
  {
    title: "Long Distance",
    image: "/images/long-distance-1.jpg",
    href: "/products?occasion=long-distance"
  },
  {
    title: "Just Because",
    image: "/images/just-because.png",
    href: "/products?occasion=just-because"
  }
]

export function ShopByOccasionSection() {
  return (
    <section className="py-24 px-4 md:px-8 bg-surface">
      <div className="container mx-auto max-w-7xl">
        <FadeIn className="flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-4 md:space-y-0">
          <div>
            <div className="font-mono text-xs tracking-[0.2em] uppercase text-text-muted mb-4">
              Find the perfect gift
            </div>
            <SectionHeading as="h2">Shop by Occasion</SectionHeading>
          </div>
          <Link href="/products" variant="default" className="text-sm">
            View All Products &rarr;
          </Link>
        </FadeIn>

        <FadeInStagger className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {occasions.map((occasion) => (
            <FadeInStaggerItem key={occasion.title}>
              <a 
                href={occasion.href}
                className="group relative block aspect-[4/5] overflow-hidden bg-bg border border-border"
              >
                <Image 
                  src={occasion.image}
                  alt={occasion.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />
                
                <div className="absolute inset-0 p-3 sm:p-6 flex flex-col justify-end">
                  <h3 className="text-white font-serif text-base sm:text-2xl mb-0.5 sm:mb-1">{occasion.title}</h3>
                  <span className="text-white/80 font-mono text-xs uppercase tracking-wider opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                    Shop Gifts &rarr;
                  </span>
                </div>
              </a>
            </FadeInStaggerItem>
          ))}
        </FadeInStagger>
      </div>
    </section>
  )
}
