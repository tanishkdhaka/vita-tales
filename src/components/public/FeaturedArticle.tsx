import Image from 'next/image';
import Link from 'next/link';
import type { Article } from '@/types';
import { Sparkles, Clock, ArrowRight, BookOpen } from 'lucide-react';
import TiltCard from './TiltCard';
import { ARCHIVAL_BLUR_DATA_URL } from '@/lib/image-shimmer';

interface FeaturedArticleProps {
  article: Article;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export default function FeaturedArticle({ article }: FeaturedArticleProps) {
  const publishedDate = formatDate(article.publishedAt || article.createdAt);
  const readingTime = article.readingTime ? `${article.readingTime} min read` : '5 min read';

  return (
    <section aria-label="Cover Dossier" className="w-full">
      <TiltCard maxTilt={4} className="rounded-2xl sm:rounded-3xl">
        <Link
          href={`/${article.slug}`}
          className="group relative block w-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl border border-brass-500/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500 transition-all duration-300 hover:border-brass-400"
        >
          {/* Background Image Container with Mobile-Safe Height */}
          <div className="relative min-h-[420px] sm:min-h-[500px] lg:min-h-[580px] w-full bg-stone-950">
            {article.heroImage ? (
              <Image
                src={article.heroImage}
                alt={article.heroImageAlt || article.title}
                fill
                sizes="(max-width: 1280px) 100vw, 1240px"
                priority
                placeholder="blur"
                blurDataURL={ARCHIVAL_BLUR_DATA_URL}
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                style={{ objectPosition: article.imagePosition || 'center' }}
              />
            ) : (
              <div className="absolute inset-0 bg-[#0e1611]" />
            )}

            {/* Natural portrait display: clear upper image with bottom scrim for editorial typography */}
            <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-stone-950 via-stone-950/80 to-transparent pointer-events-none" />

            {/* Overlaid Cover Dossier Content */}
            <div className="relative z-10 flex min-h-[420px] sm:min-h-[500px] lg:min-h-[580px] flex-col justify-end p-5 sm:p-10 lg:p-14 text-white">
              <div className="max-w-3xl space-y-3.5 sm:space-y-4">
                {/* Cover Dossier Header Badges */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brass-500 px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-stone-950 shadow-md">
                    <Sparkles className="h-3 w-3 fill-current" />
                    Cover Dossier
                  </span>
                  {article.category && (
                    <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md border border-white/20">
                      {article.category}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-white/80 font-medium">
                    <Clock className="h-3 w-3 text-brass-300" />
                    {readingTime}
                  </span>
                </div>

                {/* Title */}
                <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight transition-colors group-hover:text-brass-300 drop-shadow-sm">
                  {article.title}
                </h2>

                {/* Subtitle / Excerpt */}
                <p className="line-clamp-2 sm:line-clamp-3 text-sm sm:text-base lg:text-lg text-white/90 leading-relaxed font-normal">
                  {article.heroSubtitle || article.excerpt}
                </p>

                {/* Meta info & CTA button */}
                <div className="pt-2 sm:pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 border-t border-white/20">
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm text-white/80">
                    <span className="font-semibold text-white">By {article.author || 'Vita Tales'}</span>
                    {publishedDate && (
                      <>
                        <span>•</span>
                        <time dateTime={article.publishedAt || article.createdAt}>
                          {publishedDate}
                        </time>
                      </>
                    )}
                  </div>

                  <span className="inline-flex items-center gap-2 rounded-full bg-brass-400 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-stone-950 transition-all duration-300 group-hover:bg-brass-300 group-hover:shadow-lg w-fit">
                    <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>Read Full Dossier</span>
                    <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </TiltCard>
    </section>
  );
}
