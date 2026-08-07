"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MaskLoader } from "@/components/layout/MaskLoader";
import { PageTransition } from "@/components/layout/PageTransition";
import { AmbientLayers } from "@/components/effects/AmbientLayers";
import { ScrollProgress } from "@/components/effects/ScrollProgress";

const SakuraField = dynamic(
  () => import("@/components/effects/SakuraField").then((m) => m.SakuraField),
  { ssr: false }
);

const CustomCursor = dynamic(
  () => import("@/components/effects/CustomCursor").then((m) => m.CustomCursor),
  { ssr: false }
);

/** Global ambient petals — skipped where page has its own SakuraAtmosphere. */
function ambientDensity(pathname: string) {
  if (pathname === "/" || pathname === "/services" || pathname === "/contact") return 0;
  if (pathname.startsWith("/portfolio")) return 16;
  return 20;
}

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isServices = pathname === "/services";
  const density = ambientDensity(pathname);

  if (isAdmin) {
    return (
      <>
        <Header />
        <main className="min-h-screen">{children}</main>
      </>
    );
  }

  return (
    <>
      <MaskLoader />
      <AmbientLayers />
      {density > 0 ? <SakuraField mode="ambient" density={density} /> : null}
      <CustomCursor />
      <ScrollProgress />
      <Header />
      <PageTransition>{children}</PageTransition>
      {!isServices ? <Footer /> : null}
    </>
  );
}
