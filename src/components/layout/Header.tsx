"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";
import { EASE_SAKURA } from "@/lib/motion";

const menuContainer: Variants = {
  hidden: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
};

const menuItem: Variants = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_SAKURA },
  },
};

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      setHidden(y > 160 && y > lastY);
      lastY = y;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (pathname.startsWith("/admin")) return null;

  const classes = [
    "site-header-bar",
    menuOpen && "is-open",
    scrolled && "is-scrolled",
    hidden && !menuOpen && "is-hidden",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={classes}>
      <Link href="/" className="site-logo">
        <span className="site-logo-text">{SITE_NAME}</span>
      </Link>

      <nav className="nav-desktop">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`nav-link ${pathname === link.href ? "is-active" : ""}`}
          >
            {link.label}
            <span className="nav-link-underline" />
            <span className="nav-active-dot" aria-hidden />
          </Link>
        ))}
      </nav>

      <button
        className="menu-burger"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
      >
        <span className={`burger-lines ${menuOpen ? "is-open" : ""}`}>
          <span />
          <span />
        </span>
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.ul
            className="vertical-menu"
            variants={menuContainer}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {NAV_LINKS.map((link) => (
              <motion.li key={link.href} variants={menuItem}>
                <Link href={link.href} onClick={() => setMenuOpen(false)}>
                  {link.label.charAt(0).toUpperCase() + link.label.slice(1)}
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  );
}
