/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ESLint hatalarını görmezden gel
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TypeScript hatalarını görmezden gel
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig 