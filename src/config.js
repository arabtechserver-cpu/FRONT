let apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.al-wefaq.center";

if (typeof window !== "undefined") {
  // Browser requests stay on the storefront origin and are proxied by Next.js.
  // This avoids CORS, privacy-extension and DNS failures caused by asking every
  // customer browser to contact the API subdomain directly.
  apiBaseUrl = "";
}

export const API_BASE_URL = apiBaseUrl;
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sk-unlocker.com";
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAErjWz_SzYtE3fce";

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
