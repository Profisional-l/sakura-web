"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { CONTACT_EMAIL, NAV_LINKS } from "@/lib/constants";
import { EASE_SAKURA } from "@/lib/motion";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE_SAKURA },
  },
};

export function Footer() {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  if (pathname.startsWith("/admin")) return null;

  return (
    <motion.footer
      className="site-footer"
      variants={reduced ? undefined : container}
      initial={reduced ? undefined : "hidden"}
      whileInView={reduced ? undefined : "visible"}
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="footer-container container-sakura">
        <motion.div className="footer-contact" variants={reduced ? undefined : item}>
          <h2>Get in Touch!</h2>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          <address>Global Agency</address>
        </motion.div>

        <motion.h2 className="footer-explore-title" variants={reduced ? undefined : item}>
          Explore Sakura
        </motion.h2>

        <motion.div className="footer-links" variants={reduced ? undefined : item}>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              <span className="links-arrow">→</span>
              {link.label.charAt(0).toUpperCase() + link.label.slice(1)}
            </Link>
          ))}
        </motion.div>
      </div>

      <motion.div
        className="footer-bottom container-sakura"
        variants={reduced ? undefined : item}
      >
        <ul>
          <li><Link href="#">Privacy</Link></li>
          <li><Link href="#">Terms</Link></li>
          <li><Link href="#">Sitemap</Link></li>
        </ul>
        <p>© 2025 Sakura, LLC</p>
      </motion.div>
    </motion.footer>
  );
}
