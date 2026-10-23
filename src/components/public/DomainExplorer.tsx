'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Atom,
  Cpu,
  Scroll,
  Compass,
  ArrowRight,
  Feather,
  BookOpen,
  Briefcase,
  Trophy,
  Film,
  Clapperboard,
  Landmark,
  Globe,
  Sparkles,
} from 'lucide-react';
import type { Article } from '@/types';

interface DomainExplorerProps {
  categories: string[];
  articles: Article[];
}

interface DomainConfig {
  icon: React.ReactNode;
  description: string;
  accentBg: string;
  iconBg: string;
  iconColor: string;
  borderHover: string;
}

function getDomainConfig(category: string): DomainConfig {
  const cat = category.toLowerCase();

  if (cat.includes('entrepreneur') || cat.includes('innovat') || cat.includes('business')) {
    return {
      icon: <Briefcase className="h-5 w-5" />,
      description: 'Visionary founders and risk-takers who defied odds to build industry-defining enterprises and disrupt modern markets.',
      accentBg: '#1b3323',
      iconBg: '#1b3323',
      iconColor: '#f0dcab',
      borderHover: 'rgba(27, 51, 35, 0.4)',
    };
  }

  if (cat.includes('sport') || cat.includes('athlet')) {
    return {
      icon: <Trophy className="h-5 w-5" />,
      description: 'Elite athletes whose relentless physical discipline, grit, and mental toughness conquered world stages and broke records.',
      accentBg: '#854d0e',
      iconBg: '#854d0e',
      iconColor: '#fef08a',
      borderHover: 'rgba(133, 77, 14, 0.4)',
    };
  }

  if (cat.includes('actress')) {
    return {
      icon: <Clapperboard className="h-5 w-5" />,
      description: 'Trailblazing artists and leading performers who shattered conventions and elevated storytelling across global cinema.',
      accentBg: '#581c87',
      iconBg: '#581c87',
      iconColor: '#f5d0fe',
      borderHover: 'rgba(88, 28, 135, 0.4)',
    };
  }

  if (cat.includes('actor') || cat.includes('entertain')) {
    return {
      icon: <Film className="h-5 w-5" />,
      description: 'Powerhouse screen and theatre performers whose craft brought unforgettable characters and cinematic narratives to life.',
      accentBg: '#7e1e2d',
      iconBg: '#7e1e2d',
      iconColor: '#fecdd3',
      borderHover: 'rgba(126, 30, 45, 0.4)',
    };
  }

  if (cat.includes('scien') || cat.includes('physics') || cat.includes('biolog')) {
    return {
      icon: <Atom className="h-5 w-5" />,
      description: 'Medical researchers, virologists, and empirical pioneers expanding the boundaries of human knowledge and health.',
      accentBg: '#064e3b',
      iconBg: '#064e3b',
      iconColor: '#a7f3d0',
      borderHover: 'rgba(6, 78, 59, 0.4)',
    };
  }

  if (cat.includes('author') || cat.includes('lit') || cat.includes('write')) {
    return {
      icon: <Feather className="h-5 w-5" />,
      description: 'Storytellers, novelists, and poetic voices whose prose illuminated society and shaped contemporary literature.',
      accentBg: '#451a03',
      iconBg: '#451a03',
      iconColor: '#fed7aa',
      borderHover: 'rgba(69, 26, 3, 0.4)',
    };
  }

  if (cat.includes('polit')) {
    return {
      icon: <Landmark className="h-5 w-5" />,
      description: 'Elected representatives and political catalysts who navigated historic grassroots struggles, governance, and public life.',
      accentBg: '#1e3a8a',
      iconBg: '#1e3a8a',
      iconColor: '#bfdbfe',
      borderHover: 'rgba(30, 58, 138, 0.4)',
    };
  }

  if (cat.includes('social') || cat.includes('influenc')) {
    return {
      icon: <Globe className="h-5 w-5" />,
      description: 'Next-generation digital creators and cultural trendsetters defining modern media, fashion, and digital communities.',
      accentBg: '#c2410c',
      iconBg: '#c2410c',
      iconColor: '#ffedd5',
      borderHover: 'rgba(194, 65, 12, 0.4)',
    };
  }

  return {
    icon: <Compass className="h-5 w-5" />,
    description: 'Transformative lives, leadership through conviction, and enduring blueprints of human endeavor.',
    accentBg: '#1b3323',
    iconBg: '#1b3323',
    iconColor: '#f0dcab',
    borderHover: 'rgba(197, 160, 89, 0.4)',
  };
}

export default function DomainExplorer({ categories, articles }: DomainExplorerProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
      {categories.map((cat, idx) => {
        const config = getDomainConfig(cat);
        const count = articles.filter(
          (a) => (a.category || '').toLowerCase() === cat.toLowerCase()
        ).length;

        return (
          <motion.div
            key={cat}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href={`/category/${encodeURIComponent(cat.toLowerCase())}`}
              className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl border border-border bg-surface h-full overflow-hidden transition-all duration-300 shadow-xs hover:shadow-xl hover:border-brass-500/40"
              style={{
                background: `linear-gradient(145deg, ${config.accentBg}12, transparent)`,
              }}
            >
              {/* Top ambient hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                style={{
                  background: `radial-gradient(ellipse at 25% 25%, ${config.accentBg}18, transparent 70%)`,
                }}
              />

              <div className="relative space-y-4">
                {/* Domain Icon & Count Badge */}
                <div className="flex items-start justify-between">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 shadow-sm transition-transform duration-300 group-hover:scale-105"
                    style={{ background: config.iconBg, color: config.iconColor }}
                  >
                    {config.icon}
                  </span>
                  <span className="text-[11px] font-semibold text-text-muted px-2.5 py-1 rounded-full bg-surface-alt/80 border border-border/80">
                    {count} {count === 1 ? 'biography' : 'biographies'}
                  </span>
                </div>

                {/* Category Title */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block">
                    Domain Folio
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-text-primary transition-colors group-hover:text-brass-600 dark:group-hover:text-brass-400 mt-0.5">
                    {cat}
                  </h3>
                </div>

                {/* Narrative Premise */}
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-sans">
                  {config.description}
                </p>
              </div>

              {/* Action Footer */}
              <div className="relative pt-4 mt-5 flex items-center justify-between border-t border-border/70 text-xs font-semibold text-text-primary group-hover:text-brass-600 dark:group-hover:text-brass-400 transition-colors">
                <span>Browse {cat}</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1.5 transition-transform text-brass-600 dark:text-brass-400" />
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
