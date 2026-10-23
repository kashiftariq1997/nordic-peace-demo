import type { Paginated, Product, ProductFilters, SortOption } from "@/types";

/**
 * Shared filter / sort / pagination used by BOTH the Shopify path and the mock
 * fallback, so the site behaves identically either way. On the Shopify path
 * this runs over the scoped fetch window (see shopify-queries.ts); for large
 * catalogs, push filters into the Storefront API query instead.
 */

export function applyProductFilters(products: Product[], filters?: ProductFilters): Product[] {
  if (!filters) {
    return products;
  }

  return products.filter((product) => {
    if (filters.productTypes?.length && !filters.productTypes.includes(product.productType)) {
      return false;
    }
    if (filters.tags?.length && !filters.tags.every((tag) => product.tags.includes(tag))) {
      return false;
    }
    if (filters.availableOnly && !product.availableForSale) {
      return false;
    }

    const optionValues = (name: string) =>
      product.options.find((option) => option.name.toLowerCase() === name.toLowerCase())?.values ??
      [];

    if (filters.sizes?.length) {
      const sizes = optionValues("size");
      if (!filters.sizes.some((size) => sizes.includes(size))) {
        return false;
      }
    }
    if (filters.colors?.length) {
      const colors = optionValues("color");
      if (!filters.colors.some((color) => colors.includes(color))) {
        return false;
      }
    }

    if (filters.priceMin !== undefined && product.priceRange.min.amount < filters.priceMin) {
      return false;
    }
    if (filters.priceMax !== undefined && product.priceRange.min.amount > filters.priceMax) {
      return false;
    }

    return true;
  });
}

export function applyProductSort(products: Product[], sort: SortOption = "featured"): Product[] {
  const sorted = [...products];

  switch (sort) {
    case "newest":
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case "price-asc":
      sorted.sort((a, b) => a.priceRange.min.amount - b.priceRange.min.amount);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.priceRange.min.amount - a.priceRange.min.amount);
      break;
    case "featured":
      sorted.sort((a, b) => a.featuredPosition - b.featuredPosition);
      break;
  }

  return sorted;
}

const DEFAULT_PAGE_SIZE = 12;

/**
 * Offset-based pagination with an opaque string cursor. The cursor is the
 * next item's offset — harmless in URLs and identical on both data paths.
 */
export function paginateProducts(
  items: Product[],
  options?: { first?: number; cursor?: string | null },
): Paginated<Product> {
  const first = options?.first ?? DEFAULT_PAGE_SIZE;
  const parsedCursor = Number.parseInt(options?.cursor ?? "0", 10);
  const offset = Number.isFinite(parsedCursor) && parsedCursor > 0 ? parsedCursor : 0;

  const pageItems = items.slice(offset, offset + first);
  const nextOffset = offset + pageItems.length;
  const hasNextPage = nextOffset < items.length;

  return {
    items: pageItems,
    totalCount: items.length,
    pageInfo: {
      hasNextPage,
      endCursor: hasNextPage ? String(nextOffset) : null,
    },
  };
}
