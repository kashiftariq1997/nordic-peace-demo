import { Container } from "@/components/layout";

/**
 * Root loading fallback — shown during client navigations while the next
 * route streams in (the collection page layers its own results skeleton
 * inside this shell).
 */
export default function Loading() {
  return (
    <div role="status" className="bg-cream flex min-h-[60vh] items-center py-16">
      <Container className="flex flex-col items-center gap-10">
        <span className="sr-only">Loading page</span>

        <div aria-hidden="true" className="flex w-full max-w-2xl flex-col items-center gap-4">
          <div className="bg-blush h-3 w-24 animate-pulse rounded-full" />
          <div className="bg-blush h-10 w-3/4 animate-pulse rounded-full" />
          <div className="bg-blush h-4 w-1/2 animate-pulse rounded-full" />
        </div>

        <div aria-hidden="true" className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="flex flex-col gap-3">
              <div className="bg-blush aspect-4/5 animate-pulse rounded-3xl" />
              <div className="bg-blush h-4 w-3/4 animate-pulse rounded-full" />
              <div className="bg-blush h-4 w-1/3 animate-pulse rounded-full" />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
