const defaultApiUrl = 'https://api.arab-tech1.online';
const apiUrl = process.env.NEXT_PUBLIC_API_URL || defaultApiUrl;

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
  // /api/services response is ~2.5MB, above the default 2MB limit.
  // Increase the in-memory data cache to 5MB so SSR pages can cache it properly.
  cacheMaxMemorySize: 5 * 1024 * 1024, // 5 MB
  images: {
    remotePatterns: [buildRemotePattern(apiUrl)],
  },
  async headers() {
    return [
      {
        source: '/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
        ],
      },
      {
        source: '/login',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
        ],
      },
      {
        source: '/wallet/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
        ],
      },
      {
        source: '/orders/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
        ],
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
