"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { CollectionGrid, ProductGrid } from "@/components/common";
import { resolveWishlistProducts } from "@/lib/wishlist-actions";
import type { Collection, Product } from "@/types";
import {
  getServerWishlistSnapshot,
  getWishlistSnapshot,
  subscribeWishlist,
} from "@/utils/wishlist";

export type WishlistGridProps = {
  /** Shown only when the wishlist is empty — data comes from the server page. */
  suggestedCollections: readonly Collection[];
  suggestedProducts: readonly Product[];
};

/**
 * Wishlist body (spec Step C). Saved handles come from the localStorage
 * store; products are resolved server-side (live prices/availability) and
 * cached by handle. `undefined` = still resolving, `null` = product no
 * longer exists. The server snapshot is `null` so SSR never flashes the
 * empty state before hydration.
 */
export function WishlistGrid({ suggestedCollections, suggestedProducts }: WishlistGridProps) {
  const handles = useSyncExternalStore(
    subscribeWishlist,
    getWishlistSnapshot,
    getServerWishlistSnapshot,
  );
  const [resolved, setResolved] = useState<Record<string, Product | null>>({});
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!handles) return;
    const missing = handles.filter((handle) => !(handle in resolved));
    if (missing.length === 0) return;
    resolveWishlistProducts(missing)
      .then((products) => {
        const byHandle = new Map(products.map((product) => [product.handle, product]));
        setResolved((previous) => {
          const next = { ...previous };
          for (const handle of missing) {
            next[handle] = byHandle.get(handle) ?? null;
          }
          return next;
        });
        setFailed(false);
      })
      .catch(() => setFailed(true));
  }, [handles, resolved, attempt]);

  if (!handles) {
    return (
      <div
        role="status"
        aria-hidden="true"
        className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4"
      >
        <span className="sr-only">Loading your wishlist</span>
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex flex-col gap-3">
            <div className="bg-blush aspect-4/5 animate-pulse rounded-3xl" />
            <div className="bg-blush h-4 w-3/4 animate-pulse rounded-full" />
            <div className="bg-blush h-4 w-1/3 animate-pulse rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (handles.length === 0) {
    return (
      <div className="flex flex-col gap-14">
        <section className="flex flex-col items-center gap-4 text-center">
          <h2 className="font-heading text-plum text-3xl">Nothing saved yet</h2>
          <p className="text-plum-soft max-w-md text-base leading-7">
            Tap the heart on any product and it will wait for you here — on this device.
          </p>
        </section>
        <section aria-labelledby="wishlist-suggestions-heading" className="flex flex-col gap-6">
          <div className="border-line border-b pb-3">
            <h2 id="wishlist-suggestions-heading" className="font-heading text-plum text-2xl">
              Start with a collection
            </h2>
          </div>
          <CollectionGrid collections={suggestedCollections} />
        </section>
        <section aria-labelledby="wishlist-bestsellers-heading" className="flex flex-col gap-6">
          <div className="border-line border-b pb-3">
            <h2 id="wishlist-bestsellers-heading" className="font-heading text-plum text-2xl">
              Bestsellers
            </h2>
          </div>
          <ProductGrid products={suggestedProducts} />
        </section>
      </div>
    );
  }

  const products = handles
    .map((handle) => resolved[handle])
    .filter((product): product is Product => product !== undefined && product !== null);
  const pending = handles.length - products.length;

  return (
    <div className="flex flex-col gap-6">
      <p aria-live="polite" className="text-plum-soft text-sm">
        {products.length} saved
        {pending > 0 ? " · loading more…" : ""}
      </p>

      {failed ? (
        <p role="alert" className="text-rose-ink text-sm">
          Couldn&apos;t load your wishlist —{" "}
          <button
            type="button"
            onClick={() => setAttempt((value) => value + 1)}
            className="font-medium underline underline-offset-4"
          >
            try again
          </button>
        </p>
      ) : null}

      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div
          aria-hidden="true"
          className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4"
        >
          {Array.from({ length: Math.min(pending, 4) }, (_, index) => (
            <div key={index} className="flex flex-col gap-3">
              <div className="bg-blush aspect-4/5 animate-pulse rounded-3xl" />
              <div className="bg-blush h-4 w-3/4 animate-pulse rounded-full" />
              <div className="bg-blush h-4 w-1/3 animate-pulse rounded-full" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
