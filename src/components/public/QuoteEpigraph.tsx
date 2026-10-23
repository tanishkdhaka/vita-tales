'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Quote } from 'lucide-react';

export default function QuoteEpigraph() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-2xl border border-border bg-surface-alt/40 p-8 sm:p-12 overflow-hidden"
    >
      {/* Decorative large quote mark */}
      <div
        className="absolute right-6 top-4 font-serif text-[120px] leading-none text-brand-800/5 select-none pointer-events-none"
        aria-hidden
      >
        &ldquo;
      </div>

      {/* Animated horizontal rule */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="h-[1px] mb-8 origin-left"
        style={{ background: 'linear-gradient(to right, #c5a059, transparent)' }}
      />

      <div className="max-w-3xl mx-auto text-center space-y-4">
        <Quote className="h-7 w-7 text-brass-500 mx-auto opacity-80" />
        <blockquote className="font-serif text-xl sm:text-2xl lg:text-3xl italic text-text-primary leading-relaxed">
          &ldquo;There is properly no history; only biography.&rdquo;
        </blockquote>
        <cite className="font-sans text-xs uppercase tracking-widest text-brass-700 dark:text-brass-400 font-bold block not-italic">
          — Ralph Waldo Emerson · On History &amp; Character
        </cite>
      </div>

      {/* Animated bottom rule */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="h-[1px] mt-8 origin-right"
        style={{ background: 'linear-gradient(to left, #c5a059, transparent)' }}
      />
    </motion.section>
  );
}
