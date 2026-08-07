"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ElementType, ReactNode } from "react";
import { EASE_SAKURA } from "@/lib/motion";

interface StaggerProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  stagger?: number;
  delay?: number;
  once?: boolean;
  amount?: number;
}

export function Stagger({
  children,
  as = "div",
  className,
  stagger = 0.09,
  delay = 0,
  once = true,
  amount = 0.15,
}: StaggerProps) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  if (reduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const container: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };

  return (
    <MotionTag
      className={className}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
    >
      {children}
    </MotionTag>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  distance?: number;
  duration?: number;
}

export function StaggerItem({
  children,
  as = "div",
  className,
  distance = 34,
  duration = 0.7,
}: StaggerItemProps) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  if (reduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const item: Variants = {
    hidden: { opacity: 0, y: distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration, ease: EASE_SAKURA },
    },
  };

  return (
    <MotionTag className={className} variants={item}>
      {children}
    </MotionTag>
  );
}
