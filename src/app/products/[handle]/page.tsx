import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { ProductGrid, SectionHeader } from "@/components/common";
import { Container } from "@/components/layout";
import {
  ProductAccordion,
  type AccordionItem,
  ProductDetailSkeleton,
  ProductForm,
  ProductGallery,
  ProductTracker,
  RecentlyViewed,
} from "@/components/product";
import { BreadcrumbJsonLd, ProductJsonLd } from "@/components/seo";
import { ROUTES } from "@/constants";
import { getCollection, getProduct, getProducts, getProductsByHandles } from "@/services";
import type { Product } from "@/types";

type Props = PageProps<"/products/[handle]">;

const MAX_STATIC_PRODUCTS = 250;
const MAX_CROSS_SELL = 4;

/** Prerender every catalog product as a static page. */
export async function generateStaticParams() {
  const { items } = await getProducts({ first: MAX_STATIC_PRODUCTS });
  return items.map((product) => ({ handle: product.handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) {
    return { title: "Product not found" };
  }
  return {
    title: product.title,
    description: product.description,
    alternates: { canonical: ROUTES.product(handle) },
    openGraph: {
      type: "website",
      images: product.images.slice(0, 3).map((image) => ({ url: image.url, alt: image.altText })),
    },
  };
}

export default function ProductPage({ params }: Props) {
  // params are runtime data: awaited inside Suspense per the Next.js dynamic
  // route docs, with a layout-matched skeleton as the streaming fallback.
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

async function ProductContent({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) {
    notFound();
  }

  const collectionHandle = product.collections[0];
  const [crossSell, collection] = await Promise.all([
    product.metafields.pairsWith && product.metafields.pairsWith.length > 0
      ? getProductsByHandles(product.metafields.pairsWith).then((items) =>
          items.filter((item) => item.handle !== product.handle).slice(0, MAX_CROSS_SELL),
        )
      : Promise.resolve([]),
    collectionHandle ? getCollection(collectionHandle) : Promise.resolve(null),
  ]);

  const breadcrumbItems = [
    { name: "Home", path: ROUTES.HOME },
    collection
      ? { name: collection.title, path: ROUTES.collection(collection.handle) }
      : { name: "Shop All", path: ROUTES.COLLECTION_ALL },
    { name: product.title, path: ROUTES.product(handle) },
  ];

  const accordionItems = buildAccordionItems(product);

  return (
    <>
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <ProductTracker
        id={product.id}
        name={product.title}
        handle={product.handle}
        price={product.priceRange.min}
        imageUrl={product.featuredImage?.url ?? null}
        imageAlt={product.featuredImage?.altText ?? product.title}
      />

      <section className="bg-cream pt-8 pb-32 sm:pt-12 sm:pb-16">
        <Container>
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
            <ProductGallery images={product.images} title={product.title} />
            <ProductForm product={product} />
          </div>

          {accordionItems.length > 0 ? (
            <div className="mx-auto mt-14 max-w-3xl">
              <h2 className="font-heading text-plum mb-6 text-2xl">The details</h2>
              <ProductAccordion items={accordionItems} />
            </div>
          ) : null}
        </Container>
      </section>

      {crossSell.length > 0 ? (
        <section className="bg-blush py-16 sm:py-20">
          <Container className="flex flex-col gap-10">
            <SectionHeader
              eyebrow="Pairs with"
              title="Complete the cozy look"
              link={{ label: "Shop all", href: ROUTES.COLLECTION_ALL }}
            />
            <ProductGrid products={crossSell} />
          </Container>
        </section>
      ) : null}

      <RecentlyViewed currentHandle={handle} />
    </>
  );
}

/** Details / Fabric & Care / Shipping & Returns / Size Guide — empty ones omitted. */
function buildAccordionItems(product: Product): AccordionItem[] {
  const items: AccordionItem[] = [
    {
      title: "Details",
      content: (
        <div>
          <p>{product.description}</p>
          {product.metafields.highlights && product.metafields.highlights.length > 0 ? (
            <ul className="mt-2 flex list-disc flex-col gap-1 pl-5">
              {product.metafields.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ),
    },
  ];

  if (product.metafields.fabric || product.metafields.care) {
    items.push({
      title: "Fabric & Care",
      content: (
        <div>
          {product.metafields.fabric ? <p>{product.metafields.fabric}</p> : null}
          {product.metafields.care ? <p>{product.metafields.care}</p> : null}
        </div>
      ),
    });
  }

  items.push({
    title: "Shipping & Returns",
    content: (
      <div>
        <p>
          {product.metafields.deliveryNote ??
            "Packed with care — please allow 2–4 business days for dispatch."}
        </p>
        <p>
          Changed your mind? See our <Link href={ROUTES.policy("shipping")}>shipping policy</Link>{" "}
          and <Link href={ROUTES.policy("returns")}>returns &amp; exchanges</Link> for the full
          details.
        </p>
      </div>
    ),
  });

  if (product.metafields.sizeChart) {
    items.push({
      title: "Size Guide",
      content: <div dangerouslySetInnerHTML={{ __html: product.metafields.sizeChart }} />,
    });
  }

  return items;
}
