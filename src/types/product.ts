export type Money = {
  amount: number;
  currencyCode: string;
};

export type ProductImage = {
  url: string;
  altText: string;
};

export type SelectedOption = {
  name: string;
  value: string;
};

export type ProductVariant = {
  id: string;
  /** e.g. "Blush / S" */
  title: string;
  availableForSale: boolean;
  price: Money;
  /** Sample compare-at prices only ever come from mock/demo data. */
  compareAtPrice: Money | null;
  selectedOptions: SelectedOption[];
  quantityAvailable: number | null;
};

export type ProductOption = {
  name: string;
  values: string[];
};

/** Merch badges surfaced on cards and product pages. */
export type ProductBadge = "new" | "bestseller" | "low-stock";

/** Values of the custom.* metafields (Shopify) or their mock equivalents. */
export type ProductMetafields = {
  fabric: string | null;
  care: string | null;
  highlights: string[] | null;
  /** HTML table markup for the Size Guide accordion. */
  sizeChart: string | null;
  deliveryNote: string | null;
  /** Handles of products to cross-sell ("Complete the cozy look"). */
  pairsWith: string[] | null;
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  productType: string;
  vendor: string;
  tags: string[];
  featuredImage: ProductImage | null;
  images: ProductImage[];
  priceRange: { min: Money; max: Money };
  options: ProductOption[];
  variants: ProductVariant[];
  metafields: ProductMetafields;
  availableForSale: boolean;
  totalInventory: number;
  /** ISO date string — drives the "newest" sort. */
  createdAt: string;
  /** Merchandising order ("featured" sort). Lower sorts first. */
  featuredPosition: number;
  badges: ProductBadge[];
  /** Collection handles this product belongs to. */
  collections: string[];
};
