import type { Metadata } from "next";
import aboutData from "@/content/about.json";
import { Reveal } from "@/components/motion/Reveal";
import { RevealText } from "@/components/motion/RevealText";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Counter } from "@/components/motion/Counter";
import { ArrowLink } from "@/components/motion/ArrowLink";

export const metadata: Metadata = {
  title: "About",
  description: aboutData.intro.subtitle,
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Sakura Web Studio",
    description: aboutData.intro.subtitle,
    url: "/about",
  },
};

export default function AboutPage() {
  return (
    <section className="page-shell">
      <div className="container-sakura">
        <header className="about-header">
          <RevealText as="h1" className="page-title" text={aboutData.intro.title} />
          <Reveal direction="up" distance={20} delay={0.2}>
            <p className="page-subtitle">{aboutData.intro.subtitle}</p>
          </Reveal>
        </header>

        <Stagger className="about-stats" stagger={0.12}>
          {aboutData.stats.map((stat) => (
            <StaggerItem key={stat.label} className="about-stat">
              <Counter value={stat.value} className="about-stat-value" />
              <div className="about-stat-label">{stat.label}</div>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal direction="up" distance={40}>
          <p className="story-text">{aboutData.mission.text}</p>
        </Reveal>

        <Stagger className="about-values" stagger={0.12}>
          {aboutData.values.map((value) => (
            <StaggerItem key={value.title} className="about-value-card">
              <h3>{value.title}</h3>
              <p>{value.text}</p>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal direction="up" distance={32} className="about-team">
          <h2>{aboutData.team.title}</h2>
          <p>{aboutData.team.text}</p>
          <ArrowLink href="/contact">Get in touch</ArrowLink>
        </Reveal>
      </div>
    </section>
  );
}
