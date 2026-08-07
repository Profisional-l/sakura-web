"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TYPEWRITER_PHRASES } from "@/lib/constants";
import { EASE_SAKURA } from "@/lib/motion";

/**
 * Types through each phrase once, then settles on the last line.
 * No infinite loop — the hero stays cinematic without becoming noisy.
 */
export function TypewriterHero() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setStarted(true);
      return;
    }
    const timer = setTimeout(() => setStarted(true), 1500);
    return () => clearTimeout(timer);
  }, [reduced]);

  useEffect(() => {
    if (reduced) {
      setDisplayText(TYPEWRITER_PHRASES[TYPEWRITER_PHRASES.length - 1]);
      setDone(true);
      return;
    }
    if (!started || done) return;

    const currentPhrase = TYPEWRITER_PHRASES[phraseIndex];
    const isLast = phraseIndex === TYPEWRITER_PHRASES.length - 1;
    const speed = isDeleting ? 22 : 48;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        const next = currentPhrase.slice(0, displayText.length + 1);
        setDisplayText(next);
        if (next.length === currentPhrase.length) {
          if (isLast) {
            setDone(true);
            return;
          }
          setTimeout(() => setIsDeleting(true), 2200);
        }
      } else {
        const next = currentPhrase.slice(0, displayText.length - 1);
        setDisplayText(next);
        if (next.length === 0) {
          setIsDeleting(false);
          setPhraseIndex((i) => i + 1);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, phraseIndex, reduced, started, done]);

  return (
    <motion.h1
      className="hero-title"
      initial={reduced ? false : { opacity: 0, y: 24, filter: "blur(12px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.9, ease: EASE_SAKURA, delay: reduced ? 0 : 1.3 }}
    >
      {displayText}
      {!reduced && <span className={`hero-cursor ${done ? "is-settled" : ""}`}>|</span>}
    </motion.h1>
  );
}
