import { shopifyFetch } from "@/lib/shopify";
import type { CartLine, CartState } from "@/types";

/**
 * Shopify Storefront cart — GraphQL query + the five mutations from the spec
 * (cartCreate, cartLinesAdd, cartLinesUpdate, cartLinesRemove,
 * cartDiscountCodesUpdate). Every mutation re-reads the full cart so callers
 * always get a complete CartState.
 *
 * Targets the current API shape (cost.subtotalAmount, 2024+). The mock path
 * in lib/mock-cart.ts mirrors the returned CartState exactly.
 */

type RawMoney = { amount: string; currencyCode: string };

type RawCartLine = {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    availableForSale: boolean;
    quantityAvailable: number | null;
    price: RawMoney;
    compareAtPrice: RawMoney | null;
    product: {
      id: string;
      handle: string;
      title: string;
      featuredImage: { url: string; altText: string | null } | null;
    };
  } | null;
};

type RawCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: RawMoney };
  discountCodes: { code: string; applicable: boolean }[];
  lines: { nodes: RawCartLine[] };
};

type MutationEnvelope<T extends string> = Record<
  T,
  { cart: { id: string } | null; userErrors: { field: string[] | null; message: string }[] }
>;

const CART_FRAGMENT = `
  id
  checkoutUrl
  totalQuantity
  cost {
    subtotalAmount {
      amount
      currencyCode
    }
  }
  discountCodes {
    code
    applicable
  }
  lines(first: 50) {
    nodes {
      id
      quantity
      merchandise {
        ... on ProductVariant {
          id
          title
          availableForSale
          quantityAvailable
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          product {
            id
            handle
            title
            featuredImage {
              url
              altText
            }
          }
        }
      }
    }
  }
`;

const CART_QUERY = `
  query Cart($cartId: ID!) {
    cart(id: $cartId) {
      ${CART_FRAGMENT}
    }
  }
`;

const CART_CREATE_MUTATION = `
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart { id }
      userErrors { field message }
    }
  }
`;

const CART_LINES_ADD_MUTATION = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { id }
      userErrors { field message }
    }
  }
`;

const CART_LINES_UPDATE_MUTATION = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { id }
      userErrors { field message }
    }
  }
`;

const CART_LINES_REMOVE_MUTATION = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { id }
      userErrors { field message }
    }
  }
`;

const CART_DISCOUNT_CODES_UPDATE_MUTATION = `
  mutation CartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]!) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
      cart { id }
      userErrors { field message }
    }
  }
