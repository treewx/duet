/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/api/sw',
      },
    ];
  },
};

module.exports = nextConfig;