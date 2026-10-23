import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui";
import { Price } from "./Price";
import { ROUTES } from "@/constants";
import type { Product } from "@/types";
import { cn } from "@/utils";

export type ProductCardProps = {
  product: Product;
  className?: string;
  /** Sizes attr for next/image — pass the grid's viewport coverage. */
  sizes?: string;
};

const DEFAULT_SIZES = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw";

/**
 * Product card — image, badges, title, price. Used on home, collection and
 * search grids. Server Component by default; no client state needed.
 * Mock art is local SVG — next/image serves .svg srcs unoptimized automatically.
 */
export function ProductCard({ product, className, sizes = DEFAULT_SIZES }: ProductCardProps) {
  const compareAt = product.variants.find((variant) => variant.compareAtPrice)?.compareAtPrice;

  return (
    <Link
      href={ROUTES.product(product.handle)}
      className={cn("group flex flex-col gap-3", className)}
    >
      <div className="bg-blush relative aspect-4/5 overflow-hidden rounded-3xl">
        {product.featuredImage ? (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText || product.title}
            fill
            sizes={sizes}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-heading text-rose-ink/40 text-4xl">Nordic Peace</span>
          </div>
        )}

        {product.badges.length > 0 ? (
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {product.badges.map((badge) => (
              <Badge key={badge} badge={badge} />
            ))}
          </div>
        ) : null}

        {!product.availableForSale ? (
          <div className="bg-cream/70 absolute inset-0 flex items-center justify-center">
            <span className="text-plum-soft border-line bg-cream rounded-full border px-4 py-1.5 text-xs font-medium tracking-wide">
              Sold out
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="font-heading text-plum group-hover:text-rose-ink text-xl leading-snug transition-colors">
          {product.title}
        </h3>
        <Price price={product.priceRange.min} compareAt={compareAt} className="text-sm" />
      </div>
    </Link>
  );
}
