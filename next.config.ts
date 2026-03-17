import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  reactStrictMode: true,
  experimental: {
    serverComponentsHmrCache: true,
  },
};

export default nextConfig;
