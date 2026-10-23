'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Search, X, Clock, ArrowRight, Loader2, Sparkles } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  readingTime: number;
}

export function openSearchModal() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-vita-search'));
  }
}

export function SearchTrigger({
  variant = 'desktop',
  className = '',
}: {
  variant?: 'desktop' | 'mobile' | 'compact';
  className?: string;
}) {
  if (variant === 'mobile') {
    return (
      <button
        type="button"
        onClick={openSearchModal}
        aria-label="Search biographies"
        className={`flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-alt/70 text-text-secondary hover:text-text-primary hover:bg-surface transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 shadow-2xs shrink-0 ${className}`}
      >
        <Search className="h-4 w-4 text-text-muted hover:text-brass-700 dark:hover:text-brass-300" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={openSearchModal}
      className={`group flex h-9 w-full max-w-xs items-center justify-between rounded-full border border-border bg-surface-alt/70 px-3.5 py-1.5 text-xs text-text-secondary hover:border-brand-400 hover:bg-surface hover:text-text-primary transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 shadow-2xs shrink-0 ${className}`}
      aria-label="Search biographies"
    >
      <div className="flex items-center gap-2 min-w-0">
        <Search className="h-3.5 w-3.5 text-text-muted group-hover:text-brass-700 dark:group-hover:text-brass-300 transition-colors shrink-0" />
        <span className="font-medium truncate">Search biographies...</span>
      </div>
      <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-sans font-semibold text-text-muted shadow-2xs shrink-0">
        ⌘K
      </kbd>
    </button>
  );
}

export default function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen to open-vita-search custom event
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-vita-search', handleOpen);
    return () => window.removeEventListener('open-vita-search', handleOpen);
  }, []);

  // Global Cmd+K / Ctrl+K listener and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Body scroll lock and auto-focus
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => inputRef.current?.focus(), 60);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  if (!mounted || !isOpen || typeof document === 'undefined') {
    return null;
  }

  const modalDialog = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search biographies"
      className="fixed inset-0 z-[9999] flex items-start justify-center p-3.5 sm:p-6 md:p-16 lg:p-20 bg-black/70 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-border bg-surface shadow-2xl ring-1 ring-black/10 overflow-hidden my-auto sm:my-0 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-2.5 sm:gap-3 border-b border-border px-3.5 sm:px-4 py-3 sm:py-3.5 bg-surface">
          <Search className="h-4 w-4 sm:h-5 sm:w-5 text-brass-700 dark:text-brass-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, discovery, era..."
            className="w-full bg-transparent text-sm sm:text-base text-text-primary placeholder:text-text-muted focus:outline-none font-sans"
          />
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-brass-600 dark:text-brass-400 animate-spin shrink-0" />
          ) : query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="rounded p-1 text-text-muted hover:text-text-primary"
              aria-label="Clear query"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg px-2.5 py-1 text-xs text-text-muted hover:bg-surface-alt hover:text-text-primary font-sans shrink-0 border border-border/60 transition-colors"
          >
            Esc
          </button>
        </div>

        {/* Results or Empty Suggestions */}
        <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto p-2 bg-surface custom-scrollbar">
          {results.length > 0 ? (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Found {results.length} Stories
              </div>
              {results.map((res) => (
                <Link
                  key={res.id}
                  href={`/${res.slug}`}
                  onClick={handleClose}
                  className="group flex items-start justify-between gap-3 rounded-xl p-3 hover:bg-surface-alt transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-serif font-bold text-sm text-text-primary group-hover:text-brass-600 dark:group-hover:text-brass-400 transition-colors">
                        {res.title}
                      </span>
                      {res.category && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brass-500/15 text-brass-900 dark:text-brass-300 border border-brass-500/30">
                          {res.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary line-clamp-1">
                      {res.excerpt}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 text-text-muted group-hover:text-brass-700 dark:group-hover:text-brass-300 text-xs">
                    {res.readingTime && (
                      <span className="hidden sm:flex items-center gap-1 text-[11px]">
                        <Clock className="h-3 w-3" />
                        {res.readingTime}m
                      </span>
                    )}
                    <ArrowRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="py-10 text-center text-sm text-text-secondary">
              No biographies found matching &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <div className="py-8 px-4 text-center">
              <Sparkles className="mx-auto h-7 w-7 text-brass-500 dark:text-brass-400 mb-2" />
              <p className="text-xs text-text-muted">
                Type a figure or topic, such as <span className="text-brass-700 dark:text-brass-400 font-medium">Aman Gupta</span>, <span className="text-brass-700 dark:text-brass-400 font-medium">Radhika Apte</span>, or <span className="text-brass-700 dark:text-brass-400 font-medium">Vikrant Massey</span>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalDialog, document.body);
}
