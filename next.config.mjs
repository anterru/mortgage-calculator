/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: '/mortgage-calculator',
  basePath: '/mortgage-calculator',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'export',
}

export default nextConfig
