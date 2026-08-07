"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SakuraLogoMark } from "@/components/motion/SakuraLogoMark";
import { EASE_SAKURA } from "@/lib/motion";

/** Bump when intro changes so old sessions replay the new animation. */
const SESSION_KEY = "sakura:intro-v3";

export function MaskLoader() {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<"boot" | "full" | "short">("boot");
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced === null) return;

    const params = new URLSearchParams(window.location.search);
    const force = params.has("intro");
    if (force) sessionStorage.removeItem(SESSION_KEY);

    const alreadyPlayed = sessionStorage.getItem(SESSION_KEY) === "1";
    const playFull = force || (!reduced && !alreadyPlayed);
    setPhase(playFull ? "full" : "short");

    const duration = playFull ? 2700 : 380;
    const timer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem(SESSION_KEY, "1");
    }, duration);

    return () => clearTimeout(timer);
  }, [reduced]);

  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="mask-loader-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: EASE_SAKURA }}
        >
          {phase !== "boot" && (
            <div className="mask-loader-inner">
              <SakuraLogoMark
                className="mask-logo"
                mode={phase === "full" ? "full" : "compact"}
                spread={38}
                duration={2.15}
                delay={0.15}
              />

              {phase === "full" && (
                <motion.div
                  className="mask-loader-bar"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ duration: 1.65, ease: EASE_SAKURA, delay: 0.55 }}
                />
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
