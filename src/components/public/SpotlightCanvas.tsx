'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function SpotlightCanvas() {
  const [mounted, setMounted] = useState(false);
  const mouseX = useMotionValue(-500);
  const mouseY = useMotionValue(-500);

  const springConfig = { damping: 25, stiffness: 200 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  if (!mounted) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden transition-opacity duration-500">
      {/* Primary Ambient Brass Spotlight */}
      <motion.div
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full opacity-35 dark:opacity-20 blur-[130px]"
        style={{
          left: smoothX,
          top: smoothY,
          width: '520px',
          height: '520px',
          background: 'radial-gradient(circle, rgba(197, 160, 89, 0.22) 0%, rgba(27, 51, 35, 0.12) 50%, transparent 75%)',
        }}
      />
    </div>
  );
}
