import { SectionHeading } from "@/components/ui/section-heading"
import { Link } from "@/components/ui/link"
import { getPublishedJournals } from "@/app/actions/journal"
import Image from "next/image"

export const dynamic = "force-dynamic"

export default async function StoriesPage() {
  const stories = await getPublishedJournals()

  return (
    <main className="flex flex-col min-h-screen pt-36 pb-24 px-4 md:px-8">
      <div className="container mx-auto max-w-6xl">
        <header className="mb-16">
          <SectionHeading as="h1">Stories</SectionHeading>
          <p className="mt-4 text-text-muted text-lg max-w-2xl">
            Real stories, real people, real memories. See how our customers are turning their favourite moments into keepsakes.
          </p>
        </header>
        
        {stories.length === 0 ? (
          <div className="text-center py-20 text-[#9A8F85]">
            <p className="text-xl font-serif">No stories published yet.</p>
            <p className="mt-2 text-sm">Check back soon for new memories!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {stories.map((story: any) => (
              <Link href={`/stories/${story.slug}`} key={story.id} className="group block">
                <div className="aspect-[4/5] bg-surface mb-4 w-full relative overflow-hidden rounded-sm">
                  {story.media_url ? (
                    story.media_type === 'video' ? (
                      <video src={story.media_url} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" autoPlay muted loop playsInline />
                    ) : (
                      <Image src={story.media_url} alt={story.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#9A8F85] text-sm">No image</div>
                  )}
                </div>
                <h3 className="font-serif text-2xl group-hover:text-accent transition-colors">{story.title}</h3>
                <p className="text-[#9A8F85] mt-2 flex justify-between items-center text-sm">
                  <span>{story.customer_name}</span>
                  <span className="italic opacity-80">{story.product_name}</span>
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
