import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ProductGrid } from "@/components/common";
import { ContentHero } from "@/components/content";
import { Container } from "@/components/layout";
import { buttonClassName } from "@/components/ui";
import { ROUTES } from "@/constants";
import { getCollections, getProductsByHandles } from "@/services";
import { cn } from "@/utils";

export const metadata: Metadata = {
  title: "Lookbook",
  description: "The Nordic Peace worlds, season by season — pajamas, bedding, vanity and gifts.",
  alternates: { canonical: "/lookbook" },
};

/** Pieces shown in the closing "featured in the edit" rail. */
const FEATURED_HANDLES = [
  "rosewater-silk-pajama-set",
  "cloud-knit-throw",
  "blush-velvet-jewelry-box",
  "scallop-vanity-mirror",
] as const;

export default async function LookbookPage() {
  const [collections, featured] = await Promise.all([
    getCollections(),
    getProductsByHandles(FEATURED_HANDLES),
  ]);

  return (
    <>
      <ContentHero
        eyebrow="Lookbook"
        title="The worlds we return to"
        lede="Six collections, one feeling — browse the edits, then wander into the pieces that make them."
      />

      <section className="bg-cream py-14 sm:py-16">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection, index) => (
              <Link
                key={collection.id}
                href={ROUTES.collection(collection.handle)}
                className="group flex flex-col gap-3"
              >
                <div
                  className={cn(
                    "bg-blush relative overflow-hidden rounded-3xl",
                    index % 3 === 1 ? "aspect-[4/5]" : "aspect-[4/3]",
                  )}
                >
                  {collection.image ? (
                    <Image
                      src={collection.image.url}
                      alt={collection.image.altText || collection.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : null}
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="font-heading text-plum group-hover:text-rose-ink text-2xl leading-snug transition-colors">
                    {collection.title}
                  </h2>
                  <p className="text-plum-soft text-sm leading-6">{collection.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-blush py-14 sm:py-16">
        <Container className="flex flex-col gap-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-rose-ink text-xs font-medium tracking-[0.25em] uppercase">
                Featured in the edit
              </p>
              <h2 className="font-heading text-plum text-3xl leading-tight tracking-tight sm:text-4xl">
                The pieces
              </h2>
            </div>
            <Link
              href={ROUTES.COLLECTION_ALL}
              className="text-plum hover:text-rose-ink text-sm font-medium underline-offset-4 transition-colors hover:underline"
            >
              Shop all →
            </Link>
          </div>
          <ProductGrid products={featured} maxColumns={4} />
          <div className="flex justify-center pt-2">
            <Link
              href={ROUTES.COLLECTION_NEW_ARRIVALS}
              className={buttonClassName({ variant: "secondary" })}
            >
              See what&apos;s new
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
