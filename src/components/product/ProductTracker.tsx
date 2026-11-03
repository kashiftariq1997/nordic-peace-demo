"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  getMarketingConsentSnapshot,
  getServerMarketingConsentSnapshot,
  recordRecentlyViewed,
  subscribeMarketingConsent,
  trackViewedProduct,
} from "@/utils";

type ProductTrackerProps = {
  id: string;
  name: string;
  handle: string;
  price: { amount: number; currencyCode: string };
  imageUrl: string | null;
  imageAlt: string;
};

/**
 * Invisible client helper (spec Step A) — on mount, fires the consent-gated
 * Viewed Product event and records a compact snapshot for the Recently
 * viewed rail. Re-fires only when the viewed product actually changes.
 */
export function ProductTracker({
  id,
  name,
  handle,
  price,
  imageUrl,
  imageAlt,
}: ProductTrackerProps) {
  const priceAmount = price.amount;
  const priceCurrency = price.currencyCode;
  const consent = useSyncExternalStore(
    subscribeMarketingConsent,
    getMarketingConsentSnapshot,
    getServerMarketingConsentSnapshot,
  );

  useEffect(() => {
    recordRecentlyViewed({
      handle,
      title: name,
      price: { amount: priceAmount, currencyCode: priceCurrency },
      imageUrl,
      imageAlt,
    });
  }, [handle, name, priceAmount, priceCurrency, imageUrl, imageAlt]);

  useEffect(() => {
    if (consent !== "granted") return;
    trackViewedProduct({ id, name, handle, price: priceAmount });
  }, [consent, id, name, handle, priceAmount]);

  return null;
}
