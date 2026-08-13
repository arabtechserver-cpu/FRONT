"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/config";

const metricDefinitions = [
  ["uniqueSessions", "الزيارات الفريدة", "👥"],
  ["service_view", "مشاهدات الخدمات", "👁️"],
  ["checkout_started", "بدء الطلب", "🛒"],
  ["order_completed", "طلبات مكتملة", "✅"],
];

export default function AnalyticsTab({ token }) {
  const [days, setDays] = useState(30);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const authToken = token || localStorage.getItem("admin_token") || "";
    setLoading(true);
    setError("");

    fetch(`${API_BASE_URL}/api/analytics/summary?days=${days}`, {
      headers: { Authorization: `Bearer ${authToken}` },
      cache: "no-store",
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "تعذر تحميل التقرير.");
        return data;
      })
      .then((data) => { if (active) setSummary(data); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [days, token]);

  const valueFor = (key) => key === "uniqueSessions"
    ? summary?.uniqueSessions || 0
    : summary?.counts?.[key] || 0;

  return (
    <div className="tab-content" dir="rtl">
      <div className="glass-panel" style={{ padding: 24, borderRadius: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          <div>
            <h2 style={{ color: "#fff", margin: 0 }}>تحويلات المبيعات</h2>
            <p style={{ color: "#94a3b8", margin: "8px 0 0" }}>قياس مجهول من زيارة الخدمة حتى إتمام الطلب، بدون تخزين بيانات العميل.</p>
          </div>
          <select value={days} onChange={(event) => setDays(Number(event.target.value))} style={{ width: 150 }}>
            <option value={7}>آخر 7 أيام</option>
            <option value={30}>آخر 30 يومًا</option>
            <option value={90}>آخر 90 يومًا</option>
          </select>
        </div>

        {loading && <div style={{ color: "#cbd5e1", padding: 24 }}>جاري تحميل التقرير...</div>}
        {error && <div style={{ color: "#fca5a5", background: "rgba(239,68,68,.12)", padding: 14, borderRadius: 12 }}>{error}</div>}

        {!loading && !error && summary && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
              {metricDefinitions.map(([key, label, icon]) => (
                <div key={key} style={{ padding: 18, borderRadius: 16, background: "rgba(15,23,42,.72)", border: "1px solid rgba(148,163,184,.16)" }}>
                  <div style={{ color: "#94a3b8", fontSize: 14 }}>{icon} {label}</div>
                  <div style={{ color: "#fff", fontSize: 30, fontWeight: 800, marginTop: 8 }}>{valueFor(key).toLocaleString("ar-EG")}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14, marginTop: 18 }}>
              <RateCard label="من مشاهدة الخدمة إلى بدء الطلب" value={summary.rates.serviceToCheckout} />
              <RateCard label="من بدء الطلب إلى الإتمام" value={summary.rates.checkoutToOrder} />
              <RateCard label="من مشاهدة الخدمة إلى البيع" value={summary.rates.serviceToOrder} />
            </div>

            <p style={{ color: "#64748b", margin: "18px 0 0", fontSize: 13 }}>
              يبدأ التقرير في تجميع البيانات بعد نشر هذا التحديث، ولا يعرض أرقامًا قديمة تقديرية.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function RateCard({ label, value }) {
  return (
    <div style={{ padding: 18, borderRadius: 16, background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.2)" }}>
      <div style={{ color: "#a7f3d0", fontSize: 14 }}>{label}</div>
      <div style={{ color: "#34d399", fontSize: 28, fontWeight: 800, marginTop: 8 }}>{Number(value || 0).toLocaleString("ar-EG")}%</div>
    </div>
  );
}