`;

function toMoney(raw: RawMoney): { amount: number; currencyCode: string } {
  return { amount: Number.parseFloat(raw.amount), currencyCode: raw.currencyCode };
}

function toCartState(cart: RawCart): CartState {
  const lines: CartLine[] = [];
  for (const node of cart.lines.nodes) {
    // Non-variant merchandise (e.g. gift cards) has no product — skip it.
    if (!node.merchandise) continue;
    const { merchandise } = node;
    lines.push({
      id: node.id,
      quantity: node.quantity,
      merchandiseId: merchandise.id,
      productId: merchandise.product.id,
      handle: merchandise.product.handle,
      productTitle: merchandise.product.title,
      variantTitle: merchandise.title,
      imageUrl: merchandise.product.featuredImage?.url ?? null,
      imageAlt: merchandise.product.featuredImage?.altText ?? merchandise.product.title,
      unitPrice: toMoney(merchandise.price),
      compareAtPrice: merchandise.compareAtPrice ? toMoney(merchandise.compareAtPrice) : null,
      maxQuantity:
        merchandise.quantityAvailable && merchandise.quantityAvailable > 0
          ? merchandise.quantityAvailable
          : null,
    });
  }

  const subtotal = toMoney(cart.cost.subtotalAmount);
  const applied = cart.discountCodes.find((entry) => entry.applicable);

  return {
    id: cart.id,
    mode: "shopify",
    lines,
    totalQuantity: cart.totalQuantity,
    subtotal,
    // Shopify finalizes the discounted total at checkout — we show the code
    // as applied without guessing the amount.
    total: subtotal,
    discount: applied ? { code: applied.code, amount: null } : null,
    checkoutUrl: cart.checkoutUrl,
  };
}

async function getCart(cartId: string): Promise<CartState | null> {
  const data = await shopifyFetch<{ cart: RawCart | null }>(CART_QUERY, { cartId });
  return data.cart ? toCartState(data.cart) : null;
}

function throwUserErrors<T extends string>(result: MutationEnvelope<T>, key: T): void {
  const payload = result[key];
  if (payload.userErrors.length > 0) {
    throw new Error(payload.userErrors[0]?.message ?? "The cart rejected that change.");
  }
  if (!payload.cart) {
    throw new Error("Shopify returned no cart after the update.");
  }
}

/** Fetch an existing cart (null when the id is unknown/expired). */
export async function fetchShopifyCart(cartId: string): Promise<CartState | null> {
  return getCart(cartId);
}

/** cartCreate — first add of the session. */
export async function shopifyCartCreate(
  merchandiseId: string,
  quantity: number,
): Promise<CartState> {
  const data = await shopifyFetch<MutationEnvelope<"cartCreate">>(CART_CREATE_MUTATION, {
    input: { lines: [{ merchandiseId, quantity }] },
  });
  throwUserErrors(data, "cartCreate");
  const cartId = data.cartCreate.cart?.id;
  if (!cartId) throw new Error("Shopify did not return a cart id.");
  const cart = await getCart(cartId);
  if (!cart) throw new Error("Shopify cart vanished after creation.");
  return cart;
}

/** cartLinesAdd — additional lines on an existing cart. */
export async function shopifyCartLinesAdd(
  cartId: string,
  merchandiseId: string,
  quantity: number,
): Promise<CartState> {
  const data = await shopifyFetch<MutationEnvelope<"cartLinesAdd">>(CART_LINES_ADD_MUTATION, {
    cartId,
    lines: [{ merchandiseId, quantity }],
  });
  throwUserErrors(data, "cartLinesAdd");
  const cart = await getCart(cartId);
  if (!cart) throw new Error("Shopify cart vanished after adding a line.");
  return cart;
}

/** cartLinesUpdate — quantity change for an existing line. */
export async function shopifyCartLinesUpdate(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<CartState> {
  const data = await shopifyFetch<MutationEnvelope<"cartLinesUpdate">>(CART_LINES_UPDATE_MUTATION, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });
  throwUserErrors(data, "cartLinesUpdate");
  const cart = await getCart(cartId);
  if (!cart) throw new Error("Shopify cart vanished after updating a line.");
  return cart;
}

/** cartLinesRemove — delete a line. */
export async function shopifyCartLinesRemove(cartId: string, lineId: string): Promise<CartState> {
  const data = await shopifyFetch<MutationEnvelope<"cartLinesRemove">>(CART_LINES_REMOVE_MUTATION, {
    cartId,
    lineIds: [lineId],
  });
  throwUserErrors(data, "cartLinesRemove");
  const cart = await getCart(cartId);
  if (!cart) throw new Error("Shopify cart vanished after removing a line.");
  return cart;
}

/** cartDiscountCodesUpdate — apply ([""] clears) discount codes. */
export async function shopifyCartDiscountCodesUpdate(
  cartId: string,
  codes: string[],
): Promise<CartState> {
  const data = await shopifyFetch<MutationEnvelope<"cartDiscountCodesUpdate">>(
    CART_DISCOUNT_CODES_UPDATE_MUTATION,
    { cartId, discountCodes: codes },
  );
  throwUserErrors(data, "cartDiscountCodesUpdate");
  const cart = await getCart(cartId);
  if (!cart) throw new Error("Shopify cart vanished after updating codes.");
  return cart;
}
