'use client';

import { useState, useEffect } from 'react';
import { Sun, Coffee, Moon } from 'lucide-react';
import { sound } from '@/lib/sounds';

type Theme = 'parchment' | 'sepia' | 'dark';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('parchment');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const syncTheme = () => {
      try {
        const stored = localStorage.getItem('chronicle_reading_theme');
        if (stored === 'dark' || stored === 'sepia') {
          setTheme(stored);
        } else {
          setTheme('parchment');
        }
      } catch {
        // ignore
      }
    };

    syncTheme();
    window.addEventListener('chronicle_theme_changed', syncTheme);
    return () => window.removeEventListener('chronicle_theme_changed', syncTheme);
  }, []);

  const changeTheme = (newTheme: Theme) => {
    sound.playPageTurn();
    setTheme(newTheme);
    try {
      localStorage.setItem('chronicle_reading_theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.classList.add('dark');
      } else if (newTheme === 'sepia') {
        document.documentElement.setAttribute('data-theme', 'sepia');
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
        document.documentElement.classList.remove('dark');
      }
      window.dispatchEvent(new CustomEvent('chronicle_theme_changed', { detail: newTheme }));
    } catch {
      // ignore
    }
  };

  if (!mounted) {
    return (
      <div className="h-8 w-24 rounded-lg bg-surface-alt/50 border border-border" />
    );
  }

  return (
    <div
      role="group"
      aria-label="Theme switcher"
      className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-surface-alt/50 p-0.5 shadow-2xs"
    >
      <button
        type="button"
        onClick={() => changeTheme('parchment')}
        className={`flex h-7 w-7 items-center justify-center rounded-md text-xs transition-all ${
          theme === 'parchment'
            ? 'bg-[#f7f4ed] text-[#181c19] border border-brass-600 shadow-xs font-bold ring-1 ring-brass-600/30'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface/60'
        }`}
        title="Classic Parchment theme"
        aria-label="Classic Parchment theme"
        aria-pressed={theme === 'parchment'}
      >
        <Sun className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => changeTheme('sepia')}
        className={`flex h-7 w-7 items-center justify-center rounded-md text-xs transition-all ${
          theme === 'sepia'
            ? 'bg-[#f3ebdb] text-[#32231b] border border-amber-700 shadow-xs font-bold ring-1 ring-amber-700/30'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface/60'
        }`}
        title="Warm Sepia theme"
        aria-label="Warm Sepia theme"
        aria-pressed={theme === 'sepia'}
      >
        <Coffee className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => changeTheme('dark')}
        className={`flex h-7 w-7 items-center justify-center rounded-md text-xs transition-all ${
          theme === 'dark'
            ? 'bg-[#15221b] text-[#f0dcab] border border-brass-400 shadow-xs font-bold ring-1 ring-brass-400/30'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface/60'
        }`}
        title="Dark Obsidian theme"
        aria-label="Dark Obsidian theme"
        aria-pressed={theme === 'dark'}
      >
        <Moon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
