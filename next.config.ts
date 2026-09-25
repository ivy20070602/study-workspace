import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/study-workspace",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;