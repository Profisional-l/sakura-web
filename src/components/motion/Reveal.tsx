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
  blur?: number;
  scale?: number;
  once?: boolean;
  amount?: number;
  className?: string;
  id?: string;
}

export function Reveal({
  children,
  as = "div",
  direction = "up",
  delay = 0,
  duration = 0.85,
  distance = 42,
  blur = 10,
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
        opacity: 0,
        x: offset.x * distance,
        y: offset.y * distance,
        filter: `blur(${blur}px)`,
        scale,
      }}
      whileInView={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)", scale: 1 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: EASE_SAKURA }}
    >
      {children}
    </MotionTag>
  );
}
