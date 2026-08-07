"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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

/**
 * Portfolio card — CSS hover video (no Framer tilt).
 * Transform on the card shell breaks hover stacking + backdrop-filter.
 */
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
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active && !reducedMotion) {
      video.play().catch(() => undefined);
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [active, reducedMotion]);

  const href = linkType === "CASE_STUDY" ? `/portfolio/${slug}` : externalUrl ?? "#";
  const isExternal = linkType === "EXTERNAL";

  const card = (
    <div
      className={`portfolio-card portfolio-card-enter ${active ? "is-active" : ""} ${className}`}
      style={{ animationDelay: `${(index % 3) * 90}ms` }}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
    >
      {videoPath && !reducedMotion && (
        <video
          ref={videoRef}
          muted
          playsInline
          loop
          preload="metadata"
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
    </div>
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
