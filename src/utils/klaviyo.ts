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
const EMAIL_KEY = "np-klaviyo-email";
const KLAVIYO_SCRIPT_SRC = "https://static.klaviyo.com/onsite/js/klaviyo.js";

/**
 * "unknown" — server snapshot (no browser storage).
 * "pending" — visitor has not decided yet (banner shows).
 * "granted" / "denied" — stored choice.
 */
export type MarketingConsent = "unknown" | "pending" | "granted" | "denied";

type KlaviyoCommand = readonly [string, ...unknown[]];
const queueProxyMarker = Symbol("klaviyoQueueProxy");

type KlaviyoQueue = {
  push: (...commands: KlaviyoCommand[]) => number;
  [queueProxyMarker]?: true;
};

declare global {
  interface Window {
    _klOnsite?: KlaviyoCommand[];
    klaviyo?: KlaviyoQueue | KlaviyoCommand[];
  }
}

const consentListeners = new Set<() => void>();
let sessionEmail: string | null = null;

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
  if (granted && sessionEmail) {
    window.localStorage.setItem(EMAIL_KEY, sessionEmail);
  } else if (!granted) {
    window.localStorage.removeItem(EMAIL_KEY);
    sessionEmail = null;
  }
  for (const listener of consentListeners) {
    listener();
  }
}

/** Remember a subscribed address in memory, persisting it only with consent. */
export function rememberKlaviyoEmail(email: string): void {
  if (typeof window === "undefined") return;
  const normalizedEmail = email.trim();
  if (!normalizedEmail) return;

  sessionEmail = normalizedEmail;
  if (readConsent() !== "granted") return;

  window.localStorage.setItem(EMAIL_KEY, normalizedEmail);
  identifyKlaviyoProfile();
}

/** Identify the known subscriber only after marketing consent is granted. */
export function identifyKlaviyoProfile(): void {
  if (typeof window === "undefined" || readConsent() !== "granted") return;
  const email = window.localStorage.getItem(EMAIL_KEY) ?? sessionEmail;
  if (!email) return;

  queueKlaviyoCommand(["identify", { email }]);
}

function ensureKlaviyoQueue(): void {
  const existingQueue = window.klaviyo;
  if (existingQueue && !Array.isArray(existingQueue) && existingQueue[queueProxyMarker]) {
    return;
  }

  const onsiteQueue = (window._klOnsite ??= []);
  if (Array.isArray(existingQueue)) {
    onsiteQueue.push(...existingQueue);
  }

  const queueProxy = new Proxy({} as KlaviyoQueue, {
    get(target, property, receiver) {
      if (property === "push") {
        return (...commands: KlaviyoCommand[]) => {
          const queue = (window._klOnsite ??= []);
          for (const command of commands) {
            queue.push(command);
            if (process.env.NODE_ENV !== "production") {
              const eventName =
                command[0] === "track" && typeof command[1] === "string" ? command[1] : command[0];
              console.debug("[klaviyo] queued", eventName);
            }
          }
          return queue.length;
        };
      }
      return Reflect.get(target, property, receiver);
    },
  });
  Object.defineProperty(queueProxy, queueProxyMarker, { value: true });
  window.klaviyo = queueProxy;
}

function queueKlaviyoCommand(command: KlaviyoCommand): void {
  ensureKlaviyoQueue();
  window.klaviyo?.push(command);
}

/** Inject the Klaviyo loader once; subsequent calls are no-ops. */
export function loadKlaviyoScript(publicKey: string): void {
  if (typeof window === "undefined" || !publicKey) return;
  ensureKlaviyoQueue();
  if (document.querySelector("script[data-klaviyo-loader]")) return;
  const script = document.createElement("script");
  script.src = `${KLAVIYO_SCRIPT_SRC}?company_id=${encodeURIComponent(publicKey)}`;
  script.async = true;
  script.crossOrigin = "anonymous";
  script.dataset.klaviyoLoader = "true";
  script.addEventListener("error", () => {
    console.warn("Klaviyo onsite script failed to load.");
    script.remove();
  });
  document.head.appendChild(script);
}

/**
 * Fire a Klaviyo event — silently no-ops without granted consent or a loaded
 * script. Queueing into `window.klaviyo` works even before the script lands.
 */
export function trackKlaviyoEvent(event: KlaviyoCommand): void {
  if (typeof window === "undefined" || readConsent() !== "granted") return;
  identifyKlaviyoProfile();
  queueKlaviyoCommand(event);
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
