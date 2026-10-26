"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ProductFilters, SortOption } from "@/types";
import { buildCollectionQuery } from "@/utils";

const SORT_OPTIONS: ReadonlyArray<{ value: SortOption; label: string }> = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export type SortSelectProps = {
  sort: SortOption;
  /** Current filters are preserved; pagination resets on sort change. */
  filters: ProductFilters;
  pathname: string;
};

/** Sort dropdown — navigates with router.replace so the URL stays the source of truth. */
export function SortSelect({ sort, filters, pathname }: SortSelectProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2.5 text-sm">
      <span className="text-plum-soft">Sort by</span>
      <select
        value={sort}
        onChange={(event) => {
          const nextSort = event.currentTarget.value as SortOption;
          startTransition(() => {
            router.replace(`${pathname}${buildCollectionQuery({ filters, sort: nextSort })}`, {
              scroll: false,
            });
          });
        }}
        className="border-line bg-cream text-plum hover:border-blush-deep h-11 cursor-pointer rounded-full border px-4 text-sm font-medium transition-colors"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
