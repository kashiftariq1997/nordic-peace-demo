import { ProductGrid } from "@/components/common";
import { ROUTES } from "@/constants";
import { PRODUCTS_PAGE_SIZE } from "@/services/product-listing";
import { getCatalogFilterOptions, getProducts } from "@/services";
import { parseCollectionQuery } from "@/utils";
import { ActiveFilterChips } from "./ActiveFilterChips";
import { CollectionEmptyState } from "./CollectionEmptyState";
import { CollectionPagination } from "./CollectionPagination";
import { FilterSidebar } from "./FilterSidebar";
import { SortSelect } from "./SortSelect";

type CollectionSearchParams = Promise<Record<string, string | string[] | undefined>>;

export type CollectionResultsProps = {
  handle: string;
  searchParams: CollectionSearchParams;
};

/**
 * The searchParams-dependent half of the collection page: parses the URL,
 * fetches the page of products, and lays out sidebar + toolbar + grid. Kept
 * behind <Suspense> in the route so the hero and page chrome prerender.
 */
export async function CollectionResults({ handle, searchParams }: CollectionResultsProps) {
  const pathname = ROUTES.collection(handle);
  const query = parseCollectionQuery(await searchParams);

  const [options, page] = await Promise.all([
    getCatalogFilterOptions(handle),
    getProducts({
      collectionHandle: handle,
      filters: query.filters,
      sort: query.sort,
      first: PRODUCTS_PAGE_SIZE,
      cursor: query.cursor,
    }),
  ]);

  return (
    <div className="grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-10">
      <FilterSidebar
        options={options}
        active={query.filters}
        sort={query.sort}
        pathname={pathname}
      />

      <div className="min-w-0">
        <div className="border-line mb-5 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
          <p className="text-plum-soft text-sm">
            <span className="text-plum font-medium">{page.totalCount}</span>{" "}
            {page.totalCount === 1 ? "product" : "products"}
          </p>
          <SortSelect sort={query.sort} filters={query.filters} pathname={pathname} />
        </div>

        <ActiveFilterChips
          pathname={pathname}
          filters={query.filters}
          sort={query.sort}
          currencyCode={options.currencyCode}
        />

        {page.items.length === 0 ? (
          <CollectionEmptyState pathname={pathname} sort={query.sort} />
        ) : (
          <>
            <ProductGrid products={page.items} maxColumns={3} />
            <CollectionPagination
              pathname={pathname}
              filters={query.filters}
              sort={query.sort}
              cursor={query.cursor}
              totalCount={page.totalCount}
              pageSize={PRODUCTS_PAGE_SIZE}
            />
          </>
        )}
      </div>
    </div>
  );
}
