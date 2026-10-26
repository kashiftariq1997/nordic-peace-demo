import Image from "next/image";
import { Container } from "@/components/layout";
import type { Collection } from "@/types";

export type CollectionHeroProps = {
  collection: Collection;
};

/** Full-width collection intro — title, description, count, optional artwork. */
export function CollectionHero({ collection }: CollectionHeroProps) {
  return (
    <section className="bg-blush">
      <Container className="grid items-center gap-10 py-14 sm:py-16 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
        <div className="flex max-w-2xl flex-col gap-4">
          <p className="text-rose-ink text-xs font-medium tracking-[0.3em] uppercase">Collection</p>
          <h1 className="font-heading text-plum text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            {collection.title}
          </h1>
          <p className="text-plum-soft max-w-xl text-base leading-7">{collection.description}</p>
          <p className="text-plum-soft text-sm">
            {collection.productsCount} {collection.productsCount === 1 ? "piece" : "pieces"}
          </p>
        </div>

        {collection.image ? (
          <div className="bg-cream shadow-soft relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-[2rem] lg:max-w-none">
            <Image
              src={collection.image.url}
              alt={collection.image.altText || collection.title}
              fill
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="object-cover"
            />
          </div>
        ) : null}
      </Container>
    </section>
  );
}
