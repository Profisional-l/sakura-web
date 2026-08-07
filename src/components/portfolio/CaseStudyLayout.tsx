import type { CaseStudyTextItem } from "@/types";
import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { RevealText } from "@/components/motion/RevealText";
import { Parallax } from "@/components/motion/Parallax";
import { ArrowLink } from "@/components/motion/ArrowLink";

type Block = {
  id: string;
  blockType: "IMAGE" | "TEXT_SECTION";
  title: string | null;
  content: string | null;
  imageAsset: { path: string; alt: string | null } | null;
};

export function CaseStudyLayout({
  title,
  subtitle,
  blocks,
}: {
  title: string;
  subtitle?: string | null;
  blocks: Block[];
}) {
  return (
    <section className="jma">
      <div className="container-sakura">
        <RevealText as="h1" className="jma__title" text={title} stagger={0.05} />
        {subtitle && (
          <Reveal direction="up" distance={18} delay={0.2}>
            <p className="jma__subtitle">{subtitle}</p>
          </Reveal>
        )}

        {blocks.map((block, index) => (
          <div key={block.id} className="jma-block-wrap">
            {block.blockType === "IMAGE" && block.imageAsset && (
              <Reveal direction="up" distance={54} duration={1} className="jma-image jma-block">
                <Parallax speed={0.05}>
                  <Image
                    src={block.imageAsset.path}
                    alt={block.imageAsset.alt ?? ""}
                    width={1200}
                    height={700}
                    priority={index === 0}
                    className="jma-block-image"
                  />
                </Parallax>
              </Reveal>
            )}

            {block.blockType === "TEXT_SECTION" && (
              <Reveal direction="up" distance={32} className="jma-text__block">
                {block.title && <h2 className="jma-text__title">{block.title}</h2>}
                {block.content && (
                  <ul className="jma-text__list">
                    {(JSON.parse(block.content) as CaseStudyTextItem[]).map((entry, i) => (
                      <li key={i} className="jma-text__subtitle">
                        <span>{entry.label}:</span> {entry.text}
                      </li>
                    ))}
                  </ul>
                )}
              </Reveal>
            )}
          </div>
        ))}

        <Reveal direction="up" distance={20} className="jma-footer-link">
          <ArrowLink href="/portfolio">Back to portfolio</ArrowLink>
        </Reveal>
      </div>
    </section>
  );
}
