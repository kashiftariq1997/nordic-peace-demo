/**
 * Typed Shopify Storefront API client (GraphQL).
 *
 * When SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN are missing,
 * `isShopifyConfigured()` returns false and every service falls back to the
 * local mock catalog — the site works fully without a Shopify store.
 *
 * Server-only: never import from a client component.
 */

export class ShopifyError extends Error {
  readonly status: number | undefined;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ShopifyError";
    this.status = status;
  }
}

type ShopifyEnv = {
  domain: string | undefined;
  accessToken: string | undefined;
  apiVersion: string | undefined;
};

function readEnv(): ShopifyEnv {
  return {
    domain: process.env.SHOPIFY_STORE_DOMAIN,
    accessToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    apiVersion: process.env.SHOPIFY_API_VERSION,
  };
}

/** True only when domain and access token are both present. */
export function isShopifyConfigured(): boolean {
  const { domain, accessToken } = readEnv();
  return Boolean(domain && accessToken);
}

function normalizeDomain(domain: string): string {
  return domain.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

export type ShopifyResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

/**
 * POST a GraphQL document to the Storefront API and return `data`.
 * Throws ShopifyError on network failure or GraphQL errors.
 */
export async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const { domain, accessToken, apiVersion } = readEnv();
  if (!domain || !accessToken) {
    throw new ShopifyError(
      "Shopify is not configured (SHOPIFY_STORE_DOMAIN / SHOPIFY_STOREFRONT_ACCESS_TOKEN missing).",
    );
  }

  const version = apiVersion?.trim() || "2026-07";
  const endpoint = `https://${normalizeDomain(domain)}/api/${version}/graphql.json`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": accessToken,
      },
      body: JSON.stringify({ query, variables }),
      // Next.js caching: our "use cache" layer owns caching; never stale-fetch.
      cache: "no-store",
    });
  } catch (cause) {
    throw new ShopifyError(
      `Shopify request failed: ${cause instanceof Error ? cause.message : String(cause)}`,
    );
  }

  if (!response.ok) {
    throw new ShopifyError(`Shopify responded with HTTP ${response.status}`, response.status);
  }

  const payload = (await response.json()) as ShopifyResponse<T>;
  if (payload.errors?.length) {
    throw new ShopifyError(payload.errors.map((error) => error.message).join("; "));
  }
  if (payload.data === undefined) {
    throw new ShopifyError("Shopify response contained no data.");
  }

  return payload.data;
}
