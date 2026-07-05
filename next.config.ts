import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow a phone/other device on the LAN to load /_next/* dev assets when you
  // open the app via this machine's network IP (e.g. http://10.160.233.230:3000).
  // Next 16 blocks cross-origin requests to dev resources by default, which stops
  // the client JS bundle from loading — so React never hydrates and interactive
  // UI (like the mobile menu button) does nothing. Dev-only: no effect on prod.
  allowedDevOrigins: ["10.160.233.230", "10.160.233.*"],
  experimental: {
    // Bulk user upload posts a spreadsheet through a Server Action; the default
    // 1MB cap is tight for larger rosters.
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
