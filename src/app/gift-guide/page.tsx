import type { Metadata } from "next";
import Link from "next/link";
import { ContentHero } from "@/components/content";
import { Container } from "@/components/layout";
import { buttonClassName } from "@/components/ui";
import { ProductGrid } from "@/components/common";
import { ROUTES } from "@/constants";
import { getProducts } from "@/services";

export const metadata: Metadata = {
  title: "Gift Guide",
  description:
    "Thoughtful little luxuries under $50, vanity treasures and soft layers — gifts from Nordic Peace.",
};

export default async function GiftGuidePage() {
  const [under50, vanity, forTheBed] = await Promise.all([
    getProducts({ filters: { priceMax: 50 }, sort: "price-asc", first: 6 }),
    getProducts({
      filters: { productTypes: ["Vanity", "Hair Accessories"] },
      sort: "featured",
      first: 6,
    }),
    getProducts({ filters: { productTypes: ["Bedding", "Home"] }, sort: "featured", first: 6 }),
  ]);

  const sections = [
    {
      eyebrow: "Under $50",
      title: "Little luxuries",
      lede: "Small things, big softness — the easiest yes on the list.",
      products: under50.items,
    },
    {
      eyebrow: "For the dressing table",
      title: "Vanity treasures",
      lede: "Trays, bows and boxes for the one who keeps everything beautiful.",
      products: vanity.items,
    },
    {
      eyebrow: "For the bed",
      title: "Layered softness",
      lede: "Duvets, throws and shams that make the whole room feel like a lie-in.",
      products: forTheBed.items,
    },
  ];

  return (
    <>
      <ContentHero
        eyebrow="Gift guide"
        title="Something soft for everyone"
        lede="Curated by price, by room, and by how well they'd be received — every parcel arrives wrapped with a hand-written note."
      />

      {sections.map((section, index) => (
        <section
          key={section.title}
          className={index % 2 === 0 ? "bg-cream py-14 sm:py-16" : "bg-blush/40 py-14 sm:py-16"}
        >
          <Container className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <p className="text-rose-ink text-xs font-medium tracking-[0.25em] uppercase">
                {section.eyebrow}
              </p>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <h2 className="font-heading text-plum text-3xl leading-tight tracking-tight sm:text-4xl">
                    {section.title}
                  </h2>
                  <p className="text-plum-soft max-w-md text-sm leading-6">{section.lede}</p>
                </div>
                <Link
                  href={ROUTES.collection("gifts")}
                  className="text-plum hover:text-rose-ink text-sm font-medium underline-offset-4 transition-colors hover:underline"
                >
                  All gifts →
                </Link>
              </div>
            </div>
            <ProductGrid products={section.products} maxColumns={3} />
          </Container>
        </section>
      ))}

      <section className="bg-cream pb-16 sm:pb-20">
        <Container>
          <div className="border-line bg-blush flex flex-col items-center gap-4 rounded-3xl border px-6 py-12 text-center">
            <h2 className="font-heading text-plum text-3xl tracking-tight">Wrapped and ready</h2>
            <p className="text-plum-soft max-w-md text-sm leading-6">
              Tissue paper, a ribbon, and your words on a card — gifting, handled. Add your note at
              checkout.
            </p>
            <Link href={ROUTES.collection("gifts")} className={buttonClassName()}>
              Shop the gift collection
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
