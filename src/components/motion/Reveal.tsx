"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ElementType, ReactNode } from "react";
import { EASE_SAKURA, REVEAL_OFFSETS, type RevealDirection } from "@/lib/motion";

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  distance?: number;
  /** @deprecated Ignored — filter on wrappers kills Chrome backdrop-filter glass. */
  blur?: number;
  scale?: number;
  once?: boolean;
  amount?: number;
  className?: string;
  id?: string;
}

/**
 * Enter animation via transform only.
 * Never animate opacity/filter here: they create a Chrome "backdrop root"
 * and permanently break backdrop-filter on this node and its descendants.
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
  amount = 0.2,
  className,
  id,
}: RevealProps) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;
  const offset = REVEAL_OFFSETS[direction];

  if (reduced) {
    const Tag = as;
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
        x: offset.x * distance,
        y: offset.y * distance,
        scale,
      }}
      whileInView={{ x: 0, y: 0, scale: 1 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: EASE_SAKURA }}
    >
      {children}
    </MotionTag>
  );
}
