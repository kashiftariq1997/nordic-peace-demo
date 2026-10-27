import { SITE_URL } from "@/constants";
import { JsonLd } from "./JsonLd";

type Crumb = {
  readonly name: string;
  /** App-relative path, e.g. "/collections/pajama-sets". */
  readonly path: string;
};

type BreadcrumbJsonLdProps = {
  items: readonly Crumb[];
};

/**
 * BreadcrumbList structured data (spec §6) — Home first, current page last.
 * Items are emitted as absolute URLs resolved against SITE_URL.
 */
export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: crumb.name,
          item: `${SITE_URL}${crumb.path}`,
        })),
      }}
    />
  );
}
