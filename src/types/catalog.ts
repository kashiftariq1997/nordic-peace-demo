export type SortOption = "featured" | "newest" | "price-asc" | "price-desc";

export type ProductFilters = {
  productTypes?: string[];
  sizes?: string[];
  colors?: string[];
  priceMin?: number;
  priceMax?: number;
  availableOnly?: boolean;
  tags?: string[];
};

export type ProductQueryParams = {
  /** Handles: "all" is virtual (every product). */
  collectionHandle?: string;
  /** Free-text search (Shopify search syntax on the API path). */
  query?: string;
  filters?: ProductFilters;
  sort?: SortOption;
  /** Page size (mock and API paths slice identically). */
  first?: number;
  /** Opaque cursor from a previous page's pageInfo.endCursor. */
  cursor?: string | null;
};

export type PageInfo = {
  hasNextPage: boolean;
  endCursor: string | null;
};

export type Paginated<T> = {
  items: T[];
  totalCount: number;
  pageInfo: PageInfo;
};

/** Distinct values used to build the collection filter sidebar. */
export type CatalogFilterOptions = {
  productTypes: string[];
  sizes: string[];
  colors: string[];
  priceMin: number;
  priceMax: number;
};

/** URL-backed state of the collection page (parsed from searchParams). */
export type CollectionQuery = {
  filters: ProductFilters;
  sort: SortOption;
  /** Opaque pagination cursor (null = first page). */
  cursor: string | null;
};
