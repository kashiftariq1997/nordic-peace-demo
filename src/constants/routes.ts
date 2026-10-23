/**
 * All app routes in one place. Always link through these constants — never
 * hardcode hrefs in components.
 */
export const ROUTES = {
  HOME: "/",
  SEARCH: "/search",
  ACCOUNT: "/account",
  WISHLIST: "/wishlist",
  GIFT_GUIDE: "/gift-guide",
  LOOKBOOK: "/lookbook",
  OUR_STORY: "/our-story",
  CONTACT: "/contact",
  FAQ: "/faq",
  COLLECTION_ALL: "/collections/all",
  COLLECTION_NEW_ARRIVALS: "/collections/new-arrivals",
  COLLECTION_PAJAMA_SETS: "/collections/pajama-sets",
  COLLECTION_COZY_HOME: "/collections/cozy-home",
  COLLECTION_VANITY_EDIT: "/collections/vanity-edit",
  collection: (handle: string) => `/collections/${handle}`,
  product: (handle: string) => `/products/${handle}`,
  policy: (slug: string) => `/policies/${slug}`,
} as const;

export type RouteKey = keyof typeof ROUTES;
