"use client";

import { useEffect, useRef, useState, type VideoHTMLAttributes } from "react";

interface LazyVideoProps extends Omit<VideoHTMLAttributes<HTMLVideoElement>, "src"> {
  src: string;
  className?: string;
  /** Start loading once the element is near the viewport. */
  rootMargin?: string;
  /** Load immediately and keep playing — for fixed full-bleed backgrounds. */
  eager?: boolean;
}

/**
 * Plays muted looping video only while in (or near) view.
 * Cuts decode/battery cost on long pages with many videos.
 */
export function LazyVideo({
  src,
  className,
  rootMargin = "200px 0px",
  eager = false,
  autoPlay = true,
  muted = true,
  loop = true,
  playsInline = true,
  ...rest
}: LazyVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(eager);

  useEffect(() => {
    if (eager) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin, threshold: 0.05 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, eager]);

  useEffect(() => {
    const node = ref.current;
    if (!node || !autoPlay) return;

    if (active) {
      void node.play().catch(() => undefined);
    } else {
      node.pause();
    }
  }, [active, autoPlay]);

  return (
    <video
      ref={ref}
      className={className}
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      preload={active || eager ? "auto" : "none"}
      aria-hidden
      {...rest}
    >
      {active || eager ? <source src={src} type="video/mp4" /> : null}
    </video>
  );
}
