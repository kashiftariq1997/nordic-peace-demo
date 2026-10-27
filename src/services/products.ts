import { cacheLife, cacheTag } from "next/cache";

import type { Paginated, Product, ProductQueryParams } from "@/types";
import { isShopifyConfigured } from "@/lib/shopify";
import {
  applyProductFilters,
  applyProductSort,
  paginateProducts,
} from "@/services/product-listing";
import {
  mockQueryProduct,
  mockQueryProducts,
  mockQueryProductsByHandles,
} from "@/services/mock-queries";
import { fetchProductByHandle, fetchProductsScoped } from "@/services/shopify-queries";

/**
 * Cached product queries. Both paths (Shopify API and mock fallback) share the
 * same filter/sort/pagination helpers and the same cache tags, so the
 * /api/revalidate webhook refreshes whichever path is live.
 *
 * Internal `loadProducts` / `loadProduct` are uncached so the cached public
 * functions never nest ("use cache" functions must not call each other with
 * identical work); the public functions add cacheTag + cacheLife around them.
 */

export const PRODUCTS_TAG = "products";
const CATALOG_LIFE = "hours";

async function loadProducts(params: ProductQueryParams): Promise<Paginated<Product>> {
  if (!isShopifyConfigured()) {
    return mockQueryProducts(params);
  }

  // Demo tradeoff (see shopify-queries.ts): fetch a scoped window, then reuse
  // the shared in-memory filter/sort/paginate helpers.
  const scoped = await fetchProductsScoped({
    collectionHandle: params.collectionHandle,
    query: params.query,
  });
  const filtered = applyProductFilters(scoped, params.filters);
  const sorted = applyProductSort(filtered, params.sort);
  return paginateProducts(sorted, { first: params.first, cursor: params.cursor });
}

async function loadProduct(handle: string): Promise<Product | null> {
  if (!isShopifyConfigured()) {
    return mockQueryProduct(handle);
  }
  return fetchProductByHandle(handle);
}

/** Paged product list. Default page size 12; cursor is the offset string. */
export async function getProducts(params: ProductQueryParams = {}): Promise<Paginated<Product>> {
  "use cache";
  cacheTag(PRODUCTS_TAG);
  cacheLife(CATALOG_LIFE);
  return loadProducts(params);
}

export async function getProduct(handle: string): Promise<Product | null> {
  "use cache";
  cacheTag(PRODUCTS_TAG);
  cacheLife(CATALOG_LIFE);
  return loadProduct(handle);
}

/** Fetch products by handle, preserving the requested handle order. */
export async function getProductsByHandles(handles: readonly string[]): Promise<Product[]> {
  "use cache";
  cacheTag(PRODUCTS_TAG);
  cacheLife(CATALOG_LIFE);

  if (handles.length === 0) {
    return [];
  }

  if (!isShopifyConfigured()) {
    return mockQueryProductsByHandles(handles);
  }

  // Scoped fetch covers up to MAX_SCOPED_NODES products; ordering follows handles.
  const scoped = await fetchProductsScoped();
  const byHandle = new Map(scoped.map((product) => [product.handle, product]));
  return handles
    .map((handle) => byHandle.get(handle))
    .filter((product): product is Product => product !== undefined);
}

/** Bestsellers: products tagged "bestseller", featured order. */
export async function getBestsellers(first = 4): Promise<Product[]> {
  const page = await getProducts({
    filters: { tags: ["bestseller"] },
    sort: "featured",
    first,
  });
  return page.items;
}

/**
 * Distinct filter values for the collection sidebar, derived from the live
 * catalog (types, sizes, colors, price bounds).
 */
export async function getCatalogFilterOptions(collectionHandle?: string): Promise<{
  productTypes: string[];
  sizes: string[];
  colors: string[];
  priceMin: number;
  priceMax: number;
}> {
  "use cache";
  cacheTag(PRODUCTS_TAG);
  cacheLife(CATALOG_LIFE);

  const page = await loadProducts({ collectionHandle, first: 250 });

  const productTypes = new Set<string>();
  const sizes = new Set<string>();
  const colors = new Set<string>();
  let priceMin = Number.POSITIVE_INFINITY;
  let priceMax = Number.NEGATIVE_INFINITY;

  for (const product of page.items) {
    productTypes.add(product.productType);
    for (const option of product.options) {
      const name = option.name.toLowerCase();
      if (name === "size") option.values.forEach((value) => sizes.add(value));
      if (name === "color") option.values.forEach((value) => colors.add(value));
    }
    priceMin = Math.min(priceMin, product.priceRange.min.amount);
    priceMax = Math.max(priceMax, product.priceRange.max.amount);
  }

  return {
    productTypes: [...productTypes].sort(),
    sizes: [...sizes],
    colors: [...colors],
    priceMin: Number.isFinite(priceMin) ? priceMin : 0,
    priceMax: Number.isFinite(priceMax) ? priceMax : 0,
  };
}
