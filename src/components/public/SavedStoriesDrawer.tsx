'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Bookmark, X, Trash2, BookOpen, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { sound } from '@/lib/sounds';
import { toast } from 'sonner';

export interface SavedArticleMeta {
  slug: string;
  title: string;
  category?: string;
  readingTime?: number;
  heroImage?: string;
  savedAt: number;
}

export function openSavedStoriesDrawer() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-vita-saved-stories'));
  }
}

export function closeSavedStoriesDrawer() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('close-vita-saved-stories'));
  }
}

/**
 * Trigger icon button placed inside desktop and mobile header navigation bars.
 */
export function SavedStoriesTrigger({ className = '' }: { className?: string }) {
  const [count, setCount] = useState<number>(0);

  const updateCount = useCallback(() => {
    try {
      const bookmarks: string[] = JSON.parse(localStorage.getItem('chronicle_bookmarks') || '[]');
      setCount(Array.isArray(bookmarks) ? bookmarks.length : 0);
    } catch {
      setCount(0);
    }
  }, []);

  useEffect(() => {
    updateCount();
    window.addEventListener('vita_bookmarks_changed', updateCount);
    window.addEventListener('storage', updateCount);

    return () => {
      window.removeEventListener('vita_bookmarks_changed', updateCount);
      window.removeEventListener('storage', updateCount);
    };
  }, [updateCount]);

  const handleClick = () => {
    sound.playClick();
    openSavedStoriesDrawer();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary hover:text-brass-700 dark:hover:text-brass-300 hover:border-brass-500/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 shrink-0 ${className}`}
      title="Saved Stories Archive"
      aria-label="View Saved Stories Archive"
    >
      <Bookmark className="h-4 w-4" />
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brass-600 dark:bg-brass-400 px-1 text-[10px] font-black text-white dark:text-stone-950 shadow-xs ring-2 ring-surface">
          {count}
        </span>
      )}
    </button>
  );
}

/**
 * Portaled slide-over drawer rendered at the document root to guarantee it always
 * pops up above all page content and never gets trapped by parent header stacking contexts.
 */
export default function SavedStoriesDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [savedArticles, setSavedArticles] = useState<SavedArticleMeta[]>([]);

  const loadSavedArticles = useCallback(() => {
    try {
      const bookmarks: string[] = JSON.parse(localStorage.getItem('chronicle_bookmarks') || '[]');
      const metaMap: Record<string, SavedArticleMeta> = JSON.parse(
        localStorage.getItem('vita_saved_articles_meta') || '{}'
      );

      const items: SavedArticleMeta[] = bookmarks.map((slug) => {
        if (metaMap[slug]) {
          return metaMap[slug];
        }
        return {
          slug,
          title: slug
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' '),
          category: 'Biography',
          readingTime: 5,
          savedAt: Date.now(),
        };
      });

      setSavedArticles(items);
    } catch {
      setSavedArticles([]);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadSavedArticles();

    const handleOpen = () => {
      loadSavedArticles();
      setIsOpen(true);
    };

    const handleClose = () => {
      setIsOpen(false);
    };

    window.addEventListener('open-vita-saved-stories', handleOpen);
    window.addEventListener('close-vita-saved-stories', handleClose);
    window.addEventListener('vita_bookmarks_changed', loadSavedArticles);
    window.addEventListener('storage', loadSavedArticles);

    return () => {
      window.removeEventListener('open-vita-saved-stories', handleOpen);
      window.removeEventListener('close-vita-saved-stories', handleClose);
      window.removeEventListener('vita_bookmarks_changed', loadSavedArticles);
      window.removeEventListener('storage', loadSavedArticles);
    };
  }, [loadSavedArticles]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        sound.playClick();
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleCloseDrawer = () => {
    sound.playClick();
    setIsOpen(false);
  };

  const handleRemove = (slug: string, title: string) => {
    sound.playClick();
    try {
      const bookmarks: string[] = JSON.parse(localStorage.getItem('chronicle_bookmarks') || '[]');
      const metaMap: Record<string, SavedArticleMeta> = JSON.parse(
        localStorage.getItem('vita_saved_articles_meta') || '{}'
      );

      const updated = bookmarks.filter((b) => b !== slug);
      delete metaMap[slug];

      localStorage.setItem('chronicle_bookmarks', JSON.stringify(updated));
      localStorage.setItem('vita_saved_articles_meta', JSON.stringify(metaMap));

      setSavedArticles((prev) => prev.filter((a) => a.slug !== slug));
      window.dispatchEvent(new CustomEvent('vita_bookmarks_changed'));
      toast('Story removed from your reading archive', { description: title });
    } catch {
      // ignore
    }
  };

  const handleClearAll = () => {
    sound.playClick();
    localStorage.removeItem('chronicle_bookmarks');
    localStorage.removeItem('vita_saved_articles_meta');
    setSavedArticles([]);
    window.dispatchEvent(new CustomEvent('vita_bookmarks_changed'));
    toast.success('Reading archive cleared');
  };

  if (!mounted || !isOpen) {
    return null;
  }

  const count = savedArticles.length;

  const drawerContent = (
    <div
      className="fixed inset-0 z-[100] overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reading-archive-title"
    >
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={handleCloseDrawer}
        aria-hidden="true"
      />

      {/* Slide-out Panel */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10 z-[101]">
        <div className="w-screen max-w-md bg-surface border-l border-border shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-border p-4 sm:px-6 bg-surface">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brass-500/15 text-brass-700 dark:text-brass-300">
                <Bookmark className="h-4 w-4" />
              </span>
              <div>
                <h2
                  id="reading-archive-title"
                  className="font-serif text-lg font-bold text-text-primary leading-tight"
                >
                  Reading Archive
                </h2>
                <p className="text-xs text-text-muted">
                  {count === 0
                    ? 'Zero stories saved'
                    : `${count} saved ${count === 1 ? 'biography' : 'biographies'}`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCloseDrawer}
              className="rounded-lg p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-alt transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label="Close Reading Archive"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 divide-y divide-border/60">
            {count === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16 px-4 space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-alt border border-border text-text-muted">
                  <BookOpen className="h-8 w-8 opacity-60 text-brass-600 dark:text-brass-400" />
                </div>
                <div className="space-y-1.5 max-w-xs">
                  <h3 className="font-serif text-base font-bold text-text-primary">
                    Your reading archive is empty
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed font-sans">
                    Click the bookmark ribbon on any biography while browsing to save it here for quiet, unhurried contemplation.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseDrawer}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-800 dark:bg-brass-400 px-4 py-2 text-xs font-semibold text-white dark:text-stone-950 hover:bg-brand-900 transition-colors shadow-sm"
                >
                  <span>Explore Stories</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                {savedArticles.map((item) => (
                  <div
                    key={item.slug}
                    className="group relative flex items-start justify-between gap-3 rounded-xl border border-border bg-surface-alt/40 p-3.5 hover:border-brass-500/40 hover:bg-surface-alt transition-all shadow-2xs"
                  >
                    <Link
                      href={`/${item.slug}`}
                      onClick={handleCloseDrawer}
                      className="flex-1 min-w-0 space-y-1 focus:outline-none"
                    >
                      <div className="flex items-center gap-2">
                        {item.category && (
                          <span className="rounded-full bg-brass-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brass-700 dark:text-brass-300">
                            {item.category}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-[11px] text-text-muted">
                          <Clock className="h-3 w-3" />
                          {item.readingTime ? `${item.readingTime} min read` : '5 min read'}
                        </span>
                      </div>

                      <h4 className="font-serif text-sm font-bold text-text-primary group-hover:text-brass-700 dark:group-hover:text-brass-300 transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h4>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleRemove(item.slug, item.title)}
                      className="text-text-muted hover:text-red-500 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-surface transition-colors shrink-0"
                      title="Remove from archive"
                      aria-label={`Remove ${item.title}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          {count > 0 && (
            <div className="border-t border-border p-4 sm:px-6 flex items-center justify-between gap-3 bg-surface-alt/30">
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-text-muted hover:text-red-500 transition-colors font-medium flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear Archive</span>
              </button>

              <button
                type="button"
                onClick={handleCloseDrawer}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-surface-alt transition-colors"
              >
                <span>Done</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
}
