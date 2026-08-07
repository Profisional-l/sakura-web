import type { Metadata } from "next";
import servicesData from "@/content/services.json";
import { ServicesSections } from "@/components/home/ServicesSections";

export const metadata: Metadata = {
  title: "Our Services | Branding, UX/UI, Web & 3D Design",
  description:
    "Explore Sakura services: custom web design, branding, UX/UI, development, content production, and digital product design for ambitious brands.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Our Services | Sakura Web Studio",
    description: servicesData.hero.subtitle,
    url: "/services",
  },
};

export default function ServicesPage() {
  return (
    <ServicesSections hero={servicesData.hero} sections={servicesData.sections} />
  );
}
