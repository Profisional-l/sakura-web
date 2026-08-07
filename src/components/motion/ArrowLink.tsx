"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { EASE_SAKURA } from "@/lib/motion";
import { Magnetic } from "./Magnetic";

interface ArrowLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export function ArrowLink({ href, children, className = "" }: ArrowLinkProps) {
  const [hovered, setHovered] = useState(false);
  const reduced = useReducedMotion();

  return (
    <Link
      href={href}
      className={`arrow-link ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Magnetic strength={0.18} className="arrow-link-inner">
        <span className="arrow-link-label">
          {children}
          <motion.span
            className="arrow-link-underline"
            initial={false}
            animate={{ scaleX: hovered && !reduced ? 1 : 0 }}
            transition={{ duration: 0.45, ease: EASE_SAKURA }}
          />
        </span>
        <motion.span
          className="arrow-link-icon"
          initial={false}
          animate={{ x: hovered && !reduced ? 6 : 0 }}
          transition={{ duration: 0.4, ease: EASE_SAKURA }}
        >
          ➜
        </motion.span>
      </Magnetic>
    </Link>
  );
}
