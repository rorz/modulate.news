import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/episodes": [
      "./node_modules/@ffmpeg-installer/**/*",
      "./node_modules/ffmpeg-static/ffmpeg",
    ],
  },
  reactCompiler: true,
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
