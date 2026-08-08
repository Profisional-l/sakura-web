"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { EASE_SAKURA } from "@/lib/motion";

/**
 * Apple-like entrance for the Core Expertise glass card.
 * Glass shell: transform / clip only (keeps Chrome backdrop-filter).
 * Inner content: soft stagger with blur → sharp.
 */
export function ExpertiseCard() {
  const reduced = useReducedMotion();
  const [lit, setLit] = useState(false);

  const shell: Variants = {
    hidden: {
      scale: 0.94,
      y: 28,
      clipPath: "inset(8% 6% 8% 6% round 35px)",
    },
    visible: {
      scale: 1,
      y: 0,
      clipPath: "inset(0% 0% 0% 0% round 35px)",
      transition: {
        duration: 1.05,
        ease: EASE_SAKURA,
        clipPath: { duration: 1.15, ease: EASE_SAKURA },
      },
    },
  };

  const stack: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.11,
        delayChildren: 0.18,
      },
    },
  };

  const item: Variants = {
    hidden: reduced
      ? { opacity: 1, y: 0, filter: "blur(0px)" }
      : { opacity: 0, y: 18, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.75, ease: EASE_SAKURA },
    },
  };

  const media: Variants = {
    hidden: reduced
      ? { opacity: 1, scale: 1, filter: "blur(0px)" }
      : { opacity: 0, scale: 0.88, filter: "blur(12px)" },
    visible: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 0.95, ease: EASE_SAKURA },
    },
  };

  return (
    <motion.div
      className={`text-for-infolist expertise-card${lit || reduced ? " is-lit" : ""}`}
      variants={reduced ? undefined : shell}
      initial={reduced ? undefined : "hidden"}
      whileInView={reduced ? undefined : "visible"}
      viewport={{ once: true, amount: 0.35 }}
      onViewportEnter={() => setLit(true)}
    >
      <span className="expertise-card-shine" aria-hidden />

      <motion.div
        className="expertise-card-stack"
        variants={reduced ? undefined : stack}
        initial={reduced ? undefined : "hidden"}
        whileInView={reduced ? undefined : "visible"}
        viewport={{ once: true, amount: 0.35 }}
      >
        <motion.div className="sakura-tree-img-cont" variants={media}>
          <Image
            src="/media/images/sakuratree1_1.webp"
            alt="Sakura tree"
            width={250}
            height={250}
            className="sakura-tree-img"
          />
        </motion.div>

        <motion.h3 className="according-block-title" variants={item}>
          Sakura&apos;s Core Expertise
        </motion.h3>

        <motion.p className="according-block-text" variants={item}>
          We craft visionary digital experiences for top global brands, seamlessly fusing AI,
          cutting-edge design, and advanced technology to redefine what&apos;s possible. You dream —
          We build!
        </motion.p>

        <motion.div className="arrow-cont" variants={item}>
          <Image
            src="/media/images/arrow-down.png"
            alt=""
            width={17}
            height={17}
            className="down-arrow"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
