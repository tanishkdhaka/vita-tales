import type { Metadata } from 'next';
import { cacheLife, cacheTag } from 'next/cache';
import {
  getPublishedArticles,
  getFeaturedArticles,
  getAllCategories,
} from '@/lib/db/queries';
import { generateWebsiteJsonLd } from '@/lib/structured-data';
import FeaturedArticle from '@/components/public/FeaturedArticle';
import NewsletterForm from '@/components/public/NewsletterForm';
import HomeHero from '@/components/public/HomeHero';
import CategoryFilter from '@/components/public/CategoryFilter';
import DomainExplorer from '@/components/public/DomainExplorer';
import SectionDivider from '@/components/public/SectionDivider';
import QuoteEpigraph from '@/components/public/QuoteEpigraph';
import {
  Sparkles,
  Compass,
  Mail,
  Feather,
  BookOpen,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Vita Tales — Stories of Lives That Shaped Our World',
  description:
    'Deeply researched, human-first biographical narratives tracing the crucibles, personal convictions, and breakthrough moments of history\'s greatest minds.',
};

export default async function HomePage() {
  'use cache';
  cacheTag('articles');
  cacheLife('hours');

  const [featuredArticles, allPublished, categories] = await Promise.all([
    getFeaturedArticles(1),
    getPublishedArticles(100),
    getAllCategories(),
  ]);

  const featured = featuredArticles[0] || (allPublished.length > 0 ? allPublished[0] : null);

  const websiteJsonLd = generateWebsiteJsonLd();

  return (
    <>
      {/* Schema.org WebSite JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      <div className="py-6 sm:py-10 lg:py-14">
        <div className="mx-auto max-w-wide px-3.5 sm:px-6 lg:px-8 space-y-14 sm:space-y-20">

          {/* ─── SECTION 1: Masthead & Archival Hero ─── */}
          <section aria-label="Vita Tales Masthead" className="border-y border-border/80 py-8 sm:py-12">
            <HomeHero categories={categories} />
          </section>

          {/* ─── SECTION 2: Lead Cover Feature (The Anchor Dossier) ─── */}
          {featured && (
            <section aria-label="Cover Dossier">
              <SectionDivider
                label="Lead Editorial Investigation"
                sublabel="The Cover Dossier"
                icon={<Sparkles className="h-4 w-4 text-brass-500" />}
                accent="brass"
              />
              <div className="mt-6">
                <FeaturedArticle article={featured} />
              </div>
            </section>
          )}

          {/* ─── SECTION 3: Dynamic Domain Folios ─── */}
          {categories.length > 0 && (
            <section id="domains" aria-label="Fields of Human Endeavor">
              <SectionDivider
                label="Disciplines & Folios"
                sublabel="Explore by Domain"
                icon={<Compass className="h-4 w-4" />}
                accent="forest"
              />
              <div className="mt-6">
                <DomainExplorer categories={categories} articles={allPublished} />
              </div>
            </section>
          )}

          {/* ─── SECTION 4: The Biographical Epigraph ─── */}
          <QuoteEpigraph />

          {/* ─── SECTION 5: The Stories Archive with Category Filter ─── */}
          <section id="stories-archive" aria-label="Biographical Stories">
            <SectionDivider
              label="The Complete Library"
              sublabel="Biographical Portraits & Essays"
              icon={<BookOpen className="h-4 w-4" />}
              accent="forest"
            />
            <div className="mt-6">
              {allPublished.length > 0 ? (
                <CategoryFilter
                  articles={allPublished}
                  categories={categories}
                />
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-8 sm:p-14 text-center bg-surface-alt/40">
                  <BookOpen className="mx-auto h-8 w-8 text-brass-600 dark:text-brass-400 mb-2" />
                  <h3 className="font-serif text-xl font-bold text-text-primary">
                    Biographies Being Curated
                  </h3>
                  <p className="mt-2 text-sm text-text-secondary max-w-sm mx-auto">
                    New life portraits are currently being researched and prepared for publication.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ─── SECTION 6: The Reading Circle Dispatch (Authentic, respectful) ─── */}
          <section
            className="relative rounded-2xl sm:rounded-3xl border border-border overflow-hidden shadow-sm"
            aria-label="Reading Circle Newsletter"
          >
            {/* Full-bleed forest green background */}
            <div className="absolute inset-0 bg-brand-800" />

            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none select-none overflow-hidden" aria-hidden>
              <Feather className="absolute -right-8 -bottom-8 h-80 w-80 text-brass-300" />
              <Feather className="absolute -left-16 -top-16 h-64 w-64 text-brass-300 rotate-180" />
            </div>

            {/* Subtle brass top border accent */}
            <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: 'linear-gradient(to right, transparent, #c5a059, transparent)' }} />

            <div className="relative z-10 p-8 sm:p-14 lg:p-16">
              <div className="max-w-2xl space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-brass-500/40 bg-brass-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brass-300">
                  <Mail className="h-3.5 w-3.5" />
                  The Reading Circle
                </div>
                <h3 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Slow, thoughtful life stories delivered to your inbox.
                </h3>
                <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                  Join our quiet reading circle to receive newly published biographical portraits and archival essays as they are released. Zero promotional clutter, zero spam—just enduring stories of human conviction.
                </p>
                <div className="pt-2">
                  <NewsletterForm />
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
