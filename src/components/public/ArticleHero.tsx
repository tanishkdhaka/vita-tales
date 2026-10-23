import Image from 'next/image';
import Link from 'next/link';
import type { Article } from '@/types';
import { Clock, Calendar, User, ChevronDown } from 'lucide-react';
import ParallaxWrapper from './ParallaxWrapper';
import Breadcrumbs from './Breadcrumbs';
import { ARCHIVAL_BLUR_DATA_URL } from '@/lib/image-shimmer';

interface ArticleHeroProps {
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

export default function ArticleHero({ article }: ArticleHeroProps) {
  const publishedDate = formatDate(article.publishedAt || article.createdAt);
  const readingTime = article.readingTime ? `${article.readingTime} min read` : '5 min read';

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    ...(article.category
      ? [
          {
            label: article.category,
            href: `/category/${encodeURIComponent(article.category.toLowerCase())}`,
          },
        ]
      : []),
    { label: article.title },
  ];

  return (
    <section
      aria-label="Article Hero"
      className="relative min-h-[60vh] sm:min-h-[75vh] md:min-h-[85vh] w-full flex flex-col justify-between overflow-hidden bg-stone-950 text-white"
    >
      {/* Background Image with Parallax */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <ParallaxWrapper className="h-full w-full">
          {article.heroImage ? (
            <Image
              src={article.heroImage}
              alt={article.heroImageAlt || article.title}
              fill
              sizes="100vw"
              priority
              placeholder="blur"
              blurDataURL={ARCHIVAL_BLUR_DATA_URL}
              className="object-cover scale-105"
              style={{ objectPosition: article.imagePosition || 'center' }}
            />
          ) : (
            <div className="h-full w-full bg-stone-900" />
          )}
        </ParallaxWrapper>

        {/* Natural, clear presentation of the subject portrait without dark tint over the face */}
        <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-stone-950 via-stone-950/80 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-stone-950/45 to-transparent pointer-events-none" />
      </div>

      {/* Top Bar: Breadcrumb Navigation */}
      <div className="relative z-20 mx-auto w-full max-w-wide px-4 pt-5 sm:pt-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbItems} variant="dark" />
      </div>

      {/* Bottom Hero Content */}
      <div className="relative z-20 mx-auto w-full max-w-wide px-4 pb-8 pt-12 sm:pb-16 sm:pt-20 sm:px-6 lg:px-8">
        <div className="max-w-4xl space-y-3.5 sm:space-y-5">
          {/* Category & Reading Time Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {article.category && (
              <Link
                href={`/category/${encodeURIComponent(article.category.toLowerCase())}`}
                className="inline-flex items-center rounded-full bg-white/15 px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md border border-white/20 transition-colors hover:bg-white/25"
              >
                {article.category}
              </Link>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs text-white/80 border border-white/10 backdrop-blur-md">
              <Clock className="h-3 w-3 text-brand-300" />
              <span>{readingTime}</span>
            </span>
          </div>

          {/* Article Title - responsive typography with high-contrast text shadow */}
          <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.18] sm:leading-[1.12] drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)]">
            {article.title}
          </h1>

          {/* Subtitle */}
          {article.heroSubtitle && (
            <p className="font-sans text-sm sm:text-lg md:text-xl text-white/95 leading-relaxed font-normal max-w-3xl line-clamp-3 sm:line-clamp-none drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
              {article.heroSubtitle}
            </p>
          )}

          {/* Metadata Byline Card */}
          <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-y-1.5 gap-x-4 sm:gap-x-5 text-xs text-white/80">
            {article.author && (
              <div className="flex items-center gap-1.5 font-medium">
                <User className="h-3.5 w-3.5 text-brand-300" />
                <span>{article.author}</span>
              </div>
            )}
            {publishedDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-brand-300" />
                <time dateTime={article.publishedAt || article.createdAt}>
                  {publishedDate}
                </time>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subtle Scroll Hint */}
      <div className="relative z-20 pb-3 text-center hidden md:flex justify-center items-center gap-1 text-[11px] uppercase tracking-widest text-white/50">
        <span>Scroll to read story</span>
        <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
      </div>
    </section>
  );
}
