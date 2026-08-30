let apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production" ? "https://api.arab-tech1.online" : "http://localhost:5000");

if (typeof window !== "undefined") {
  // Browser requests stay on the storefront origin and are proxied by Next.js.
  // This avoids CORS, privacy-extension and DNS failures caused by asking every
  // customer browser to contact the API subdomain directly.
  apiBaseUrl = "";
}

export const API_BASE_URL = apiBaseUrl;
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://arab-tech1.online";

/**
 * fetch() with a timeout (default 10 seconds).
 * Accepts the same arguments as the native fetch() API.
 */
export function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(id)
  );
}
