export default function ProductDetailLoading() {
  return (
    <main className="flex flex-col min-h-screen pt-32 pb-24 px-4 md:px-8">
      <div className="container mx-auto max-w-6xl">
        {/* Breadcrumb Skeleton */}
        <div className="h-4 w-48 bg-[#EDE7DC] rounded-sm animate-pulse motion-reduce:animate-none mb-8" />

        <div className="flex flex-col md:flex-row gap-12 lg:gap-20">
          {/* Left: Product Images Skeleton */}
          <div className="w-full md:w-1/2">
            <div className="aspect-[4/5] bg-[#E8E1D5] rounded-sm animate-pulse motion-reduce:animate-none mb-4" />
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-16 h-16 bg-[#EDE7DC] rounded-sm animate-pulse motion-reduce:animate-none" />
              ))}
            </div>
          </div>

          {/* Right: Product Details Skeleton */}
          <div className="w-full md:w-1/2 flex flex-col">
            {/* Title Skeleton */}
            <div className="h-8 md:h-10 w-3/4 bg-[#E8E1D5] rounded-sm animate-pulse motion-reduce:animate-none mb-4" />
            
            {/* Price Skeleton */}
            <div className="h-8 w-28 bg-[#EDE7DC] rounded-sm animate-pulse motion-reduce:animate-none mb-2" />
            <div className="h-3 w-20 bg-[#EDE7DC] rounded-sm animate-pulse motion-reduce:animate-none mb-6" />

            {/* Variant Options Skeleton */}
            <div className="mb-6">
              <div className="h-4 w-24 bg-[#EDE7DC] rounded-sm animate-pulse motion-reduce:animate-none mb-2" />
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-9 w-20 bg-[#EDE7DC] rounded-sm animate-pulse motion-reduce:animate-none" />
                ))}
              </div>
            </div>

            {/* Photo / Delivery Info Box Skeleton (No fake upload!) */}
            <div className="p-4 bg-[#FBF6EE] border border-[#E0D9CF] rounded-sm mb-6 space-y-2">
              <div className="h-4 w-1/2 bg-[#E8E1D5] rounded-sm animate-pulse motion-reduce:animate-none" />
              <div className="h-3 w-3/4 bg-[#EDE7DC] rounded-sm animate-pulse motion-reduce:animate-none" />
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex gap-3 w-full mt-2">
              <div className="flex-1 h-12 bg-[#221F1C]/20 rounded-full animate-pulse motion-reduce:animate-none" />
              <div className="flex-1 h-12 border border-[#221F1C]/20 rounded-full animate-pulse motion-reduce:animate-none" />
              <div className="w-12 h-12 rounded-full border border-[#E0D9CF] animate-pulse motion-reduce:animate-none" />
            </div>

            {/* Description Accordion Skeleton */}
            <div className="mt-10 border-t border-[#E0D9CF] pt-6 space-y-3">
              <div className="h-5 w-40 bg-[#EDE7DC] rounded-sm animate-pulse motion-reduce:animate-none" />
              <div className="h-4 w-full bg-[#EDE7DC] rounded-sm animate-pulse motion-reduce:animate-none" />
              <div className="h-4 w-5/6 bg-[#EDE7DC] rounded-sm animate-pulse motion-reduce:animate-none" />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
