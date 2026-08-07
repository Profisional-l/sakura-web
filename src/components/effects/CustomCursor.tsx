"use client";

import { useEffect, useRef, useState } from "react";

const INTERACTIVE_SELECTOR = "a, button, [role='button'], input, textarea, select, .portfolio-card";

/**
 * Lightweight ring cursor (no Framer, no backdrop-filter).
 * Matches the original site's simple circle cursor behavior.
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100, rx: -100, ry: -100, hovering: false, visible: false });
  const raf = useRef(0);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(fine && !reduced);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    document.body.classList.add("has-custom-cursor");

    const tick = () => {
      const p = pos.current;
      p.rx += (p.x - p.rx) * 0.22;
      p.ry += (p.y - p.ry) * 0.22;

      const dot = dotRef.current;
      const ring = ringRef.current;
      if (dot) {
        dot.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
        dot.style.opacity = p.visible ? "1" : "0";
        dot.classList.toggle("is-hovering", p.hovering);
      }
      if (ring) {
        ring.style.transform = `translate3d(${p.rx}px, ${p.ry}px, 0)`;
        ring.style.opacity = p.visible ? "1" : "0";
        ring.classList.toggle("is-hovering", p.hovering);
      }
      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);

    const onMove = (event: MouseEvent) => {
      pos.current.x = event.clientX;
      pos.current.y = event.clientY;
      pos.current.visible = true;
      const target = event.target as HTMLElement | null;
      pos.current.hovering = Boolean(target?.closest(INTERACTIVE_SELECTOR));
    };

    const onLeave = () => {
      pos.current.visible = false;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.body.classList.remove("has-custom-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden />
      <div ref={ringRef} className="cursor-ring" aria-hidden />
    </>
  );
}
