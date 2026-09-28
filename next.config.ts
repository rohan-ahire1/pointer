import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for the VPS deploy (`npm run build:static`); Vercel builds normally.
  ...(process.env.STATIC_EXPORT ? { output: "export" as const, trailingSlash: true } : {}),
};

export default nextConfig;
