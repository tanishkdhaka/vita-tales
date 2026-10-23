'use client';

import { useState, useEffect } from 'react';
import { Feather, BookOpen, Compass, ArrowDown, Sparkles, CheckCircle2 } from 'lucide-react';

interface HomeHeroProps {
  categories?: string[];
  recentTitles?: string[]; // Backwards-compatible
}

const DEFAULT_CATEGORIES = [
  'Entrepreneurs and Innovators',
  'Scientist',
  'Authors and Literary Figures',
  'Actors',
  'Actresses',
  'Sports',
  'Politician',
  'Social Media Influencer',
];

export default function HomeHero({ categories, recentTitles }: HomeHeroProps) {
  const [today, setToday] = useState<string>('');

  useEffect(() => {
    try {
      setToday(
        new Intl.DateTimeFormat('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }).format(new Date())
      );
    } catch {
      // fallback
    }
  }, []);

  // Use curated database categories for the marquee ticker
  const rawCategories =
    categories && categories.length > 0
      ? categories
      : DEFAULT_CATEGORIES;

  // Duplicate items twice to ensure a continuous, seamless marquee loop across all screen sizes
  const tickerItems = [...rawCategories, ...rawCategories];

  return (
    <div className="relative overflow-hidden">
      {/* Soft warm ambient atmospheric glow */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[420px] w-[700px] rounded-full opacity-[0.06] dark:opacity-[0.12]"
        style={{ background: 'radial-gradient(ellipse at center, #c5a059 0%, transparent 70%)' }}
        aria-hidden
      />

      {/* Editorial Dateline Bar — SSR Visible */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-3.5 mb-8 sm:mb-10 text-xs font-sans gap-2 transition-opacity duration-300">
        <div className="flex items-center gap-2 font-semibold tracking-wider uppercase text-text-primary">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-brass-500/15 text-brass-700 dark:text-brass-300">
            <Feather className="h-3 w-3" />
          </span>
          <span className="font-bold tracking-widest text-[11px]">VITA TALES</span>
          <span className="text-text-muted font-normal">•</span>
          <span className="text-text-secondary font-medium tracking-normal capitalize">{today || 'Archival Edition'}</span>
        </div>

        <div className="flex items-center gap-3 text-text-muted text-[11px]">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            Independent &amp; Ad-Free
          </span>
          <span>•</span>
          <span>The Biographical Archive</span>
        </div>
      </div>

      {/* Main Hero Grid — SSR Visible (Never hidden before hydration) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-8 lg:gap-12 items-center">
        {/* Left Column: Headline, Narrative & Primary Actions */}
        <div className="space-y-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brass-500/10 border border-brass-500/25 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brass-700 dark:text-brass-300">
              <Sparkles className="h-3.5 w-3.5 text-brass-600 dark:text-brass-400" />
              Biographical Essays &amp; In-Depth Profiles
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-text-primary leading-[1.12]">
            Where Extraordinary Lives Become{' '}
            <span className="italic text-brass-700 dark:text-brass-300 font-serif">
              Timeless Stories.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-text-secondary leading-relaxed font-sans max-w-xl">
            Deeply researched, human-first biographical portraits dissecting the personal crucibles, quiet convictions, and breakthrough moments that shaped history’s most fascinating minds.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="#stories-archive"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-800 dark:bg-brass-400 px-5 py-3 text-sm font-semibold text-white dark:text-stone-950 shadow-md hover:bg-brand-900 dark:hover:bg-brass-300 border border-brass-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <BookOpen className="h-4 w-4 text-brass-300 dark:text-stone-950" />
              <span>Explore Stories</span>
              <ArrowDown className="h-3.5 w-3.5 text-brass-300 dark:text-stone-950" />
            </a>

            <a
              href="#domains"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-medium text-text-primary hover:bg-surface-alt transition-colors"
            >
              <Compass className="h-4 w-4 text-brass-600 dark:text-brass-400" />
              <span>Browse by Domain</span>
            </a>
          </div>

          {/* Core Editorial Pillars (Honest values, no fake counters) */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 border-t border-border/70 text-xs text-text-secondary">
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-brass-600 dark:text-brass-400" />
              <span>Primary-Source Grounded</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-brass-600 dark:text-brass-400" />
              <span>Psychological Depth</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-brass-600 dark:text-brass-400" />
              <span>Unhurried Prose</span>
            </div>
          </div>
        </div>

        {/* Right Column: Editorial Manifesto Card */}
        <div className="rounded-3xl border border-border bg-surface-alt/50 p-6 sm:p-8 space-y-4 shadow-sm relative overflow-hidden transition-all duration-300 hover:border-brass-500/40">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-800 dark:text-brass-400">
            <Feather className="h-4 w-4 text-brass-600 dark:text-brass-400" />
            <span>The Vita Tales Manifesto</span>
          </div>

          <h3 className="font-serif text-xl sm:text-2xl font-bold text-text-primary leading-snug">
            History is not made by monuments—it is forged in quiet crucibles.
          </h3>

          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-sans">
            We look past myth-making to uncover how real human beings endured failure, self-doubt, and isolation before finding the clarity that changed our world.
          </p>

          <div className="pt-2 flex items-center justify-between border-t border-border/70 text-[11px] text-text-muted">
            <span className="font-medium text-text-secondary">Human Conviction &amp; Narrative Rigor</span>
            <span className="font-semibold text-brass-700 dark:text-brass-400">Vita Tales Archive</span>
          </div>
        </div>
      </div>

      {/* Real Biographical Categories Marquee Ticker (Refined, Readable, Hover-Paused) */}
      <div className="mt-10 overflow-hidden border-y border-border/60 py-2.5 bg-surface-alt/30 marquee-container group">
        <div className="relative flex gap-0">
          {/* Main Track */}
          <div className="flex shrink-0 items-center gap-8 animate-marquee-slow whitespace-nowrap">
            {tickerItems.map((cat, i) => (
              <a
                key={`track1-${i}`}
                href="#domains"
                className="inline-flex items-center gap-2.5 text-xs font-sans font-medium text-text-muted hover:text-brass-700 dark:hover:text-brass-300 transition-colors py-1 group/item"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-brass-500/80 shrink-0 group-hover/item:scale-125 transition-transform" />
                <span className="tracking-wider uppercase text-[11px] font-semibold">{cat}</span>
              </a>
            ))}
          </div>

          {/* Continuous Loop Clone Track */}
          <div className="flex shrink-0 items-center gap-8 animate-marquee-slow whitespace-nowrap" aria-hidden="true">
            {tickerItems.map((cat, i) => (
              <a
                key={`track2-${i}`}
                href="#domains"
                tabIndex={-1}
                className="inline-flex items-center gap-2.5 text-xs font-sans font-medium text-text-muted hover:text-brass-700 dark:hover:text-brass-300 transition-colors py-1 group/item"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-brass-500/80 shrink-0 group-hover/item:scale-125 transition-transform" />
                <span className="tracking-wider uppercase text-[11px] font-semibold">{cat}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
