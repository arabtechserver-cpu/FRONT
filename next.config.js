/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  cacheMaxMemorySize: 8 * 1024 * 1024,
  experimental: {
    preloadEntriesOnStart: false,
    imgOptConcurrency: 1,
    imgOptSequentialRead: true,
    imgOptMaxInputPixels: 16_000_000,
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    maximumResponseBody: 10 * 1024 * 1024,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.arabtechproserver.tech',
      },
      {
        protocol: 'https',
        hostname: 'api.borai.store',
      },
      {
        protocol: 'https',
        hostname: 'borai.store',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
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
              "img-src 'self' data: blob: https:",
              "media-src 'self' data: blob: https:",
              "connect-src 'self' https://api.arabtechproserver.tech https://api.borai.store https://borai.store https://www.borai.store https://accounts.google.com https://challenges.cloudflare.com https://www.paypal.com https://www.sandbox.paypal.com https://fonts.googleapis.com https://fonts.gstatic.com",
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
