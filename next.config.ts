import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    // Bypasses Windows-specific WebAssembly thread worker type serialization warnings
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
