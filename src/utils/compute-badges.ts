import type { ProductBadge } from "@/types";

/** Total inventory at or below this shows the "Low stock" badge. */
export const LOW_STOCK_THRESHOLD = 5;

type BadgeInput = {
  tags: string[];
  totalInventory: number;
  availableForSale: boolean;
};

/**
 * Derives merch badges from product data. Never invent badges — only tags
 * ("new", "bestseller") and real inventory numbers produce them.
 */
export function computeBadges({
  tags,
  totalInventory,
  availableForSale,
}: BadgeInput): ProductBadge[] {
  const badges: ProductBadge[] = [];
  if (tags.includes("new")) {
    badges.push("new");
  }
  if (tags.includes("bestseller")) {
    badges.push("bestseller");
  }
  if (availableForSale && totalInventory > 0 && totalInventory <= LOW_STOCK_THRESHOLD) {
    badges.push("low-stock");
  }
  return badges;
}
