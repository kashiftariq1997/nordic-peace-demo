import type { Product, ProductVariant } from "@/types";

/**
 * Shared variant-selection helpers for the product form and card quick-add
 * (spec Step B/C follow-up) — identical behavior on both surfaces.
 */

/** Default selection = first available variant (fallback: first variant). */
export function defaultSelection(product: Product): Record<string, string> {
  const fromOptions = Object.fromEntries(
    product.options.map((option) => [option.name, option.values[0] ?? ""]),
  );
  const source =
    product.variants.find((variant) => variant.availableForSale) ?? product.variants[0];
  if (!source) {
    return fromOptions;
  }
  return {
    ...fromOptions,
    ...Object.fromEntries(source.selectedOptions.map((option) => [option.name, option.value])),
  };
}

/** Is this option value buyable given the OTHER current selections? */
export function isValueAvailable(
  product: Product,
  selected: Record<string, string>,
  optionName: string,
  value: string,
): boolean {
  return product.variants.some(
    (variant) =>
      variant.availableForSale &&
      variant.selectedOptions.every((option) =>
        option.name === optionName
          ? option.value === value
          : selected[option.name] === option.value,
      ),
  );
}

/** The variant matching the current option selections (null if none matches). */
export function matchVariant(
  product: Product,
  selected: Record<string, string>,
): ProductVariant | null {
  return (
    product.variants.find((variant) =>
      variant.selectedOptions.every((option) => selected[option.name] === option.value),
    ) ?? null
  );
}
