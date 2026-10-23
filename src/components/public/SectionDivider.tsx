'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface SectionDividerProps {
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  accent?: 'brass' | 'forest' | 'crimson';
}

const accentClasses = {
  brass: 'text-brass-700 dark:text-brass-300',
  forest: 'text-brand-800 dark:text-emerald-400',
  crimson: 'text-crimson-600 dark:text-rose-400',
};

const barColors = {
  brass: '#c5a059',
  forest: '#10b981',
  crimson: '#e11d48',
};

export default function SectionDivider({ label, sublabel, icon, accent = 'brass' }: SectionDividerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <div ref={ref} className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-border pb-4 gap-2">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-0.5"
      >
        <div className="flex items-center gap-2">
          {icon && <span className={accentClasses[accent]}>{icon}</span>}
          <span className={`text-xs uppercase tracking-widest font-bold font-sans ${accentClasses[accent]}`}>
            {label}
          </span>
        </div>
        {sublabel && (
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            {sublabel}
          </h2>
        )}
      </motion.div>
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="hidden sm:block h-[2px] flex-1 mx-6 origin-left"
        style={{ background: `linear-gradient(to right, ${barColors[accent]}40, transparent)` }}
      />
    </div>
  );
}
