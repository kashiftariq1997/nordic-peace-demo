import { cacheLife, cacheTag } from "next/cache";

import type { Collection } from "@/types";
import { isShopifyConfigured } from "@/lib/shopify";
import { mockQueryCollection, mockQueryCollections } from "@/services/mock-queries";
import { fetchCollectionByHandle, fetchCollections } from "@/services/shopify-queries";
import { getProducts } from "@/services/products";

/**
 * Cached collection queries. Tagged "collections" (the /api/revalidate
 * webhook refreshes it); product counts on the mock path use membership.
 */

export const COLLECTIONS_TAG = "collections";
const CATALOG_LIFE = "hours";

/** The virtual "all" collection — every product, no physical Shopify record. */
export const ALL_COLLECTION_HANDLE = "all";

const VIRTUAL_ALL: Collection = {
  id: "virtual-all",
  handle: ALL_COLLECTION_HANDLE,
  title: "All Products",
  description: "Everything in the shop, in one place.",
  image: null,
  productsCount: 0, // filled in by the caller when needed
};

async function loadCollections(): Promise<Collection[]> {
  if (!isShopifyConfigured()) {
    return mockQueryCollections();
  }
  return fetchCollections();
}

async function loadCollection(handle: string): Promise<Collection | null> {
  if (handle === ALL_COLLECTION_HANDLE) {
    // Count the whole catalog via the shared products path (cheap: first=1 page).
    const page = await getProducts({ collectionHandle: ALL_COLLECTION_HANDLE, first: 1 });
    return { ...VIRTUAL_ALL, productsCount: page.totalCount };
  }
  if (!isShopifyConfigured()) {
    return mockQueryCollection(handle);
  }
  const result = await fetchCollectionByHandle(handle);
  return result?.collection ?? null;
}

export async function getCollections(): Promise<Collection[]> {
  "use cache";
  cacheTag(COLLECTIONS_TAG);
  cacheLife(CATALOG_LIFE);
  return loadCollections();
}

export async function getCollection(handle: string): Promise<Collection | null> {
  "use cache";
  cacheTag(COLLECTIONS_TAG);
  cacheLife(CATALOG_LIFE);
  return loadCollection(handle);
}
