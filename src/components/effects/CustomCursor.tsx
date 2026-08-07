"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const INTERACTIVE_SELECTOR = "a, button, [role='button'], input, textarea, select, .portfolio-card";

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);
  // left/top (not transform) so backdrop-filter can sample the page behind the ring.
  const ringX = useSpring(rawX, { stiffness: 320, damping: 32, mass: 0.5 });
  const ringY = useSpring(rawY, { stiffness: 320, damping: 32, mass: 0.5 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(fine && !reduced);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleMove = (event: MouseEvent) => {
      rawX.set(event.clientX);
      rawY.set(event.clientY);
      setVisible(true);

      const target = event.target as HTMLElement | null;
      setHovering(Boolean(target?.closest(INTERACTIVE_SELECTOR)));
    };

    const handleLeave = () => setVisible(false);

    window.addEventListener("mousemove", handleMove, { passive: true });
    document.addEventListener("mouseleave", handleLeave);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
    };
  }, [enabled, rawX, rawY]);

  useEffect(() => {
    if (!enabled) return;
    document.body.classList.add("has-custom-cursor");
    return () => document.body.classList.remove("has-custom-cursor");
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        className={`cursor-dot ${hovering ? "is-hovering" : ""}`}
        style={{ left: rawX, top: rawY, opacity: visible ? 1 : 0 }}
        aria-hidden
      />
      <motion.div
        className={`cursor-ring ${hovering ? "is-hovering" : ""}`}
        style={{ left: ringX, top: ringY, opacity: visible ? 1 : 0 }}
        aria-hidden
      />
    </>
  );
}
