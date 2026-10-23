'use client';

import { useState, useEffect, useRef } from 'react';
import { Copy, Share2, BookmarkCheck, Check, Feather, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { sound } from '@/lib/sounds';
import QuotePosterModal from './QuotePosterModal';

interface QuoteClipperProps {
  title: string;
  author?: string | null;
}

interface ClipperPosition {
  x: number;
  y: number;
}

export default function QuoteClipper({ title, author = 'Vita Tales' }: QuoteClipperProps) {
  const [selectedText, setSelectedText] = useState('');
  const [position, setPosition] = useState<ClipperPosition | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [activeQuoteForStudio, setActiveQuoteForStudio] = useState('');
  const clipperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        if (!isStudioOpen) {
          setPosition(null);
          setSelectedText('');
        }
        return;
      }

      const text = selection.toString().trim();
      if (text.length < 10) {
        if (!isStudioOpen) {
          setPosition(null);
          setSelectedText('');
        }
        return;
      }

      // Check if selection is inside article content
      const range = selection.getRangeAt(0);
      const articleEl = document.querySelector('.article-content');
      if (!articleEl || !articleEl.contains(range.commonAncestorContainer)) {
        if (!isStudioOpen) {
          setPosition(null);
        }
        return;
      }

      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        if (!isStudioOpen) {
          setPosition(null);
        }
        return;
      }

      setSelectedText(text);

      // Clamp X position within viewport so pill never gets clipped on mobile screens
      const windowWidth = window.innerWidth;
      const rawX = rect.left + rect.width / 2;
      const clampedX = Math.max(145, Math.min(rawX, windowWidth - 145));

      setPosition({
        x: clampedX,
        y: Math.max(60, rect.top + window.scrollY - 12),
      });
    };

    document.addEventListener('mouseup', handleSelectionChange);
    document.addEventListener('touchend', handleSelectionChange);
    document.addEventListener('keyup', handleSelectionChange);

    return () => {
      document.removeEventListener('mouseup', handleSelectionChange);
      document.removeEventListener('touchend', handleSelectionChange);
      document.removeEventListener('keyup', handleSelectionChange);
    };
  }, [isStudioOpen]);

  const handleCopyQuote = async () => {
    sound.playClick();
    const formatted = `“${selectedText}”\n— ${title} (${author || 'Vita Tales'})`;
    try {
      await navigator.clipboard.writeText(formatted);
      setIsCopied(true);
      toast.success('Quote clipped to clipboard', {
        description: `“${selectedText.slice(0, 45)}...”`,
      });
      setTimeout(() => {
        setIsCopied(false);
        setPosition(null);
        window.getSelection()?.removeAllRanges();
      }, 1200);
    } catch {
      toast.error('Could not copy quote');
    }
  };

  const handleSaveToNotebook = () => {
    sound.playBookmark();
    const existing = JSON.parse(localStorage.getItem('chronicle_notebook') || '[]');
    existing.unshift({
      id: Date.now(),
      text: selectedText,
      story: title,
      date: new Date().toLocaleDateString(),
    });
    localStorage.setItem('chronicle_notebook', JSON.stringify(existing.slice(0, 50)));
    toast.success('Archived to your Personal Notebook', {
      description: 'Quote saved in local browser notebook',
    });
    setPosition(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleShareOnX = () => {
    sound.playClick();
    const tweetText = `“${selectedText.slice(0, 200)}”\n\n— On ${title}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setPosition(null);
  };

  const handleOpenStudio = () => {
    sound.playClick();
    setActiveQuoteForStudio(selectedText);
    setIsStudioOpen(true);
    setPosition(null);
  };

  return (
    <>
      {position && selectedText && (
        <div
          ref={clipperRef}
          style={{
            position: 'absolute',
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
          className="z-50 flex items-center gap-1 rounded-xl border border-brass-500/50 bg-[#16251b] px-2 py-1.5 shadow-2xl text-white backdrop-blur-md animate-fade-in max-w-[94vw]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="hidden xs:flex items-center gap-1 pl-1 pr-1.5 border-r border-white/10 text-brass-400">
            <Feather className="h-3.5 w-3.5" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Clip</span>
          </div>

          <button
            type="button"
            onClick={handleCopyQuote}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-white hover:bg-white/10 transition-colors"
            title="Copy formatted quote"
          >
            {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{isCopied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenStudio}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brass-300 hover:bg-brass-500/20 transition-colors border border-brass-500/30"
            title="Generate artistic poster card"
          >
            <Palette className="h-3.5 w-3.5" />
            <span>Studio</span>
          </button>

          <button
            type="button"
            onClick={handleSaveToNotebook}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-white hover:bg-white/10 transition-colors"
            title="Save to your private notebook"
          >
            <BookmarkCheck className="h-3.5 w-3.5 text-brass-400" />
            <span className="hidden sm:inline">Notebook</span>
          </button>

          <button
            type="button"
            onClick={handleShareOnX}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-white hover:bg-white/10 transition-colors"
            title="Share quote to X"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      )}

      {/* Quote Poster Studio Modal */}
      <QuotePosterModal
        quote={activeQuoteForStudio}
        sourceTitle={title}
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
      />
    </>
  );
}
