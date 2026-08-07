"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ElementType } from "react";
import { EASE_SAKURA } from "@/lib/motion";

interface RevealTextProps {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
  amount?: number;
}

export function RevealText({
  text,
  as = "h2",
  className,
  delay = 0,
  stagger = 0.035,
  once = true,
  amount = 0.35,
}: RevealTextProps) {
  const reduced = useReducedMotion();
  const Tag = as;
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  if (reduced) {
    return <Tag className={className}>{text}</Tag>;
  }

  const container: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };

  const word: Variants = {
    hidden: { y: "110%", opacity: 0 },
    visible: {
      y: "0%",
      opacity: 1,
      transition: { duration: 0.75, ease: EASE_SAKURA },
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
      {text.split(" ").map((chunk, index) => (
        <span key={`${chunk}-${index}`} className="reveal-word">
          <motion.span className="reveal-word-inner" variants={word}>
            {chunk}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
