/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    turbo: {},
    typedRoutes: true,
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "img-src 'self' https://image.tmdb.org data:",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "frame-src https://cinemaos.tech",
              "frame-ancestors 'self'",
              "connect-src 'self' https://api.themoviedb.org",
              "base-uri 'self'",
              "form-action 'self'"
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;


