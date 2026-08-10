const defaultApiUrl = 'https://api.arab-tech1.online';
const apiUrl = process.env.NEXT_PUBLIC_API_URL || defaultApiUrl;

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      "form-action 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.paypal.com https://*.paypal.com https://challenges.cloudflare.com https://accounts.google.com https://apis.google.com https://*.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      `img-src 'self' data: blob: ${apiUrl} https://* http://* https://lh3.googleusercontent.com https://ssl.gstatic.com https://*.googleusercontent.com`,
      `media-src 'self' data: blob: ${apiUrl}`,
      `connect-src 'self' ${apiUrl} https://www.paypal.com https://*.paypal.com https://challenges.cloudflare.com https://accounts.google.com https://*.google.com https://identitytoolkit.googleapis.com`,
      "frame-src https://www.paypal.com https://*.paypal.com https://challenges.cloudflare.com https://accounts.google.com https://*.google.com",
      "upgrade-insecure-requests",
    ].join('; '),
  },
];

const privatePageHeaders = [
  ...securityHeaders,
  { key: 'Cache-Control', value: 'no-store, max-age=0' },
  { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
];

function buildRemotePattern(value) {
  try {
    const url = new URL(value);
    return {
      protocol: url.protocol.replace(':', ''),
      hostname: url.hostname,
      port: url.port || '',
      pathname: '/uploads/**',
    };
  } catch {
    return {
      protocol: 'https',
      hostname: new URL(defaultApiUrl).hostname,
      pathname: '/uploads/**',
    };
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  cacheMaxMemorySize: 5 * 1024 * 1024, // 5 MB
  images: {
    remotePatterns: [buildRemotePattern(apiUrl)],
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${apiUrl}/uploads/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/admin/:path*',
        headers: privatePageHeaders,
      },
      {
        source: '/login',
        headers: privatePageHeaders,
      },
      {
        source: '/wallet/:path*',
        headers: privatePageHeaders,
      },
      {
        source: '/orders/:path*',
        headers: privatePageHeaders,
      },
      {
        source: '/favicon.ico',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, must-revalidate' },
        ],
      },
      {
        source: '/icons/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, must-revalidate' },
        ],
      },
    ];
  },
};

export default nextConfig;
