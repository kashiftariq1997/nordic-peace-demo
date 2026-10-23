import { ProductGrid, SectionHeader } from "@/components/common";
import { Container } from "@/components/layout";
import { ROUTES } from "@/constants";
import type { Product } from "@/types";

export type ProductRailProps = {
  products: readonly Product[];
};

/** New arrivals rail — 4-up on the homepage. */
export function NewArrivalsRail({ products }: ProductRailProps) {
  return (
    <section className="bg-blush py-16 sm:py-24">
      <Container className="flex flex-col gap-10">
        <SectionHeader
          eyebrow="Freshly folded"
          title="New arrivals"
          link={{ label: "View all", href: ROUTES.COLLECTION_NEW_ARRIVALS }}
        />
        <ProductGrid products={products} />
      </Container>
    </section>
  );
}
