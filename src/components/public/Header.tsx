import Link from 'next/link';
import { cacheLife, cacheTag } from 'next/cache';
import { getAllCategories } from '@/lib/db/queries';
import { ChevronDown, Feather } from 'lucide-react';
import MobileNav from './MobileNav';
import SearchModal, { SearchTrigger } from './SearchModal';
import ThemeToggle from './ThemeToggle';
import SavedStoriesDrawer, { SavedStoriesTrigger } from './SavedStoriesDrawer';

export default async function Header() {
  'use cache';
  cacheTag('articles');
  cacheLife('hours');
  const categories = await getAllCategories();

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 sm:h-[70px] max-w-wide items-center justify-between px-3.5 sm:px-6 lg:px-8 gap-3 sm:gap-4">
          {/* Brand / Logo */}
          <div className="flex items-center min-w-0 shrink-0">
            <Link
              href="/"
              className="group flex items-center gap-2 sm:gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded min-w-0"
            >
              <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-brand-800 text-brass-300 shadow-xs shrink-0 border border-brass-500/30">
                <Feather className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </span>
              <span className="font-serif text-xl sm:text-2xl font-black tracking-tight text-text-primary transition-colors group-hover:text-brass-700 dark:group-hover:text-brass-300 truncate">
                VITA TALES
              </span>
              <span className="hidden lg:inline-block font-sans text-[10px] font-bold uppercase tracking-widest text-text-muted border-l border-border pl-2.5">
                Life Stories Archive
              </span>
            </Link>
          </div>

          {/* Center: Search Trigger (Desktop) - active only on md and up */}
          <div className="flex-1 max-w-xs hidden md:flex justify-center">
            <SearchTrigger variant="desktop" />
          </div>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex md:items-center md:gap-7 shrink-0"
            aria-label="Main Navigation"
          >
            <Link
              href="/"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded px-1.5 py-1"
            >
              Archive
            </Link>

            {/* Categories Dropdown */}
            <div className="relative group">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary py-1 px-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
                aria-haspopup="true"
              >
                <span>Folios</span>
                <ChevronDown className="h-3.5 w-3.5 text-text-muted transition-transform duration-200 group-hover:rotate-180" />
              </button>

              {/* Dropdown Menu */}
              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 absolute left-0 top-full pt-2 transition-all duration-200 ease-out z-50">
                <div className="w-56 rounded-2xl border border-border bg-surface p-2 shadow-xl ring-1 ring-black/5 animate-fade-in">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                    Archival Categories
                  </div>
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <Link
                        key={cat}
                        href={`/category/${encodeURIComponent(cat.toLowerCase())}`}
                        className="block rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-alt hover:text-brass-700 dark:hover:text-brass-300 focus:bg-surface-alt focus:text-brass-700 dark:focus:text-brass-300 font-medium"
                      >
                        {cat}
                      </Link>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-text-muted italic">
                      No categories found
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Link
              href="/about"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded px-1.5 py-1"
            >
              Editorial Vision
            </Link>

            <div className="h-4 w-px bg-border/80" aria-hidden="true" />

            <SavedStoriesTrigger />
            <ThemeToggle />
          </nav>

          {/* Mobile Search Trigger, Saved Drawer & Hamburger - active below md */}
          <div className="flex items-center gap-2 md:hidden shrink-0">
            <SavedStoriesTrigger />
            <SearchTrigger variant="mobile" />
            <MobileNav categories={categories} />
          </div>
        </div>
      </header>

      {/* Portaled global search and reading archive drawer */}
      <SearchModal />
      <SavedStoriesDrawer />
    </>
  );
}
