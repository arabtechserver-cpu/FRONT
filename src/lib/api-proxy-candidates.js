const knownBackendUrls = [
  "http://pro-b-i0r2xu:5000",
  "http://backend:5000",
  "http://pro-back:5000",
  "http://api:5000"
];

function isLocalhost(url) {
  return /localhost|127\.0\.0\.1|::1/.test(url);
}

function getBackendCandidates(cachedBackendUrl, internalApiUrl) {
  const isDev = process.env.NODE_ENV !== "production";
  const configuredUrl = internalApiUrl && (!isLocalhost(internalApiUrl) || isDev) ? internalApiUrl : null;
  return [cachedBackendUrl, configuredUrl, ...knownBackendUrls].filter(
    (url, index, all) => Boolean(url) && all.indexOf(url) === index
  );
}

module.exports = { getBackendCandidates };
