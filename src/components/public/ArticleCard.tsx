import Image from 'next/image';
import Link from 'next/link';
import type { Article } from '@/types';
import { Clock, ArrowRight } from 'lucide-react';
import TiltCard from './TiltCard';
import { ARCHIVAL_BLUR_DATA_URL } from '@/lib/image-shimmer';

interface ArticleCardProps {
  article: Article;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function getCategoryColor(category?: string | null): string {
  if (!category) {
    return 'bg-brand-100/80 text-brand-950 border-brand-300/80 dark:bg-brass-500/15 dark:text-brass-300 dark:border-brass-500/30';
  }
  const cat = category.toLowerCase();
  if (cat.includes('science') || cat.includes('physics')) {
    return 'bg-emerald-100/80 text-emerald-950 border-emerald-300/80 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700/50';
  }
  if (cat.includes('tech') || cat.includes('engineering')) {
    return 'bg-indigo-100/80 text-indigo-950 border-indigo-300/80 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-700/50';
  }
  if (cat.includes('literature') || cat.includes('art') || cat.includes('philosophy')) {
    return 'bg-amber-100/80 text-amber-950 border-amber-300/80 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-700/50';
  }
  return 'bg-brand-100/80 text-brand-950 border-brand-300/80 dark:bg-brass-500/15 dark:text-brass-300 dark:border-brass-500/30';
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const publishedDate = formatDate(article.publishedAt || article.createdAt);
  const readingTime = article.readingTime ? `${article.readingTime} min read` : '5 min read';
  const categoryBadgeStyle = getCategoryColor(article.category);

  return (
    <TiltCard className="h-full rounded-2xl" maxTilt={6}>
      <article className="group relative flex flex-col h-full overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-300 hover:shadow-2xl hover:border-brass-500/40">
        {/* Clickable link spanning card */}
        <Link
          href={`/${article.slug}`}
          className="flex flex-col h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-2xl"
          aria-label={`Read ${article.title}`}
        >
          {/* Hero image container */}
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-100/40">
            {article.heroImage ? (
              <Image
                src={article.heroImage}
                alt={article.heroImageAlt || article.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                placeholder="blur"
                blurDataURL={ARCHIVAL_BLUR_DATA_URL}
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                style={{ objectPosition: article.imagePosition || 'center' }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-surface-alt text-text-muted font-serif italic text-sm">
                Vita Tales Archive
              </div>
            )}
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Glowing corner accent */}
            <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-brass-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_8px_#c5a059]" />
          </div>

          {/* Content body */}
          <div className="flex flex-1 flex-col justify-between p-6">
            <div>
              {/* Category badge & Reading time */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider border ${categoryBadgeStyle}`}>
                  {article.category || 'Biography'}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-text-muted font-medium">
                  <Clock className="h-3 w-3 text-brass-600" />
                  {readingTime}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-serif text-xl font-bold tracking-tight text-text-primary transition-colors duration-200 group-hover:text-brass-600 dark:group-hover:text-brass-400 line-clamp-2">
                {article.title}
              </h3>

              {/* Excerpt */}
              <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-text-secondary font-sans">
                {article.excerpt}
              </p>
            </div>

            {/* Footer: Author & Read CTA */}
            <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-4 text-xs text-text-muted">
              <span className="font-medium text-text-secondary truncate max-w-[60%]">
                By {article.author || 'Vita Tales'}
              </span>
              <div className="inline-flex items-center gap-1 font-semibold text-brand-800 dark:text-brass-400 group-hover:text-brand-950 dark:group-hover:text-brass-300 transition-colors">
                <span>Read Story</span>
                <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1.5 transition-transform text-brass-600 dark:text-brass-400" />
              </div>
            </div>
          </div>
        </Link>
      </article>
    </TiltCard>
  );
}
