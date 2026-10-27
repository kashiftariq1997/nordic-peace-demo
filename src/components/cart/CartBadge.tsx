"use client";

import { BagIcon } from "@/icons";
import { cn } from "@/utils";
import { useCart } from "./CartContext";

/**
 * Header cart badge — opens the drawer on click and mirrors the live line
 * count (hidden while the bag is empty).
 */
export function CartBadge() {
  const { cart, openCart } = useCart();
  const count = cart.totalQuantity;

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={count === 0 ? "Open bag (empty)" : `Open bag, ${count} items`}
      className="text-plum hover:text-rose-ink relative flex h-11 w-11 items-center justify-center transition-colors"
    >
      <BagIcon className="h-5 w-5" />
      <span
        aria-hidden="true"
        className={cn(
          "bg-rose-ink text-cream absolute top-1.5 right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[11px] leading-none font-medium",
          count === 0 && "hidden",
        )}
      >
        {count > 99 ? "99+" : count}
      </span>
    </button>
  );
}
