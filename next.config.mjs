/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/mortgage-calculator',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
