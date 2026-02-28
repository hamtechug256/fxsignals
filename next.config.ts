import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  serverExternalPackages: ['lightweight-charts'],
  // Add empty turbopack config to silence the warning
  turbopack: {},
};

export default nextConfig;
