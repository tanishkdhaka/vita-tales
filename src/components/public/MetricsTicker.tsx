'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import AnimatedCounter from './AnimatedCounter';
import { BookOpen, Compass, Clock, Milestone } from 'lucide-react';

const metrics = [
  {
    icon: BookOpen,
    value: 6,
    suffix: '+',
    label: 'Biographies Cataloged',
    description: 'Comprehensive long-form profiles',
    accent: '#c5a059',
  },
  {
    icon: Compass,
    value: 3,
    suffix: '',
    label: 'Disciplines Covered',
    description: 'Science, Technology & Letters',
    accent: '#1b3323',
  },
  {
    icon: Clock,
    value: 15,
    suffix: ' min',
    label: 'Average Immersion',
    description: 'Unhurried biographical narratives',
    accent: '#7e1e2d',
  },
  {
    icon: Milestone,
    value: 150,
    suffix: '+ yrs',
    label: 'Historical Scope',
    description: 'From 19th-century pioneers to today',
    accent: '#c5a059',
  },
];

export default function MetricsTicker() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((m, i) => {
        const Icon = m.icon;
        return (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="group relative p-5 rounded-2xl border border-border bg-surface-alt/40 text-center overflow-hidden transition-all duration-300 hover:shadow-md hover:border-brass-500/40"
          >
            {/* Subtle hover glow */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
              style={{ background: `radial-gradient(ellipse at center, ${m.accent}08, transparent 70%)` }}
            />

            <div className="relative space-y-2">
              <div
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg mx-auto mb-1 text-brand-800 dark:text-brass-400 bg-brass-500/10"
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-text-primary flex items-center justify-center">
                <AnimatedCounter from={0} to={m.value} suffix={m.suffix || ''} />
              </div>
              <div className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">
                {m.label}
              </div>
              <div className="text-[10px] text-text-secondary">
                {m.description}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
