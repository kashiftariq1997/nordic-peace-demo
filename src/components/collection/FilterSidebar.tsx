"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronIcon } from "@/icons";
import type { CatalogFilterOptions, ProductFilters, SortOption } from "@/types";
import { buildCollectionQuery, countActiveFilters, formatMoney, toggleListValue } from "@/utils";

/** Decorative swatch colors for known catalog colors (line as safe fallback). */
const COLOR_SWATCHES: Record<string, string> = {
  Blush: "#F3B9C7",
  Cream: "#FFF9F6",
  Ivory: "#F5EEDF",
  Oat: "#E3D5BC",
  Peony: "#DE8096",
  Plum: "#372A33",
  Rosewater: "#F7D9E1",
};

function toPrice(value: FormDataEntryValue | null): number | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export type FilterSidebarProps = {
  options: CatalogFilterOptions;
  /** Active filters parsed server-side from the URL. */
  active: ProductFilters;
  /** Sort is preserved when a filter changes (pagination resets). */
  sort: SortOption;
  pathname: string;
};

/**
 * URL-driven filter panel. Rendered twice — a mobile <details> disclosure and
 * a desktop sticky sidebar — from one stateless inner panel, so every change
 * is a router.replace to the next query string (server props stay the source
 * of truth; no client-side filter state to drift out of sync).
 */
export function FilterSidebar({ options, active, sort, pathname }: FilterSidebarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const activeCount = countActiveFilters(active);

  const applyFilters = (next: ProductFilters) => {
    startTransition(() => {
      router.replace(`${pathname}${buildCollectionQuery({ filters: next, sort })}`, {
        scroll: false,
      });
    });
  };

  return (
    <div aria-busy={isPending} className="min-w-0">
      <details className="border-line bg-cream group rounded-3xl border lg:hidden">
        <summary className="text-plum flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            Filters
            {activeCount > 0 ? (
              <span className="bg-blush-deep text-plum rounded-full px-2 py-0.5 text-xs">
                {activeCount}
              </span>
            ) : null}
          </span>
          <ChevronIcon className="text-plum-soft h-4 w-4 transition-transform duration-200 group-open:rotate-180" />
        </summary>
        <div className="border-line border-t p-4">
          <FiltersPanel active={active} options={options} onChange={applyFilters} />
        </div>
      </details>

      <aside className="hidden lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
        <FiltersPanel active={active} options={options} onChange={applyFilters} />
      </aside>
    </div>
  );
}

type FiltersPanelProps = Omit<FilterSidebarProps, "sort" | "pathname"> & {
  onChange: (next: ProductFilters) => void;
};

