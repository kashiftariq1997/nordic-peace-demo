# Nordic Peace — Original Spec (saved per request)

bahi look yeh meri prompt thii is ky hisab sy chal rahy hny aur aik file mny save kr ly jis sy ky tujy yad rahy

---

Build the Nordic Peace storefront in this existing Next.js project. Follow INSTRUCTIONS.md (folder structure, TypeScript strict, zero type errors, zero lint errors, Prettier, naming rules). Before coding, read AGENTS.md and the relevant guides in node_modules/next/dist/docs/, because this Next.js version differs from older ones.

## 1. Project overview

Nordic Peace is a coquette-style lifestyle brand: pajama sets, cozy bedding and home accents, vanity items, bows and hair accessories, and gifts. The site is a headless storefront: Next.js frontend, Shopify as the backend (Storefront API, GraphQL). Tone: soft, feminine, cozy, romantic, aspirational but never childish. It is a demo project, but it must feel polished and production-grade.

## 2. Tech stack

- Next.js App Router, TypeScript (strict), Tailwind CSS v4, Prettier.
- Shopify Storefront API for products, collections, search and cart. Checkout happens on Shopify's hosted checkout (redirect from the cart's checkoutUrl).
- Klaviyo for newsletter signup and behavior events.
- Fonts via next/font/google: Cormorant Garamond (headings, weights 400-600 plus italic) and DM Sans (body).

## 3. Color scheme (define as Tailwind v4 theme tokens in globals.css via @theme)

- blush: #FBE9EF (soft backgrounds, sections)
- rose: #DE8096 (accents, ribbons, badges, decoration)
- cream: #FFF9F6 (page background)
- plum: #372A33 (text, primary buttons)
- Extra helpers: blush-deep #F6D3DD, rose-ink #A64560 (use this darker rose for any rose-colored TEXT so it passes WCAG AA), plum-soft #5B4853 (secondary text), line #EFD9E0 (borders).
- Never put rose #DE8096 text on cream or blush. All essential text and buttons must meet AA contrast.
- Primary button: plum background, cream text, rounded-full. Secondary: outlined plum. Hover states use rose-ink.

## 4. Design language

- Rounded cards (rounded-3xl), thin borders, soft shadows, generous whitespace.
- Restrained decoration: scalloped dividers, small bow or ribbon motifs as SVG icons, soft blush gradients. No clutter.
- Subtle motion only: fade-up on scroll, gentle hover lift, a slow marquee on the announcement bar. Respect prefers-reduced-motion.
- Mobile-first. Test 360px, 768px, 1280px+. Tap targets at least 44px. Visible focus rings. Every interactive control has an accessible label.

## 5. Global layout

- Announcement bar (rotating or marquee messages, such as free shipping progress text; read the free-shipping threshold from a constant).
- Header: logo wordmark "NORDIC PEACE", nav (Shop All | New Arrivals | Pajama Sets | Cozy Home | Vanity Edit | Gifts | Our Story), search, account, cart with item-count badge. On mobile: hamburger menu drawer, search, cart.
- Footer: brand blurb, link columns (Shop, Help, Company, Legal), newsletter signup, social links (placeholders marked clearly), payment/shipping note, copyright.
- Cart drawer slides in from the right (see section 7).

## 6. Pages

1. Home (/): hero with headline and CTA, featured collections (Pajama Sets, Cozy Home, Vanity Edit), seasonal edit banner, bestsellers carousel/grid, brand story strip, "complete the cozy look" section, social proof section (use clearly labeled sample content only, NEVER invent real customer reviews), newsletter signup.
2. Collection (/collections/[handle]): title and description, product grid, filters (category/product type, size, color, price range, availability), sort (featured, newest, price low-high, price high-low), result count, quick-add on cards, badges (New, Bestseller, Low stock), pagination or "load more". "Shop All" = /collections/all, "New Arrivals" = /collections/new-arrivals.
3. Product (/products/[handle]): image gallery with thumbnails and zoom, title, price and compare-at price, variant selector (color, size) with unavailable states, quantity, Add to Cart, sticky Add to Cart bar on mobile, accordion (Details, Fabric and Care, Shipping and Returns, Size Guide as a table), cross-sell ("Complete the cozy look" from a pairs-with list), reviews section placeholder, recently viewed, JSON-LD Product schema.
4. Search (/search): search input with live suggestions (debounced), results grid, empty state with suggestions.
5. Wishlist (/wishlist): saved products (localStorage), heart toggle on every product card.
6. Gift Guide (/gift-guide): gifts grouped by category and budget (under 25, under 50, 50+).
7. Lookbook (/lookbook): editorial moodboard layout linking to products.
8. Our Story (/our-story), Contact (/contact, form with validation, no backend promise), FAQ (/faq, accessible accordion).
9. Policy pages (/policies/[slug]): shipping, returns, privacy, terms, accessibility. Use clearly marked placeholder copy that the merchant must replace. Do not invent legal claims.
10. Account: link to Shopify customer accounts (do not build custom auth).
11. 404 page, loading skeletons, and error boundaries in the brand style.

