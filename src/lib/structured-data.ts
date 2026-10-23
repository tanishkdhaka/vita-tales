import type { Article } from "@/types";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const siteName = process.env.SITE_NAME || "Vita Tales";

/**
 * Generates JSON-LD structured data for an article page.
 * Uses Article schema (BlogPosting subtype) with proper metadata.
 */
export function generateArticleJsonLd(article: Article): object {
  const articleUrl = article.canonicalUrl || `${siteUrl}/${article.slug}`;
  const heroImageUrl = article.heroImage.startsWith("http")
    ? article.heroImage
    : `${siteUrl}${article.heroImage}`;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt,
    image: {
      "@type": "ImageObject",
      url: heroImageUrl,
    },
    author: {
      "@type": "Person",
      name: article.author || "Vita Tales Editorial Board",
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/favicon.ico`,
      },
    },
    url: articleUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt || article.publishedAt || article.createdAt,
    ...(article.category && {
      articleSection: article.category,
    }),
    ...(article.tags && {
      keywords: safeParseJsonArray(article.tags).join(", "),
    }),
    wordCount: estimateWordCount(article.sanitizedContent || article.htmlContent),
    inLanguage: "en-US",
  };
}

/**
 * Generates JSON-LD BreadcrumbList for article pages.
 */
export function generateBreadcrumbJsonLd(article: Article): object {
  const items = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: siteUrl,
    },
  ];

  if (article.category) {
    items.push({
      "@type": "ListItem",
      position: 2,
      name: article.category,
      item: `${siteUrl}/category/${encodeURIComponent(article.category.toLowerCase())}`,
    });
    items.push({
      "@type": "ListItem",
      position: 3,
      name: article.title,
      item: `${siteUrl}/${article.slug}`,
    });
  } else {
    items.push({
      "@type": "ListItem",
      position: 2,
      name: article.title,
      item: `${siteUrl}/${article.slug}`,
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

/**
 * Generates JSON-LD for the website (homepage) with SearchAction for Google Sitelinks Search Box.
 */
export function generateWebsiteJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    description:
      "Discover the extraordinary journeys of entrepreneurs, scientists, leaders, artists, and visionaries who shaped our world.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/api/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

function safeParseJsonArray(json: string | null): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function estimateWordCount(html: string): number {
  if (!html) return 0;
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.split(" ").filter(Boolean).length;
}
