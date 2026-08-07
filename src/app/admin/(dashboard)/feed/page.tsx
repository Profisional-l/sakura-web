import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { FeedBuilder } from "@/components/admin/FeedBuilder";
import { prisma } from "@/lib/prisma";

export default async function AdminFeedPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const [categories, projects, mediaAssets] = await Promise.all([
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        feedItems: {
          orderBy: { sortOrder: "asc" },
          include: {
            project: { select: { title: true } },
            mediaAsset: { select: { filename: true } },
            posterAsset: { select: { filename: true } },
          },
        },
      },
    }),
    prisma.project.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
    prisma.mediaAsset.findMany({ select: { id: true, filename: true, mediaType: true }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="min-h-screen pt-8 px-4 md:px-8 pb-16">
      <div className="container-sakura">
        <AdminNav />
        <h1 className="text-3xl mb-8">Portfolio Feed Builder</h1>
        <FeedBuilder categories={categories} projects={projects} mediaAssets={mediaAssets} />
      </div>
    </div>
  );
}