## 7. Cart

- Cart state in a client provider, persisted by cart id in localStorage.
- Server Actions (no cookies in render path) call Shopify cartCreate, cartLinesAdd, cartLinesUpdate, cartLinesRemove.
- Drawer shows lines, quantity steppers, remove, subtotal, free-shipping progress bar, "Checkout" button going to Shopify checkoutUrl. Open the drawer after add-to-cart. Show optimistic updates and error toasts.

## 8. Shopify data layer

- Create a typed client in src/lib and queries in src/services. Env vars: SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_ACCESS_TOKEN, SHOPIFY_API_VERSION, SHOPIFY_REVALIDATION_SECRET. Provide .env.example.
- Metafields: custom.fabric, custom.care, custom.highlights, custom.size_chart, custom.delivery_note, custom.pairs_with.
- IMPORTANT: if the env vars are missing, fall back to rich local mock data (at least 16 products across pajama sets, bedding, vanity, bows, gifts, with variants and metafields; 6 collections) so the whole site works without a Shopify store. Draw mock product images as soft SVG illustrations, with no external image dependencies. Mock content must never claim to be real inventory.
- Never hardcode product details in components. Everything flows from the data layer.

## 9. Next.js caching rules for this version (Cache Components is enabled)

- Cache data functions with the "use cache" directive, cacheLife, and cacheTag ("products", "collections").
- Use generateStaticParams for product and collection routes. Await params inside a Suspense boundary (pass the params promise to a child component), as the docs describe.
- Any use of searchParams, cookies or headers must sit inside Suspense.
- Webhook route /api/revalidate (POST, verified with SHOPIFY_REVALIDATION_SECRET) calls revalidateTag(tag, "max") on Shopify product/collection updates.
- Check the docs in node_modules/next/dist/docs for anything you are unsure about.

## 10. Klaviyo

- POST /api/newsletter: validate the email, require explicit consent checkbox, subscribe via Klaviyo API (env: KLAVIYO_PRIVATE_KEY, KLAVIYO_LIST_ID, KLAVIYO_PUBLIC_KEY). If keys are missing, return a clear dev-mode success without sending anything. Never expose private keys to the client.
- Client tracking helper (consent-aware, does nothing until the visitor accepts cookies): Viewed Product and Added to Cart events via Klaviyo JS (needs the public key).
- Add a simple cookie consent banner that gates tracking.
- Use consistent UTM-friendly links in the footer and signup source tagging ("footer", "popup", "home").

## 11. SEO and performance

- generateMetadata per page, Open Graph images, canonical URLs, sitemap.ts, robots.ts, JSON-LD (Organization, Product, Breadcrumb).
- next/image everywhere with proper sizes and alt text. Aim for Lighthouse 90+ on mobile.
- No placeholder links at all: every CTA must lead to a real route.

## 12. Rules

- No fake reviews, testimonials, customer counts, discounts, countdowns or scarcity claims. Anything illustrative must be labeled as sample content in code comments.
- No new dependencies unless clearly needed. Ask first for anything big (UI kits, state libraries).
- Server Components by default, "use client" only where needed.

## 13. Build order (finish and verify each phase before the next)

Phase 1: design tokens, fonts, layout shell (announcement bar, header, footer, mobile menu).
Phase 2: types, mock data, Shopify data layer with fallback.
Phase 3: Home, Collection, Product pages.
Phase 4: Cart drawer and Server Actions, wishlist, search.
Phase 5: Gift Guide, Lookbook, Our Story, FAQ, Contact, policies, 404/error/loading.
Phase 6: Klaviyo, cookie consent, SEO, revalidation webhook.
Phase 7: accessibility and responsive pass, README with Shopify and Klaviyo setup steps.

After each phase run: npm run type-check, npm run lint, npm run format:check, npm run build. Fix every issue before moving on, and give me a short summary per phase.
