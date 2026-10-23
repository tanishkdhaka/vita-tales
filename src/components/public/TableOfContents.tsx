'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ListFilter,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  Compass,
  Clock,
  Share2,
  Check,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import type { TOCItem, Article } from '@/types';

interface ExtendedTOCItem extends TOCItem {
  children?: ExtendedTOCItem[];
}

interface TableOfContentsProps {
  toc: ExtendedTOCItem[];
  mode?: 'mobile' | 'desktop' | 'both';
  article?: Article;
}

interface NormalizedItem {
  id: string;
  text: string;
  level: number;
}

function normalizeTOC(items: ExtendedTOCItem[]): NormalizedItem[] {
  const flat: NormalizedItem[] = [];
  for (const item of items) {
    flat.push({ id: item.id, text: item.text, level: item.level || 2 });
    if (item.children && Array.isArray(item.children)) {
      for (const child of item.children) {
        flat.push({ id: child.id, text: child.text, level: child.level || 3 });
      }
    }
  }
  return flat;
}

export default function TableOfContents({
  toc,
  mode = 'both',
  article,
}: TableOfContentsProps) {
  const items = useMemo(() => normalizeTOC(toc || []), [toc]);
  const [activeId, setActiveId] = useState<string>('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentActiveId = activeId || items[0]?.id || '';

  // Track active section as reader scrolls
  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -65% 0px',
        threshold: 0,
      }
    );

    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [items]);

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      history.pushState(null, '', `#${id}`);
      setActiveId(id);
      setMobileOpen(false);
    }
  };

  const handleBackToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Story link copied to clipboard');
      setTimeout(() => setCopied(false), 2200);
    } catch {
      toast.error('Could not copy link');
    }
  }, []);

  if (!items || items.length === 0) {
    return null;
  }

  const showMobile = mode === 'mobile' || mode === 'both';
  const showDesktop = mode === 'desktop' || mode === 'both';

  return (
    <>
      {/* Mobile Collapsible Table of Contents */}
      {showMobile && (
        <div className={`${mode === 'both' ? 'lg:hidden' : ''} mb-8 w-full rounded-2xl border border-border bg-surface p-4 shadow-xs`}>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex w-full items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg p-1"
            aria-expanded={mobileOpen}
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brass-500/15 text-brass-700 dark:text-brass-300 dark:bg-brass-500/20">
                <Compass className="h-4 w-4" />
              </span>
              <div>
                <span className="font-sans text-xs font-bold uppercase tracking-wider text-text-primary block">
                  Table of Contents
                </span>
                <span className="text-[11px] text-text-muted">
                  {items.length} sections in this biography
                </span>
              </div>
            </div>
            {mobileOpen ? (
              <ChevronUp className="h-4 w-4 text-text-muted" />
            ) : (
              <ChevronDown className="h-4 w-4 text-text-muted" />
            )}
          </button>

          {mobileOpen && (
            <nav className="mt-4 border-t border-border pt-3 space-y-1" aria-label="Mobile Table of Contents">
              {items.map((item) => {
                const isActive = item.id === currentActiveId;
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => handleLinkClick(e, item.id)}
                    className={`block py-1.5 text-sm transition-colors rounded-lg px-2.5 ${
                      item.level === 3 ? 'pl-6 text-xs' : 'font-medium'
                    } ${
                      isActive
                        ? 'bg-brass-500/15 text-text-primary font-bold border-l-2 border-brass-600 dark:bg-brass-500/20 dark:text-brass-300 dark:border-brass-400'
                        : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
                    }`}
                  >
                    {item.text}
                  </a>
                );
              })}
            </nav>
          )}
        </div>
      )}

      {/* Desktop Sidebar Table of Contents */}
      {showDesktop && (
        <div className={`${mode === 'both' ? 'hidden lg:block' : ''} w-full space-y-4`}>
          {/* Card 1: Chronicle Table of Contents */}
          <div className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md p-5 shadow-xs transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-border">
              <div className="flex items-center gap-2">
                <ListFilter className="h-4 w-4 text-brass-700 dark:text-brass-400" />
                <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-text-primary">
                  Chronicle Contents
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-text-muted px-2 py-0.5 rounded-full bg-surface-alt border border-border/60">
                {items.length} sections
              </span>
            </div>

            <nav
              className="max-h-[calc(100vh-320px)] overflow-y-auto space-y-1 pr-1 text-sm custom-scrollbar"
              aria-label="Table of Contents"
            >
              {items.map((item) => {
                const isActive = item.id === currentActiveId;
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => handleLinkClick(e, item.id)}
                    className={`group flex items-start gap-2 py-1.5 px-2.5 rounded-lg transition-all duration-150 ${
                      item.level === 3 ? 'pl-6 text-xs' : 'text-sm font-medium'
                    } ${
                      isActive
                        ? 'bg-brass-500/15 text-text-primary font-bold shadow-2xs dark:bg-brass-500/20 dark:text-brass-300'
                        : 'text-text-secondary hover:bg-surface-alt/70 hover:text-text-primary'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full shrink-0 mt-2 transition-all ${
                        isActive
                          ? 'bg-brass-600 scale-125 ring-2 ring-brass-300 dark:bg-brass-400 dark:ring-brass-500/50'
                          : 'bg-border group-hover:bg-text-muted'
                      }`}
                    />
                    <span className="leading-snug line-clamp-2">
                      {item.text}
                    </span>
                  </a>
                );
              })}
            </nav>

            {/* Back to top shortcut */}
            <div className="mt-4 pt-3 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={handleBackToTop}
                className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-brass-700 dark:hover:text-brass-300 transition-colors font-medium p-1"
                aria-label="Back to top"
              >
                <ArrowUp className="h-3 w-3" />
                <span>Back to top</span>
              </button>
            </div>
          </div>

          {/* Card 2: Archival Companion Dossier (Fills sidebar below TOC so no empty void is left) */}
          {article && (
            <div className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md p-4 sm:p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-sans font-bold uppercase tracking-wider text-text-muted text-[10px]">
                  Archival Dossier
                </span>
                {article.category && (
                  <span className="font-semibold px-2 py-0.5 rounded-full bg-brass-500/15 text-brass-900 dark:text-brass-300 text-[10px] border border-brass-500/20">
                    {article.category}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <h4 className="font-serif text-sm font-bold text-text-primary line-clamp-2 leading-snug">
                  {article.title}
                </h4>
                {article.readingTime && (
                  <p className="text-[11px] text-text-muted flex items-center gap-1.5 pt-0.5">
                    <Clock className="h-3 w-3 text-brass-600 dark:text-brass-400" />
                    <span>{article.readingTime} min full immersion</span>
                  </p>
                )}
              </div>

              {/* Quick Actions: Share, Back to Top */}
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors font-medium py-1 px-2 rounded-lg hover:bg-surface-alt"
                  aria-label="Copy story link"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-brand-700 dark:text-brass-400" />
                      <span className="text-brand-800 dark:text-brass-300 font-semibold">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Share Story</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBackToTop}
                  className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-brass-700 dark:hover:text-brass-300 transition-colors font-medium py-1 px-2 rounded-lg hover:bg-surface-alt"
                  aria-label="Back to top"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                  <span>Top</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
