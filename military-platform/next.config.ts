import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  images: {
    // Allow any local image path (including assets in the public root such as
    // "/MNGDP LOGO 2 .png") and allow optional query strings so we can use
    // cache-busting params like "?v=2" without renaming files. Omitting
    // `search` lets any query string pass through.
    localPatterns: [
      {
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
