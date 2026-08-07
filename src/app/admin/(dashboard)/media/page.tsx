import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { prisma } from "@/lib/prisma";

export default async function AdminMediaPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const assets = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen pt-8 px-4 md:px-8 pb-16">
      <div className="container-sakura">
        <AdminNav />
        <h1 className="text-3xl mb-8">Media Library</h1>
        <MediaLibrary initialAssets={assets.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() }))} />
      </div>
    </div>
  );
}
