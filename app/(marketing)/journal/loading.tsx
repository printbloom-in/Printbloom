export default function JournalLoading() {
  return (
    <main className="flex flex-col min-h-screen pt-36 pb-24 px-4 md:px-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header Skeleton */}
        <header className="mb-16">
          <div className="h-10 md:h-12 w-64 bg-[#E8E1D5] rounded-sm animate-pulse motion-reduce:animate-none mb-4" />
          <div className="h-4 w-full max-w-xl bg-[#EDE7DC] rounded-sm animate-pulse motion-reduce:animate-none mb-2" />
          <div className="h-4 w-2/3 max-w-md bg-[#EDE7DC] rounded-sm animate-pulse motion-reduce:animate-none" />
        </header>

        {/* Journal Stories Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="block">
              {/* Media Skeleton */}
              <div className="aspect-[4/5] bg-[#E8E1D5] rounded-sm animate-pulse motion-reduce:animate-none mb-4" />
              
              {/* Title Skeleton */}
              <div className="h-6 w-3/4 bg-[#EDE7DC] rounded-sm animate-pulse motion-reduce:animate-none mb-2" />
              
              {/* Meta Skeleton */}
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-[#EDE7DC] rounded-sm animate-pulse motion-reduce:animate-none" />
                <div className="h-4 w-28 bg-[#EDE7DC] rounded-sm animate-pulse motion-reduce:animate-none" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
