import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets `npm run build:check` compile into a separate folder so a running
  // dev server does not fight over `.next` (a frequent problem on Windows).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
};

export default nextConfig;
