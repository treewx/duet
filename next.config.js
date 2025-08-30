/** @type {import('next').NextConfig} */
const nextConfig = {
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