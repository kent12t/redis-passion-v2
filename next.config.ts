import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */


  turbopack: {},
  webpack: (config) => {
    // Ignore warnings from face-api instead of trying to use ignore-loader
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /node_modules\/@vladmandic\/face-api/,
        message: /Critical dependency/,
      },
    ];
    
    return config;
  },
  // Model weights never change; without this Next serves /public with max-age=0
  async headers() {
    return [
      {
        source: '/models/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  // Remove the problematic optimizeCss experiment that's causing the critters error
};

export default nextConfig;
