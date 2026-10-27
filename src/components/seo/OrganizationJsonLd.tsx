import { SITE_DESCRIPTION, SITE_EMAIL, SITE_NAME, SITE_URL, SOCIAL_LINKS } from "@/constants";
import { JsonLd } from "./JsonLd";

/** Organization structured data (spec §6) — emitted once in the root layout. */
export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/favicon.ico`,
        description: SITE_DESCRIPTION,
        email: SITE_EMAIL,
        sameAs: SOCIAL_LINKS.map((link) => link.href),
      }}
    />
  );
}
