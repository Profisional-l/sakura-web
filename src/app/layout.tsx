import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/layout/Providers";
import { SiteShell } from "@/components/layout/SiteShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Sakura — Web Studio | Branding, UX/UI, 3D Design, E-commerce",
    template: "%s | Sakura",
  },
  description:
    "Sakura is a global web design and development studio specializing in branding, UX/UI design, 3D design, and e-commerce experiences for leading brands.",
  keywords: [
    "web design",
    "UX/UI",
    "branding",
    "e-commerce",
    "3D design",
    "digital branding",
    "web development",
    "design systems",
  ],
  authors: [{ name: "Sakura Web Studio" }],
  creator: "Sakura Web Studio",
  publisher: "Sakura Web Studio",
  applicationName: "Sakura",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Sakura Web Studio",
    title: "Sakura — Web Studio | Branding, UX/UI, 3D Design, E-commerce",
    description:
      "A global agency specializing in branding and UX design. We create cutting-edge digital experiences for leading global brands.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Sakura — Web Studio",
    description:
      "A global agency specializing in branding and UX design for leading global brands.",
  },
  category: "design",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <JsonLd />
        <Providers>
          <SiteShell>{children}</SiteShell>
        </Providers>
      </body>
    </html>
  );
}
