"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { EASE_SAKURA } from "@/lib/motion";

interface ProjectCardProps {
  slug: string;
  title: string;
  linkType: "CASE_STUDY" | "EXTERNAL";
  externalUrl?: string | null;
  logoPath?: string | null;
  logoAlt?: string | null;
  videoPath?: string | null;
  needBig?: boolean;
  index?: number;
  className?: string;
}

export function ProjectCard({
  slug,
  title,
  linkType,
  externalUrl,
  logoPath,
  logoAlt,
  videoPath,
  needBig = false,
  index = 0,
  className = "",
}: ProjectCardProps) {
  const [active, setActive] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [entered, setEntered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(pointerY, [0, 1], [7, -7]), {
    stiffness: 180,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(pointerX, [0, 1], [-9, 9]), {
    stiffness: 180,
    damping: 22,
  });
  const glowX = useTransform(pointerX, (v) => `${v * 100}%`);
  const glowY = useTransform(pointerY, (v) => `${v * 100}%`);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;
    if (active && !reducedMotion) {
      videoRef.current.play().catch(() => undefined);
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [active, reducedMotion]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    pointerX.set((event.clientX - rect.left) / rect.width);
    pointerY.set((event.clientY - rect.top) / rect.height);
  };

  const handleLeave = () => {
    setActive(false);
    pointerX.set(0.5);
    pointerY.set(0.5);
  };

  const href = linkType === "CASE_STUDY" ? `/portfolio/${slug}` : externalUrl ?? "#";
  const isExternal = linkType === "EXTERNAL";

  const inner = (
    <>
      {!reduced && (
        <motion.span
          className="portfolio-card-glow"
          style={{ left: glowX, top: glowY }}
          animate={{ opacity: active ? 0.65 : 0 }}
          transition={{ duration: 0.4 }}
          aria-hidden
        />
      )}

      {videoPath && !reducedMotion && (
        <video
          ref={videoRef}
          muted
          playsInline
          loop
          preload="none"
          aria-hidden
          className={needBig ? "need-big" : ""}
        >
          <source src={videoPath} type="video/mp4" />
        </video>
      )}

      {logoPath && (
        <Image
          src={logoPath}
          alt={logoAlt ?? title}
          width={160}
          height={80}
          className="portfolio_item_img"
        />
      )}

      <span className="portfolio-card-label">{title}</span>
    </>
  );

  const shellProps = {
    ref: cardRef,
    className: `portfolio-card ${active ? "is-active" : ""} ${className}`,
    onPointerMove: handlePointerMove,
    onMouseEnter: () => setActive(true),
    onMouseLeave: handleLeave,
    onFocus: () => setActive(true),
    onBlur: handleLeave,
  };

  const tilt = (children: ReactNode) =>
    reduced ? (
      <div className="portfolio-card-tilt">{children}</div>
    ) : (
      <motion.div
        className="portfolio-card-tilt"
        style={{ rotateX, rotateY, transformPerspective: 1100 }}
      >
        {children}
      </motion.div>
    );

  // After entrance, drop Motion on the glass shell so no leftover transform remains.
  const card =
    reduced || entered ? (
      <div {...shellProps}>{tilt(inner)}</div>
    ) : (
      <motion.div
        {...shellProps}
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2, margin: "60px 0px" }}
        transition={{ duration: 0.7, delay: (index % 3) * 0.1, ease: EASE_SAKURA }}
        onAnimationComplete={() => setEntered(true)}
      >
        {tilt(inner)}
      </motion.div>
    );

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={title}
        className="portfolio-card-link"
      >
        {card}
      </a>
    );
  }

  return (
    <Link href={href} title={title} className="portfolio-card-link">
      {card}
    </Link>
  );
}
