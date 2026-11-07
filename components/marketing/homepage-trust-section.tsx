import { homepageTrustCards } from "@/lib/reviews-data"
import Image from "next/image"

export function HomepageTrustSection() {
  return (
    <section className="bg-[#FBF6EE] py-12 md:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="font-mono text-xs uppercase tracking-widest text-[#DFBC94] mb-3">Real Customers. Real Reactions.</p>
          <h2 className="font-serif text-4xl text-[#221F1C]">What they said when it arrived</h2>
          <p className="text-[#6B6259] mt-3 max-w-xl mx-auto">These are actual WhatsApp messages our customers sent us — unedited.</p>
        </div>

        {/* 3 Screenshot Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {homepageTrustCards.map((card) => (
            <div key={card.id} className="flex flex-col bg-white border border-[#E0D9CF] rounded-sm overflow-hidden shadow-sm hover:shadow-lg transition-shadow group">
              {/* Screenshot image (top half) */}
              <div className="relative h-72 overflow-hidden bg-gray-100">
                <Image
                  src={card.image}
                  alt={`Customer review screenshot`}
                  fill
                  className="object-cover object-top group-hover:object-center transition-all duration-700"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {/* WhatsApp badge */}
                <div className="absolute top-3 right-3 bg-[#25D366] text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <svg viewBox="0 0 175.216 175.552" className="w-3 h-3" fill="white">
                    <path d="M87.609 0C39.268 0 0 39.26 0 87.609c0 15.447 4.047 29.937 11.107 42.501L0 175.552l46.756-11.013C59.069 171.38 73.004 175.2 87.609 175.2c48.341 0 87.607-39.261 87.607-87.608C175.216 39.26 135.95 0 87.609 0z"/>
                  </svg>
                  Verified
                </div>
              </div>

              {/* Quote (bottom half) */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[#DFBC94] mb-3 text-sm">★★★★★</div>
                  <p className="text-[#221F1C] leading-relaxed text-sm italic">"{card.quote}"</p>
                </div>
                <div className="mt-4 pt-4 border-t border-[#E0D9CF] flex items-center justify-between">
                  <span className="text-xs text-[#9A8F85] font-mono">Verified Customer</span>
                  <span className="text-xs text-[#DFBC94] font-medium">{card.product}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA to reviews page */}
        <div className="text-center mt-10">
          <a href="/reviews" className="inline-flex items-center gap-2 text-sm font-medium text-[#221F1C] border border-[#221F1C] px-6 py-3 rounded-full hover:bg-[#221F1C] hover:text-white transition-colors">
            Read all reviews →
          </a>
        </div>
      </div>
    </section>
  )
}
