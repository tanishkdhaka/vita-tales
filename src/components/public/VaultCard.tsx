'use client';

import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useRef, useState } from 'react';

interface VaultCardProps {
  href: string;
  icon: React.ReactNode;
  folioNumber: string;
  title: string;
  description: string;
  accentColor: string;
  bgColor: string;
  borderHoverColor: string;
  ctaColor: string;
}

export default function VaultCard({
  href,
  icon,
  folioNumber,
  title,
  description,
  accentColor,
  bgColor,
  borderHoverColor,
  ctaColor,
}: VaultCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 200, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 200, damping: 20 });

  const rotateX = useTransform(springY, [-0.5, 0.5], ['8deg', '-8deg']);
  const rotateY = useTransform(springX, [-0.5, 0.5], ['-8deg', '8deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 24 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={href}
        className="group relative flex flex-col justify-between p-6 rounded-2xl border border-border bg-surface h-full overflow-hidden transition-all duration-300 shadow-xs hover:shadow-md"
        style={{
          background: `linear-gradient(145deg, ${bgColor}15, transparent)`,
        }}
      >
        {/* Hover glow background */}
        <motion.div
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 30% 30%, ${bgColor}20, transparent 70%)`,
            boxShadow: isHovered ? `0 8px 32px ${bgColor}20, inset 0 0 0 1px ${borderHoverColor}` : 'none',
          }}
        />

        <div className="relative space-y-4">
          {/* Icon + Folio Number */}
          <div className="flex items-start justify-between">
            <motion.span
              animate={{ scale: isHovered ? 1.08 : 1 }}
              transition={{ duration: 0.3 }}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10"
              style={{ background: bgColor, color: '#f0dcab' }}
            >
              {icon}
            </motion.span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">
              {folioNumber}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-serif text-xl font-bold text-text-primary transition-colors duration-200 group-hover:text-brass-600 dark:group-hover:text-brass-400">
            {title}
          </h3>

          {/* Description */}
          <p className="text-xs text-text-secondary leading-relaxed">
            {description}
          </p>
        </div>

        {/* CTA Footer */}
        <div className="relative pt-4 mt-4 flex items-center justify-between border-t border-border/60 text-xs font-semibold text-text-primary group-hover:text-brass-600 dark:group-hover:text-brass-400 transition-colors">
          <span>Inspect Folio</span>
          <motion.span
            animate={{ x: isHovered ? 4 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowRight className="h-3.5 w-3.5 text-brass-500" />
          </motion.span>
        </div>
      </Link>
    </motion.div>
  );
}
