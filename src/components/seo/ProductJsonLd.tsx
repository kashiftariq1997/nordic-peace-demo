import { ROUTES, SITE_URL } from "@/constants";
import type { Product } from "@/types";
import { JsonLd } from "./JsonLd";

function absoluteImageUrl(url: string): string {
  return url.startsWith("/") ? `${SITE_URL}${url}` : url;
}

/** Product structured data (spec Step A) — emitted on /products/[handle]. */
export function ProductJsonLd({ product }: { product: Product }) {
  const images = product.images.length
    ? product.images
    : product.featuredImage
      ? [product.featuredImage]
      : [];

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.title,
        description: product.description,
        ...(images.length > 0 ? { image: images.map((image) => absoluteImageUrl(image.url)) } : {}),
        sku: product.handle,
        brand: { "@type": "Brand", name: product.vendor },
        offers: {
          "@type": "Offer",
          url: `${SITE_URL}${ROUTES.product(product.handle)}`,
          priceCurrency: product.priceRange.min.currencyCode,
          price: product.priceRange.min.amount,
          availability: product.availableForSale
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
        },
      }}
    />
  );
}
