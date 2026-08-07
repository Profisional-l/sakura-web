import type { Metadata } from "next";
import { getCategoriesWithFeed } from "@/actions";
import { PortfolioClient } from "@/components/portfolio/PortfolioClient";
import { RevealText } from "@/components/motion/RevealText";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Selected work from Sakura: branding, UX/UI, web development, 3D and motion projects for global brands.",
  alternates: { canonical: "/portfolio" },
  openGraph: {
    title: "Portfolio | Sakura Web Studio",
    description:
      "Selected branding, UX/UI, web, 3D and motion projects for global brands.",
    url: "/portfolio",
  },
};

export default async function PortfolioPage() {
  const categories = await getCategoriesWithFeed();

  return (
    <section className="page-shell" id="portfolio">
      <div className="container-sakura">
        <RevealText
          as="h1"
          className="portfolio-page-title"
          text="We take products and brands to the next level"
          stagger={0.05}
        />
        <PortfolioClient categories={categories} />
      </div>
    </section>
  );
}
