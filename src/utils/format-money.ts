import type { Money } from "@/types";

const CURRENCY_FRACTION_DIGITS: Readonly<Record<string, number>> = {
  BIF: 0,
  CLF: 4,
  CLP: 0,
  DJF: 0,
  GNF: 0,
  IQD: 3,
  JPY: 0,
  KMF: 0,
  KRW: 0,
  KWD: 3,
  LYD: 3,
  MGA: 0,
  OMR: 3,
  PYG: 0,
  RWF: 0,
  TND: 3,
  UGX: 0,
  UYW: 4,
  VND: 0,
  VUV: 0,
  XAF: 0,
  XOF: 0,
  XPF: 0,
};

/** Format a Money value as USD-style currency, e.g. `$128.00`. */
export function formatMoney({ amount, currencyCode }: Money): string {
  const currency = currencyCode || "USD";
  const fractionDigits = CURRENCY_FRACTION_DIGITS[currency] ?? 2;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}
