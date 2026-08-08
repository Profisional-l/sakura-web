"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { ProjectCard } from "./ProjectCard";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { EASE_SAKURA } from "@/lib/motion";

const feedContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const feedItem: Variants = {
  // Transform-only so glass banners/cards keep backdrop-filter in Chrome.
  hidden: { y: 34 },
  visible: {
    y: 0,
    transition: { duration: 0.7, ease: EASE_SAKURA },
  },
};

const tabsContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const tabItem: Variants = {
  hidden: { y: 16 },
  visible: {
    y: 0,
    transition: { duration: 0.5, ease: EASE_SAKURA },
  },
};

type FeedItem = {
  id: string;
  itemType: string;
  project?: {
    slug: string;
    title: string;
    linkType: "CASE_STUDY" | "EXTERNAL";
    externalUrl: string | null;
    logoAsset: { path: string; alt: string | null } | null;
    cardVideoAsset: { path: string } | null;
  } | null;
  mediaAsset?: { path: string; mediaType: string } | null;
  posterAsset?: { path: string } | null;
};

export function FeedRenderer({ items }: { items: FeedItem[] }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="portfolio-feed"
      variants={reduced ? undefined : feedContainer}
      initial={reduced ? undefined : "hidden"}
      animate={reduced ? undefined : "visible"}
    >
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          className="portfolio-feed-item"
          variants={reduced ? undefined : feedItem}
        >
          <FeedItemRenderer item={item} index={index} />
        </motion.div>
      ))}
    </motion.div>
  );
}

function FeedItemRenderer({ item, index }: { item: FeedItem; index: number }) {
  switch (item.itemType) {
    case "PROJECT_CARD":
      if (!item.project) return null;
      return (
        <ProjectCard
          index={index}
          slug={item.project.slug}
          title={item.project.title}
          linkType={item.project.linkType}
          externalUrl={item.project.externalUrl}
          logoPath={item.project.logoAsset?.path}
          logoAlt={item.project.logoAsset?.alt}
          videoPath={item.project.cardVideoAsset?.path}
        />
      );

    case "IMAGE_BANNER":
      if (!item.mediaAsset) return null;
      return (
        <div className="portfolio-banner">
          <Image
            src={item.mediaAsset.path}
            alt=""
            width={1400}
            height={800}
            className="portfolio-banner-media"
          />
        </div>
      );

    case "VIDEO_BANNER":
      if (!item.mediaAsset) return null;
      return (
        <div className="portfolio-banner">
          <LazyVideo className="portfolio-banner-media" src={item.mediaAsset.path} />
        </div>
      );

    case "PLAYABLE_VIDEO":
      if (!item.mediaAsset) return null;
      return <PlayableVideo src={item.mediaAsset.path} poster={item.posterAsset?.path} />;

    default:
      return null;
  }
}

function PlayableVideo({ src, poster }: { src: string; poster?: string }) {
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const handlePlay = () => {
    setPlaying(true);
    if (!reducedMotion) {
      videoRef.current?.play().catch(() => undefined);
    }
  };

  const handleClose = () => {
    setPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div className="video-block">
      <div className="bg-overlay" />
      <video ref={videoRef} src={src} muted loop={!reducedMotion} playsInline preload="metadata" />

      <AnimatePresence>
        {!playing && (
          <motion.div
            className="overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE_SAKURA }}
          >
            {poster && (
              <Image src={poster} alt="" fill className="video-poster" />
            )}
            <motion.button
              type="button"
              onClick={handlePlay}
              className="play-btn"
              aria-label="Play video"
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.94 }}
              transition={{ duration: 0.25, ease: EASE_SAKURA }}
            >
              <Image src="/media/images/play-button.webp" alt="" width={22} height={22} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {playing && (
          <motion.button
            type="button"
            onClick={handleClose}
            className="close-btn"
            aria-label="Close video"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.25, ease: EASE_SAKURA }}
          >
            <Image src="/media/images/Crossclose.png" alt="" width={20} height={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PortfolioTabs({
  categories,
  activeSlug,
  onTabChange,
}: {
  categories: { slug: string; name: string }[];
  activeSlug: string;
  onTabChange: (slug: string) => void;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.ul
      className="portfolio-tabs"
      variants={reduced ? undefined : tabsContainer}
      initial={reduced ? undefined : "hidden"}
      animate={reduced ? undefined : "visible"}
    >
      {categories.map((cat) => {
        const active = activeSlug === cat.slug;
        return (
          <motion.li key={cat.slug} variants={reduced ? undefined : tabItem}>
            <button
              type="button"
              onClick={() => onTabChange(cat.slug)}
              className={`portfolio-tab ${active ? "active" : ""}`}
            >
              {active && (
                <motion.span
                  layoutId="portfolio-tab-pill"
                  className="portfolio-tab-pill"
                  transition={{ duration: 0.45, ease: EASE_SAKURA }}
                />
              )}
              <span className="portfolio-tab-label">{cat.name}</span>
            </button>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}
