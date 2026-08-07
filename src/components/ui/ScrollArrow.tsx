"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_SAKURA } from "@/lib/motion";

interface ScrollArrowProps {
  text: string;
  className?: string;
  fast?: boolean;
}

export function ScrollArrow({ text, className = "", fast = false }: ScrollArrowProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={`scroll-arrow-cont ${fast ? "scroll-arrow-fast" : ""} ${className}`}
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: EASE_SAKURA, delay: fast ? 1 : 2.4 }}
    >
      <p className="scroll-arrow-text">{text}</p>
      <span className="down-arrow-wrap" aria-hidden>
        <Image src="/media/images/arrow-down.png" alt="" width={17} height={17} />
      </span>
    </motion.div>
  );
}
