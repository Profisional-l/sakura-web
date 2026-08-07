import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminProjectsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: { categories: { include: { category: true } } },
  });

  return (
    <div className="min-h-screen pt-8 px-4 md:px-8 pb-16">
      <div className="container-sakura">
        <AdminNav />
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl">Projects</h1>
          <Link href="/admin/projects/new" className="admin-btn">
            New Project
          </Link>
        </div>

        <div className="space-y-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/admin/projects/${project.id}`}
              className="glass-panel flex items-center justify-between px-6 py-4 rounded-lg hover:border-[var(--color-accent)] transition-colors"
            >
              <div>
                <div className="font-medium">{project.title}</div>
                <div className="text-sm text-white/50">{project.slug}</div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs px-2 py-1 rounded ${
                  project.status === "PUBLISHED" ? "bg-green-900/50 text-green-300" : "bg-yellow-900/50 text-yellow-300"
                }`}>
                  {project.status}
                </span>
                <span className="text-white/30">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
