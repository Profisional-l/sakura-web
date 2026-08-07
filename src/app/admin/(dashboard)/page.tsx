import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const [projectCount, mediaCount, feedCount] = await Promise.all([
    prisma.project.count(),
    prisma.mediaAsset.count(),
    prisma.portfolioFeedItem.count(),
  ]);

  return (
    <div className="min-h-screen pt-8 px-4 md:px-8 pb-16">
      <div className="container-sakura">
        <AdminNav />
        <h1 className="text-3xl mb-8">Dashboard</h1>
        <p className="text-white/60 mb-8">Welcome, {session.user.name ?? session.user.email}</p>

        <div className="grid md:grid-cols-3 gap-6">
          <StatCard label="Projects" value={projectCount} href="/admin/projects" />
          <StatCard label="Media Assets" value={mediaCount} href="/admin/media" />
          <StatCard label="Feed Items" value={feedCount} href="/admin/feed" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="glass-panel p-6 rounded-lg hover:border-[var(--color-accent)] transition-colors block">
      <div className="text-4xl text-[var(--color-accent)] mb-2">{value}</div>
      <div className="text-white/60">{label}</div>
    </Link>
  );
}
