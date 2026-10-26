import { FREE_SHIPPING_THRESHOLD } from "./site";

export type PolicySection = {
  readonly heading: string;
  readonly paragraphs: readonly string[];
};

export type Policy = {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  /** Display-only date shown under the title. */
  readonly updated: string;
  readonly sections: readonly PolicySection[];
};

const UPDATED = "Last updated October 2026";

/**
 * Static policy content for /policies/[slug] (sample copy — have real legal
 * review before launch). Slugs match the footer links in site.ts.
 */
export const POLICIES: readonly Policy[] = [
  {
    slug: "shipping",
    title: "Shipping Policy",
    description: "How orders are prepared, what delivery costs, and when to expect your parcel.",
    updated: UPDATED,
    sections: [
      {
        heading: "Processing",
        paragraphs: [
          "Orders are prepared and leave our studio within 1–2 business days, Monday to Friday.",
          "Orders placed on weekends or holidays are packed the next business day.",
        ],
      },
      {
        heading: "Rates & free shipping",
        paragraphs: [
          `Orders over $${FREE_SHIPPING_THRESHOLD} ship free within the United States. Below the threshold, a flat $6 rate applies.`,
          "Expedited options and their costs are shown at checkout before you confirm your order.",
        ],
      },
      {
        heading: "Delivery times",
        paragraphs: [
          "Standard delivery takes 3–6 business days within the US after dispatch.",
          "International orders typically arrive within 7–14 business days, depending on your country's customs process.",
        ],
      },
      {
        heading: "Tracking & duties",
        paragraphs: [
          "A tracking link is emailed the moment your parcel is collected.",
          "International duties and taxes are calculated at checkout where possible, so there are no surprises on arrival.",
        ],
      },
    ],
  },
  {
    slug: "returns",
    title: "Returns & Exchanges",
    description: "A 30-day window, what condition we ask for, and how refunds work.",
    updated: UPDATED,
    sections: [
      {
        heading: "The window",
        paragraphs: [
          "You have 30 days from delivery to return unworn pieces for a full refund.",
          "Items must be in their original condition with tags attached and hygiene seals intact where applicable.",
        ],
      },
      {
        heading: "Starting a return",
        paragraphs: [
          "Email us from the contact page with your order number and the pieces you'd like to send back.",
          "We'll reply within two business days with return instructions and a prepaid label where available.",
        ],
      },
      {
        heading: "Refunds",
        paragraphs: [
          "Refunds are issued to your original payment method within 5–7 business days of the parcel arriving back with us.",
          "Original shipping fees are non-refundable unless the item arrived faulty.",
        ],
      },
      {
        heading: "Exchanges",
        paragraphs: [
          "Need a different size instead? Mention it when you start your return and we'll reserve it for you while your parcel travels.",
          "If the size has sold out, we'll refund you so you can re-order when it's back.",
        ],
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    description: "What we collect, why we collect it, and the choices you have.",
    updated: UPDATED,
    sections: [
      {
        heading: "What we collect",
        paragraphs: [
          "We collect the details you give us — your name, address, email, and order history — plus basic usage data such as pages viewed.",
          "Payment details are handled by our checkout provider and never touch our servers.",
        ],
      },
      {
        heading: "How we use it",
        paragraphs: [
          "To fulfil orders, answer your messages, and — only with your consent — send the occasional email about new arrivals.",
          "We never sell your personal information. Service providers receive only what they need to do their job.",
        ],
      },
      {
        heading: "Cookies",
        paragraphs: [
          "We use essential cookies to keep your cart and session working, and optional analytics cookies to understand what's helpful.",
          "You can decline the optional ones without losing any functionality.",
        ],
      },
      {
        heading: "Your rights",
        paragraphs: [
          "You can ask to see, correct, or delete your data at any time — just email us from the contact page.",
          "We'll respond within the timeframe required by your local law, and usually much sooner.",
        ],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms of Service",
    description: "The ground rules for using this site and placing an order.",
    updated: UPDATED,
    sections: [
      {
        heading: "Orders",
        paragraphs: [
          "All orders are subject to availability and confirmation of the order price.",
          "We reserve the right to cancel and refund any order — for example, if an item is listed in error.",
        ],
      },
      {
        heading: "Pricing",
        paragraphs: [
          "Prices are shown in USD and may change without notice. The price confirmed at checkout is the price you pay.",
          "Promotional codes cannot be combined unless stated otherwise.",
        ],
      },
      {
        heading: "The site",
        paragraphs: [
          "Content, imagery, and design on this site belong to Nordic Peace and may not be reused without permission.",
          "We aim to keep everything accurate, but typographical errors can happen — we'll always honour genuine pricing mistakes promptly.",
        ],
      },
      {
        heading: "Liability",
        paragraphs: [
          "Nothing in these terms limits rights you have under applicable consumer law.",
          "Our liability for any claim is limited to the amount you paid for the order in question.",
        ],
      },
    ],
  },
  {
    slug: "accessibility",
    title: "Accessibility",
    description: "Our commitment to a shop everyone can browse comfortably.",
    updated: UPDATED,
    sections: [
      {
        heading: "Our commitment",
        paragraphs: [
          "Nordic Peace aims to meet WCAG 2.1 Level AA across the shopping experience — from browsing to checkout.",
          "Accessibility is part of every release, not a clean-up at the end.",
        ],
      },
      {
        heading: "What's in place",
        paragraphs: [
          "Keyboard-reachable controls with visible focus, descriptive alternative text on imagery, and reduced-motion support.",
          "Text and interface colors are checked for contrast against WCAG AA ratios.",
        ],
      },
      {
        heading: "Ongoing work",
        paragraphs: [
          "We review the site with automated and manual testing as pages evolve, and welcome reports of anything that falls short.",
        ],
      },
      {
        heading: "Get help",
        paragraphs: [
          "If something here blocked you, tell us via the contact page — we'll fix it and share what changed.",
          "We also provide policy and product information in alternative formats on request.",
        ],
      },
    ],
  },
];

export const POLICY_SLUGS: readonly string[] = POLICIES.map((policy) => policy.slug);

/** Look up a policy by its /policies/[slug] segment. */
export function getPolicy(slug: string): Policy | undefined {
  return POLICIES.find((policy) => policy.slug === slug);
}
