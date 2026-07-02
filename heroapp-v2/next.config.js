/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cache.vtrcdn.com' },
      { protocol: 'https', hostname: 'dynamic-media.tacdn.com' },
      { protocol: 'https', hostname: 'media.tacdn.com' },
      { protocol: 'https', hostname: '*.vtrcdn.com' },
      { protocol: 'https', hostname: '*.tripadvisor.com' },
      { protocol: 'https', hostname: '*.tacdn.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  },
};

module.exports = nextConfig;
