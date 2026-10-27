"use server";

import { emptyCart } from "@/constants";
import {
  getMockCart,
  mockAddLine,
  mockApplyDiscount,
  mockRemoveLine,
  mockUpdateLine,
} from "@/lib/mock-cart";
import { isShopifyConfigured } from "@/lib/shopify";
import {
  fetchShopifyCart,
  shopifyCartCreate,
  shopifyCartDiscountCodesUpdate,
  shopifyCartLinesAdd,
  shopifyCartLinesRemove,
  shopifyCartLinesUpdate,
} from "@/lib/shopify-cart";
import type { CartActionResult, CartLineInput, CartState } from "@/types";

/**
 * Cart Server Actions (spec Step B). One public surface; each action
 * dispatches to the Shopify Storefront mutations (cartCreate / cartLinesAdd /
 * cartLinesUpdate / cartLinesRemove / cartDiscountCodesUpdate) when
 * credentials exist, and the cookie-backed mock cart otherwise — the site
 * works fully with no env vars.
 *
 * Prices and availability always resolve server-side; client input only
 * names the variant and quantity.
 */

const MAX_QUANTITY = 99;

async function guard(operation: () => Promise<CartState>): Promise<CartActionResult> {
  try {
    return { ok: true, cart: await operation() };
  } catch (error) {
    console.error("Cart action failed:", error);
    return {
      ok: false,
      error:
        error instanceof Error && error.message
          ? error.message
          : "Your bag is unavailable right now.",
    };
  }
}

/** Re-read the visitor's cart (called once on hydration). */
export async function fetchCart(cartId: string | null): Promise<CartActionResult> {
  return guard(async () => {
    if (isShopifyConfigured()) {
      if (!cartId) return emptyCart("shopify");
      return (await fetchShopifyCart(cartId)) ?? emptyCart("shopify");
    }
    return getMockCart(cartId);
  });
}

/** Add a line — creates the cart first when needed (Shopify path). */
export async function addCartLine(
  cartId: string | null,
  line: CartLineInput,
): Promise<CartActionResult> {
  const quantity = Math.max(1, Math.min(line.quantity, MAX_QUANTITY));
  return guard(async () => {
    if (isShopifyConfigured()) {
      if (!cartId) return shopifyCartCreate(line.merchandiseId, quantity);
      return shopifyCartLinesAdd(cartId, line.merchandiseId, quantity);
    }
    return mockAddLine(cartId, line.merchandiseId, quantity);
  });
}

/** Change a line's quantity. */
export async function updateCartLine(
  cartId: string | null,
  lineId: string,
  quantity: number,
): Promise<CartActionResult> {
  const nextQuantity = Math.max(1, Math.min(quantity, MAX_QUANTITY));
  return guard(async () => {
    if (isShopifyConfigured()) {
      if (!cartId) return emptyCart("shopify");
      return shopifyCartLinesUpdate(cartId, lineId, nextQuantity);
    }
    return mockUpdateLine(cartId, lineId, nextQuantity);
  });
}

/** Remove a line entirely. */
export async function removeCartLine(
  cartId: string | null,
  lineId: string,
): Promise<CartActionResult> {
  return guard(async () => {
    if (isShopifyConfigured()) {
      if (!cartId) return emptyCart("shopify");
      return shopifyCartLinesRemove(cartId, lineId);
    }
    return mockRemoveLine(cartId, lineId);
  });
}

/** Apply a discount code (empty string clears it). */
export async function applyCartDiscount(
  cartId: string | null,
  code: string,
): Promise<CartActionResult> {
  return guard(async () => {
    if (isShopifyConfigured()) {
      if (!cartId) return emptyCart("shopify");
      const normalized = code.trim();
      return shopifyCartDiscountCodesUpdate(cartId, normalized ? [normalized] : []);
    }
    return mockApplyDiscount(cartId, code);
  });
}
