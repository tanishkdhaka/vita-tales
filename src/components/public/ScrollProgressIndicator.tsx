'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sound } from '@/lib/sounds';

export default function ScrollProgressIndicator() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight <= 0) return;

      const scroll = `${totalScroll / windowHeight}`;
      const progress = Number(scroll);

      setScrollProgress(progress);
      setIsVisible(totalScroll > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    sound.playClick();
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const circumference = 2 * Math.PI * 18; // radius = 18
  const strokeDashoffset = circumference - scrollProgress * circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <button
            type="button"
            onClick={scrollToTop}
            className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-surface/90 text-text-primary shadow-xl backdrop-blur-md border border-border hover:border-brass-500/50 hover:shadow-2xl transition-all active:scale-95"
            title="Scroll to top"
            aria-label="Scroll back to top"
          >
            {/* SVG Circular Progress Ring */}
            <svg className="absolute inset-0 h-full w-full -rotate-90 transform" viewBox="0 0 44 44">
              <circle
                cx="22"
                cy="22"
                r="18"
                className="text-border"
                strokeWidth="2.5"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="22"
                cy="22"
                r="18"
                className="text-brass-500 transition-all duration-100 ease-out"
                strokeWidth="2.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            {/* Inner Arrow Icon */}
            <ArrowUp className="h-4 w-4 text-text-primary group-hover:text-brass-600 dark:group-hover:text-brass-400 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
