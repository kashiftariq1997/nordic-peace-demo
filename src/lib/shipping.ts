import { FREE_SHIPPING_THRESHOLD_DEFAULT } from "@/constants";
import { formatMoney } from "@/utils";

/**
 * Free-shipping helpers (spec §6) — server-only. The threshold is an amount
 * in the store's own currency, read from the FREE_SHIPPING_THRESHOLD env var
 * (default 75), and every caller formats it with a currency returned by
 * Shopify — never a hardcoded "$". Never call these from a client component:
 * process.env is not inlined in the browser bundle.
 */

/** Live threshold amount, falling back to the default when unset/invalid. */
export function getFreeShippingThreshold(): number {
  const raw = process.env.FREE_SHIPPING_THRESHOLD?.trim();
  if (!raw) {
    return FREE_SHIPPING_THRESHOLD_DEFAULT;
  }
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : FREE_SHIPPING_THRESHOLD_DEFAULT;
}

/** The threshold formatted with a Shopify-returned currency code. */
export function formatFreeShippingThreshold(currencyCode: string): string {
  return formatMoney({ amount: getFreeShippingThreshold(), currencyCode });
}
