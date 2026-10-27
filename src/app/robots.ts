import type { MetadataRoute } from "next";
import { SITE_URL } from "@/constants";

/** robots.txt (spec §6) — everything crawlable except the API surface. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
