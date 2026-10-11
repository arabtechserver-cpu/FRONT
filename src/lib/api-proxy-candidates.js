const productionBackendUrl = "https://api.borai.store";

function getBackendCandidates(cachedBackendUrl, internalApiUrl) {
  // The public API is the deployed backend. Legacy internal services can still
  // answer requests with obsolete authentication rules and a separate OTP store.
  if (process.env.NODE_ENV === "production") {
    return [productionBackendUrl];
  }

  return [cachedBackendUrl, internalApiUrl, process.env.NEXT_PUBLIC_API_URL,
    "http://127.0.0.1:5000", "http://localhost:5000"
  ].filter((url, index, all) => Boolean(url) && all.indexOf(url) === index);
}

module.exports = { getBackendCandidates };
