"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { ACCORDION_ITEMS } from "@/lib/constants";
import { EASE_SAKURA } from "@/lib/motion";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  // No opacity — parent opacity breaks backdrop-filter on the glass button.
  hidden: { y: 26 },
  visible: {
    y: 0,
    transition: { duration: 0.6, ease: EASE_SAKURA },
  },
};

export function Accordion() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="accordion-wrap"
      variants={reduced ? undefined : container}
      initial={reduced ? undefined : "hidden"}
      whileInView={reduced ? undefined : "visible"}
      viewport={{ once: true, amount: 0.1 }}
    >
      {ACCORDION_ITEMS.map((entry, index) => {
        const isActive = activeIndex === index;

        return (
          <motion.div
            key={entry.title}
            className={`accordion-item ${isActive ? "is-active" : ""}`}
            variants={reduced ? undefined : item}
          >
            <button
              type="button"
              className={isActive ? "active" : ""}
              onClick={() => setActiveIndex(isActive ? null : index)}
              aria-expanded={isActive}
            >
              <span className="accordion-item-head">
                <span className="accordion-item-name">{entry.title}</span>
                <motion.span
                  className="accordion-indicator"
                  initial={false}
                  animate={{ rotate: isActive ? -90 : 0 }}
                  transition={{ duration: 0.35, ease: EASE_SAKURA }}
                  aria-hidden
                >
                  |
                </motion.span>
              </span>

              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.span
                    className="accordion-item-text"
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.42, ease: EASE_SAKURA }}
                  >
                    <span className="accordion-item-text-inner">{entry.text}</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
