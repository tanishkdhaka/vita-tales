import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Vita Tales — The Biography Journal',
  description:
    'Vita Tales is an independent publishing platform dedicated to in-depth, human-first biographical narratives of human achievement, history, and resilience.',
};

export default function AboutPage() {
  return (
    <article className="py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-reading px-4 sm:px-6 space-y-12">
        {/* Header */}
        <header className="border-b border-border pb-8">
          <span className="text-xs uppercase tracking-widest text-brand-700 dark:text-brass-400 font-sans font-bold">
            Our Purpose
          </span>
          <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-black tracking-tight text-text-primary leading-tight">
            About Vita Tales
          </h1>
          <p className="mt-4 font-serif text-lg sm:text-xl text-text-secondary italic leading-relaxed">
            Where extraordinary lives become timeless stories.
          </p>
        </header>

        {/* Mission Body */}
        <div className="article-content space-y-6">
          <p>
            Founded on the premise that every transformative era is shaped by individuals of remarkable
            audacity and complex conviction, <strong>Vita Tales</strong> is an editorial publication committed to
            nuanced, long-form biography.
          </p>

          <p>
            In an era of fleeting soundbites and superficial summaries, we preserve the tradition of
            rigorous historical investigation. We trace the lineage of ideas, examine critical inflection
            points, and reconstruct the interior lives of pioneers across science, literature, politics,
            philosophy, and industry.
          </p>

          <h2>Editorial Principles</h2>
          <ul>
            <li>
              <strong>Primary-Source Rigor:</strong> We cross-reference letters, diaries, oral histories,
              and contemporary documentation to ground every narrative in verifiable historical truth.
            </li>
            <li>
              <strong>Psychological Depth:</strong> Rather than mere chronicles of events, we explore
              the motivations, dilemmas, and failures that defined our subjects’ trajectories.
            </li>
            <li>
              <strong>Literary Precision:</strong> We believe that truthful history deserves prose
              crafted with clarity, cadence, and enduring resonance.
            </li>
          </ul>

          <blockquote>
            “To know a person’s story is to understand the hidden architecture of human possibility.”
            <cite>— The Vita Tales Editorial Board</cite>
          </blockquote>

          <h2>Publishing Inquiries</h2>
          <p>
            We welcome correspondence from scholars, biographers, and writers. If you have research
            or unpublished perspectives relevant to our forthcoming portraits, please reach out to our editorial desk.
          </p>
        </div>

        {/* Back Link */}
        <div className="border-t border-border pt-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-800 dark:text-brass-400 hover:text-brand-950 dark:hover:text-brass-300 transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Back to All Biographies</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
