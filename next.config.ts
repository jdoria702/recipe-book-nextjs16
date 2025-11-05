import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      }
    ]
  },
  experimental: {
    turbo: {
      root: __dirname,
    },
  },
};

export default nextConfig;
