import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  CollectionHero,
  CollectionResults,
  CollectionResultsSkeleton,
} from "@/components/collection";
import { Container } from "@/components/layout";
import { BreadcrumbJsonLd } from "@/components/seo";
import { ROUTES } from "@/constants";
import { ALL_COLLECTION_HANDLE, getCollection, getCollections } from "@/services";

type Props = PageProps<"/collections/[handle]">;

/** Prerender every known collection plus the virtual "all" collection. */
export async function generateStaticParams() {
  const collections = await getCollections();
  return [
    { handle: ALL_COLLECTION_HANDLE },
    ...collections.map((collection) => ({ handle: collection.handle })),
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollection(handle);
  if (!collection) {
    return { title: "Collection not found" };
  }
  return {
    title: collection.title,
    description: collection.description,
    alternates: { canonical: ROUTES.collection(handle) },
  };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { handle } = await params;
  const collection = await getCollection(handle);
  if (!collection) {
    notFound();
  }

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: ROUTES.HOME },
          { name: collection.title, path: ROUTES.collection(handle) },
        ]}
      />
      <CollectionHero collection={collection} />
      {/* searchParams live only inside CollectionResults, behind Suspense, so
          the hero and page chrome stay part of the prerendered static shell. */}
      <section className="bg-cream py-10 sm:py-14">
        <Container>
          <Suspense fallback={<CollectionResultsSkeleton />}>
            <CollectionResults handle={handle} searchParams={searchParams} />
          </Suspense>
        </Container>
      </section>
    </>
  );
}
