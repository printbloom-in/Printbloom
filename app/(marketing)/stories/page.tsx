import { SectionHeading } from "@/components/ui/section-heading"
import NextLink from "next/link"
import { getPublishedJournals } from "@/app/actions/journal"
import Image from "next/image"

export const dynamic = "force-dynamic"

export default async function StoriesPage() {
  const stories = await getPublishedJournals()

  return (
    <main className="flex flex-col min-h-screen pt-36 pb-24 px-4 md:px-8">
      <div className="container mx-auto max-w-5xl">
        <header className="mb-12 md:mb-16 text-center md:text-left">
          <span className="inline-block font-mono text-xs uppercase tracking-widest text-[#DFBC94] mb-3 bg-[#DFBC94]/10 px-3.5 py-1.5 rounded-full border border-[#DFBC94]/20">
            Real Stories, Real Keepsakes
          </span>
          <SectionHeading as="h1">Stories Behind the Gifts</SectionHeading>
          <p className="mt-4 text-text-muted text-base sm:text-lg max-w-2xl">
            See how our customers are turning their favourite photographs, inside jokes, and cherished moments into personalised keepsakes.
          </p>
        </header>
        
        {stories.length === 0 ? (
          <div className="text-center py-20 text-[#9A8F85] bg-white/60 rounded-2xl border border-[#E0D9CF]">
            <p className="text-xl font-serif text-[#221F1C]">No stories published yet.</p>
            <p className="mt-2 text-sm text-[#6B6259]">Check back soon for new memories and keepsakes!</p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8 md:space-y-10">
            {stories.map((story: any) => (
              <NextLink 
                href={`/stories/${story.slug}`} 
                key={story.id} 
                className="group block bg-white/80 hover:bg-white border border-[#E0D9CF] hover:border-[#DFBC94] rounded-2xl p-4 sm:p-6 transition-all duration-300 shadow-xs hover:shadow-md"
              >
                <div className="flex flex-col md:flex-row gap-5 md:gap-8 items-start md:items-center">
                  
                  {/* Media: Top on mobile, Left on desktop */}
                  <div className="w-full md:w-72 lg:w-80 shrink-0 aspect-[4/3] sm:aspect-[16/10] md:aspect-[4/3] relative overflow-hidden rounded-xl bg-surface border border-[#E0D9CF]/50">
                    {story.media_url ? (
                      story.media_type === 'video' ? (
                        <video 
                          src={story.media_url} 
                          className="object-cover w-full h-full group-hover:scale-[1.03] transition-transform duration-500" 
                          muted 
                          playsInline 
                        />
                      ) : (
                        <Image 
                          src={story.media_url} 
                          alt={story.title} 
                          fill 
                          sizes="(max-width: 768px) 100vw, 320px"
                          className="object-cover group-hover:scale-[1.03] transition-transform duration-500" 
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#9A8F85] text-sm font-mono">
                        PrintBloom Story
                      </div>
                    )}
                  </div>

                  {/* Text: Bottom on mobile, Right on desktop */}
                  <div className="flex flex-col flex-1 space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs uppercase tracking-widest text-[#DFBC94] bg-[#DFBC94]/10 px-2.5 py-1 rounded-full border border-[#DFBC94]/20">
                        {story.product_name || "Custom Gift"}
                      </span>
                      {story.customer_name && (
                        <span className="text-xs text-[#9A8F85] font-mono">
                          • {story.customer_name}
                        </span>
                      )}
                    </div>
                    
                    <h2 className="font-serif text-xl sm:text-2xl text-[#221F1C] group-hover:text-[#DFBC94] transition-colors leading-snug">
                      {story.title}
                    </h2>
                    
                    {story.content && (
                      <p className="text-sm sm:text-base text-[#6B6259] line-clamp-2 sm:line-clamp-3 leading-relaxed font-sans">
                        {story.content}
                      </p>
                    )}

                    <div className="pt-1 flex items-center text-xs sm:text-sm font-medium text-[#221F1C] group-hover:text-[#DFBC94] transition-colors">
                      <span>Read full story &rarr;</span>
                    </div>
                  </div>

                </div>
              </NextLink>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
