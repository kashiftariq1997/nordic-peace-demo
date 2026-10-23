import { ProductCard } from "@/components/common/ProductCard";
import type { Product } from "@/types";
import { cn } from "@/utils";

export type ProductGridProps = {
  products: readonly Product[];
  className?: string;
  sizes?: string;
};

/** Responsive product grid — 2 cols mobile, 3 sm, 4 lg. */
export function ProductGrid({ products, className, sizes }: ProductGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4",
        className,
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} sizes={sizes} />
      ))}
    </div>
  );
}
