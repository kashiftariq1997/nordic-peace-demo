import type { CollectionQuery, ProductFilters, SortOption } from "@/types";
import { formatMoney } from "./format-money";

/**
 * Pure URL <-> filter-state helpers for the collection page. Used by BOTH the
 * server components (parsing the incoming searchParams) and the client filter
 * controls (building the next href) — so keep this file client-safe: no
 * server-only imports, no fetches.
 */

const SORT_VALUES: readonly SortOption[] = ["featured", "newest", "price-asc", "price-desc"];

type SearchParamsRecord = Record<string, string | string[] | undefined>;

/** `"M,L"` or `["M","L"]` -> `["M", "L"]` (CSV and repeated params both work). */
function toList(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const parts = Array.isArray(value) ? value : [value];
  return parts
    .flatMap((part) => part.split(","))
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function toOptionalNumber(value: string | string[] | undefined): number | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

/** Read the URL into typed filter/sort/cursor state (unknown values fall back safely). */
export function parseCollectionQuery(searchParams: SearchParamsRecord): CollectionQuery {
  const sortParam = typeof searchParams.sort === "string" ? searchParams.sort : "";
  const sort: SortOption = SORT_VALUES.includes(sortParam as SortOption)
    ? (sortParam as SortOption)
    : "featured";

  const filters: ProductFilters = {};
  const productTypes = toList(searchParams.type);
  const sizes = toList(searchParams.size);
  const colors = toList(searchParams.color);
  if (productTypes.length) filters.productTypes = productTypes;
  if (sizes.length) filters.sizes = sizes;
  if (colors.length) filters.colors = colors;

  const priceMin = toOptionalNumber(searchParams.min);
  const priceMax = toOptionalNumber(searchParams.max);
  if (priceMin !== undefined) filters.priceMin = priceMin;
  if (priceMax !== undefined) filters.priceMax = priceMax;
  if (searchParams.available === "1") filters.availableOnly = true;

  const cursor =
    typeof searchParams.cursor === "string" && searchParams.cursor ? searchParams.cursor : null;

  return { filters, sort, cursor };
}

/**
 * Serialize state to a query string ("?a=1&b=2", or "" for defaults).
 * Defaults are omitted: featured sort, empty filters, cursor 0 — and cursor is
 * intentionally left out whenever the caller doesn't pass it, so filter/sort
 * changes reset pagination.
 */
export function buildCollectionQuery(query: Partial<CollectionQuery>): string {
  const { filters = {}, sort, cursor } = query;
  const params = new URLSearchParams();

  if (filters.productTypes?.length) params.set("type", filters.productTypes.join(","));
  if (filters.sizes?.length) params.set("size", filters.sizes.join(","));
  if (filters.colors?.length) params.set("color", filters.colors.join(","));
  if (filters.priceMin !== undefined) params.set("min", String(filters.priceMin));
  if (filters.priceMax !== undefined) params.set("max", String(filters.priceMax));
  if (filters.availableOnly) params.set("available", "1");
  if (sort && sort !== "featured") params.set("sort", sort);
  if (cursor && cursor !== "0") params.set("cursor", cursor);

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

/** Add/remove one value from a multi-select filter list. */
export function toggleListValue(list: string[] | undefined, value: string): string[] {
  const current = list ?? [];
  return current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value];
}

/** Number of active filter facets — drives the mobile "Filters (n)" badge. */
export function countActiveFilters(filters: ProductFilters): number {
  return (
    (filters.productTypes?.length ?? 0) +
    (filters.sizes?.length ?? 0) +
    (filters.colors?.length ?? 0) +
    (filters.priceMin !== undefined ? 1 : 0) +
    (filters.priceMax !== undefined ? 1 : 0) +
    (filters.availableOnly ? 1 : 0)
  );
}

export type FilterChip = {
  key: string;
  label: string;
  /** The remaining filters after removing this chip (cursor is dropped anyway). */
  filters: ProductFilters;
};

/** Active-filter chips for the results toolbar — each removes just its own facet. */
export function buildFilterChips(filters: ProductFilters, currencyCode: string): FilterChip[] {
  const chips: FilterChip[] = [];

  const productTypes = filters.productTypes ?? [];
  for (const value of productTypes) {
    chips.push({
      key: `type:${value}`,
      label: value,
      filters: { ...filters, productTypes: productTypes.filter((entry) => entry !== value) },
    });
  }

  const sizes = filters.sizes ?? [];
  for (const value of sizes) {
    chips.push({
      key: `size:${value}`,
      label: value,
      filters: { ...filters, sizes: sizes.filter((entry) => entry !== value) },
    });
  }

  const colors = filters.colors ?? [];
  for (const value of colors) {
    chips.push({
      key: `color:${value}`,
      label: value,
      filters: { ...filters, colors: colors.filter((entry) => entry !== value) },
    });
  }

  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    let label: string;
    if (filters.priceMin !== undefined && filters.priceMax !== undefined) {
      label = `${formatMoney({ amount: filters.priceMin, currencyCode })}–${formatMoney({
        amount: filters.priceMax,
        currencyCode,
      })}`;
    } else if (filters.priceMin !== undefined) {
      label = `From ${formatMoney({ amount: filters.priceMin, currencyCode })}`;
    } else {
      label = `Up to ${formatMoney({ amount: filters.priceMax ?? 0, currencyCode })}`;
    }
    chips.push({
      key: "price",
      label,
      filters: { ...filters, priceMin: undefined, priceMax: undefined },
    });
  }

  if (filters.availableOnly) {
    chips.push({
      key: "available",
      label: "In stock only",
      filters: { ...filters, availableOnly: false },
    });
  }

  return chips;
}
