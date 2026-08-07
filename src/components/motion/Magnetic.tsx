"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useRef, type ReactNode } from "react";

interface MagneticProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

export function Magnetic({ children, className, strength = 0.35 }: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(rawY, { stiffness: 220, damping: 18, mass: 0.4 });

  const handleMove = (event: React.MouseEvent<HTMLSpanElement>) => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    rawX.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    rawY.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const handleLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  const classes = ["magnetic", className].filter(Boolean).join(" ");

  if (reduced) {
    return <span className={classes}>{children}</span>;
  }

  return (
    <motion.span
      ref={ref}
      className={classes}
      style={{ x, y }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </motion.span>
  );
}
