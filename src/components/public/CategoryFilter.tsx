'use client';

import { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import type { Article } from '@/types';
import ArticleCard from './ArticleCard';
import { BookOpen } from 'lucide-react';

interface CategoryFilterProps {
  articles: Article[];
  categories: string[];
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.25 },
  },
};

export default function CategoryFilter({ articles, categories }: CategoryFilterProps) {
  const [active, setActive] = useState<string>('All');

  const allTabs = ['All', ...categories];

  const filtered = active === 'All'
    ? articles
    : articles.filter((a) => (a.category || '').toLowerCase() === active.toLowerCase());

  return (
    <div className="space-y-6">
      {/* Filter tab bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {allTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`relative shrink-0 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 ${
              active === tab
                ? 'text-white dark:text-stone-950 font-extrabold'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-alt/60'
            }`}
          >
            {active === tab && (
              <motion.span
                layoutId="filter-pill"
                className="absolute inset-0 rounded-full bg-brand-800 dark:bg-brass-400 border border-brass-500/30 shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab}</span>
          </button>
        ))}
        <span className="ml-auto shrink-0 text-xs text-text-muted font-medium">
          {filtered.length} {filtered.length === 1 ? 'story' : 'stories'}
        </span>
      </div>

      {/* Article Grid with AnimatePresence */}
      {filtered.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((article) => (
              <motion.div
                key={article.id}
                variants={cardVariants}
                layout
                exit="exit"
              >
                <ArticleCard article={article} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-14 text-center bg-surface-alt/40">
          <BookOpen className="mx-auto h-8 w-8 text-brass-600 dark:text-brass-400 mb-3" />
          <h3 className="font-serif text-xl font-bold text-text-primary">No stories in this vault yet</h3>
          <p className="mt-2 text-sm text-text-secondary max-w-sm mx-auto">
            New biographical narratives from this domain will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
