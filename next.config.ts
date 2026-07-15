import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No "standalone" output — Vercel handles Next.js natively.
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Bundle the SQLite DB file with serverless API routes so it's available
  // at runtime on Vercel. The DB is seeded during build (see package.json
  // "build" script) and copied to /tmp at runtime (see src/lib/db.ts).
  outputFileTracingIncludes: {
    "/api/**": ["./db/vercel-prod.db"],
  },
};

export default nextConfig;
