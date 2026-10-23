'use client';

import { Shield, Target, Flame, Award, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedCounter from './AnimatedCounter';
import { sound } from '@/lib/sounds';

interface ImpactMatrixProps {
  title: string;
  category?: string | null;
  author?: string | null;
}

interface ScoreMetric {
  label: string;
  score: number;
  description: string;
  icon: typeof Shield;
}

export default function ImpactMatrix({ title }: ImpactMatrixProps) {
  let archetype = 'The Relentless Groundbreaker';
  let resilience = 96;
  let intellect = 98;
  let audacity = 94;
  let motto = '“Patience in labor, audacity in discovery.”';

  if (title.toLowerCase().includes('curie')) {
    archetype = 'The Unyielding Pioneer';
    resilience = 99;
    intellect = 98;
    audacity = 96;
    motto = 'Conquered poverty, prejudice, and radioactivity to reshape modern physics.';
  } else if (title.toLowerCase().includes('johnson')) {
    archetype = 'The Celestial Calculator';
    resilience = 98;
    intellect = 99;
    audacity = 92;
    motto = 'Calculated the trajectories of Apollo with chalk, pencil, and unmatched precision.';
  } else if (title.toLowerCase().includes('nadella')) {
    archetype = 'The Empathetic Strategist';
    resilience = 92;
    intellect = 96;
    audacity = 91;
    motto = 'Revitalized an aging titan through empathy, cloud conviction, and cultural reset.';
  } else if (title.toLowerCase().includes('pichai')) {
    archetype = 'The Quiet Architect';
    resilience = 93;
    intellect = 95;
    audacity = 89;
    motto = 'From a modest two-room Chennai home to directing humanity’s search engine.';
  }

  const metrics: ScoreMetric[] = [
    {
      label: 'Resilience Under Adversity',
      score: resilience,
      description: 'Endurance against systemic barriers and professional exile',
      icon: Shield,
    },
    {
      label: 'Strategic Vision & Intellect',
      score: intellect,
      description: 'Originality of thought and long-range paradigm creation',
      icon: Target,
    },
    {
      label: 'Historical Audacity',
      score: audacity,
      description: 'Willingness to dismantle established orthodoxy',
      icon: Flame,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="my-8 sm:my-12 rounded-2xl sm:rounded-3xl border border-border bg-surface p-4 sm:p-8 shadow-md relative overflow-hidden transition-colors"
    >
      {/* Heritage corner accent */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-brass-400/20 via-brand-200/10 to-transparent pointer-events-none rounded-bl-full" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 border-b border-border pb-4 sm:pb-5 mb-5 sm:mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-widest text-brand-800 dark:text-brass-400">
            <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-brass-600" />
            <span>Archival Assessment Matrix</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-black tracking-tight text-text-primary mt-1">
            Character & Impact Profile
          </h3>
        </div>

        {/* Archetype Badge with Crimson Wax Accent */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="flex items-center gap-2.5 sm:gap-3 bg-surface-alt/60 sm:bg-transparent rounded-xl p-2.5 sm:p-0 border sm:border-0 border-border cursor-default"
        >
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full wax-seal text-brass-300 font-serif font-black shadow-md text-xs sm:text-sm border border-brass-400/40 relative">
            Ψ
            <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-brass-400 pointer-events-none" />
          </div>
          <div>
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-text-muted block">
              Archetype Classification
            </span>
            <span className="font-sans font-bold text-xs sm:text-sm text-text-primary dark:text-brass-300 block truncate">
              {archetype}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Metrics Row with Animated Counters and Spring Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-6 mb-5 sm:mb-6">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.5 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              onMouseEnter={() => sound.playClick()}
              className="group rounded-xl sm:rounded-2xl border border-border/80 bg-surface-alt/50 p-3.5 sm:p-4 space-y-2.5 transition-all hover:shadow-md hover:border-brass-500/40"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-text-primary">
                  <Icon className="h-3.5 w-3.5 text-brass-600 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold font-sans text-text-primary truncate">
                    {m.label}
                  </span>
                </div>
                <span className="font-mono text-xs sm:text-sm font-black text-text-primary dark:text-brass-300 shrink-0 flex items-center">
                  <AnimatedCounter from={0} to={m.score} />
                  <span className="text-text-muted font-normal text-[10px]">/100</span>
                </span>
              </div>

              {/* Progress bar with brass styling */}
              <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${m.score}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.2 + idx * 0.15, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-brand-700 via-brand-600 to-brass-500 rounded-full"
                />
              </div>

              <p className="text-[11px] text-text-secondary leading-snug">
                {m.description}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Editorial Epigraph */}
      <div className="rounded-xl border border-border/60 bg-surface-alt/30 p-3 sm:p-3.5 flex items-center gap-2.5 sm:gap-3">
        <Sparkles className="h-4 w-4 text-brass-600 shrink-0 animate-pulse" />
        <p className="text-xs italic text-text-secondary font-serif leading-relaxed">
          {motto}
        </p>
      </div>
    </motion.div>
  );
}
