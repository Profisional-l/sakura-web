"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ACCORDION_ITEMS } from "@/lib/constants";
import { EASE_SAKURA } from "@/lib/motion";

/**
 * Glass accordion — no transform/filter on the frosted buttons.
 */
export function Accordion() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  return (
    <div className="accordion-wrap">
      {ACCORDION_ITEMS.map((entry, index) => {
        const isActive = activeIndex === index;

        return (
          <div
            key={entry.title}
            className={`accordion-item ${isActive ? "is-active" : ""}`}
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
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.42, ease: EASE_SAKURA }}
                  >
                    <span className="accordion-item-text-inner">{entry.text}</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        );
      })}
    </div>
  );
}
