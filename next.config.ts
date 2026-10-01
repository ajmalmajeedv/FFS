import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // next/image silently ignores a `quality` prop not listed here,
    // falling back to 75 — the higher photography-heavy sections
    // (projects, typologies) request 92 explicitly.
    qualities: [75, 92],
  },
};

export default nextConfig;
