import type { MetadataRoute } from "next";
import { ROUTES, SITE_URL } from "@/constants";
import { getCollections } from "@/services";

/**
 * sitemap.xml (spec §6). Static editorial routes + every live collection.
 *
 * Product URLs are intentionally absent until /products/[handle] exists —
 * no placeholder links are ever published (spec §11).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const collections = await getCollections();
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified, changeFrequency: "weekly", priority: 1 },
    {
      url: `${SITE_URL}${ROUTES.COLLECTION_ALL}`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}${ROUTES.OUR_STORY}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}${ROUTES.GIFT_GUIDE}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}${ROUTES.LOOKBOOK}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    { url: `${SITE_URL}${ROUTES.FAQ}`, lastModified, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}${ROUTES.CONTACT}`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];

  const collectionEntries: MetadataRoute.Sitemap = collections.map((collection) => ({
    url: `${SITE_URL}${ROUTES.collection(collection.handle)}`,
    lastModified,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...collectionEntries];
}
