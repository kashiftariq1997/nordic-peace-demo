import type { Metadata } from "next";
import {
  BestsellersRail,
  FeaturedCollections,
  GiftTeaser,
  Hero,
  NewArrivalsRail,
  StoryBand,
  ValuesStrip,
} from "@/components/home";
import { SITE_DESCRIPTION, SITE_NAME } from "@/constants";
import { getBestsellers, getCollections, getProducts } from "@/services";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

const FEATURED_COLLECTION_HANDLES = ["pajama-sets", "cozy-home", "vanity-edit"] as const;

export default async function Home() {
  const [newArrivals, bestsellers, collections] = await Promise.all([
    getProducts({ sort: "newest", first: 4 }),
    getBestsellers(4),
    getCollections(),
  ]);

  const featuredCollections = FEATURED_COLLECTION_HANDLES.map((handle) =>
    collections.find((collection) => collection.handle === handle),
  ).filter((collection): collection is NonNullable<typeof collection> => Boolean(collection));

  return (
    <>
      <Hero />
      <ValuesStrip />
      <FeaturedCollections collections={featuredCollections} />
      <NewArrivalsRail products={newArrivals.items} />
      <StoryBand />
      <BestsellersRail products={bestsellers} />
      <GiftTeaser />
    </>
  );
}
