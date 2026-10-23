'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { openSearchModal } from './SearchModal';
import {
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Home,
  Compass,
  Info,
  Feather,
  Sparkles,
  Sun,
  Moon,
  Coffee,
  Search,
} from 'lucide-react';

interface MobileNavProps {
  categories: string[];
  year?: number;
}

export default function MobileNav({ categories, year = 2026 }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<'parchment' | 'sepia' | 'dark'>('parchment');
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync theme from document
  useEffect(() => {
    const syncTheme = () => {
      try {
        const stored = localStorage.getItem('chronicle_reading_theme');
        if (stored === 'dark' || stored === 'sepia') {
          setCurrentTheme(stored);
        } else {
          setCurrentTheme('parchment');
        }
      } catch {
        // ignore
      }
    };
    syncTheme();
    window.addEventListener('chronicle_theme_changed', syncTheme);
    return () => window.removeEventListener('chronicle_theme_changed', syncTheme);
  }, [isOpen]);

  const changeTheme = (theme: 'parchment' | 'sepia' | 'dark') => {
    setCurrentTheme(theme);
    try {
      localStorage.setItem('chronicle_reading_theme', theme);
      if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.classList.add('dark');
      } else if (theme === 'sepia') {
        document.documentElement.setAttribute('data-theme', 'sepia');
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
        document.documentElement.classList.remove('dark');
      }
      window.dispatchEvent(new CustomEvent('chronicle_theme_changed', { detail: theme }));
    } catch {
      // ignore
    }
  };

  // Close when pathname changes (user navigated)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close on Escape and manage body overflow & focus
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        toggleBtnRef.current?.focus();
        return;
      }

      // Focus trap within drawer
      if (e.key === 'Tab' && drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstEl = focusableElements[0];
        const lastEl = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const timer = setTimeout(() => {
      const firstFocusable = drawerRef.current?.querySelector<HTMLElement>(
        'button, [href]'
      );
      firstFocusable?.focus();
    }, 50);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    toggleBtnRef.current?.focus();
  }, []);

  const drawerPortal =
    mounted && typeof document !== 'undefined'
      ? createPortal(
          <>
            {/* Backdrop overlay */}
            <div
              className={`fixed inset-0 z-[9990] bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
                isOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
              }`}
              onClick={handleClose}
              aria-hidden="true"
            />

            {/* Slide-out drawer - hidden completely from layout when closed to avoid horizontal overflow */}
            <div
              id="mobile-navigation-drawer"
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation drawer"
              className={`fixed top-0 right-0 z-[9990] flex h-full w-[85%] max-w-sm flex-col bg-surface shadow-2xl border-l border-border transition-all duration-300 ease-in-out ${
                isOpen
                  ? 'translate-x-0 opacity-100 visible pointer-events-auto'
                  : 'translate-x-full opacity-0 invisible pointer-events-none'
              }`}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between border-b border-border px-5 py-4 shrink-0">
                <Link
                  href="/"
                  onClick={handleClose}
                  className="flex items-center gap-2 font-serif text-lg font-bold tracking-tight text-text-primary"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-800 text-brass-300 shadow-xs border border-brass-500/30">
                    <Feather className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex flex-col">
                    <span className="leading-tight">VITA TALES</span>
                    <span className="text-[9px] font-sans font-medium uppercase tracking-widest text-text-muted">
                      Life Stories Archive
                    </span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Close navigation"
                  className="rounded-lg p-2 text-text-muted hover:text-text-primary hover:bg-surface-alt transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable Navigation Body */}
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
                {/* Drawer Quick Search */}
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    openSearchModal();
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-surface-alt/70 px-3.5 py-2.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Search className="h-4 w-4 text-brass-700 dark:text-brass-400" />
                    <span>Search life stories...</span>
                  </div>
                  <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-sans font-semibold text-text-muted">
                    ⌘K
                  </kbd>
                </button>

                {/* Main Navigation Links */}
                <nav aria-label="Mobile Navigation" className="space-y-1.5">
                  <Link
                    href="/"
                    onClick={handleClose}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                      pathname === '/'
                        ? 'bg-brand-800 text-white dark:bg-brass-500/20 dark:text-brass-300 dark:border dark:border-brass-500/40'
                        : 'text-text-primary hover:bg-surface-alt'
                    }`}
                  >
                    <Home className="h-4 w-4" />
                    <span>Home · All Biographies</span>
                  </Link>

                  <Link
                    href="/about"
                    onClick={handleClose}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                      pathname === '/about'
                        ? 'bg-brand-800 text-white dark:bg-brass-500/20 dark:text-brass-300 dark:border dark:border-brass-500/40 font-semibold'
                        : 'text-text-primary hover:bg-surface-alt'
                    }`}
                  >
                    <Info className="h-4 w-4" />
                    <span>About Vita Tales</span>
                  </Link>
                </nav>

                {/* Categories / Domains Section */}
                <div className="rounded-2xl border border-border bg-surface-alt/40 p-3.5 space-y-2">
                  <button
                    type="button"
                    onClick={() => setCategoriesOpen((prev) => !prev)}
                    className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-wider text-text-primary"
                    aria-expanded={categoriesOpen}
                  >
                    <div className="flex items-center gap-2">
                      <Compass className="h-4 w-4 text-brand-800 dark:text-brass-400" />
                      <span>Explore Domains</span>
                    </div>
                    {categoriesOpen ? (
                      <ChevronUp className="h-4 w-4 text-text-muted" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-text-muted" />
                    )}
                  </button>

                  {categoriesOpen && (
                    <div className="pt-2 grid grid-cols-1 gap-1 border-t border-border/60">
                      {categories.length > 0 ? (
                        categories.map((cat) => {
                          const href = `/category/${encodeURIComponent(cat.toLowerCase())}`;
                          const isActive = pathname === href;
                          return (
                            <Link
                              key={cat}
                              href={href}
                              onClick={handleClose}
                              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                                isActive
                                  ? 'bg-brand-800 text-white dark:bg-brass-500/20 dark:text-brass-300 dark:border dark:border-brass-500/40 font-semibold'
                                  : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                              }`}
                            >
                              <span>{cat}</span>
                              <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">
                                Browse
                              </span>
                            </Link>
                          );
                        })
                      ) : (
                        <span className="px-3 py-2 text-xs text-text-muted italic">
                          Biographies across science, technology, literature...
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Reading Canvas Theme Switcher */}
                <div className="rounded-2xl border border-border bg-surface-alt/40 p-3.5 space-y-2.5">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Reading Theme
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => changeTheme('parchment')}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border transition-all ${
                        currentTheme === 'parchment'
                          ? 'bg-[#f7f4ed] text-[#181c19] border-brass-600 font-bold shadow-xs ring-1 ring-brass-600/30'
                          : 'bg-surface border-border text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <Sun className="h-3.5 w-3.5" />
                      <span>Parchment</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => changeTheme('sepia')}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border transition-all ${
                        currentTheme === 'sepia'
                          ? 'bg-[#f3ebdb] text-[#32231b] border-amber-700 font-bold shadow-xs ring-1 ring-amber-700/30'
                          : 'bg-surface border-border text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <Coffee className="h-3.5 w-3.5" />
                      <span>Sepia</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => changeTheme('dark')}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border transition-all ${
                        currentTheme === 'dark'
                          ? 'bg-[#15221b] text-[#f0dcab] border-brass-400 font-bold shadow-xs ring-1 ring-brass-400/30'
                          : 'bg-surface border-border text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <Moon className="h-3.5 w-3.5" />
                      <span>Dark</span>
                    </button>
                  </div>
                </div>

                {/* Reading Inspiration Snippet */}
                <div className="rounded-xl border border-brass-500/30 bg-brass-500/5 p-3.5 text-xs text-text-secondary leading-relaxed font-serif italic">
                  “Every extraordinary life leaves a blueprint. Unhurried, deep narratives of human conviction.”
                </div>
              </div>

              {/* Drawer footer */}
              <div className="border-t border-border p-4 shrink-0 text-center text-xs text-text-muted">
                <p>© {year} Vita Tales. All rights reserved.</p>
              </div>
            </div>
          </>,
          document.body
        )
      : null;

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        ref={toggleBtnRef}
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation-drawer"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        className="relative inline-flex items-center justify-center p-2 text-text-secondary hover:text-text-primary hover:bg-surface-alt rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {drawerPortal}
    </div>
  );
}
