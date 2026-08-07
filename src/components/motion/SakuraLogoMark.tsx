"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SITE_NAME } from "@/lib/constants";
import { EASE_SAKURA } from "@/lib/motion";

const LETTERS = SITE_NAME.split("");
const MID = (LETTERS.length - 1) / 2;

interface SakuraLogoMarkProps {
  className?: string;
  /** Wider starting gap between letters (px per step from center). */
  spread?: number;
  duration?: number;
  delay?: number;
  /** compact = quick settle for page wipes / repeats */
  mode?: "full" | "compact";
}

/**
 * "sakura." mark where letters start spaced apart and drift together.
 */
export function SakuraLogoMark({
  className = "mask-logo",
  spread = 34,
  duration = 2,
  delay = 0.12,
  mode = "full",
}: SakuraLogoMarkProps) {
  const reduced = useReducedMotion();
  const full = mode === "full" && !reduced;

  return (
    <span className={className} aria-label={SITE_NAME}>
      {LETTERS.map((char, index) => {
        const fromCenter = index - MID;
        const startX = full ? fromCenter * spread : 0;

        return (
          <motion.span
            key={`${char}-${index}`}
            className="mask-logo-char"
            initial={{
              x: startX,
              opacity: full ? 0 : 1,
            }}
            animate={{ x: 0, opacity: 1 }}
            transition={
              full
                ? {
                    x: {
                      duration,
                      ease: [0.16, 1, 0.3, 1],
                      delay: delay + Math.abs(fromCenter) * 0.045,
                    },
                    opacity: {
                      duration: 0.85,
                      ease: EASE_SAKURA,
                      delay: delay + Math.abs(fromCenter) * 0.03,
                    },
                  }
                : { duration: 0.25, ease: EASE_SAKURA }
            }
          >
            {char}
          </motion.span>
        );
      })}
    </span>
  );
}
