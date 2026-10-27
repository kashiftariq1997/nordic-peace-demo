import { Container } from "@/components/layout";

/**
 * Streaming fallback for /products/[handle] — mirrors the final layout
 * (gallery block + info column) so the shell doesn't jump when data lands.
 */
export function ProductDetailSkeleton() {
  return (
    <div role="status" className="bg-cream py-10 sm:py-14">
      <span className="sr-only">Loading product</span>
      <Container>
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="bg-blush aspect-4/5 animate-pulse rounded-3xl" />
          <div className="flex flex-col gap-5 py-4">
            <div className="bg-blush h-4 w-24 animate-pulse rounded-full" />
            <div className="bg-blush h-9 w-3/4 animate-pulse rounded-full" />
            <div className="bg-blush h-6 w-32 animate-pulse rounded-full" />
            <div className="flex gap-3">
              <div className="bg-blush h-11 w-20 animate-pulse rounded-full" />
              <div className="bg-blush h-11 w-20 animate-pulse rounded-full" />
              <div className="bg-blush h-11 w-20 animate-pulse rounded-full" />
            </div>
            <div className="bg-blush h-11 w-28 animate-pulse rounded-full" />
            <div className="bg-plum h-12 w-full animate-pulse rounded-full opacity-30" />
          </div>
        </div>
        <div aria-hidden="true" className="mx-auto mt-14 flex max-w-3xl flex-col gap-4">
          <div className="bg-blush h-6 w-40 animate-pulse rounded-full" />
          <div className="bg-blush h-4 w-full animate-pulse rounded-full" />
          <div className="bg-blush h-4 w-5/6 animate-pulse rounded-full" />
        </div>
      </Container>
    </div>
  );
}
