'use client';

import { useState } from 'react';
import { Milestone, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sound } from '@/lib/sounds';

interface MilestoneItem {
  year: string;
  age?: string;
  title: string;
  description: string;
  significance?: 'crucible' | 'breakthrough' | 'zenith' | 'legacy';
}

interface LifelineTimelineProps {
  title: string;
  slug: string;
}

export default function LifelineTimeline({ title, slug }: LifelineTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  let milestones: MilestoneItem[] = [];

  if (slug.includes('curie') || title.toLowerCase().includes('curie')) {
    milestones = [
      {
        year: '1867',
        age: 'Age 0',
        title: 'Partitioned Warsaw',
        description: 'Born in Russian-occupied Poland; denied higher university access due to imperial bans on women.',
        significance: 'crucible',
      },
      {
        year: '1885',
        age: 'Age 18',
        title: 'Flying University & Sister Pact',
        description: 'Studied clandestinely at night while laboring 5 years as a governess to fund sister’s Sorbonne medical degree.',
        significance: 'crucible',
      },
      {
        year: '1891',
        age: 'Age 24',
        title: 'The Parisian Garret',
        description: 'Arrives in Paris; tops physics and mathematical licentiates living on bread, radishes, and tea.',
        significance: 'crucible',
      },
      {
        year: '1898',
        age: 'Age 31',
        title: 'Isolation of Radium',
        description: 'Boils metric tons of pitchblende in a drafty dissection shed with Pierre Curie to discover polonium and radium.',
        significance: 'breakthrough',
      },
      {
        year: '1903',
        age: 'Age 36',
        title: 'First Nobel Prize in Physics',
        description: 'First woman in history awarded the Nobel Prize for pioneering investigations into spontaneous radiation.',
        significance: 'zenith',
      },
      {
        year: '1911',
        age: 'Age 44',
        title: 'Second Nobel Prize in Chemistry',
        description: 'Wins solo Nobel Prize for isolating pure metallic radium; only scientist honored across two distinct disciplines.',
        significance: 'zenith',
      },
      {
        year: '1914',
        age: 'Age 47',
        title: 'Petite Curies on Western Front',
        description: 'Engineers 20 mobile X-ray ambulances and 200 radiological posts, personally screening wounded soldiers.',
        significance: 'legacy',
      },
    ];
  } else if (slug.includes('nadella') || title.toLowerCase().includes('nadella')) {
    milestones = [
      {
        year: '1967',
        age: 'Age 0',
        title: 'Born in Hyderabad, India',
        description: 'Developed an early obsession with cricket and Russian poetry, shaping his collaborative philosophy.',
        significance: 'crucible',
      },
      {
        year: '1992',
        age: 'Age 25',
        title: 'Joining Microsoft',
        description: 'Commuted every weekend between Seattle and University of Chicago to complete his MBA while engineering.',
        significance: 'crucible',
      },
      {
        year: '2011',
        age: 'Age 44',
        title: 'Building Cloud & Enterprise',
        description: 'Orchestrated Microsoft’s pivot to cloud computing, scaling Azure from infancy into a global infrastructure.',
        significance: 'breakthrough',
      },
      {
        year: '2014',
        age: 'Age 47',
        title: 'Appointed CEO & Culture Reset',
        description: 'Eliminated dogmatic internal rivalry in favor of a "learn-it-all" growth mindset and cross-platform embrace.',
        significance: 'zenith',
      },
      {
        year: '2019–Present',
        age: 'Age 52+',
        title: 'AI Paradigm & Trillion Dollar Renaissance',
        description: 'Decisive early partnership with OpenAI propels Microsoft into one of history’s most valuable enterprises.',
        significance: 'legacy',
      },
    ];
  } else if (slug.includes('johnson') || title.toLowerCase().includes('johnson')) {
    milestones = [
      {
        year: '1918',
        age: 'Age 0',
        title: 'White Sulphur Springs, WV',
        description: 'Showed prodigious mathematical fascination early, counting everything from steps to stars.',
        significance: 'crucible',
      },
      {
        year: '1953',
        age: 'Age 35',
        title: 'West Area Computing Unit',
        description: 'Joined NACA Langley Memorial Aeronautical Laboratory amidst systemic segregation.',
        significance: 'crucible',
      },
      {
        year: '1962',
        age: 'Age 44',
        title: 'Friendship 7 Orbit Verification',
        description: 'Astronaut John Glenn personally insisted that Katherine verify the electronic computer trajectories before launch.',
        significance: 'breakthrough',
      },
      {
        year: '1969',
        age: 'Age 51',
        title: 'Apollo 11 Moon Landing',
        description: 'Calculated launch windows and backup flight charts guaranteeing the safe lunar journey of Armstrong, Aldrin, and Collins.',
        significance: 'zenith',
      },
      {
        year: '2015',
        age: 'Age 97',
        title: 'Presidential Medal of Freedom',
        description: 'Awarded America’s highest civilian honor by President Barack Obama for pioneering space exploration mathematics.',
        significance: 'legacy',
      },
    ];
  } else {
    milestones = [
      {
        year: 'Phase I',
        age: 'Origins',
        title: 'The Crucible & Early Resistance',
        description: 'The defining early adversity, mentors, and challenges that forged their inner determination.',
        significance: 'crucible',
      },
      {
        year: 'Phase II',
        age: 'Inflection',
        title: 'The Breakthrough Moment',
        description: 'The critical turning point where preparation met audacious historical opportunity.',
        significance: 'breakthrough',
      },
      {
        year: 'Phase III',
        age: 'Zenith',
        title: 'Mastery & Proof of Concept',
        description: 'Achieving world-class impact and demonstrating testable domain mastery.',
        significance: 'zenith',
      },
      {
        year: 'Phase IV',
        age: 'Legacy',
        title: 'Enduring Paradigm Imprint',
        description: 'The ideas, frameworks, and institutional transformations left for humanity.',
        significance: 'legacy',
      },
    ];
  }

  const getBadgeStyle = (sig?: string) => {
    switch (sig) {
      case 'crucible':
        return 'border-border bg-surface-alt text-text-secondary';
      case 'breakthrough':
        return 'border-emerald-300 bg-emerald-100/70 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300';
      case 'zenith':
        return 'border-brass-500/40 bg-brass-500/15 text-stone-950 dark:text-brass-200 dark:bg-brass-500/20 dark:border-brass-500/40 font-bold';
      case 'legacy':
        return 'border-crimson-500/40 bg-crimson-500/10 text-crimson-700 dark:border-crimson-600/50 dark:bg-crimson-950/40 dark:text-rose-300 font-bold';
      default:
        return 'border-border bg-surface-alt text-text-secondary';
    }
  };

  const handleToggle = () => {
    sound.playClick();
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="my-8 sm:my-12 rounded-2xl sm:rounded-3xl border border-border bg-surface p-4 sm:p-8 shadow-xs transition-colors"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3.5 sm:pb-4 mb-5 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-brand-800 text-brass-300 dark:bg-brass-500/20 dark:text-brass-300 shadow-xs shrink-0 border border-brass-500/30">
            <Milestone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </span>
          <div>
            <h3 className="font-serif text-lg sm:text-2xl font-bold tracking-tight text-text-primary">
              Lifeline Chronology
            </h3>
            <span className="text-[11px] sm:text-xs text-text-muted">
              Pivotal inflection points and turning-point ages
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          className="flex items-center gap-1 rounded-lg px-2 sm:px-2.5 py-1 text-xs text-text-muted hover:text-text-primary hover:bg-surface-alt transition-colors shrink-0"
        >
          <span className="hidden sm:inline">{isExpanded ? 'Collapse' : 'Expand'}</span>
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Timeline Steps - responsive left border & node positioning */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="relative pl-5 sm:pl-8 border-l-2 border-brass-500/40 space-y-6 sm:space-y-7 my-4 ml-4 sm:ml-5">
              {milestones.map((item, idx) => (
                <motion.div
                  key={`${item.year}-${idx}`}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className="relative group"
                  onMouseEnter={() => sound.playPageTurn()}
                >
                  {/* Timeline Brass Node - positioned with pixel accuracy */}
                  <div className="absolute -left-[27px] sm:-left-[39px] top-1 flex h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 items-center justify-center rounded-full bg-surface border-2 border-brass-600 dark:border-brass-400 ring-4 ring-surface group-hover:border-brass-500 group-hover:scale-125 transition-all">
                    <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-brass-500" />
                  </div>

                  {/* Milestone Box */}
                  <div className="space-y-1 sm:space-y-1.5">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="font-serif font-black text-xs sm:text-base text-text-primary dark:text-brass-300">
                        {item.year}
                      </span>
                      {item.age && (
                        <span className={`inline-flex items-center rounded-md border px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] uppercase font-semibold ${getBadgeStyle(item.significance)}`}>
                          {item.age}
                        </span>
                      )}
                      <h4 className="font-sans font-bold text-xs sm:text-base text-text-primary group-hover:text-brass-600 dark:group-hover:text-brass-400 transition-colors">
                        {item.title}
                      </h4>
                    </div>

                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-sans">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
