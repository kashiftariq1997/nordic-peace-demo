const CONSENT_KEY = "np-marketing-consent";
const GA4_SCRIPT_ID = "np-ga4-loader";
const GA4_SCRIPT_SRC = "https://www.googletagmanager.com/gtag/js";

type GA4EventName = "page_view" | "view_item" | "add_to_cart" | "begin_checkout";
type GA4EventParams = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

let configuredMeasurementId: string | null = null;

function hasMarketingConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(CONSENT_KEY) === "granted";
  } catch {
    return false;
  }
}

function disableMeasurement(measurementId: string): void {
  window[`ga-disable-${measurementId}`] = true;
}

function enableMeasurement(measurementId: string): void {
  window[`ga-disable-${measurementId}`] = false;
}

function ensureGtagQueue(): void {
  window.dataLayer ??= [];
  window.gtag ??= (...args: unknown[]) => {
    window.dataLayer?.push(args);
  };
}

/** Load GA4 once, but only after explicit marketing consent. */
export function loadGA4(): void {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (typeof window === "undefined" || !measurementId) return;
  if (!hasMarketingConsent()) {
    disableMeasurement(measurementId);
    return;
  }

  enableMeasurement(measurementId);
  ensureGtagQueue();

  if (configuredMeasurementId !== measurementId) {
    window.gtag?.("js", new Date());
    window.gtag?.("config", measurementId, { send_page_view: false });
    configuredMeasurementId = measurementId;
  }

  if (document.getElementById(GA4_SCRIPT_ID)) return;

  const script = document.createElement("script");
  script.id = GA4_SCRIPT_ID;
  script.src = `${GA4_SCRIPT_SRC}?id=${encodeURIComponent(measurementId)}`;
  script.async = true;
  script.addEventListener("error", () => {
    console.error("Google Analytics script failed to load.");
    script.remove();
    configuredMeasurementId = null;
  });
  document.head.appendChild(script);
}

/** Prevent GA4 from sending hits after consent is denied or withdrawn. */
export function stopGA4(): void {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (typeof window === "undefined" || !measurementId) return;
  disableMeasurement(measurementId);
}

/** Send an event only while the visitor's stored marketing consent is granted. */
export function trackGA4Event(eventName: GA4EventName, params: GA4EventParams = {}): void {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (typeof window === "undefined" || !measurementId) return;
  if (!hasMarketingConsent()) {
    disableMeasurement(measurementId);
    return;
  }

  loadGA4();
  window.gtag?.("event", eventName, params);
}
