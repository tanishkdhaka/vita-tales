'use client';

import React, { useRef, useState, MouseEvent } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  glareEffect?: boolean;
  maxTilt?: number;
  perspective?: number;
}

export default function TiltCard({
  children,
  className = '',
  glareEffect = true,
  maxTilt = 10,
  perspective = 1000,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const springConfig = { damping: 20, stiffness: 300 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  const rotateX = useTransform(smoothY, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(smoothX, [0, 1], [-maxTilt, maxTilt]);

  // Glare position calculation
  const glareX = useTransform(smoothX, [0, 1], ['0%', '100%']);
  const glareY = useTransform(smoothY, [0, 1], ['0%', '100%']);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / rect.width;
    const mouseY = (e.clientY - rect.top) / rect.height;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <div
      style={{ perspective: `${perspective}px` }}
      className="relative will-change-transform"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className={`relative transition-shadow duration-300 ${className}`}
      >
        {children}

        {/* Dynamic Specular Glare / Light Reflection */}
        {glareEffect && isHovered && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-30 rounded-[inherit] overflow-hidden mix-blend-overlay transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle 320px at ${glareX.get()} ${glareY.get()}, rgba(255, 255, 255, 0.28), transparent 70%)`,
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
