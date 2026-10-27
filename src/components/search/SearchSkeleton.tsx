/** Placeholder mirroring the search layout while searchParams stream in. */
export function SearchSkeleton() {
  return (
    <div role="status" className="flex flex-col gap-8">
      <span className="sr-only">Loading search results</span>

      <div aria-hidden="true" className="mx-auto w-full max-w-2xl">
        <div className="bg-blush h-12 animate-pulse rounded-full" />
      </div>

      <div aria-hidden="true" className="bg-blush h-4 w-40 animate-pulse rounded-full" />

      <div
        aria-hidden="true"
        className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4"
      >
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="flex flex-col gap-3">
            <div className="bg-blush aspect-4/5 animate-pulse rounded-3xl" />
            <div className="bg-blush h-4 w-3/4 animate-pulse rounded-full" />
            <div className="bg-blush h-4 w-1/3 animate-pulse rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
