import { ProductCard } from "@/components/common/ProductCard";
import type { Product } from "@/types";
import { cn } from "@/utils";

export type ProductGridProps = {
  products: readonly Product[];
  className?: string;
  sizes?: string;
  /** 4 columns on lg by default; 3 when the grid shares the row with a sidebar. */
  maxColumns?: 4 | 3;
};

const SIZES_BY_COLUMNS: Record<4 | 3, string> = {
  4: "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw",
  3: "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
};

/** Responsive product grid — 2 cols mobile, 3 sm, then 4 (or 3) on lg. */
export function ProductGrid({ products, className, sizes, maxColumns = 4 }: ProductGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6",
        maxColumns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4",
        className,
      )}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          sizes={sizes ?? SIZES_BY_COLUMNS[maxColumns]}
        />
      ))}
    </div>
  );
}
