import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { ProjectEditor } from "@/components/admin/ProjectEditor";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function AdminProjectEditPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const { id } = await params;

  const [categories, mediaAssets] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  if (id === "new") {
    return (
      <div className="min-h-screen pt-8 px-4 md:px-8 pb-16">
        <div className="container-sakura">
          <AdminNav />
          <h1 className="text-3xl mb-8">New Project</h1>
          <ProjectEditor categories={categories} mediaAssets={mediaAssets} />
        </div>
      </div>
    );
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      categories: true,
      caseStudyBlocks: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!project) notFound();

  return (
    <div className="min-h-screen pt-8 px-4 md:px-8 pb-16">
      <div className="container-sakura">
        <AdminNav />
        <h1 className="text-3xl mb-8">Edit: {project.title}</h1>
        <ProjectEditor project={project} categories={categories} mediaAssets={mediaAssets} />
      </div>
    </div>
  );
}
