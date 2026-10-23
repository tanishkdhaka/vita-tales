import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { connection } from 'next/server';
import { getArticleById } from '@/lib/db/queries';
import ArticleHero from '@/components/public/ArticleHero';
import ArticleBody from '@/components/public/ArticleBody';
import TableOfContents from '@/components/public/TableOfContents';

interface PreviewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: 'Preview Article | Admin Dashboard',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminArticlePreviewPage({
  params,
}: PreviewPageProps) {
  await connection();
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) {
    notFound();
  }

  // Parse TOC JSON
  let toc = [];
  try {
    toc = article.tocJson ? JSON.parse(article.tocJson) : [];
  } catch {
    toc = [];
  }

  // Parse tags if present
  let tagsList: string[] = [];
  if (article.tags) {
    try {
      const parsed = JSON.parse(article.tags);
      if (Array.isArray(parsed)) {
        tagsList = parsed;
      }
    } catch {
      tagsList = article.tags.split(',').map((t) => t.trim()).filter(Boolean);
    }
  }

  const isDraft = article.status === 'draft';

  return (
    <div className="-mx-4 -my-8 sm:-mx-6 lg:-mx-8 min-h-screen bg-surface">
      {/* Sticky Preview Mode Banner */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-amber-300 bg-amber-500/95 px-4 py-3 text-stone-950 shadow-md backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <span className="flex h-2.5 w-2.5 rounded-full bg-stone-950 animate-pulse" />
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-xs uppercase tracking-wider">
              Preview Mode
            </span>
            <span className="hidden sm:inline text-xs text-stone-800">|</span>
            <span className="text-xs font-medium">
              Status:{' '}
              <span className="font-bold uppercase underline">
                {article.status}
              </span>
            </span>
            {isDraft && (
              <span className="rounded-md bg-stone-900 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
                Draft (Not Live)
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/admin/articles/${article.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-stone-800 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            <span>Back to Editor</span>
          </Link>
        </div>
      </div>

      {/* Render Article Hero */}
      <ArticleHero article={article} />

      {/* Article Content Layout */}
      <div className="mx-auto max-w-wide px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Main Reading Column */}
          <div className="lg:col-span-8 xl:col-span-8">
            {/* Mobile TOC */}
            {toc.length > 0 && (
              <TableOfContents toc={toc} mode="mobile" />
            )}

            {/* Article Body */}
            <ArticleBody content={article.sanitizedContent || article.htmlContent} />

            {/* Tags Footer */}
            {tagsList.length > 0 && (
              <div className="max-w-reading mx-auto mt-12 pt-8 border-t border-border">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted mr-1">
                    Tagged:
                  </span>
                  {tagsList.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block rounded-full bg-surface-alt px-3 py-1 text-xs font-medium text-text-secondary border border-border"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Sidebar TOC */}
          {toc.length > 0 && (
            <div className="hidden lg:block lg:col-span-4 xl:col-span-4">
              <TableOfContents toc={toc} mode="desktop" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
