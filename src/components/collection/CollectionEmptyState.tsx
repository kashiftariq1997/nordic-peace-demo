import Link from "next/link";
import { buttonClassName } from "@/components/ui";
import { ROUTES } from "@/constants";
import type { SortOption } from "@/types";
import { buildCollectionQuery } from "@/utils";

export type CollectionEmptyStateProps = {
  pathname: string;
  sort: SortOption;
};

/** Shown when the active filters match nothing — offers a way back out. */
export function CollectionEmptyState({ pathname, sort }: CollectionEmptyStateProps) {
  return (
    <div className="border-line bg-blush/50 mt-2 flex flex-col items-center gap-4 rounded-3xl border px-6 py-16 text-center">
      <h2 className="font-heading text-plum text-2xl">No pieces match those filters</h2>
      <p className="text-plum-soft max-w-sm text-sm leading-6">
        Try loosening a filter or two — the soft things are still here.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href={`${pathname}${buildCollectionQuery({ sort })}`}
          className={buttonClassName({ variant: "secondary", size: "sm" })}
        >
          Clear all filters
        </Link>
        <Link
          href={ROUTES.COLLECTION_ALL}
          className="text-plum-soft hover:text-rose-ink text-sm underline underline-offset-4 transition-colors"
        >
          Browse everything
        </Link>
      </div>
    </div>
  );
}
