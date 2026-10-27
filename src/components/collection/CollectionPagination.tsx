import Link from "next/link";
import type { ProductFilters, SortOption } from "@/types";
import { buildCollectionQuery } from "@/utils";

export type CollectionPaginationProps = {
  pathname: string;
  filters: ProductFilters;
  sort: SortOption;
  /** Offset cursor of the current page ("0"/null = first page). */
  cursor: string | null;
  totalCount: number;
  pageSize: number;
};

type PageItem = number | "…";

/** Page number list with ellipses — all pages when <= 7, else 1 … c-1 c c+1 … n. */
function getPageItems(current: number, total: number): PageItem[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "…", total];
  }
  if (current >= total - 3) {
    return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "…", current - 1, current, current + 1, "…", total];
}

const cellClasses =
  "border-line text-plum hover:border-rose-ink hover:text-rose-ink flex h-11 w-11 items-center justify-center rounded-full border text-sm font-medium transition-colors";

/** Offset-based "Showing X–Y of Z" summary plus prev/next and numbered pages. */
export function CollectionPagination({
  pathname,
  filters,
  sort,
  cursor,
  totalCount,
  pageSize,
}: CollectionPaginationProps) {
  if (totalCount === 0) {
    return null;
  }

  const parsedCursor = Number.parseInt(cursor ?? "0", 10);
  const offset = Number.isFinite(parsedCursor) && parsedCursor > 0 ? parsedCursor : 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const current = Math.min(totalPages, Math.floor(offset / pageSize) + 1);
  const start = offset + 1;
  const end = Math.min(totalCount, offset + pageSize);

  const hrefForPage = (page: number) =>
    `${pathname}${buildCollectionQuery({
      filters,
      sort,
      cursor: String((page - 1) * pageSize),
    })}`;

  return (
    <nav aria-label="Pagination" className="mt-12 flex flex-col items-center gap-5">
      <p className="text-plum-soft text-sm">
        Showing {start}–{end} of {totalCount} products
      </p>

      {totalPages > 1 ? (
        <ul className="flex flex-wrap items-center justify-center gap-2">
          <li>
            {current > 1 ? (
              <Link
                href={hrefForPage(current - 1)}
                prefetch
                aria-label="Previous page"
                className={cellClasses}
              >
                ←
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className={`${cellClasses} pointer-events-none opacity-40`}
              >
                ←
              </span>
            )}
          </li>

          {getPageItems(current, totalPages).map((item, index) =>
            item === "…" ? (
              <li key={`gap-${index}`} className="text-plum-soft px-1 text-sm" aria-hidden="true">
                …
              </li>
            ) : item === current ? (
              <li key={item}>
                <span
                  aria-current="page"
                  className="bg-plum text-cream flex h-11 w-11 items-center justify-center rounded-full text-sm font-medium"
                >
                  {item}
                </span>
              </li>
            ) : (
              <li key={item}>
                <Link href={hrefForPage(item)} prefetch className={cellClasses}>
                  {item}
                </Link>
              </li>
            ),
          )}

          <li>
            {current < totalPages ? (
              <Link
                href={hrefForPage(current + 1)}
                prefetch
                aria-label="Next page"
                className={cellClasses}
              >
                →
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className={`${cellClasses} pointer-events-none opacity-40`}
              >
                →
              </span>
            )}
          </li>
        </ul>
      ) : null}
    </nav>
  );
}
