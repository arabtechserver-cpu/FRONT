/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  // Production caches stay on disk instead of retaining two 50 MB memory caches.
  cacheMaxMemorySize: 0,
  compress: true,
  poweredByHeader: false,
  allowedDevOrigins: [
    'localhost:3000',
    '127.0.0.1:3000',
    'borai.local',
    'borai.local:3000',
    'borai-server.local',
    'borai-server.local:3000',
    '*.local',
    '*.trycloudflare.com',
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    // Serve original assets; runtime image conversion can exceed the RAM budget.
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'borai.store',
      },
      {
        protocol: 'https',
        hostname: 'api.borai.store',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '5000',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ''} https://accounts.google.com https://challenges.cloudflare.com https://www.paypal.com https://www.sandbox.paypal.com`.replace(/\s+/g, ' ').trim(),
              "style-src 'self' 'unsafe-inline' https://accounts.google.com https://fonts.googleapis.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "img-src 'self' data: blob: https: http://localhost:5000 http://127.0.0.1:5000",
              "media-src 'self' data: blob: https: http://localhost:5000 http://127.0.0.1:5000",
              "connect-src 'self' ws: wss: http://localhost:5000 http://127.0.0.1:5000 ws://localhost:3000 ws://127.0.0.1:3000 ws://borai.local ws://borai.local:3000 http://borai.local http://borai.local:3000 http://borai-server.local https://borai.store https://www.borai.store https://api.borai.store https://accounts.google.com https://challenges.cloudflare.com https://www.paypal.com https://www.sandbox.paypal.com https://fonts.googleapis.com https://fonts.gstatic.com",
              "frame-src 'self' https://accounts.google.com https://challenges.cloudflare.com https://www.sandbox.paypal.com https://www.paypal.com",
              "object-src 'none'",
              "base-uri 'self'",
              "frame-ancestors 'self'",
            ].join('; '),
          },
        ],
      },

      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
      {
        source: '/videos/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Accept-Ranges',
            value: 'bytes',
          },
        ],
      },
      {
        source: '/images/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
