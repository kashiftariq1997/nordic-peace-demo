/**
 * Consent-aware Klaviyo browser helper (spec §6). Private key material never
 * touches this file — only the public site ID (which is safe to ship).
 *
 * Marketing consent lives in localStorage and is exposed as a tiny external
 * store for useSyncExternalStore, so components read it without effects.
 * The Klaviyo script is only injected and events only fired when consent has
 * been granted — the cookie consent banner gates all tracking.
 */

const CONSENT_KEY = "np-marketing-consent";
const KLAVIYO_SCRIPT_SRC = "https://static.klaviyo.com/klaviyo.js";

/**
 * "unknown" — server snapshot (no browser storage).
 * "pending" — visitor has not decided yet (banner shows).
 * "granted" / "denied" — stored choice.
 */
export type MarketingConsent = "unknown" | "pending" | "granted" | "denied";

type KlaviyoEvent = readonly [string, string, Record<string, unknown>?];

declare global {
  interface Window {
    klaviyo?: unknown[];
  }
}

const consentListeners = new Set<() => void>();

function readConsent(): MarketingConsent {
  if (typeof window === "undefined") return "unknown";
  const stored = window.localStorage.getItem(CONSENT_KEY);
  if (stored === "granted") return "granted";
  if (stored === "denied") return "denied";
  return "pending";
}

/** useSyncExternalStore client snapshot. */
export function getMarketingConsentSnapshot(): MarketingConsent {
  return readConsent();
}

/** useSyncExternalStore server snapshot — always the neutral value. */
export function getServerMarketingConsentSnapshot(): MarketingConsent {
  return "unknown";
}

/** Subscribe to consent changes (own writes notify; cross-tab via storage). */
export function subscribeMarketingConsent(onStoreChange: () => void): () => void {
  consentListeners.add(onStoreChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key === CONSENT_KEY) onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    consentListeners.delete(onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** Persist the visitor's choice and notify subscribers. */
export function saveMarketingConsent(granted: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONSENT_KEY, granted ? "granted" : "denied");
  for (const listener of consentListeners) {
    listener();
  }
}

/** Inject the Klaviyo loader once; subsequent calls are no-ops. */
export function loadKlaviyoScript(publicKey: string): void {
  if (typeof window === "undefined" || !publicKey) return;
  window.klaviyo = window.klaviyo ?? [];
  if (document.querySelector("script[data-klaviyo-loader]")) return;
  const script = document.createElement("script");
  script.src = `${KLAVIYO_SCRIPT_SRC}?company_id=${encodeURIComponent(publicKey)}`;
  script.async = true;
  script.crossOrigin = "anonymous";
  script.dataset.klaviyoLoader = "true";
  document.head.appendChild(script);
}

/**
 * Fire a Klaviyo event — silently no-ops without granted consent or a loaded
 * script. Queueing into `window.klaviyo` works even before the script lands.
 */
export function trackKlaviyoEvent(event: KlaviyoEvent): void {
  if (typeof window === "undefined" || readConsent() !== "granted") return;
  window.klaviyo = window.klaviyo ?? [];
  window.klaviyo.push(event);
}

/** Spec event: fires when a visitor opens a product page. */
export function trackViewedProduct(product: {
  readonly id: string;
  readonly name: string;
  readonly handle: string;
  readonly price: number;
}): void {
  trackKlaviyoEvent(["track", "Viewed Product", { ...product }]);
}

/** Spec event: fires when a visitor adds a product to the cart. */
export function trackAddedToCart(product: {
  readonly id: string;
  readonly name: string;
  readonly handle: string;
  readonly price: number;
  readonly quantity?: number;
}): void {
  trackKlaviyoEvent(["track", "Added to Cart", { ...product }]);
}
