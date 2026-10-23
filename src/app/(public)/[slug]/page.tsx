import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cacheLife, cacheTag } from 'next/cache';
import {
  getPublishedArticleBySlug,
  getPublishedArticleSlugs,
  getRelatedArticles,
} from '@/lib/db/queries';
import type { TOCItem } from '@/types';
import ArticleHero from '@/components/public/ArticleHero';
import ArticleBody from '@/components/public/ArticleBody';
import TableOfContents from '@/components/public/TableOfContents';
import ReadingProgress from '@/components/public/ReadingProgress';
import RelatedArticles from '@/components/public/RelatedArticles';
import ReaderControls from '@/components/public/ReaderControls';
import QuoteClipper from '@/components/public/QuoteClipper';
import ImpactMatrix from '@/components/public/ImpactMatrix';
import LifelineTimeline from '@/components/public/LifelineTimeline';
import NextArticlePrompt from '@/components/public/NextArticlePrompt';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const instant = false;

export async function generateStaticParams() {
  const items = await getPublishedArticleSlugs();
  if (items.length === 0) {
    return [{ slug: '__init__' }];
  }
  return items.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Article Not Found | Vita Tales',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const siteName = process.env.SITE_NAME || 'Vita Tales';
  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.excerpt;
  const canonicalUrl = article.canonicalUrl || `${siteUrl}/${article.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
      siteName,
      title,
      description,
      url: `${siteUrl}/${article.slug}`,
      publishedTime: article.publishedAt || article.createdAt,
      modifiedTime: article.updatedAt || undefined,
      authors: [article.author || 'Vita Tales'],
      images: article.heroImage
        ? [
            {
              url: article.heroImage,
              alt: article.heroImageAlt || title,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: article.heroImage ? [article.heroImage] : [],
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  'use cache';
  cacheTag('articles');
  cacheLife('hours');

  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article || article.status !== 'published') {
    notFound();
  }

  // Parse Table of Contents safely
  let toc: TOCItem[] = [];
  if (article.tocJson) {
    try {
      const parsed = JSON.parse(article.tocJson);
      if (Array.isArray(parsed)) {
        toc = parsed;
      }
    } catch {
      toc = [];
    }
  }

  // Parse Tags safely
  let parsedTags: string[] = [];
  if (article.tags) {
    try {
      const parsed = JSON.parse(article.tags);
      if (Array.isArray(parsed)) {
        parsedTags = parsed;
      } else if (typeof parsed === 'string') {
        parsedTags = parsed.split(',').map((t) => t.trim()).filter(Boolean);
      }
    } catch {
      parsedTags = article.tags.split(',').map((t) => t.trim()).filter(Boolean);
    }
  }

  // Fetch related stories in the same category (or fallback to latest published)
  let relatedArticles = await getRelatedArticles(
    article.id,
    article.category,
    4
  );
  if (relatedArticles.length === 0) {
    relatedArticles = await getRelatedArticles(article.id, undefined, 4);
  }
  const nextArticle = relatedArticles.length > 0 ? relatedArticles[0] : null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const siteName = process.env.SITE_NAME || 'Vita Tales';

  // Article / BlogPosting Schema JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/${article.slug}`,
    },
    headline: article.title,
    description: article.excerpt,
    image: article.heroImage ? [article.heroImage] : undefined,
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt || article.createdAt,
    author: {
      '@type': 'Person',
      name: article.author || 'Vita Tales',
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
    },
    ...(article.category ? { articleSection: article.category } : {}),
    ...(article.readingTime ? { timeRequired: `PT${article.readingTime}M` } : {}),
  };

  return (
    <>
      {/* Schema.org Article JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Decorative reading progress bar at top of window */}
      <ReadingProgress targetId="article-body-wrapper" />

      {/* Floating Interactive Quote Clipper */}
      <QuoteClipper title={article.title} author={article.author} />

      {/* Hero with Parallax */}
      <ArticleHero article={article} />

      {/* Article Content Area */}
      <div
        id="article-body-wrapper"
        className="mx-auto max-w-wide px-4 sm:px-6 lg:px-8 py-10 lg:py-16"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-12 xl:gap-16">
          {/* Main Reading Column */}
          <div className="lg:col-span-8 lg:max-w-reading">
            {/* Interactive Reader Controls Toolbar */}
            <div className="mb-8">
              <ReaderControls
                title={article.title}
                slug={article.slug}
                readingTime={article.readingTime}
                category={article.category}
                heroImage={article.heroImage}
                targetId="article-content-body"
              />
            </div>

            {/* Mobile Table of Contents */}
            {toc.length > 0 && (
              <div className="lg:hidden">
                <TableOfContents toc={toc} mode="mobile" />
              </div>
            )}

            {/* Character & Impact Assessment Matrix */}
            <ImpactMatrix
              title={article.title}
              category={article.category}
              author={article.author}
            />

            {/* Rendered sanitized HTML body */}
            <div id="article-content-body">
              <ArticleBody
                content={article.sanitizedContent || article.htmlContent}
              />
            </div>

            {/* Interactive Lifeline Chronology */}
            <LifelineTimeline title={article.title} slug={article.slug} />

            {/* Tags section */}
            {parsedTags.length > 0 && (
              <div className="mt-12 pt-6 border-t border-border flex flex-wrap items-center gap-2">
                <span className="text-xs font-sans font-bold uppercase tracking-wider text-text-muted mr-1">
                  Topics:
                </span>
                {parsedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-lg bg-surface-alt px-3 py-1 text-xs font-medium text-text-secondary border border-border"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Author Byline / End Box with Dark Academia Wax Accent */}
            <div className="mt-14 rounded-2xl border border-border bg-surface-alt/40 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl wax-seal text-brass-300 font-serif font-black text-2xl shadow-md border border-brass-400/40">
                {(article.author || 'V').charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase font-sans font-bold tracking-wider text-text-muted">
                  From the Editorial Board
                </span>
                <h4 className="font-serif text-lg font-bold text-text-primary">
                  {article.author || 'Vita Tales Editorial Desk'}
                </h4>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-sans">
                  Dedicated to preserving authentic biographical accounts through archival
                  rigor, primary-source investigation, and narrative depth.
                </p>
              </div>
            </div>

            {/* Up Next in this Folio — Continuous Reading Journey */}
            {nextArticle && (
              <NextArticlePrompt
                currentCategory={article.category}
                nextArticle={nextArticle}
              />
            )}
          </div>

          {/* Desktop Table of Contents Sidebar */}
          {toc.length > 0 && (
            <aside className="article-sidebar hidden lg:block lg:col-span-4">
              <div className="article-sidebar-sticky">
                <TableOfContents toc={toc} mode="desktop" article={article} />
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Related Biographies */}
      <RelatedArticles articles={relatedArticles} />
    </>
  );
}
