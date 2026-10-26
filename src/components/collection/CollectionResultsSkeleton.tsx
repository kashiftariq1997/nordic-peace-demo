const SIDEBAR_BLOCKS = ["w-24", "w-full", "w-full", "w-32", "w-full"] as const;

/** Placeholder mirroring the collection layout while results stream in. */
export function CollectionResultsSkeleton() {
  return (
    <div role="status" className="grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-10">
      <span className="sr-only">Loading products</span>

      <div aria-hidden="true">
        {/* Mobile: compact filter bar */}
        <div className="bg-blush h-12 animate-pulse rounded-3xl lg:hidden" />
        {/* Desktop: sidebar panel */}
        <div className="border-line bg-cream hidden flex-col gap-6 rounded-3xl border p-5 lg:flex">
          <div className="bg-blush h-5 w-20 animate-pulse rounded-full" />
          {SIDEBAR_BLOCKS.map((width, index) => (
            <div key={index} className="flex flex-col gap-3">
              <div className={`bg-blush h-3 animate-pulse rounded-full ${width}`} />
              <div className="bg-blush h-4 w-full animate-pulse rounded-full" />
              <div className="bg-blush h-4 w-2/3 animate-pulse rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <div aria-hidden="true" className="flex min-w-0 flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="bg-blush h-4 w-28 animate-pulse rounded-full" />
          <div className="bg-blush h-11 w-48 animate-pulse rounded-full" />
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="flex flex-col gap-3">
              <div className="bg-blush aspect-4/5 animate-pulse rounded-3xl" />
              <div className="bg-blush h-4 w-3/4 animate-pulse rounded-full" />
              <div className="bg-blush h-4 w-1/3 animate-pulse rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
