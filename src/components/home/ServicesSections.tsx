"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ScrollArrow } from "@/components/ui/ScrollArrow";
import { Counter } from "@/components/motion/Counter";
import { SakuraAtmosphere } from "@/components/effects/SakuraAtmosphere";
import { EASE_SAKURA } from "@/lib/motion";

const slideContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const slideItem: Variants = {
  hidden: { opacity: 0, x: -28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: EASE_SAKURA },
  },
};

const illustrationVariants: Variants = {
  hidden: { opacity: 0, scale: 0.86, rotate: -6 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { duration: 1.1, ease: EASE_SAKURA },
  },
};

type ServiceSection = {
  id: string;
  title: string;
  subtitle: string;
  services: string[];
  icon: string;
};

interface ServicesSectionsProps {
  hero: { title: string; subtitle: string };
  sections: ServiceSection[];
}

function formatIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

export function ServicesSections({ hero, sections }: ServicesSectionsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const slides = document.querySelectorAll(".services-slide[data-index]");
    if (!slides.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveIndex(Number(entry.target.getAttribute("data-index")));
          }
        }
      },
      { threshold: 0.45 }
    );

    slides.forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="services-page">
      <SakuraAtmosphere variant="services" intensity={activeIndex} />

      <div
        className={`services-blur-bg ${activeIndex > 0 ? "services-blur-active" : ""}`}
        aria-hidden
      />

      <nav className="services-dots" aria-label="Services sections">
        {[hero, ...sections].map((entry, index) => (
          <button
            key={index}
            type="button"
            className={`services-dot ${activeIndex === index ? "is-active" : ""}`}
            aria-label={
              index === 0
                ? "Overview"
                : `Service ${formatIndex(index - 1)}: ${(entry as ServiceSection).title ?? "Overview"}`
            }
            onClick={() => {
              document
                .querySelector(`.services-slide[data-index="${index}"]`)
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          />
        ))}
      </nav>

      <section className="services-slide services-hero-slide" data-index={0}>
        <div className="container-sakura services-hero-inner">
          <motion.div
            className="services-main-block"
            initial={reduced ? false : { opacity: 0, y: 30, filter: "blur(14px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: EASE_SAKURA, delay: 0.3 }}
          >
            <h1 className="services-title">{hero.title}</h1>
            <p className="services-subtitle">{hero.subtitle}</p>
          </motion.div>
          <ScrollArrow text="Explore Us Now!" fast />
        </div>
      </section>

      {sections.map((section, index) => (
        <section key={section.id} className="services-slide" data-index={index + 1}>
          <motion.div
            className="container-sakura services-item-container"
            variants={reduced ? undefined : slideContainer}
            initial={reduced ? undefined : "hidden"}
            whileInView={reduced ? undefined : "visible"}
            viewport={{ once: true, amount: 0.35 }}
          >
            <div className="services-item-block">
              <motion.div
                className="services-item-index"
                variants={reduced ? undefined : slideItem}
              >
                <Counter value={formatIndex(index)} className="services-item-index-num" />
              </motion.div>

              <motion.h2
                className="services-item-title"
                variants={reduced ? undefined : slideItem}
              >
                {section.title}
              </motion.h2>

              <motion.p
                className="services-item-subtitle"
                variants={reduced ? undefined : slideItem}
              >
                {section.subtitle}
              </motion.p>

              <ul className="services-item-list">
                {section.services.map((item) => (
                  <motion.li key={item} variants={reduced ? undefined : slideItem}>
                    <span className="services-item-dash">—</span> {item}
                  </motion.li>
                ))}
              </ul>
            </div>

            <motion.div
              className="services-item-illustration"
              variants={reduced ? undefined : illustrationVariants}
            >
              <Image
                src={section.icon}
                alt=""
                width={430}
                height={430}
                className="services-icon"
                sizes="(max-width: 730px) 55vw, 430px"
              />
            </motion.div>
          </motion.div>
        </section>
      ))}
    </div>
  );
}
