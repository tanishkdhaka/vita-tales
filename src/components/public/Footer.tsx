import Link from 'next/link';
import { cacheLife, cacheTag } from 'next/cache';
import { getAllCategories } from '@/lib/db/queries';
import { Feather, Heart } from 'lucide-react';

export default async function Footer() {
  'use cache';
  cacheTag('articles');
  cacheLife('days');
  const currentYear = new Date().getFullYear();
  const categories = await getAllCategories();

  return (
    <footer className="w-full border-t border-border bg-surface-alt/40 transition-colors">
      <div className="mx-auto max-w-wide px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:gap-12">
          {/* Column 1: Brand & Tagline */}
          <div className="md:col-span-2 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-serif text-2xl font-bold tracking-tight text-text-primary hover:text-brass-700 dark:hover:text-brass-300 transition-colors"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-800 text-white">
                <Feather className="h-3.5 w-3.5" />
              </span>
              <span>VITA TALES</span>
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-text-secondary">
              Deeply researched biographical narratives tracing the crucibles, personal convictions,
              and breakthrough moments of history’s greatest thinkers, pioneers, and creators.
            </p>
            <div className="pt-2">
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-text-muted">
                Stories of Lives That Shaped Our World
              </span>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-text-primary">
              Navigation
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-text-secondary">
              <li>
                <Link
                  href="/"
                  className="transition-colors hover:text-brass-700 dark:hover:text-brass-300 hover:underline"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="transition-colors hover:text-brass-700 dark:hover:text-brass-300 hover:underline"
                >
                  About Vita Tales
                </Link>
              </li>
              <li>
                <a
                  href="#main-content"
                  className="transition-colors hover:text-brass-700 dark:hover:text-brass-300 hover:underline"
                >
                  Back to Top
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div>
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-text-primary">
              Explore Domains
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-text-secondary">
              {categories.length > 0 ? (
                categories.slice(0, 5).map((category) => (
                  <li key={category}>
                    <Link
                      href={`/category/${encodeURIComponent(category.toLowerCase())}`}
                      className="transition-colors hover:text-brass-700 dark:hover:text-brass-300 hover:underline"
                    >
                      {category}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-xs text-text-muted italic">
                  Biographies across all disciplines
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-border pt-8 text-xs text-text-muted sm:flex-row gap-4">
          <p>© {currentYear} Vita Tales. All rights reserved.</p>
          <div className="flex items-center gap-1 text-text-muted">
            <span>Crafted with</span>
            <Heart className="h-3.5 w-3.5 text-crimson-600 fill-current" />
            <span>for lovers of great stories</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
