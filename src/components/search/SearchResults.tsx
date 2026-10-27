import Link from "next/link";
import { CollectionGrid, ProductGrid } from "@/components/common";
import { ROUTES, SUGGESTED_COLLECTION_HANDLES } from "@/constants";
import { getBestsellers, getCollections, getProducts } from "@/services";
import type { Collection, Product } from "@/types";
import { SearchBox } from "./SearchBox";

export type SearchResultsProps = {
  /** Awaited inside Suspense (spec §9) — never at the page's top level. */
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const MAX_RESULTS = 24;

/**
 * /search body (spec Step C): live-suggestions input plus the results grid.
 * With no query (or no matches) it renders suggestions — curated collections
 * and bestsellers — instead of a dead end.
 */
export async function SearchResults({ searchParams }: SearchResultsProps) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";

  if (!query) {
    return (
      <div className="flex flex-col gap-14">
        <div className="mx-auto w-full max-w-2xl">
          <SearchBox />
        </div>
        <SuggestionsSections />
      </div>
    );
  }

  const results = await getProducts({ query, first: MAX_RESULTS });
  const resultsHeader = (
    <>
      <div className="mx-auto w-full max-w-2xl">
        <SearchBox key={query} initialQuery={query} />
      </div>
      <p aria-live="polite" className="text-plum-soft text-sm">
        {results.totalCount} result{results.totalCount === 1 ? "" : "s"} for “{query}”
      </p>
    </>
  );

  if (results.items.length === 0) {
    return (
      <div className="flex flex-col gap-14">
        {resultsHeader}
        <section className="flex flex-col items-center gap-4 text-center">
          <h2 className="font-heading text-plum text-3xl">No matches for “{query}”</h2>
          <p className="text-plum-soft max-w-md text-base leading-7">
            Nothing here yet — try a different word, or explore one of these instead.
          </p>
        </section>
        <SuggestionsSections />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {resultsHeader}
      <ProductGrid products={results.items} />
    </div>
  );
}

/** Suggested collections + bestsellers — the "empty state with suggestions". */
async function SuggestionsSections() {
  const [collections, bestsellers] = await Promise.all([getCollections(), getBestsellers(4)]);
  const suggested = collections.filter((collection) =>
    SUGGESTED_COLLECTION_HANDLES.includes(collection.handle),
  );
  const featured: readonly Product[] = bestsellers;
  const suggestedCollections: readonly Collection[] = suggested;

  return (
    <div className="flex flex-col gap-12">
      <section aria-labelledby="search-suggestions-heading" className="flex flex-col gap-6">
        <div className="border-line flex items-baseline justify-between gap-4 border-b pb-3">
          <h2 id="search-suggestions-heading" className="font-heading text-plum text-2xl">
            Start with a collection
          </h2>
        </div>
        <CollectionGrid collections={suggestedCollections} />
      </section>

      <section aria-labelledby="search-bestsellers-heading" className="flex flex-col gap-6">
        <div className="border-line flex items-baseline justify-between gap-4 border-b pb-3">
          <h2 id="search-bestsellers-heading" className="font-heading text-plum text-2xl">
            Bestsellers
          </h2>
          <Link
            href={ROUTES.COLLECTION_ALL}
            className="text-rose-ink hover:text-plum text-sm font-medium underline underline-offset-4 transition-colors"
          >
            Shop all
          </Link>
        </div>
        <ProductGrid products={featured} />
      </section>
    </div>
  );
}
