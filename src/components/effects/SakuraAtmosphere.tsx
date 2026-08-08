"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { SakuraField } from "@/components/effects/SakuraField";
import { EASE_SAKURA } from "@/lib/motion";

interface SakuraAtmosphereProps {
  variant?: "hero" | "services";
  /** Services: 0 = overview, higher = deeper into sections. */
  intensity?: number;
}

/**
 * Brand atmosphere for Home hero + Services.
 * Soft cherry blooms + procedural petal field — no looping 3D CGI video.
 */
export function SakuraAtmosphere({ variant = "hero", intensity = 0 }: SakuraAtmosphereProps) {
  const reduced = useReducedMotion();
  const [allowParallax, setAllowParallax] = useState(false);

  useEffect(() => {
    // Scroll-linked transform on a fixed layer jitters on mobile (URL bar + rubber-band).
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const narrow = window.matchMedia("(max-width: 700px)").matches;
    setAllowParallax(!coarse && !narrow);
  }, []);

  const { scrollY } = useScroll();
  const smooth = useSpring(scrollY, { stiffness: 90, damping: 28, restDelta: 0.5 });

  const heroOpacity = useTransform(smooth, [0, 720], [1, 0.15]);
  const heroY = useTransform(smooth, [0, 900], [0, 80]);
  const heroScale = useTransform(smooth, [0, 900], [1, 1.06]);

  const isHero = variant === "hero";
  // Keep density stable — changing it remounts the canvas and makes blooms jump.
  const density = isHero ? 34 : 28;

  const content = (
    <>
      <div className="sakura-atmosphere-wash" aria-hidden />
      <div className={`sakura-atmosphere-bloom sakura-atmosphere-bloom-a ${isHero ? "is-hero" : "is-services"}`} aria-hidden />
      <div className={`sakura-atmosphere-bloom sakura-atmosphere-bloom-b ${isHero ? "is-hero" : "is-services"}`} aria-hidden />
      <div className={`sakura-atmosphere-bloom sakura-atmosphere-bloom-c ${isHero ? "is-hero" : "is-services"}`} aria-hidden />
      <div className="sakura-atmosphere-mist" aria-hidden />
      {!reduced && (
        <SakuraField
          mode={isHero ? "hero" : "services"}
          density={density}
          intensity={isHero ? 0.15 : Math.min(1, 0.2 + intensity * 0.12)}
          className="sakura-field sakura-field-local"
        />
      )}
      <div className="sakura-atmosphere-vignette" aria-hidden />
    </>
  );

  if (reduced || !isHero || !allowParallax) {
    return (
      <div className={`sakura-atmosphere sakura-atmosphere-${variant}`} aria-hidden>
        {content}
      </div>
    );
  }

  return (
    <motion.div
      className="sakura-atmosphere sakura-atmosphere-hero"
      style={{ opacity: heroOpacity, y: heroY, scale: heroScale }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.8, ease: EASE_SAKURA, delay: 0.5 }}
      aria-hidden
    >
      {content}
    </motion.div>
  );
}
