import * as React from "react"
import Image from "next/image"
import { Link } from "@/components/ui/link"
import { SectionHeading } from "@/components/ui/section-heading"

const stories = [
  {
    id: 1,
    title: "A Year of Long Distance",
    occasion: "Anniversary",
    image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    slug: "year-of-long-distance"
  },
  {
    id: 2,
    title: "To My Best Friend, On Her 30th",
    occasion: "Birthday",
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    slug: "best-friend-30th"
  },
  {
    id: 3,
    title: "Our First Home Together",
    occasion: "Milestone",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    slug: "first-home"
  }
]

export function BloomJournalSection() {
  return (
    <section className="py-24 px-4 md:px-8">
      <div className="container mx-auto max-w-7xl">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="font-mono text-xs tracking-[0.2em] uppercase text-text-muted mb-4">
            The Bloom Stories
          </div>
          <SectionHeading as="h2" className="mb-4">Real stories behind the gifts.</SectionHeading>
          <p className="text-text-muted text-lg">
            Every magazine we print holds a completely unique story. Here are a few of our favorites, shared with permission.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stories.map((story) => (
            <div key={story.id} className="group cursor-pointer">
              <a href="/stories" className="block">
                <div className="relative aspect-[4/3] sm:aspect-square md:aspect-[3/4] max-h-[320px] sm:max-h-none w-full overflow-hidden bg-surface mb-4 border border-border">
                  <Image 
                    src={story.image}
                    alt={story.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-col items-center text-center space-y-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                    {story.occasion}
                  </span>
                  <h3 className="font-serif text-2xl text-ink group-hover:text-accent transition-colors">
                    {story.title}
                  </h3>
                </div>
              </a>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link href="/stories" variant="default">
            Read More Stories
          </Link>
        </div>

      </div>
    </section>
  )
}
