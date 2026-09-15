import type { NextConfig } from "next";
const apiBase = (process.env.RECOMMENDER_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");
const nextConfig: NextConfig = {
  async rewrites() {
    // Same-origin URLs work for both next/image and mobile clients without exposing a file tree.
    return [{ source: "/business-image/:photoId", destination: `${apiBase}/business-image/:photoId` }];
  },
};
export default nextConfig;
