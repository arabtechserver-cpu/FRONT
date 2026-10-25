const { getBackendCandidates } = require('./api-proxy-candidates');

// Keep the storefront on the same database as the dashboard. A fast fallback
// server must not win a race against the configured server or an empty catalog.
async function loadStorefrontData(path, accept, fetcher = fetch) {
  for (const base of getBackendCandidates(null, process.env.INTERNAL_API_URL)) {
    try {
      const response = await fetcher(`${base.replace(/\/$/, '')}${path}`, {
        cache: 'no-store', signal: AbortSignal.timeout(2500)
      });
      if (!response.ok) continue;
      const data = await response.json();
      if (accept(data)) return data;
    } catch {}
  }
  return null;
}

module.exports = { loadStorefrontData };
