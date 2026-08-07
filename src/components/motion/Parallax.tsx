"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

interface ParallaxProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  scaleRange?: [number, number];
  fade?: boolean;
}

export function Parallax({
  children,
  className,
  speed = 0.15,
  scaleRange,
  fade = false,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  const y = useTransform(smooth, [0, 1], [`${speed * 100}%`, `${-speed * 100}%`]);
  const scale = useTransform(smooth, [0, 0.5, 1], scaleRange ? [scaleRange[0], scaleRange[1], scaleRange[0]] : [1, 1, 1]);
  const opacity = useTransform(smooth, [0, 0.25, 0.75, 1], fade ? [0.35, 1, 1, 0.35] : [1, 1, 1, 1]);

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div ref={ref} className={className} style={{ y, scale, opacity }}>
      {children}
    </motion.div>
  );
}
