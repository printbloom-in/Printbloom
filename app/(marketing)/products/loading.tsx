export default function ProductsLoading() {
  return (
    <main className="flex flex-col min-h-screen pt-36 pb-24 px-4 md:px-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header Skeleton */}
        <header className="mb-16 text-center md:text-left">
          <div className="h-10 md:h-12 w-3/4 max-w-md bg-[#E8E1D5] rounded-sm animate-pulse motion-reduce:animate-none mb-4 mx-auto md:mx-0" />
          <div className="h-4 w-full max-w-xl bg-[#EDE7DC] rounded-sm animate-pulse motion-reduce:animate-none mb-2 mx-auto md:mx-0" />
          <div className="h-4 w-2/3 max-w-md bg-[#EDE7DC] rounded-sm animate-pulse motion-reduce:animate-none mx-auto md:mx-0" />
        </header>

        {/* Product Grid Skeleton: A4 & A5 full-width on mobile (col-span-2), others 2 per row (col-span-1) */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {/* A4 Magazine Skeleton */}
          <div className="col-span-2 md:col-span-1">
            <div className="aspect-[3/4] bg-[#E8E1D5] rounded-sm animate-pulse motion-reduce:animate-none mb-4" />
            <div className="h-5 w-3/4 bg-[#EDE7DC] rounded-sm animate-pulse motion-reduce:animate-none mb-2" />
            <div className="h-4 w-1/4 bg-[#EDE7DC] rounded-sm animate-pulse motion-reduce:animate-none" />
          </div>

          {/* A5 Magazine Skeleton */}
          <div className="col-span-2 md:col-span-1">
            <div className="aspect-[3/4] bg-[#E8E1D5] rounded-sm animate-pulse motion-reduce:animate-none mb-4" />
            <div className="h-5 w-3/4 bg-[#EDE7DC] rounded-sm animate-pulse motion-reduce:animate-none mb-2" />
            <div className="h-4 w-1/4 bg-[#EDE7DC] rounded-sm animate-pulse motion-reduce:animate-none" />
          </div>

          {/* Standard Products Skeleton (2-col on mobile) */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="col-span-1">
              <div className="aspect-[4/5] bg-[#E8E1D5] rounded-sm animate-pulse motion-reduce:animate-none mb-3" />
              <div className="h-4 md:h-5 w-4/5 bg-[#EDE7DC] rounded-sm animate-pulse motion-reduce:animate-none mb-2" />
              <div className="h-3 md:h-4 w-1/3 bg-[#EDE7DC] rounded-sm animate-pulse motion-reduce:animate-none" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
