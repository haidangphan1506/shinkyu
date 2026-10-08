import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Emits .next/standalone/server.js with only the traced files needed to run (used by the Dockerfile).
  output: 'standalone',
};

export default nextConfig;
