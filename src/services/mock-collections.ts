import type { Collection } from "@/types";

/**
 * SAMPLE CONTENT — mock demo collections used when Shopify env vars are missing.
 * Mirrors the handle-based membership defined on MOCK_PRODUCTS.collections.
 */

const COLLECTION_SEED: ReadonlyArray<Omit<Collection, "productsCount">> = [
  {
    id: "mock-collection-pajama-sets",
    handle: "pajama-sets",
    title: "Pajama Sets",
    description:
      "Two-piece sets in silk, linen and brushed cotton — soft evenings and slow mornings.",
    image: {
      url: "/images/collections/c-pajama-sets.svg",
      altText: "Illustration of folded pajama sets",
    },
  },
  {
    id: "mock-collection-cozy-home",
    handle: "cozy-home",
    title: "Cozy Home",
    description: "Duvet covers, throws and shams for layering the bed into something soft.",
    image: {
      url: "/images/collections/c-cozy-home.svg",
      altText: "Illustration of layered bedding",
    },
  },
  {
    id: "mock-collection-vanity-edit",
    handle: "vanity-edit",
    title: "The Vanity Edit",
    description: "Mirrors, trays and jewelry boxes for a dressing table that feels like yours.",
    image: {
      url: "/images/collections/c-vanity-edit.svg",
      altText: "Illustration of a vanity table",
    },
  },
  {
    id: "mock-collection-gifts",
    handle: "gifts",
    title: "Gifts",
    description: "Small things, thoughtfully chosen — for her, for them, for no reason at all.",
    image: {
      url: "/images/collections/c-gifts.svg",
      altText: "Illustration of a wrapped gift",
    },
  },
  {
    id: "mock-collection-new-arrivals",
    handle: "new-arrivals",
    title: "New Arrivals",
    description: "The newest additions to the shop, freshly drawn and folded.",
    image: {
      url: "/images/collections/c-new-arrivals.svg",
      altText: "Illustration of a new arrival ribbon",
    },
  },
  {
    id: "mock-collection-bestsellers",
    handle: "bestsellers",
    title: "Bestsellers",
    description: "The pieces you come back for, restocked and waiting.",
    image: {
      url: "/images/collections/c-bestsellers.svg",
      altText: "Illustration of a bestseller ribbon",
    },
  },
];

export const MOCK_COLLECTIONS: readonly Collection[] = COLLECTION_SEED.map((collection) => ({
  ...collection,
  productsCount: 0, // computed by mockQueryCollections() from product membership
}));
