import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  experimental: {
    serverComponentsExternalPackages: ['lightweight-charts'],
  },
  webpack: (config) => {
    config.externals = config.externals || [];
    return config;
  },
};

export default nextConfig;
