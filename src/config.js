let apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production" ? "https://api.arab-tech1.online" : "http://localhost:5000");

if (typeof window !== "undefined") {
  if (process.env.NEXT_PUBLIC_API_URL) {
    apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  } else {
    const host = window.location.hostname;
    if (host.includes("localhost") || host.includes("127.0.0.1")) {
      apiBaseUrl = "http://localhost:5000";
    } else if (host.includes("spider-store.vercel.app")) {
      apiBaseUrl = "https://api.arab-tech1.online";
    } else {
      // If deployed elsewhere or custom domain, default to the production backend
      apiBaseUrl = "https://api.arab-tech1.online";
    }
  }
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
