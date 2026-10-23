import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/constants";
import type { Collection } from "@/types";
import { cn } from "@/utils";

export type CollectionCardProps = {
  collection: Collection;
  className?: string;
  sizes?: string;
};

const DEFAULT_SIZES = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

/** Collection card — illustration, title, product count. */
export function CollectionCard({
  collection,
  className,
  sizes = DEFAULT_SIZES,
}: CollectionCardProps) {
  return (
    <Link
      href={ROUTES.collection(collection.handle)}
      className={cn("group flex flex-col gap-3", className)}
    >
      <div className="bg-blush relative aspect-square overflow-hidden rounded-3xl">
        {collection.image ? (
          <Image
            src={collection.image.url}
            alt={collection.image.altText || collection.title}
            fill
            sizes={sizes}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-heading text-rose-ink/40 text-3xl">Nordic Peace</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-0.5">
        <h3 className="font-heading text-plum group-hover:text-rose-ink text-xl transition-colors">
          {collection.title}
        </h3>
        <p className="text-plum-soft text-sm">
          {collection.productsCount} {collection.productsCount === 1 ? "piece" : "pieces"}
        </p>
      </div>
    </Link>
  );
}
