import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  images: {
    // Disable Next.js image optimization. We serve only local assets, and the
    // optimizer in Next 16 + Turbopack currently throws thousands of
    // `LRUCache: calculateSize returned 0` errors that swamp the dev server
    // and cause dynamic routes (e.g. /path/[slug]/type/[code]) to fail to
    // compile, returning 404. Bypassing the optimizer is safe for local
    // images and eliminates the noise entirely.
    unoptimized: true,
    localPatterns: [
      {
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
