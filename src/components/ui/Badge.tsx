import { cn } from "@/utils";
import type { ProductBadge } from "@/types";

const badgeClasses: Record<ProductBadge, string> = {
  new: "border-line bg-cream text-rose-ink",
  bestseller: "border-plum bg-plum text-cream",
  "low-stock": "border-line bg-blush-deep text-plum",
};

const badgeLabels: Record<ProductBadge, string> = {
  new: "New",
  bestseller: "Bestseller",
  "low-stock": "Low stock",
};

export type BadgeProps = {
  badge: ProductBadge;
  className?: string;
};

/** Merch badge pill — New / Bestseller / Low stock. */
export function Badge({ badge, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide",
        badgeClasses[badge],
        className,
      )}
    >
      {badgeLabels[badge]}
    </span>
  );
}
