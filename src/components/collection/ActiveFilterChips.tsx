import Link from "next/link";
import { CloseIcon } from "@/icons";
import type { ProductFilters, SortOption } from "@/types";
import { buildCollectionQuery, buildFilterChips } from "@/utils";

export type ActiveFilterChipsProps = {
  pathname: string;
  filters: ProductFilters;
  sort: SortOption;
};

/** Chips for each active facet — removing one chip drops just that value. */
export function ActiveFilterChips({ pathname, filters, sort }: ActiveFilterChipsProps) {
  const chips = buildFilterChips(filters);
  if (chips.length === 0) {
    return null;
  }

  return (
    <ul className="mb-6 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <li key={chip.key}>
          <Link
            href={`${pathname}${buildCollectionQuery({ filters: chip.filters, sort })}`}
            prefetch
            className="border-line bg-blush text-plum hover:border-rose-ink hover:text-rose-ink inline-flex h-11 items-center gap-1.5 rounded-full border pr-2.5 pl-3 text-xs font-medium transition-colors"
          >
            {chip.label}
            <CloseIcon className="h-3.5 w-3.5" />
            <span className="sr-only">Remove filter</span>
          </Link>
        </li>
      ))}
      <li>
        <Link
          href={`${pathname}${buildCollectionQuery({ sort })}`}
          prefetch
          className="text-plum-soft hover:text-rose-ink flex min-h-11 items-center text-xs underline underline-offset-4 transition-colors"
        >
          Clear all
        </Link>
      </li>
    </ul>
  );
}
