import { ROUTES } from "./routes";

export const SITE_NAME = "Nordic Peace";

/** Free-shipping threshold in USD — read from here everywhere (announcement bar, cart, policies). */
export const FREE_SHIPPING_THRESHOLD = 75;

export const SITE_DESCRIPTION =
  "Soft, romantic essentials for slow mornings and unhurried nights — pajama sets, cozy bedding, vanity pieces and little gifts.";

/**
 * Marquee messages for the announcement bar. Sample copy — adjust freely;
 * the free-shipping message derives its amount from FREE_SHIPPING_THRESHOLD.
 */
export const ANNOUNCEMENT_MESSAGES = [
  `Complimentary shipping on orders over $${FREE_SHIPPING_THRESHOLD}`,
  "Pajama sets for slow mornings",
  "The gift guide — something soft for everyone",
] as const;

export type NavLink = {
  readonly label: string;
  readonly href: string;
};

/** Primary header navigation. */
export const NAV_LINKS: readonly NavLink[] = [
  { label: "Shop All", href: ROUTES.COLLECTION_ALL },
  { label: "New Arrivals", href: ROUTES.COLLECTION_NEW_ARRIVALS },
  { label: "Pajama Sets", href: ROUTES.COLLECTION_PAJAMA_SETS },
  { label: "Cozy Home", href: ROUTES.COLLECTION_COZY_HOME },
  { label: "Vanity Edit", href: ROUTES.COLLECTION_VANITY_EDIT },
  { label: "Gifts", href: ROUTES.GIFT_GUIDE },
  { label: "Our Story", href: ROUTES.OUR_STORY },
];

/** Footer link columns. */
export const FOOTER_LINK_COLUMNS: readonly {
  readonly title: string;
  readonly links: readonly NavLink[];
}[] = [
  {
    title: "Shop",
    links: [
      { label: "Shop All", href: ROUTES.COLLECTION_ALL },
      { label: "New Arrivals", href: ROUTES.COLLECTION_NEW_ARRIVALS },
      { label: "Pajama Sets", href: ROUTES.COLLECTION_PAJAMA_SETS },
      { label: "Cozy Home", href: ROUTES.COLLECTION_COZY_HOME },
      { label: "Vanity Edit", href: ROUTES.COLLECTION_VANITY_EDIT },
      { label: "Gift Guide", href: ROUTES.GIFT_GUIDE },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Contact", href: ROUTES.CONTACT },
      { label: "FAQ", href: ROUTES.FAQ },
      { label: "Shipping Policy", href: ROUTES.policy("shipping") },
      { label: "Returns & Exchanges", href: ROUTES.policy("returns") },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Our Story", href: ROUTES.OUR_STORY },
      { label: "Lookbook", href: ROUTES.LOOKBOOK },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: ROUTES.policy("privacy") },
      { label: "Terms of Service", href: ROUTES.policy("terms") },
      { label: "Accessibility", href: ROUTES.policy("accessibility") },
    ],
  },
];

export type SocialLink = {
  readonly label: string;
  readonly href: string;
};

/**
 * PLACEHOLDER social links — hrefs point at the platforms' homepages only.
 * Replace with the brand's real profile URLs before launch (marked in the
 * footer with a title tooltip as well).
 */
export const SOCIAL_LINKS: readonly SocialLink[] = [
  { label: "Instagram", href: "https://www.instagram.com/" },
  { label: "Pinterest", href: "https://www.pinterest.com/" },
  { label: "TikTok", href: "https://www.tiktok.com/" },
];
