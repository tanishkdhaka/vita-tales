import type { Metadata } from 'next';
import Link from 'next/link';
import { cacheLife, cacheTag } from 'next/cache';
import { getArticlesByCategory, getAllCategories } from '@/lib/db/queries';
import ArticleCard from '@/components/public/ArticleCard';
import Breadcrumbs from '@/components/public/Breadcrumbs';

type PageProps = {
  params: Promise<{ category: string }>;
};

export const instant = false;

export async function generateStaticParams() {
  const categories = await getAllCategories();
  if (categories.length === 0) {
    return [{ category: '__init__' }];
  }
  return categories.map((cat) => ({
    category: encodeURIComponent(cat.toLowerCase()),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: rawCategory } = await params;
  const decoded = decodeURIComponent(rawCategory);
  const allCategories = await getAllCategories();
  const matched =
    allCategories.find((c) => c.toLowerCase() === decoded.toLowerCase()) || decoded;
  const formattedName = matched.charAt(0).toUpperCase() + matched.slice(1);

  return {
    title: `${formattedName} Biographies`,
    description: `Explore long-form biographies, historical memoirs, and insightful stories in ${formattedName}.`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  'use cache';
  cacheTag('articles');
  cacheLife('hours');

  const { category: rawCategory } = await params;
  const decoded = decodeURIComponent(rawCategory);

  const allCategories = await getAllCategories();
  const matchedCategory =
    allCategories.find((c) => c.toLowerCase() === decoded.toLowerCase()) || decoded;

  const articles = await getArticlesByCategory(matchedCategory);

  const formattedName =
    matchedCategory.charAt(0).toUpperCase() + matchedCategory.slice(1);

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Categories' },
    { label: formattedName },
  ];

  return (
    <div className="py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-wide px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={breadcrumbs} variant="light" />

        {/* Category Header */}
        <header className="border-b border-border pb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-brand-700 dark:text-brass-400 font-sans font-bold">
              Category Archive
            </span>
            <h1 className="mt-1 font-serif text-3xl sm:text-5xl font-black tracking-tight text-text-primary">
              {formattedName}
            </h1>
          </div>
          <p className="text-sm text-text-secondary sm:text-right">
            {articles.length} {articles.length === 1 ? 'biography' : 'biographies'} cataloged
          </p>
        </header>

        {/* Articles Grid or Empty State */}
        {articles.length > 0 ? (
          <section aria-label={`${formattedName} Articles`}>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-12 sm:p-20 text-center bg-surface-alt/40">
            <h2 className="font-serif text-2xl font-bold text-text-primary">
              No Biographies Found in “{formattedName}”
            </h2>
            <p className="mt-3 max-w-md mx-auto text-sm text-text-secondary leading-relaxed">
              Stories in this field are currently in development. You can explore other categories or return to the main archive.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-brand-800"
              >
                Back to All Biographies
              </Link>
            </div>
          </div>
        )}

        {/* Back navigation footer */}
        <div className="border-t border-border pt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-800 dark:text-brass-400 hover:text-brand-950 dark:hover:text-brass-300 transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