function FiltersPanel({ options, active, onChange }: FiltersPanelProps) {
  const activeCount = countActiveFilters(active);
  const toggleFacet = (facet: "productTypes" | "sizes" | "colors", value: string) => {
    const current =
      facet === "productTypes"
        ? active.productTypes
        : facet === "sizes"
          ? active.sizes
          : active.colors;
    const toggled = toggleListValue(current, value);
    if (facet === "productTypes") onChange({ ...active, productTypes: toggled });
    else if (facet === "sizes") onChange({ ...active, sizes: toggled });
    else onChange({ ...active, colors: toggled });
  };

  return (
    <div className="border-line bg-cream flex flex-col gap-7 rounded-3xl border p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-plum text-lg">Filters</h2>
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={() => onChange({})}
            className="text-plum-soft hover:text-rose-ink text-xs underline underline-offset-4 transition-colors"
          >
            Clear all
          </button>
        ) : null}
      </div>

      <fieldset className="m-0 border-0 p-0">
        <legend className="text-rose-ink mb-3 p-0 text-xs font-medium tracking-[0.25em] uppercase">
          Category
        </legend>
        <div className="flex flex-col">
          {options.productTypes.map((type) => (
            <label
              key={type}
              className="text-plum flex min-h-11 cursor-pointer items-center gap-3 text-sm"
            >
              <input
                type="checkbox"
                className="accent-plum h-4 w-4 cursor-pointer"
                checked={active.productTypes?.includes(type) ?? false}
                onChange={() => toggleFacet("productTypes", type)}
              />
              {type}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="m-0 border-0 p-0">
        <legend className="text-rose-ink mb-3 p-0 text-xs font-medium tracking-[0.25em] uppercase">
          Size
        </legend>
        <div className="flex flex-wrap gap-2">
          {options.sizes.map((size) => (
            <label key={size} className="cursor-pointer">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={active.sizes?.includes(size) ?? false}
                onChange={() => toggleFacet("sizes", size)}
              />
              <span className="border-line text-plum hover:border-rose-ink peer-checked:border-plum peer-checked:bg-plum peer-checked:text-cream peer-focus-visible:outline-rose-ink inline-flex h-11 min-w-11 items-center justify-center rounded-full border px-3 text-xs font-medium transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2">
                {size}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="m-0 border-0 p-0">
        <legend className="text-rose-ink mb-3 p-0 text-xs font-medium tracking-[0.25em] uppercase">
          Color
        </legend>
        <div className="flex flex-col">
          {options.colors.map((color) => (
            <label
              key={color}
              className="text-plum flex min-h-11 cursor-pointer items-center gap-3 text-sm"
            >
              <input
                type="checkbox"
                className="peer sr-only"
                checked={active.colors?.includes(color) ?? false}
                onChange={() => toggleFacet("colors", color)}
              />
              <span
                className="border-line peer-checked:ring-plum peer-checked:ring-offset-cream peer-focus-visible:outline-rose-ink block h-6 w-6 shrink-0 rounded-full border transition-shadow peer-checked:ring-2 peer-checked:ring-offset-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2"
                style={{ backgroundColor: COLOR_SWATCHES[color] ?? "#EFD9E0" }}
              />
              {color}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="m-0 border-0 p-0">
        <legend className="text-rose-ink mb-3 p-0 text-xs font-medium tracking-[0.25em] uppercase">
          Price
        </legend>
        {/* key remounts the form when the applied price changes, resetting inputs. */}
        <form
          key={`${active.priceMin ?? ""}-${active.priceMax ?? ""}`}
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            onChange({
              ...active,
              priceMin: toPrice(data.get("min")),
              priceMax: toPrice(data.get("max")),
            });
          }}
        >
          <div className="flex items-center gap-2">
            <input
              type="number"
              name="min"
              min={0}
              inputMode="numeric"
              aria-label={`Minimum price in ${options.currencyCode}`}
              placeholder={formatMoney({
                amount: options.priceMin,
                currencyCode: options.currencyCode,
              })}
              defaultValue={active.priceMin ?? ""}
              className="border-line text-plum placeholder:text-plum-soft h-11 w-full min-w-0 rounded-full border bg-white px-4 text-sm"
            />
            <span aria-hidden="true" className="text-plum-soft text-sm">
              –
            </span>
            <input
              type="number"
              name="max"
              min={0}
              inputMode="numeric"
              aria-label={`Maximum price in ${options.currencyCode}`}
              placeholder={formatMoney({
                amount: options.priceMax,
                currencyCode: options.currencyCode,
              })}
              defaultValue={active.priceMax ?? ""}
              className="border-line text-plum placeholder:text-plum-soft h-11 w-full min-w-0 rounded-full border bg-white px-4 text-sm"
            />
          </div>
          <button
            type="submit"
            className="border-line text-plum hover:border-rose-ink hover:text-rose-ink h-11 rounded-full border text-xs font-medium tracking-wide uppercase transition-colors"
          >
            Apply price
          </button>
        </form>
      </fieldset>

      <label className="border-line text-plum flex min-h-11 cursor-pointer items-center gap-3 border-t pt-4 text-sm">
        <input
          type="checkbox"
          className="accent-plum h-4 w-4 cursor-pointer"
          checked={active.availableOnly ?? false}
          onChange={() => onChange({ ...active, availableOnly: !active.availableOnly })}
        />
        In stock only
      </label>
    </div>
  );
}
