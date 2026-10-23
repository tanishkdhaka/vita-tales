'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Copy, Check, X, Sparkles, Palette, Feather } from 'lucide-react';
import { toast } from 'sonner';
import { sound } from '@/lib/sounds';

interface QuotePosterModalProps {
  quote: string;
  sourceTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

const THEMES = [
  {
    id: 'heritage-brass',
    name: 'Antique Brass',
    bg: 'from-[#1b3323] via-[#0f1f15] to-[#080d09]',
    border: 'border-[#c5a059]/40',
    accent: 'text-[#c5a059]',
    tagBg: 'bg-[#c5a059]/15 border-[#c5a059]/30 text-[#e5c98f]',
    quoteColor: 'text-[#f7f4ed]',
  },
  {
    id: 'crimson-crucible',
    name: 'Crimson Seal',
    bg: 'from-[#4a121a] via-[#24090d] to-[#120406]',
    border: 'border-[#c5a059]/30',
    accent: 'text-[#e5a9b2]',
    tagBg: 'bg-[#7e1e2d]/30 border-[#e5a9b2]/20 text-[#f5d0d6]',
    quoteColor: 'text-[#fdfcf9]',
  },
  {
    id: 'midnight-obsidian',
    name: 'Obsidian Starlight',
    bg: 'from-[#141517] via-[#0b0c0d] to-[#040505]',
    border: 'border-white/20',
    accent: 'text-amber-300',
    tagBg: 'bg-white/10 border-white/20 text-white/90',
    quoteColor: 'text-white',
  },
  {
    id: 'parchment-folio',
    name: 'Aged Parchment',
    bg: 'from-[#f4efe4] via-[#ebe3d3] to-[#ded2bd]',
    border: 'border-[#8c7853]/40',
    accent: 'text-[#1b3323]',
    tagBg: 'bg-[#1b3323]/10 border-[#1b3323]/20 text-[#1b3323]',
    quoteColor: 'text-[#1c1917]',
  },
];

export default function QuotePosterModal({
  quote,
  sourceTitle,
  isOpen,
  onClose,
}: QuotePosterModalProps) {
  const [activeTheme, setActiveTheme] = useState(THEMES[0]);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  if (!isOpen || !mounted || typeof document === 'undefined') return null;

  const handleCopyCard = async () => {
    sound.playClick();
    setIsExporting(true);
    try {
      // Copy formatted quote markdown / plain text
      await navigator.clipboard.writeText(`“${quote}”\n\n— From Vita Tales: “${sourceTitle}”\n${window.location.href}`);
      setCopied(true);
      toast.success('Quote formatted for social media copied!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy');
    } finally {
      setIsExporting(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative z-10 w-full max-w-lg rounded-3xl border border-border bg-surface p-5 sm:p-7 shadow-2xl space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-3.5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-800 text-brass-300">
                <Palette className="h-3.5 w-3.5" />
              </span>
              <div>
                <h3 className="font-serif text-lg font-bold text-text-primary">
                  Artistic Quote Studio
                </h3>
                <span className="text-[11px] text-text-muted">
                  Shareable visual card with archival typography
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-alt transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Theme Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setActiveTheme(t);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all ${
                  activeTheme.id === t.id
                    ? 'bg-brand-800 text-white dark:bg-brass-400 dark:text-stone-950 shadow-xs font-bold scale-102 ring-1 ring-brass-500/30'
                    : 'bg-surface-alt text-text-secondary hover:text-text-primary border border-border font-medium'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          {/* The Poster Card Preview */}
          <div
            ref={cardRef}
            className={`relative rounded-2xl bg-gradient-to-br ${activeTheme.bg} p-6 sm:p-8 border ${activeTheme.border} shadow-xl transition-all duration-300 min-h-[220px] flex flex-col justify-between overflow-hidden`}
          >
            {/* Ambient Watermark Quill */}
            <Feather
              className={`absolute -right-6 -bottom-6 h-36 w-36 opacity-10 ${activeTheme.accent} pointer-events-none rotate-12`}
            />

            {/* Top Folio Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-serif text-[11px] font-black uppercase tracking-widest text-white/70 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brass-400" />
                VITA TALES ARCHIVE
              </span>
              <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${activeTheme.tagBg}`}>
                Primary Source
              </span>
            </div>

            {/* Main Quote Content */}
            <div className="my-5 space-y-3">
              <p className={`font-serif text-lg sm:text-xl font-bold leading-relaxed italic ${activeTheme.quoteColor}`}>
                “{quote}”
              </p>
            </div>

            {/* Bottom Byline */}
            <div className="border-t border-white/10 pt-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-white/50 block">
                  Documented In
                </span>
                <span className={`text-xs font-bold font-sans line-clamp-1 ${activeTheme.quoteColor}`}>
                  {sourceTitle}
                </span>
              </div>
              <span className={`font-mono text-[10px] ${activeTheme.accent}`}>
                vitatales.org
              </span>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleCopyCard}
              disabled={isExporting}
              className="flex items-center gap-2 rounded-xl bg-brand-800 hover:bg-brand-900 text-white dark:bg-brass-400 dark:hover:bg-brass-300 dark:text-stone-950 px-4 py-2.5 text-xs font-bold shadow-md transition-all active:scale-98"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? 'Copied Card!' : 'Copy Formatted Card'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
