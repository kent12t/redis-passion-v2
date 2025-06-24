import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: {
    buildActivity: false,
  },
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
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  // Remove the problematic optimizeCss experiment that's causing the critters error
};

export default nextConfig;
