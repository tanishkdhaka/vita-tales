'use client';

import { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { sound } from '@/lib/sounds';

interface ReadingProgressProps {
  targetId?: string;
}

function subscribeReducedMotion(callback: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export default function ReadingProgress({
  targetId = 'article-body-wrapper',
}: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const celebrationTriggered = useRef(false);

  const isReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  useEffect(() => {
    let rafId: number | null = null;

    const calculateProgress = () => {
      const target =
        document.getElementById(targetId) ||
        document.querySelector('article') ||
        document.documentElement;

      if (!target) return;

      const rect = target.getBoundingClientRect();
      const elementTop = rect.top + window.scrollY;
      const elementHeight = rect.height;
      const windowHeight = window.innerHeight;
      const currentScroll = window.scrollY;

      const start = elementTop;
      const totalDistance = elementHeight - windowHeight;

      if (totalDistance <= 0) {
        setProgress(100);
        return;
      }

      const scrolled = currentScroll - start;
      const percentage = Math.min(Math.max((scrolled / totalDistance) * 100, 0), 100);

      setProgress(percentage);

      // Trigger celebration on completing the article
      if (percentage >= 92 && !celebrationTriggered.current) {
        celebrationTriggered.current = true;
        sound.playCelebration();
        if (!isReducedMotion) {
          confetti({
            particleCount: 50,
            spread: 65,
            origin: { y: 0.85 },
            colors: ['#c5a059', '#1b3323', '#7e1e2d', '#f7f4ed'],
            disableForReducedMotion: true,
          });
        }
        toast('Story completed!', {
          description: 'Thank you for reading this archival biography.',
        });
      }
    };

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        calculateProgress();
        rafId = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    calculateProgress();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [targetId, isReducedMotion]);

  if (isReducedMotion && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-1 bg-border/40 pointer-events-none transition-all duration-150"
      aria-hidden="true"
    >
      <div
        className="h-full bg-linear-to-r from-brand-600 via-brand-500 to-amber-600 transition-all duration-150 ease-out shadow-[0_0_8px_rgba(180,141,96,0.5)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
