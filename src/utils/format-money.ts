import type { Money } from "@/types";

/** Format a Money value as USD-style currency, e.g. `$128.00`. */
export function formatMoney({ amount, currencyCode }: Money): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode || "USD",
  }).format(amount);
}
