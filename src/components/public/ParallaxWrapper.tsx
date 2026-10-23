'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface ParallaxWrapperProps {
  children: ReactNode;
  className?: string;
}

export default function ParallaxWrapper({
  children,
  className = '',
}: ParallaxWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offsetY, setOffsetY] = useState<number>(0);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) return;

    // Fallback to static on mobile devices for smooth performance
    if (window.innerWidth < 768) return;

    let rafId: number | null = null;

    const onScroll = () => {
      if (rafId !== null) return;

      rafId = window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        // Subtle translation: capped at 40px, dampened rate
        const calculated = Math.min(Math.max(scrollY * 0.25, 0), 40);
        setOffsetY(calculated);
        rafId = null;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`hero-parallax relative h-full w-full ${className}`}
      style={{
        transform: offsetY > 0 ? `translate3d(0, ${offsetY}px, 0)` : undefined,
        willChange: offsetY > 0 ? 'transform' : 'auto',
      }}
    >
      {children}
    </div>
  );
}
