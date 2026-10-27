"use client";

import { useSyncExternalStore } from "react";
import { HeartIcon } from "@/icons";
import {
  getServerWishlistSnapshot,
  getWishlistSnapshot,
  subscribeWishlist,
  toggleWishlist,
} from "@/utils/wishlist";
import { cn } from "@/utils";

export type WishlistButtonProps = {
  handle: string;
  title: string;
  className?: string;
};

/**
 * Heart toggle overlaid on every product card (spec Step C). Saved state
 * comes from the localStorage-backed wishlist store, so hearts stay in sync
 * across cards, pages and tabs.
 */
export function WishlistButton({ handle, title, className }: WishlistButtonProps) {
  const saved = useSyncExternalStore(
    subscribeWishlist,
    getWishlistSnapshot,
    getServerWishlistSnapshot,
  )?.includes(handle);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from wishlist` : `Add ${title} to wishlist`}
      onClick={() => toggleWishlist(handle)}
      className={cn(
        "bg-cream/85 text-plum hover:text-rose-ink flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm transition-colors",
        saved && "text-rose-ink",
        className,
      )}
    >
      <HeartIcon className="h-[18px] w-[18px]" filled={saved} />
    </button>
  );
}
