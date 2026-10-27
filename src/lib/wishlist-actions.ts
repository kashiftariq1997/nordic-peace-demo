"use server";

import { getProductsByHandles } from "@/services";
import type { Product } from "@/types";

/**
 * Wishlist server action (spec Step C) — resolves saved handles (from
 * localStorage) to full products server-side, so the wishlist grid shows
 * live prices and availability instead of stale snapshots. Handle order is
 * preserved; unknown handles (deleted products) drop out.
 */
export async function resolveWishlistProducts(handles: readonly string[]): Promise<Product[]> {
  if (handles.length === 0) {
    return [];
  }
  return getProductsByHandles(handles);
}
