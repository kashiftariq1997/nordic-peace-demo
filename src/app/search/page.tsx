import type { Metadata } from "next";
import { Suspense } from "react";
import { ContentHero } from "@/components/content";
import { Container } from "@/components/layout";
import { SearchResults, SearchSkeleton } from "@/components/search";
import { ROUTES } from "@/constants";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Nordic Peace for pajamas, robes, sleep accessories and cozy gifts.",
  alternates: { canonical: ROUTES.SEARCH },
  // Parameterized results pages shouldn't be indexed (spec §11).
  robots: { index: false, follow: true },
};

type Props = PageProps<"/search">;

export default async function SearchPage({ searchParams }: Props) {
  return (
    <>
      <ContentHero
        eyebrow="Search"
        title="Find your softest thing"
        lede="Live suggestions as you type — or browse collections below."
      />
      {/* searchParams live only inside SearchResults, behind Suspense, so the
          hero and page chrome stay part of the prerendered static shell. */}
      <section className="bg-cream py-10 sm:py-14">
        <Container>
          <Suspense fallback={<SearchSkeleton />}>
            <SearchResults searchParams={searchParams} />
          </Suspense>
        </Container>
      </section>
    </>
  );
}
