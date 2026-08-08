"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

interface ParallaxProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  scaleRange?: [number, number];
}

export function Parallax({
  children,
  className,
  speed = 0.15,
  scaleRange,
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
  const scale = useTransform(
    smooth,
    [0, 0.5, 1],
    scaleRange ? [scaleRange[0], scaleRange[1], scaleRange[0]] : [1, 1, 1]
  );

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div ref={ref} className={className} style={{ y, scale }}>
      {children}
    </motion.div>
  );
}
