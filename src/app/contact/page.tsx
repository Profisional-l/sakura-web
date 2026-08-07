import type { Metadata } from "next";
import { ContactForm } from "@/components/ui/ContactForm";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { CONTACT_EMAIL, JOBS_EMAIL } from "@/lib/constants";
import { Reveal } from "@/components/motion/Reveal";
import { RevealText } from "@/components/motion/RevealText";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Let's talk. Tell us about your project and what we can design and build together.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Sakura",
    description:
      "Tell us about your project — branding, UX/UI, web, or digital product work.",
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <section className="contact-page">
      <LazyVideo
        className="contact-bg-video"
        src="/media/videos/outBGminisak_comp.mp4"
        eager
      />

      <div className="container-sakura contact-inner">
        <Reveal className="contact-block" direction="up" distance={40} duration={1}>
          <RevealText as="h1" className="contact-title" text="Let's Talk" stagger={0.08} />
          <p className="contact-subtitle">
            We&apos;d love to learn more about you and what we can design and build together.
          </p>

          <Stagger className="contact-mail" stagger={0.14}>
            <StaggerItem>
              <h3>Become a Client</h3>
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </StaggerItem>
            <StaggerItem>
              <h3>Work at Sakura</h3>
              <a href={`mailto:${JOBS_EMAIL}`}>{JOBS_EMAIL}</a>
            </StaggerItem>
          </Stagger>
        </Reveal>

        <Reveal className="contact-form-block" direction="up" distance={32} delay={0.2}>
          <h2 className="contact-form-title">Send a message</h2>
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
