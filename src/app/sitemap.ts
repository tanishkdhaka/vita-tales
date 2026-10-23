import type { MetadataRoute } from "next";
import { getPublishedArticleSlugs, getAllCategories } from "@/lib/db/queries";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = getPublishedArticleSlugs();
  const categories = getAllCategories();

  const articleEntries: MetadataRoute.Sitemap = slugs.map((item) => ({
    url: `${siteUrl}/${item.slug}`,
    lastModified: item.updatedAt || item.publishedAt || item.createdAt,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${siteUrl}/category/${encodeURIComponent(cat)}`,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/about`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...articleEntries,
    ...categoryEntries,
  ];
}
