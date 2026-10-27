# Nordic Peace

A coquette-aesthetic storefront for **Nordic Peace**, built as a headless Shopify
storefront with Next.js 16 (App Router). Soft blush palette, serif display type,
and a full shopping flow: collections with filters, product pages, search with
live suggestions, a persistent cart drawer, wishlist, and consent-gated Klaviyo
tracking.

**Runs with zero configuration.** With no Shopify credentials the app serves a
built-in mock catalog (19 sample products, 6 collections, SVG illustrations) and
all flows work end-to-end — search, cart, discounts (`COZY10`, `WELCOME15`),
wishlist, recently viewed. Add environment variables to point it at a real store.

## Stack

- **Next.js 16.4.2** (App Router, `cacheComponents`, Turbopack), **React 19.3**, **TypeScript** (strict)
- **Tailwind CSS v4** (theme tokens in `src/app/globals.css`, no PostCSS config)
- **Shopify Storefront API** (GraphQL) with graceful mock fallback
- **Klaviyo** (newsletter + consent-gated behavior tracking)
- Prettier + ESLint 9 (flat config)

## Scripts

| Command                | What it does                                  |
| ---------------------- | --------------------------------------------- |
| `npm run dev`          | Dev server (Turbopack)                        |
| `npm run build`        | Production build (also codegen's route types) |
| `npm run start`        | Serve the production build                    |
| `npm run lint`         | ESLint (fix with `npm run lint:fix`)          |
| `npm run type-check`   | `tsc --noEmit` (run `build`/`dev` first)      |
| `npm run format`       | Prettier write                                |
| `npm run format:check` | Prettier check (CI)                           |

Verification order before shipping: `format` → `lint` → `build` → `type-check` →
`format:check`.

## Environment variables

Copy `.env.example` to `.env.local` and fill in what you need. All optional —
missing Shopify or Klaviyo keys switch those integrations to their demo modes.

| Variable                          | Purpose                                                                                                   |
| --------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`            | Absolute origin for canonical URLs, sitemap, robots, Open Graph (falls back to `https://nordicpeace.com`) |
| `FREE_SHIPPING_THRESHOLD`         | Free-shipping threshold **in the store's currency** (e.g. `1500` for PKR) — defaults to `75` when unset   |
| `SHOPIFY_STORE_DOMAIN`            | Store domain, e.g. `your-store.myshopify.com`                                                             |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Storefront API access token                                                                               |
| `SHOPIFY_API_VERSION`             | Storefront API version (default `2026-07`)                                                                |
| `SHOPIFY_REVALIDATION_SECRET`     | Shared secret verified on `POST /api/revalidate` (webhook HMAC)                                           |
| `KLAVIYO_PRIVATE_KEY`             | Server-side private key for the Subscribe Profiles API                                                    |
| `KLAVIYO_LIST_ID`                 | List ID for newsletter signups                                                                            |
| `KLAVIYO_PUBLIC_KEY`              | Public site ID — loads Klaviyo JS (behind cookie consent)                                                 |

Private keys are only ever read in route handlers/server code — never shipped
to the client.

## Connecting a Shopify store

1. **Enable the Headless channel** — in the Shopify admin install the _Headless_
   sales channel (or _Hydrogen_), then create a **Storefront API access token**
   for this storefront.
2. **Set the env vars** — `SHOPIFY_STORE_DOMAIN` (without `https://`) and
   `SHOPIFY_STOREFRONT_ACCESS_TOKEN`. The token has store-wide public read and
   cart permission (Storefront tokens carry no configurable scopes); private
   customer data is never accessed. Leave them unset to stay on the mock catalog.
3. **Product metafields** (namespace `custom`) read by the product page:

   | Key             | Recommended type                         | Used for                                    |
   | --------------- | ---------------------------------------- | ------------------------------------------- |
   | `fabric`        | `single_line_text_field`                 | Details accordion                           |
   | `care`          | `multi_line_text_field`                  | Fabric & Care accordion                     |
   | `highlights`    | `json` (array of strings)                | Bullet highlights                           |
   | `size_chart`    | `multi_line_text_field` (HTML `<table>`) | Size Guide accordion (scrollable on mobile) |
   | `delivery_note` | `single_line_text_field`                 | Shipping line under Add to Cart             |
   | `pairs_with`    | `json` (array of **product handles**)    | "Complete the cozy look" cross-sell         |

4. **Collection handles** — the nav/footer link to these handles (create
   collections with matching handles, or the links 404):
   `pajama-sets`, `cozy-home`, `vanity-edit`, `new-arrivals`, plus `bestsellers`
   and `gifts` used on the home/lookbook. `Shop All` is virtual (`/collections/all`).
5. **Product tags** — badges are derived, never invented: tag products `new` /
   `bestseller` for those badges; "Low stock" appears automatically when total
   inventory is 1–5. The Bestsellers rail reads the `bestseller` tag.
6. **Checkout** — the cart's Checkout button goes to Shopify's hosted checkout
   via the cart's `checkoutUrl`. On the mock catalog the button is disabled and
   labeled honestly.

## Webhook setup (cache revalidation)

`POST /api/revalidate` invalidates the cached product and collection tags when
merchandise changes. Two ways to authenticate, both keyed on
`SHOPIFY_REVALIDATION_SECRET`:

- **Shopify webhook** — header `X-Shopify-Hmac-Sha256` carrying the Base64
  HMAC-SHA256 of the **raw request body** signed with the secret. The signature
  is compared timing-safely; any verified request revalidates the `products` and
  `collections` tags (payload contents are not trusted for tag selection).
- **Manual/curl** — header `Authorization: Bearer <SHOPIFY_REVALIDATION_SECRET>`.

To subscribe: Shopify admin → **Settings → Notifications → Webhooks** (or the
Admin API `webhookSubscriptionCreate` mutation — needs `read_webhooks` /
`write_webhooks` plus read access to the subscribed topics). Create webhooks for:

- `products/update` → `https://<your-domain>/api/revalidate`
- `collections/update` → `https://<your-domain>/api/revalidate`

Use the same HMAC secret as `SHOPIFY_REVALIDATION_SECRET`. Without the env var
the route rejects everything with a 501. Webhook registration itself uses an
**Admin API** token (custom app with `read_webhooks`, `write_webhooks`,
`read_products`, `read_collections`) — separate from the public Storefront token.

## Klaviyo setup

- **Newsletter** — `POST /api/newsletter` validates the email, requires explicit
  consent, and subscribes via the Subscribe Profiles API
  (`profile-subscription-bulk-create-jobs`, revision `2025-10-15`) using
  `KLAVIYO_PRIVATE_KEY` + `KLAVIYO_LIST_ID`. Sources are tagged (`footer`,
  `home`, `popup`). If the keys are missing it returns a clear dev-mode success
  without sending anything.
- **Behavior tracking** — `Viewed Product` and `Added to Cart` events fire via
  Klaviyo JS once `KLAVIYO_PUBLIC_KEY` is set **and** the visitor accepts the
  cookie banner (declining persists a refusal; the script never loads).
- Signups carry UTM-friendly source tags; the cookie banner gates everything.

## Deploying to Vercel

1. Import the repo — Vercel auto-detects Next.js; framework preset and build
   command (`next build`) need no changes.
2. Set the env vars above in **Project → Settings → Environment Variables**
   (production and preview). Set `NEXT_PUBLIC_SITE_URL` to the final origin —
   it drives canonicals, sitemap and social cards.
3. After the first production deploy, register the webhooks against the live
   domain (`https://<domain>/api/revalidate`).
4. Route handlers run on the Node runtime (HMAC/crypto) — no Edge config needed.
5. Re-run `npm run format:check && npm run lint && npm run build` in CI.

## Project layout

```
src/
  app/            routes (home, collections, products, search, wishlist, content, policies, api)
  components/     common · cart · collection · content · home · layout · product · search · seo · ui · wishlist
  lib/            Shopify client, cart/search/wishlist server actions, mock cart
  services/       cached queries ("use cache" + tags), mock catalog, GraphQL mappers
  constants/      routes, site copy, cart, faq, policies
  types/          catalog · collection · product · cart · search
  utils/          money, badges, filters, consent, wishlist/recently-viewed stores, focus trap
```

Caching notes: services use `"use cache"` with the `products`/`collections` tags
(`cacheLife: hours`); `/api/revalidate` refreshes both. `searchParams` only ever
appear inside `<Suspense>` boundaries.

## Known demo limitations

- Mock mode: checkout disabled, discount codes `COZY10`/`WELCOME15`, all copy is
  sample content (reviews are deliberately absent — none are invented).
- Policy pages contain clearly marked placeholder legal copy for the merchant to
  replace.
