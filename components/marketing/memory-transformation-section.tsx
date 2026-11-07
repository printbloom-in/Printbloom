import * as React from "react"
import Image from "next/image"
import { SectionHeading } from "@/components/ui/section-heading"

export function MemoryTransformationSection() {
  return (
    <section className="py-14 md:py-24 px-4 md:px-8 bg-[#221F1C] text-[#FBF6EE]">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          <div className="relative aspect-square md:aspect-[4/5] w-full max-w-md mx-auto">
            {/* Background decorative element */}
            <div className="absolute inset-0 bg-[#DFBC94]/20 translate-x-4 translate-y-4" />
            
            <div className="relative w-full h-full border border-white/10 overflow-hidden bg-[#2C2926]">
              <Image 
                src="/images/polaroids.jpg"
                alt="Beautiful custom polaroid prints and memory gifts"
                fill
                className="object-cover opacity-90"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-6 md:pl-8">
            <div className="font-mono text-xs tracking-[0.2em] uppercase text-[#9A8F85]">
              Digital to Physical
            </div>
            
            <SectionHeading as="h2" className="text-[#FBF6EE]">
              We rescue your best moments from the cloud.
            </SectionHeading>
            
            <div className="space-y-4 text-[#9A8F85] text-lg leading-relaxed">
              <p>
                Thousands of photos sitting on your phone, rarely looked at. We think your memories deserve better than a camera roll.
              </p>
              <p>
                Whether it's a year of dating, a best friend's birthday, or a trip you never want to forget, we transform your digital gallery into tactile, beautifully printed pieces you can hold in your hands.
              </p>
            </div>
            
            <div className="pt-4 grid grid-cols-2 gap-6 border-t border-white/10 mt-8">
              <div>
                <p className="font-serif text-3xl text-[#FBF6EE] mb-1">500+</p>
                <p className="text-sm font-mono text-[#9A8F85]">Stories Printed</p>
              </div>
              <div>
                <p className="font-serif text-3xl text-[#FBF6EE] mb-1">100%</p>
                <p className="text-sm font-mono text-[#9A8F85]">Made to Order</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
