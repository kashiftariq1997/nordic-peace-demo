import { CollectionCard } from "@/components/common/CollectionCard";
import type { Collection } from "@/types";
import { cn } from "@/utils";

export type CollectionGridProps = {
  collections: readonly Collection[];
  className?: string;
  sizes?: string;
};

/** Responsive collection grid — 1 col mobile, 3 sm+. */
export function CollectionGrid({ collections, className, sizes }: CollectionGridProps) {
  return (
    <div
      className={cn("grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3", className)}
    >
      {collections.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} sizes={sizes} />
      ))}
    </div>
  );
}
