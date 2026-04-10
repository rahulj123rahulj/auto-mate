import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['oceanographical-raspily-heidy.ngrok-free.dev'],
  async redirects() {
    return [
      {
        source: "/",
        destination: "/workflows",
        permanent: false
      }
    ]
    
  },
  /* config options here */
};

export default nextConfig;
