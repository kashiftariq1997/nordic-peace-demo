import type { Money } from "./product";

export type CartLine = {
  /** Opaque line id — Shopify line id, or the variant id in mock mode. */
  id: string;
  quantity: number;
  /** Variant id — the argument for addCartLine. */
  merchandiseId: string;
  productId: string;
  handle: string;
  productTitle: string;
  variantTitle: string;
  imageUrl: string | null;
  imageAlt: string;
  unitPrice: Money;
  compareAtPrice: Money | null;
  /** Inventory cap for the quantity stepper (null = no cap). */
  maxQuantity: number | null;
};

export type CartDiscount = {
  code: string;
  /** null when the platform finalizes the amount at checkout (Shopify). */
  amount: Money | null;
};

export type CartState = {
  /** Shopify cart id (null for an empty/mock cart). */
  id: string | null;
  /** Which backend maintains this cart — drives checkout + demo hints. */
  mode: "mock" | "shopify";
  lines: CartLine[];
  totalQuantity: number;
  /** Sum of line totals before discounts. */
  subtotal: Money;
  /** What the customer pays: subtotal minus discount when the amount is known. */
  total: Money;
  discount: CartDiscount | null;
  checkoutUrl: string | null;
};

export type CartActionResult = { ok: true; cart: CartState } | { ok: false; error: string };

/** Client-side input for an add — preview is display-only (never trusted). */
export type CartLineInput = {
  merchandiseId: string;
  quantity: number;
  preview?: {
    productId: string;
    handle: string;
    productTitle: string;
    variantTitle: string;
    imageUrl: string | null;
    imageAlt: string;
    unitPrice: Money;
    compareAtPrice: Money | null;
    maxQuantity: number | null;
  };
};
