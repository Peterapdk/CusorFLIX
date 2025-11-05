/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    turbo: true,
    typedRoutes: true,
    serverActions: {
      bodySizeLimit: '2mb'
    }
  }
};

export default nextConfig;


