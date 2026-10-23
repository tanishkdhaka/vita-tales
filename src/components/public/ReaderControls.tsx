'use client';

import { useState, useEffect } from 'react';
import {
  Type,
  Sun,
  Moon,
  BookOpen,
  Volume2,
  VolumeX,
  Share2,
  Bookmark,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { sound } from '@/lib/sounds';

interface ReaderControlsProps {
  title: string;
  slug: string;
  readingTime?: number | null;
  category?: string | null;
  heroImage?: string | null;
  targetId?: string;
}

export default function ReaderControls({
  title,
  slug,
  readingTime = 5,
  category,
  heroImage,
  targetId = 'article-body-wrapper',
}: ReaderControlsProps) {
  const [theme, setTheme] = useState<'parchment' | 'sepia' | 'dark'>('parchment');
  const [fontScale, setFontScale] = useState<number>(1);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);

  useEffect(() => {
    const syncTheme = () => {
      try {
        const savedTheme = localStorage.getItem('chronicle_reading_theme') as 'parchment' | 'sepia' | 'dark' | null;
        if (savedTheme === 'dark' || savedTheme === 'sepia') {
          setTheme(savedTheme);
          document.documentElement.setAttribute('data-theme', savedTheme);
          document.documentElement.classList.toggle('dark', savedTheme === 'dark');
        } else {
          setTheme('parchment');
          document.documentElement.removeAttribute('data-theme');
          document.documentElement.classList.remove('dark');
        }
      } catch {
        // ignore
      }
    };

    syncTheme();
    window.addEventListener('chronicle_theme_changed', syncTheme);

    const savedScale = localStorage.getItem('chronicle_font_scale');
    if (savedScale) {
      const scaleNum = parseFloat(savedScale);
      setFontScale(scaleNum);
      document.documentElement.style.setProperty('--reading-font-scale', scaleNum.toString());
    }

    const syncBookmarks = () => {
      try {
        const bookmarks = JSON.parse(localStorage.getItem('chronicle_bookmarks') || '[]');
        setIsBookmarked(bookmarks.includes(slug));
      } catch {
        // ignore
      }
    };

    syncBookmarks();
    window.addEventListener('vita_bookmarks_changed', syncBookmarks);

    setIsSoundMuted(sound.getMuted());

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSupported(true);
    }

    return () => {
      window.removeEventListener('chronicle_theme_changed', syncTheme);
      window.removeEventListener('vita_bookmarks_changed', syncBookmarks);
    };
  }, [slug]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleThemeChange = (newTheme: 'parchment' | 'sepia' | 'dark') => {
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
    toast.success(`Theme switched to ${newTheme === 'parchment' ? 'Classic Parchment' : newTheme === 'sepia' ? 'Warm Sepia' : 'Dark Mode'}`);
  };

  const handleFontScale = (delta: number) => {
    sound.playClick();
    const newScale = Math.min(Math.max(parseFloat((fontScale + delta).toFixed(2)), 0.85), 1.35);
    setFontScale(newScale);
    localStorage.setItem('chronicle_font_scale', newScale.toString());
    document.documentElement.style.setProperty('--reading-font-scale', newScale.toString());
  };

  const handleResetFont = () => {
    sound.playClick();
    setFontScale(1);
    localStorage.setItem('chronicle_font_scale', '1');
    document.documentElement.style.setProperty('--reading-font-scale', '1');
  };

  const handleBookmark = () => {
    try {
      const bookmarks: string[] = JSON.parse(localStorage.getItem('chronicle_bookmarks') || '[]');
      const metaMap: Record<
        string,
        { slug: string; title: string; category?: string; readingTime?: number; heroImage?: string; savedAt: number }
      > = JSON.parse(localStorage.getItem('vita_saved_articles_meta') || '{}');

      if (isBookmarked) {
        sound.playClick();
        const updated = bookmarks.filter((b: string) => b !== slug);
        delete metaMap[slug];
        localStorage.setItem('chronicle_bookmarks', JSON.stringify(updated));
        localStorage.setItem('vita_saved_articles_meta', JSON.stringify(metaMap));
        setIsBookmarked(false);
        toast('Story removed from your reading archive');
      } else {
        sound.playBookmark();
        if (!bookmarks.includes(slug)) {
          bookmarks.unshift(slug);
        }
        metaMap[slug] = {
          slug,
          title,
          category: category || 'Biography',
          readingTime: readingTime || 5,
          heroImage: heroImage || '',
          savedAt: Date.now(),
        };
        localStorage.setItem('chronicle_bookmarks', JSON.stringify(bookmarks));
        localStorage.setItem('vita_saved_articles_meta', JSON.stringify(metaMap));
        setIsBookmarked(true);
        toast.success('Story saved to your private reading archive');
      }
      window.dispatchEvent(new CustomEvent('vita_bookmarks_changed'));
    } catch {
      // ignore
    }
  };

  const handleSoundToggle = () => {
    const muted = sound.toggleMute();
    setIsSoundMuted(muted);
    toast(muted ? 'Tactile sound FX muted' : 'Tactile sound FX enabled');
    if (!muted) {
      sound.playClick();
    }
  };

  const handleShare = async () => {
    sound.playClick();
    const url = window.location.href;
    const shareData = {
      title: `${title} | Vita Tales`,
      text: `Read the biographical profile of ${title} on Vita Tales:`,
      url,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('Shared successfully');
        return;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Reader dismissed the native sheet, do not fallback to error
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      toast.error('Could not copy link');
    }
  };

  const toggleSpeech = () => {
    sound.playClick();
    if (!speechSupported) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      toast('Reading paused');
    } else {
      const target = document.getElementById(targetId) || document.querySelector('.article-content');
      if (!target) return;

      const text = (target as HTMLElement).innerText;
      if (!text) return;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      toast.success('Listening to narration...', {
        description: 'Audio generated with native Web Speech synthesizer',
      });
    }
  };

  return (
    <div className="sticky top-16 sm:top-18 z-30 mb-8 border-b border-border bg-surface/90 backdrop-blur-md transition-colors py-2.5 px-3 sm:px-6 shadow-xs">
      <div className="mx-auto flex max-w-content flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Tier 1 on Mobile: Stats & Quick Actions */}
        <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-brass-500/15 text-brass-700 dark:text-brass-300 dark:bg-brass-500/20">
              <BookOpen className="h-3 w-3" />
            </span>
            <span className="font-semibold text-text-primary">
              {readingTime} min read
            </span>
            {fontScale !== 1 && (
              <span className="text-[10px] text-text-muted hidden xs:inline">
                ({Math.round(fontScale * 100)}% zoom)
              </span>
            )}
          </div>

          {/* Mobile-Only Actions */}
          <div className="flex items-center gap-1 sm:hidden">
            <button
              type="button"
              onClick={handleBookmark}
              className={`p-1.5 rounded-lg transition-colors ${
                isBookmarked
                  ? 'text-brass-800 bg-brass-500/20 dark:text-brass-300 dark:bg-brass-500/25 border border-brass-500/40'
                  : 'text-text-secondary hover:bg-surface-alt'
              }`}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark story'}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark story'}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-alt transition-colors"
              title="Share biography"
              aria-label="Share biography"
            >
              {isCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Tier 2: Reading Customization Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 w-full sm:w-auto border-t sm:border-t-0 border-border/50 pt-2 sm:pt-0">
          {/* Web Speech Narration Trigger with Audio Waveform */}
          {speechSupported && (
            <button
              type="button"
              onClick={toggleSpeech}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all shadow-xs ${
                isSpeaking
                  ? 'bg-emerald-600 text-white animate-pulse'
                  : 'bg-surface-alt text-text-secondary hover:text-text-primary hover:bg-surface border border-border'
              }`}
              title={isSpeaking ? 'Stop narration' : 'Listen to narration'}
              aria-label={isSpeaking ? 'Stop narration' : 'Listen to narration'}
            >
              {isSpeaking ? (
                <>
                  {/* Audio Waveform dancing bars */}
                  <div className="flex items-center gap-0.5 h-3">
                    <span className="w-0.5 h-3 bg-white animate-pulse" />
                    <span className="w-0.5 h-2 bg-white animate-bounce" />
                    <span className="w-0.5 h-3.5 bg-white animate-pulse" />
                    <span className="w-0.5 h-2 bg-white animate-bounce" />
                  </div>
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-3.5 w-3.5 text-brass-600" />
                  <span>Listen</span>
                </>
              )}
            </button>
          )}

          {/* Sound FX Mute Toggle */}
          <button
            type="button"
            onClick={handleSoundToggle}
            className="h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded-lg border border-border bg-surface-alt/60 text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
            title={isSoundMuted ? 'Unmute haptic sound FX' : 'Mute sound FX'}
            aria-label={isSoundMuted ? 'Unmute sound FX' : 'Mute sound FX'}
          >
            {isSoundMuted ? (
              <VolumeX className="h-3.5 w-3.5 text-text-muted" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-brass-500" />
            )}
          </button>

          {/* Font Size Adjusters */}
          <div className="flex items-center bg-surface-alt/60 rounded-lg p-0.5 border border-border">
            <button
              type="button"
              onClick={() => handleFontScale(-0.05)}
              disabled={fontScale <= 0.85}
              className="h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded text-text-secondary hover:bg-surface hover:text-text-primary disabled:opacity-40 transition-colors"
              title="Decrease font size"
              aria-label="Decrease font size"
            >
              <span className="font-serif text-xs font-bold">A-</span>
            </button>
            {fontScale !== 1 && (
              <button
                type="button"
                onClick={handleResetFont}
                className="h-7 w-6 sm:h-8 sm:w-7 flex items-center justify-center rounded text-text-muted hover:text-text-primary transition-colors text-[10px]"
                title="Reset font size"
                aria-label="Reset font size"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            )}
            <button
              type="button"
              onClick={() => handleFontScale(0.05)}
              disabled={fontScale >= 1.35}
              className="h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded text-text-secondary hover:bg-surface hover:text-text-primary disabled:opacity-40 transition-colors"
              title="Increase font size"
              aria-label="Increase font size"
            >
              <span className="font-serif text-sm font-bold">A+</span>
            </button>
          </div>

          {/* Theme Picker */}
          <div className="flex items-center bg-surface-alt/60 rounded-lg p-0.5 border border-border gap-0.5">
            <button
              type="button"
              onClick={() => handleThemeChange('parchment')}
              className={`h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded-md transition-all ${
                theme === 'parchment'
                  ? 'bg-[#f7f4ed] text-[#181c19] border border-brass-600 font-bold shadow-xs ring-1 ring-brass-600/30'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              title="Classic Parchment theme"
              aria-label="Switch to classic parchment theme"
            >
              <Sun className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange('sepia')}
              className={`h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded-md transition-all ${
                theme === 'sepia'
                  ? 'bg-[#f3ebdb] text-[#32231b] border border-amber-700 font-bold shadow-xs ring-1 ring-amber-700/30'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              title="Warm Sepia theme"
              aria-label="Switch to warm sepia theme"
            >
              <Type className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange('dark')}
              className={`h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded-md transition-all ${
                theme === 'dark'
                  ? 'bg-[#122419] text-[#f0dcab] border border-brass-400 font-bold shadow-xs ring-1 ring-brass-400/30'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              title="Dark theme"
              aria-label="Switch to dark theme"
            >
              <Moon className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-1 border-l border-border pl-2">
            <button
              type="button"
              onClick={handleBookmark}
              className={`p-1.5 rounded-lg transition-colors ${
                isBookmarked
                  ? 'text-brass-800 bg-brass-500/20 dark:text-brass-300 dark:bg-brass-500/25 border border-brass-500/40'
                  : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
              }`}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark story'}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark story'}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-alt hover:text-text-primary transition-colors"
              title="Share biography"
              aria-label="Share biography"
            >
              {isCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
