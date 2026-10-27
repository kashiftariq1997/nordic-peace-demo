/**
 * Wishlist (spec Step C) — a tiny localStorage-backed external store for
 * useSyncExternalStore (same pattern as recently-viewed). Stores product
 * handles only (newest first); product data is resolved server-side so
 * prices and availability are never stale snapshots.
 */

const STORAGE_KEY = "np-wishlist";
const MAX_ITEMS = 50;

const listeners = new Set<() => void>();
/** Cached snapshot — React requires getSnapshot to return a stable reference. `null` = not yet read (server). */
let cached: string[] | null = null;

function isHandle(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function read(): string[] {
  if (typeof window === "undefined") return [];
  if (cached) return cached;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cached = Array.isArray(parsed) ? parsed.filter(isHandle).slice(0, MAX_ITEMS) : [];
  } catch {
    cached = [];
  }
  return cached;
}

/** useSyncExternalStore client snapshot — saved handles once read. */
export function getWishlistSnapshot(): string[] | null {
  if (typeof window === "undefined") return null;
  return read();
}

/** useSyncExternalStore server snapshot — `null` means "not hydrated yet". */
export function getServerWishlistSnapshot(): string[] | null {
  return null;
}

/** Subscribe to wishlist changes (own writes notify; cross-tab via storage). */
export function subscribeWishlist(onStoreChange: () => void): () => void {
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

/** Toggle a handle on the wishlist — newest first, capped at 50. */
export function toggleWishlist(handle: string): void {
  if (typeof window === "undefined") return;
  const current = read();
  const saved = current.includes(handle);
  const next = saved
    ? current.filter((item) => item !== handle)
    : [handle, ...current].slice(0, MAX_ITEMS);
  cached = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage full/unavailable — hearts simply don't persist this session.
  }
  for (const listener of listeners) {
    listener();
  }
}
