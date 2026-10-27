"use server";

import { getProducts } from "@/services";
import type { SearchSuggestion } from "@/types";

/**
 * Search server action (spec Step C) — debounced suggestions for the header
 * and /search input. Resolves through the same cached product query as the
 * results grid, so suggestions and results always agree.
 */
export async function getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }

  const page = await getProducts({ query: trimmed, first: 6 });
  return page.items.slice(0, 5).map((product) => ({
    handle: product.handle,
    title: product.title,
    price: product.priceRange.min,
    imageUrl: product.featuredImage?.url ?? null,
    imageAlt: product.featuredImage?.altText || product.title,
  }));
}
