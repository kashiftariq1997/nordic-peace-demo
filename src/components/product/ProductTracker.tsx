"use client";

import { useEffect } from "react";
import { recordRecentlyViewed, trackViewedProduct } from "@/utils";

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

  useEffect(() => {
    recordRecentlyViewed({
      handle,
      title: name,
      price: { amount: priceAmount, currencyCode: priceCurrency },
      imageUrl,
      imageAlt,
    });
    trackViewedProduct({ id, name, handle, price: priceAmount });
  }, [id, name, handle, priceAmount, priceCurrency, imageUrl, imageAlt]);

  return null;
}
