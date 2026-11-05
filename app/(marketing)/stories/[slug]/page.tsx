import { SectionHeading } from "@/components/ui/section-heading"
import { getJournalBySlug } from "@/app/actions/journal"
import { notFound } from "next/navigation"
import Image from "next/image"

type PageProps = {
  params: Promise<{ slug: string }>
}

export const dynamic = "force-dynamic"

export default async function StoryDetailPage({ params }: PageProps) {
  const resolvedParams = await params
  const story = await getJournalBySlug(resolvedParams.slug)

  if (!story || !story.published) {
    return notFound()
  }
  
  return (
    <main className="flex flex-col min-h-screen py-36 px-4 md:px-8">
      <div className="container mx-auto max-w-4xl text-center">
        <div className="uppercase tracking-widest text-xs font-mono text-text-muted mb-4">{story.product_name}</div>
        <SectionHeading as="h1">{story.title}</SectionHeading>
        
        <p className="mt-4 text-[#9A8F85] italic">Featured Story by {story.customer_name}</p>

        {story.media_url && (
          <div className="my-12 w-full aspect-video relative bg-surface rounded-sm overflow-hidden">
            {story.media_type === 'video' ? (
              <video src={story.media_url} className="object-contain w-full h-full bg-[#F5F0E8]" controls />
            ) : (
              <Image src={story.media_url} alt={story.title} fill className="object-contain bg-[#F5F0E8]" />
            )}
          </div>
        )}

        <div className="mt-8 text-left text-lg leading-relaxed text-[#221F1C] whitespace-pre-wrap font-serif">
          {story.content}
        </div>
      </div>
    </main>
  )
}
