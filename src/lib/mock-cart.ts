import { cookies } from "next/headers";
import { MOCK_CART_COOKIE, MOCK_DISCOUNT_CODES } from "@/constants";
import { MOCK_PRODUCTS } from "@/services/mock-products";
import type { CartLine, CartState, Product, ProductVariant } from "@/types";

/**
 * Cookie-backed mock cart (spec Step B) — works with zero env vars.
 *
 * Server Actions can't read localStorage, so mock cart state lives in an
 * httpOnly cookie; the Shopify path instead keeps its cart id client-side.
 * Prices always resolve from the local catalog — client input is never
 * trusted for money.
 */

type MockCartLine = { merchandiseId: string; quantity: number };
type MockCartData = { discountCode: string | null; lines: MockCartLine[] };

const MAX_LINE_QUANTITY = 99;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function parseCart(raw: string | undefined): MockCartData {
  if (!raw) return { discountCode: null, lines: [] };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return { discountCode: null, lines: [] };
    const data = parsed as Partial<MockCartData>;
    return {
      discountCode: typeof data.discountCode === "string" ? data.discountCode : null,
      lines: Array.isArray(data.lines)
        ? data.lines.filter(
            (line): line is MockCartLine =>
              typeof line === "object" &&
              line !== null &&
              typeof (line as MockCartLine).merchandiseId === "string" &&
              typeof (line as MockCartLine).quantity === "number",
          )
        : [],
    };
  } catch {
    return { discountCode: null, lines: [] };
  }
}

async function readCart(): Promise<MockCartData> {
  const store = await cookies();
  return parseCart(store.get(MOCK_CART_COOKIE)?.value);
}

async function writeCart(data: MockCartData): Promise<void> {
  const store = await cookies();
  store.set(MOCK_CART_COOKIE, JSON.stringify(data), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });
}

function findMerchandise(
  merchandiseId: string,
): { product: Product; variant: ProductVariant } | null {
  for (const product of MOCK_PRODUCTS) {
    const variant = product.variants.find((candidate) => candidate.id === merchandiseId);
    if (variant) return { product, variant };
  }
  return null;
}

/** Resolve cookie state against the catalog into a full CartState. */
export function resolveMockCart(data: MockCartData, cartId: string | null): CartState {
  const lines: CartLine[] = [];
  for (const entry of data.lines) {
    const found = findMerchandise(entry.merchandiseId);
    if (!found) continue;
    const { product, variant } = found;
    const cap =
      variant.quantityAvailable && variant.quantityAvailable > 0
        ? variant.quantityAvailable
        : MAX_LINE_QUANTITY;
    lines.push({
      id: variant.id,
      quantity: Math.max(1, Math.min(entry.quantity, cap)),
      merchandiseId: variant.id,
      productId: product.id,
      handle: product.handle,
      productTitle: product.title,
      variantTitle: variant.title,
      imageUrl: product.featuredImage?.url ?? null,
      imageAlt: product.featuredImage?.altText ?? product.title,
      unitPrice: variant.price,
      compareAtPrice: variant.compareAtPrice,
      maxQuantity:
        variant.quantityAvailable && variant.quantityAvailable > 0
          ? variant.quantityAvailable
          : null,
    });
  }

  const subtotalAmount = round2(
    lines.reduce((sum, line) => sum + line.unitPrice.amount * line.quantity, 0),
  );
  const currencyCode = lines[0]?.unitPrice.currencyCode ?? "USD";

  const code = data.discountCode?.trim().toUpperCase() || null;
  const rate = code ? MOCK_DISCOUNT_CODES[code] : undefined;
  const discount =
    code && rate ? { code, amount: { amount: round2(subtotalAmount * rate), currencyCode } } : null;

  const totalAmount = discount?.amount
    ? round2(subtotalAmount - discount.amount.amount)
    : subtotalAmount;

  return {
    id: cartId,
    mode: "mock",
    lines,
    totalQuantity: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: { amount: subtotalAmount, currencyCode },
    total: { amount: totalAmount, currencyCode },
    discount,
    checkoutUrl: null,
  };
}

/** Read the current mock cart (hydration + after refresh). */
export async function getMockCart(cartId: string | null): Promise<CartState> {
  return resolveMockCart(await readCart(), cartId);
}

/** Add a line (creates the cookie on first use). */
export async function mockAddLine(
  cartId: string | null,
  merchandiseId: string,
  quantity: number,
): Promise<CartState> {
  const found = findMerchandise(merchandiseId);
  if (!found || !found.variant.availableForSale) {
    throw new Error("That item is no longer available.");
  }
  const data = await readCart();
  const existing = data.lines.find((line) => line.merchandiseId === merchandiseId);
  const cap =
    found.variant.quantityAvailable && found.variant.quantityAvailable > 0
      ? Math.min(MAX_LINE_QUANTITY, found.variant.quantityAvailable)
      : MAX_LINE_QUANTITY;
  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, cap);
  } else {
    data.lines.push({ merchandiseId, quantity: Math.min(quantity, cap) });
  }
  await writeCart(data);
  return resolveMockCart(data, cartId);
}

/** Change a line's quantity (1..cap). */
export async function mockUpdateLine(
  cartId: string | null,
  lineId: string,
  quantity: number,
): Promise<CartState> {
  const data = await readCart();
  const line = data.lines.find((candidate) => candidate.merchandiseId === lineId);
  if (!line) {
    throw new Error("That item is no longer in your bag.");
  }
  const found = findMerchandise(lineId);
  const cap =
    found?.variant.quantityAvailable && found.variant.quantityAvailable > 0
      ? Math.min(MAX_LINE_QUANTITY, found.variant.quantityAvailable)
      : MAX_LINE_QUANTITY;
  line.quantity = Math.max(1, Math.min(quantity, cap));
  await writeCart(data);
  return resolveMockCart(data, cartId);
}

/** Remove a line entirely. */
export async function mockRemoveLine(cartId: string | null, lineId: string): Promise<CartState> {
  const data = await readCart();
  data.lines = data.lines.filter((line) => line.merchandiseId !== lineId);
  await writeCart(data);
  return resolveMockCart(data, cartId);
}

/** Apply or clear a promo code — unknown codes are rejected (demo error path). */
export async function mockApplyDiscount(cartId: string | null, code: string): Promise<CartState> {
  const data = await readCart();
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    data.discountCode = null;
  } else if (!(normalized in MOCK_DISCOUNT_CODES)) {
    throw new Error("That code isn’t valid — try COZY10.");
  } else {
    data.discountCode = normalized;
  }
  await writeCart(data);
  return resolveMockCart(data, cartId);
}
