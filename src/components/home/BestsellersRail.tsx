import { ProductGrid, SectionHeader } from "@/components/common";
import { Container } from "@/components/layout";
import { ROUTES } from "@/constants";
import type { Product } from "@/types";

export type BestsellersRailProps = {
  products: readonly Product[];
};

/** Bestsellers rail — products tagged "bestseller" in the data layer. */
export function BestsellersRail({ products }: BestsellersRailProps) {
  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container className="flex flex-col gap-10">
        <SectionHeader
          eyebrow="Loved by many"
          title="Bestsellers"
          link={{ label: "View all", href: ROUTES.COLLECTION_BESTSELLERS }}
        />
        <ProductGrid products={products} />
      </Container>
    </section>
  );
}
