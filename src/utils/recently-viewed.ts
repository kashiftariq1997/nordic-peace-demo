/**
 * Recently-viewed products (spec Step A) — a tiny localStorage-backed
 * external store for useSyncExternalStore (same pattern as the consent
 * store). Snapshots stay small (handle/title/price/image only) so the rail
 * renders entirely on the client without a server round-trip.
 */

const STORAGE_KEY = "np-recently-viewed";
const MAX_ITEMS = 8;

export type RecentlyViewedProduct = {
  handle: string;
  title: string;
  price: { amount: number; currencyCode: string };
  imageUrl: string | null;
  imageAlt: string;
};

const EMPTY: RecentlyViewedProduct[] = [];
const listeners = new Set<() => void>();
/** Cached snapshot — React requires getSnapshot to return a stable reference. */
let cached: RecentlyViewedProduct[] | null = null;

function isRecentlyViewedProduct(value: unknown): value is RecentlyViewedProduct {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<RecentlyViewedProduct>;
  return typeof candidate.handle === "string" && typeof candidate.title === "string";
}

function read(): RecentlyViewedProduct[] {
  if (typeof window === "undefined") return EMPTY;
  if (cached) return cached;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cached = Array.isArray(parsed) ? parsed.filter(isRecentlyViewedProduct) : [];
  } catch {
    cached = [];
  }
  return cached;
}

/** useSyncExternalStore client snapshot. */
export function getRecentlyViewedSnapshot(): RecentlyViewedProduct[] {
  return read();
}

/** useSyncExternalStore server snapshot — always empty. */
export function getServerRecentlyViewedSnapshot(): RecentlyViewedProduct[] {
  return EMPTY;
}

/** Subscribe to rail changes (own writes notify; cross-tab via storage). */
export function subscribeRecentlyViewed(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cached = null;
      onStoreChange();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** Record a product view — newest first, deduped by handle, capped at 8. */
export function recordRecentlyViewed(product: RecentlyViewedProduct): void {
  if (typeof window === "undefined") return;
  const next = [product, ...read().filter((item) => item.handle !== product.handle)].slice(
    0,
    MAX_ITEMS,
  );
  cached = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage full/unavailable — the rail simply degrades to fewer items.
  }
  for (const listener of listeners) {
    listener();
  }
}
