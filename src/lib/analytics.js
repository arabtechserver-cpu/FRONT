const SESSION_KEY = "arabtech_conversion_session";

function getSessionId() {
  if (typeof window === "undefined") return "";
  try {
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = typeof crypto?.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  } catch {
    return "";
  }
}

export function trackConversion(eventName, metadata = {}) {
  if (typeof window === "undefined") return;

  const payload = JSON.stringify({
    eventName,
    sessionId: getSessionId(),
    path: `${window.location.pathname}${window.location.search}`,
    metadata,
  });

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      if (navigator.sendBeacon("/api/analytics/events", blob)) return;
    }

    fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Analytics must never interrupt browsing or checkout.
  }
}
