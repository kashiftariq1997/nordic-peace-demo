import type { Metadata } from "next";
import { ContentHero } from "@/components/content";
import { Container } from "@/components/layout";
import { WishlistGrid } from "@/components/wishlist";
import { ROUTES, SUGGESTED_COLLECTION_HANDLES } from "@/constants";
import { getBestsellers, getCollections } from "@/services";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Products you've saved on Nordic Peace — kept on this device.",
  alternates: { canonical: ROUTES.WISHLIST },
  // Personal, localStorage-backed content shouldn't be indexed (spec §11).
  robots: { index: false, follow: true },
};

/**
 * Wishlist page (spec Step C) — saved products from localStorage. Static
 * shell (hero + suggested collections for the empty state) with the
 * client-only grid resolving saved handles to live products.
 */
export default async function WishlistPage() {
  const [collections, bestsellers] = await Promise.all([getCollections(), getBestsellers(4)]);
  const suggestedCollections = collections.filter((collection) =>
    SUGGESTED_COLLECTION_HANDLES.includes(collection.handle),
  );

  return (
    <>
      <ContentHero
        eyebrow="Wishlist"
        title="Saved for later"
        lede="Hearts you've tapped — kept on this device, no account needed."
      />
      <section className="bg-cream py-10 sm:py-14">
        <Container>
          <WishlistGrid
            suggestedCollections={suggestedCollections}
            suggestedProducts={bestsellers}
          />
        </Container>
      </section>
    </>
  );
}
