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

  if (reduced) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
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

      {/* Only opacity is animated here: transform/filter on this element would
          become the containing block for the fixed background videos inside. */}
      <motion.main
        key={pathname}
        className="min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.55, ease: EASE_SAKURA, delay: 0.15 }}
      >
        {children}
      </motion.main>
    </>
  );
}
