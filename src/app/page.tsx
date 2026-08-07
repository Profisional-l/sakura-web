import type { Metadata } from "next";
import Image from "next/image";
import { TypewriterHero } from "@/components/home/TypewriterHero";
import { Accordion } from "@/components/home/Accordion";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { ScrollArrow } from "@/components/ui/ScrollArrow";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { SakuraAtmosphere } from "@/components/effects/SakuraAtmosphere";
import { Reveal } from "@/components/motion/Reveal";
import { RevealText } from "@/components/motion/RevealText";
import { Parallax } from "@/components/motion/Parallax";
import { ArrowLink } from "@/components/motion/ArrowLink";
import { getFeaturedProjects } from "@/actions";

// CMS-backed page — always read fresh data from Postgres.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const projects = await getFeaturedProjects();

  return (
    <>
      <section className="hero-section">
        <SakuraAtmosphere variant="hero" />

        <div className="container-sakura">
          <div className="main-block main-block-fade-in">
            <TypewriterHero />
          </div>
        </div>

        <ScrollArrow text="Join the journey." />
      </section>

      <section className="section-block">
        <div className="container-sakura about-intro">
          <RevealText
            as="h2"
            className="about-intro-title"
            text="We create cutting-edge digital experiences for leading global brands by seamlessly integrating AI, innovative design, and advanced technology."
          />
          <Reveal delay={0.35} direction="up" distance={18} className="about-intro-link">
            <ArrowLink href="/services">View our services</ArrowLink>
          </Reveal>
        </div>
      </section>

      <section className="short-info-block">
        <Reveal className="text-for-infolist" direction="left" distance={54}>
          <Parallax speed={0.06} className="sakura-tree-img-cont">
            <Image
              src="/media/images/sakuratree1_1.webp"
              alt="Sakura tree"
              width={250}
              height={250}
              className="sakura-tree-img"
            />
          </Parallax>
          <h3 className="according-block-title">Sakura&apos;s Core Expertise</h3>
          <p className="according-block-text">
            We craft visionary digital experiences for top global brands, seamlessly
            fusing AI, cutting-edge design, and advanced technology to redefine what&apos;s
            possible. You dream — We build!
          </p>
          <div className="arrow-cont">
            <Image
              src="/media/images/arrow-down.png"
              alt=""
              width={17}
              height={17}
              className="down-arrow"
            />
          </div>
        </Reveal>

        <Accordion />
      </section>

      <section className="section-block">
        <div className="container-sakura">
          <Reveal className="about-why-sakura" direction="up" distance={60} duration={1}>
            <div className="sakura-tree-video-block">
              <LazyVideo className="sakura-tree-video" src="/media/videos/Gallery-26_1.mp4" />
            </div>
            <h2 className="about-sakura-title">
              At Sakura Web Studio, we believe in the elegance and beauty of our namesake — the
              cherry blossom. Just as the cherry blossom symbolizes the peak of natural beauty, we
              strive to create the most stunning and effective digital solutions for your business.
              Our team crafts websites and digital experiences that are not only visually captivating
              but also drive success and growth. Let us help you bloom online with innovative designs
              and solutions tailored to your unique needs.
            </h2>
          </Reveal>
        </div>
      </section>

      <section className="portfolio-on-main">
        <div className="container-sakura">
          <Reveal direction="up" distance={26} className="portfolio-section-head">
            <h2 className="portfolio-section-title">We Worked With</h2>
            <hr className="portfolio-divider" />
          </Reveal>

          <div className="portfolio-grid">
            {projects.map((project, i) => (
              <ProjectCard
                key={project.id}
                index={i}
                slug={project.slug}
                title={project.title}
                linkType={project.linkType}
                externalUrl={project.externalUrl}
                logoPath={project.logoAsset?.path}
                logoAlt={project.logoAsset?.alt}
                videoPath={project.cardVideoAsset?.path}
                needBig={i === 0 || i === 3 || i === 4}
              />
            ))}
          </div>
        </div>

        <Reveal className="portfolio-link-parent" direction="up" distance={18}>
          <ArrowLink href="/portfolio">View portfolio</ArrowLink>
        </Reveal>
      </section>

      <section className="section-block portfolio-out">
        <div className="container-sakura">
          <RevealText
            as="h2"
            className="portfolio-out-title"
            text="Dream it. We Build it."
            stagger={0.07}
          />
        </div>
      </section>

      <section className="main-about section-block">
        <div className="container-sakura main-about-inner">
          <Reveal direction="up" distance={38}>
            <p className="main-about-text">
              Our multidisciplinary team brings together strategy, branding, UX design, and
              technology to deliver rapid and impactful results. By collaborating closely with our
              clients as a unified team, we blend human creativity with AI-powered efficiency to
              consistently surpass expectations.
            </p>
          </Reveal>
          <Reveal direction="up" distance={18} delay={0.15} className="main-about-link">
            <ArrowLink href="/about">Get to know us</ArrowLink>
          </Reveal>
        </div>
      </section>
    </>
  );
}
