import { CollectionGrid, SectionHeader } from "@/components/common";
import { Container } from "@/components/layout";
import { ROUTES } from "@/constants";
import type { Collection } from "@/types";

export type FeaturedCollectionsProps = {
  collections: readonly Collection[];
};

/** "Shop by mood" — the three curated worlds of the store. */
export function FeaturedCollections({ collections }: FeaturedCollectionsProps) {
  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container className="flex flex-col gap-10">
        <SectionHeader
          eyebrow="Shop by mood"
          title="Collections"
          link={{ label: "Shop all", href: ROUTES.COLLECTION_ALL }}
        />
        <CollectionGrid collections={collections} />
      </Container>
    </section>
  );
}
