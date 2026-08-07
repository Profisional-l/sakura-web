"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState, type ElementType, type ReactNode } from "react";
import { EASE_SAKURA, REVEAL_OFFSETS, type RevealDirection } from "@/lib/motion";

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  distance?: number;
  /** @deprecated Ignored — CSS filter breaks backdrop-filter. */
  blur?: number;
  scale?: number;
  once?: boolean;
  amount?: number;
  className?: string;
  id?: string;
}

/**
 * Scroll reveal that sheds Motion transforms after finishing.
 * Leftover `transform` / `filter` on ancestors kills `backdrop-filter` glass on desktop Chrome.
 */
export function Reveal({
  children,
  as = "div",
  direction = "up",
  delay = 0,
  duration = 0.85,
  distance = 42,
  scale = 1,
  once = true,
  amount = 0.15,
  className,
  id,
}: RevealProps) {
  const reduced = useReducedMotion();
  const [settled, setSettled] = useState(false);
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;
  const offset = REVEAL_OFFSETS[direction];
  const Tag = as;

  if (reduced || settled) {
    return (
      <Tag className={className} id={id}>
        {children}
      </Tag>
    );
  }

  return (
    <MotionTag
      id={id}
      className={className}
      initial={{
        opacity: 0,
        x: offset.x * distance,
        y: offset.y * distance,
        scale,
      }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once, amount, margin: "100px 0px" }}
      transition={{ duration, delay, ease: EASE_SAKURA }}
      onAnimationComplete={() => setSettled(true)}
    >
      {children}
    </MotionTag>
  );
}
