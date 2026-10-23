import type { Collection, Paginated, Product, ProductQueryParams } from "@/types";
import {
  applyProductFilters,
  applyProductSort,
  paginateProducts,
} from "@/services/product-listing";
import { MOCK_PRODUCTS } from "@/services/mock-products";
import { MOCK_COLLECTIONS } from "@/services/mock-collections";

/**
 * SAMPLE CONTENT — mock implementations of the data-layer queries. These
 * mirror the shape of the Shopify query results in shopify-queries.ts, so the
 * cached service functions in products.ts / collections.ts can call either
 * path interchangeably.
 */

function matchesQuery(product: Product, query?: string): boolean {
  if (!query) {
    return true;
  }
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return true;
  }
  const haystack = [product.title, product.description, product.productType, ...product.tags]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

export async function mockQueryProducts(params: ProductQueryParams): Promise<Paginated<Product>> {
  const { collectionHandle, query, filters, sort, first, cursor } = params;

  let items = [...MOCK_PRODUCTS];

  if (collectionHandle && collectionHandle !== "all") {
    items = items.filter((product) => product.collections.includes(collectionHandle));
  }

  items = items.filter((product) => matchesQuery(product, query));
  items = applyProductFilters(items, filters);
  items = applyProductSort(items, sort);

  return paginateProducts(items, { first, cursor });
}

export async function mockQueryProduct(handle: string): Promise<Product | null> {
  return MOCK_PRODUCTS.find((product) => product.handle === handle) ?? null;
}

/** Products across ALL collections whose handles match (order preserved). */
export async function mockQueryProductsByHandles(handles: readonly string[]): Promise<Product[]> {
  const handleSet = new Set(handles);
  return MOCK_PRODUCTS.filter((product) => handleSet.has(product.handle));
}

export async function mockQueryCollections(): Promise<Collection[]> {
  return MOCK_COLLECTIONS.map((collection) => ({
    ...collection,
    productsCount: MOCK_PRODUCTS.filter((product) =>
      product.collections.includes(collection.handle),
    ).length,
  }));
}

export async function mockQueryCollection(handle: string): Promise<Collection | null> {
  const collections = await mockQueryCollections();
  return collections.find((collection) => collection.handle === handle) ?? null;
}
