import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProjectBySlug } from "@/actions";
import { CaseStudyLayout } from "@/components/portfolio/CaseStudyLayout";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Not Found" };

  const title = project.seoTitle ?? project.title;
  const description =
    project.seoDescription ??
    project.subtitle ??
    `${project.title} — case study by Sakura Web Studio.`;

  return {
    title,
    description,
    alternates: { canonical: `/portfolio/${slug}` },
    openGraph: {
      title,
      description,
      url: `/portfolio/${slug}`,
      type: "article",
    },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project || project.linkType !== "CASE_STUDY") {
    notFound();
  }

  return (
    <CaseStudyLayout
      title={project.caseStudyTitle ?? project.title}
      subtitle={project.caseStudySubtitle}
      blocks={project.caseStudyBlocks}
    />
  );
}
