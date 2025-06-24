import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: {
    buildActivity: false,
  },
  webpack: (config) => {
    // Suppress the face-api warning
    config.module.rules.push({
      test: /node_modules\/@vladmandic\/face-api/,
      loader: 'ignore-loader'
    });
    
    // Ignore warnings from face-api
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
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
