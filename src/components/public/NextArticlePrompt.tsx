import Link from 'next/link';
import Image from 'next/image';
import type { Article } from '@/types';
import { ArrowRight, BookOpen, Clock, Sparkles } from 'lucide-react';
import { ARCHIVAL_BLUR_DATA_URL } from '@/lib/image-shimmer';

interface NextArticlePromptProps {
  currentCategory?: string | null;
  nextArticle: Article;
}

export default function NextArticlePrompt({
  currentCategory,
  nextArticle,
}: NextArticlePromptProps) {
  const readingTime = nextArticle.readingTime
    ? `${nextArticle.readingTime} min read`
    : '5 min read';

  const categoryLabel = nextArticle.category || currentCategory || 'Vita Tales Archive';

  return (
    <div className="my-14 sm:my-16 rounded-2xl sm:rounded-3xl border border-border bg-surface-alt/50 p-6 sm:p-8 lg:p-10 shadow-sm relative overflow-hidden transition-all duration-300 hover:border-brass-500/50 group">
      {/* Soft warm background glow */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full opacity-[0.06] dark:opacity-[0.10]"
        style={{ background: 'radial-gradient(circle, #c5a059 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
        {/* Next article thumbnail */}
        {nextArticle.heroImage && (
          <div className="relative aspect-[4/3] w-full md:w-56 shrink-0 overflow-hidden rounded-xl sm:rounded-2xl border border-border shadow-md">
            <Image
              src={nextArticle.heroImage}
              alt={nextArticle.heroImageAlt || nextArticle.title}
              fill
              sizes="(max-width: 768px) 100vw, 240px"
              placeholder="blur"
              blurDataURL={ARCHIVAL_BLUR_DATA_URL}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              style={{ objectPosition: nextArticle.imagePosition || 'center' }}
            />
          </div>
        )}

        {/* Next article narrative & CTA */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brass-500/15 border border-brass-500/25 px-2.5 py-0.5 font-bold uppercase tracking-wider text-brass-700 dark:text-brass-300 text-[10px]">
              <Sparkles className="h-3 w-3" />
              Up Next in {categoryLabel}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-text-muted">
              <Clock className="h-3 w-3" />
              {readingTime}
            </span>
          </div>

          <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-black text-text-primary group-hover:text-brass-700 dark:group-hover:text-brass-300 transition-colors leading-snug">
            <Link href={`/${nextArticle.slug}`} className="focus:outline-none">
              {nextArticle.title}
            </Link>
          </h3>

          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed line-clamp-2 font-sans">
            {nextArticle.heroSubtitle || nextArticle.excerpt}
          </p>

          <div className="pt-2">
            <Link
              href={`/${nextArticle.slug}`}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-800 dark:bg-brass-400 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white dark:text-stone-950 shadow-sm hover:bg-brand-900 dark:hover:bg-brass-300 transition-all group-hover:gap-3"
            >
              <span>Continue to Next Biography</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
