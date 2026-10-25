import 'server-only';
import { getBackendCandidates } from './api-proxy-candidates';

export async function loadStorePages(path = '') {
  const base = getBackendCandidates(null, process.env.INTERNAL_API_URL)[0];
  if (!base) return null;
  try {
    const response = await fetch(`${base.replace(/\/$/, '')}/api/store-pages${path}`, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    return response.ok ? await response.json() : null;
  } catch { return null; }
}
