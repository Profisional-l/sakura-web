"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { EASE_SAKURA } from "@/lib/motion";
import { SakuraLogoMark } from "@/components/motion/SakuraLogoMark";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const firstRender = useRef(true);
  const [wiping, setWiping] = useState(false);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (reduced) return;

    setWiping(true);
    const timer = setTimeout(() => setWiping(false), 900);
    return () => clearTimeout(timer);
  }, [pathname, reduced]);

  return (
    <>
      {!reduced && (
        <AnimatePresence>
          {wiping && (
            <motion.div
              className="page-wipe"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE_SAKURA }}
            >
              <SakuraLogoMark
                className="page-wipe-logo mask-logo"
                mode="full"
                spread={28}
                duration={0.85}
                delay={0.05}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/*
        Plain <main> on purpose: opacity/filter/will-change on an ancestor
        becomes a Chrome "backdrop root" and kills backdrop-filter blur
        on all glass UI inside (header-adjacent hero card, panels, etc.).
        Safari is more forgiving — that's why iPhone looked fine.
      */}
      <main key={pathname} className="min-h-screen">
        {children}
      </main>
    </>
  );
}
