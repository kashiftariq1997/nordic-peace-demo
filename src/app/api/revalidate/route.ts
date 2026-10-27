import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { COLLECTIONS_TAG, PRODUCTS_TAG } from "@/services";

/** Tags this webhook is allowed to invalidate — everything else is ignored. */
const REVALIDATABLE_TAGS = [PRODUCTS_TAG, COLLECTIONS_TAG] as const;

function secretsMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function hmacMatches(rawBody: string, provided: string, secret: string): boolean {
  const expected = createHmac("sha256", secret).update(rawBody).digest("base64");
  return secretsMatch(provided, expected);
}

/**
 * Revalidation webhook (spec §6) — `POST /api/revalidate`.
 *
 * Two accepted verifications, both keyed on SHOPIFY_REVALIDATION_SECRET:
 * - Shopify webhook mode: `X-Shopify-Hmac-Sha256` header carrying the
 *   base64 HMAC-SHA256 of the raw request body (Shopify's standard scheme).
 * - Direct mode: `Authorization: Bearer <secret>` (manual/curl calls).
 *
 * On success both catalog tags are revalidated with stale-while-revalidate
 * semantics (`"max"`), so cached collection/product pages refresh in the
 * background while visitors keep being served the stale copy.
 */
export async function POST(request: Request) {
  const secret = process.env.SHOPIFY_REVALIDATION_SECRET;
  if (!secret) {
    return Response.json(
      { revalidated: false, error: "Revalidation is not configured." },
      { status: 500 },
    );
  }

  const rawBody = await request.text();

  let authorized = false;
  const hmac = request.headers.get("x-shopify-hmac-sha256");
  if (hmac) {
    authorized = hmacMatches(rawBody, hmac, secret);
  } else {
    const authorization = request.headers.get("authorization") ?? "";
    const bearer = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    if (bearer) {
      authorized = secretsMatch(bearer, secret);
    }
  }

  if (!authorized) {
    return Response.json({ revalidated: false, error: "Invalid secret." }, { status: 401 });
  }

  await Promise.all(REVALIDATABLE_TAGS.map((tag) => revalidateTag(tag, "max")));

  return Response.json({ revalidated: true, tags: [...REVALIDATABLE_TAGS] });
}
