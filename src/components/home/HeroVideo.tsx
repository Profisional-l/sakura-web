"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

interface HeroVideoProps {
  src: string;
  className?: string;
}

export function HeroVideo({ src, className = "hero-video" }: HeroVideoProps) {
  const reduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scrollY } = useScroll();

  const smooth = useSpring(scrollY, { stiffness: 90, damping: 26, restDelta: 0.5 });
  const scale = useTransform(smooth, [0, 900], [1, 1.12]);
  const opacity = useTransform(smooth, [0, 700], [1, 0.2]);
  const y = useTransform(smooth, [0, 900], [0, 100]);

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;

    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 1.2) {
        if (!node.paused) node.pause();
      } else if (node.paused) {
        void node.play().catch(() => undefined);
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (reduced) {
    return (
      <video
        ref={videoRef}
        className={className}
        muted
        playsInline
        autoPlay
        loop
        preload="metadata"
        aria-hidden
      >
        <source src={src} type="video/mp4" />
      </video>
    );
  }

  return (
    <motion.video
      ref={videoRef}
      className={className}
      style={{ scale, opacity, y }}
      muted
      playsInline
      autoPlay
      loop
      preload="auto"
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.6, delay: 0.9 }}
    >
      <source src={src} type="video/mp4" />
    </motion.video>
  );
}
