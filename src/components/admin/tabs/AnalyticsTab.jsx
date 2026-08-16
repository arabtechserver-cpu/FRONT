"use client";

import { useEffect, useState, useRef } from "react";
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
  
  // Daily Report State
  const [showDailyReport, setShowDailyReport] = useState(false);
  const [dailyOrders, setDailyOrders] = useState([]);
  const [allFetchedOrders, setAllFetchedOrders] = useState([]);
  const [reportPeriod, setReportPeriod] = useState("today");
  const [loadingDaily, setLoadingDaily] = useState(false);
  const printRef = useRef(null);

  const fetchDailyReport = async () => {
    setShowDailyReport(true);
    setLoadingDaily(true);
    const authToken = token || localStorage.getItem("admin_token") || "";
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders?limit=500`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!response.ok) throw new Error("تعذر جلب الطلبات");
      const allOrders = await response.json();
      const completed = allOrders.filter(o => o.status === 'completed');
      setAllFetchedOrders(completed);
      
      // Auto-detect best default (if today is 0, default to latest 50)
      const todayStr = new Date().toDateString();
      const completedToday = completed.filter(o => new Date(o.created_at).toDateString() === todayStr);
      
      if (completedToday.length === 0 && completed.length > 0) {
        setReportPeriod("latest50");
      } else {
        setReportPeriod("today");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء تحميل التقرير اليومي.");
    } finally {
      setLoadingDaily(false);
    }
  };

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

  // Effect to filter orders when reportPeriod or allFetchedOrders changes
  useEffect(() => {
    if (!allFetchedOrders || allFetchedOrders.length === 0) {
      setDailyOrders([]);
      return;
    }
    
    const today = new Date();
    const todayStr = today.toDateString();
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    
    let filtered = [];
    if (reportPeriod === "today") {
      filtered = allFetchedOrders.filter(o => new Date(o.created_at).toDateString() === todayStr);
    } else if (reportPeriod === "yesterday") {
      filtered = allFetchedOrders.filter(o => new Date(o.created_at).toDateString() === yesterdayStr);
    } else if (reportPeriod === "last7days") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filtered = allFetchedOrders.filter(o => new Date(o.created_at) >= sevenDaysAgo);
    } else if (reportPeriod === "latest50") {
      filtered = allFetchedOrders.slice(0, 50);
    }
    
    setDailyOrders(filtered);
  }, [reportPeriod, allFetchedOrders]);

  return (
    <div className="tab-content" dir="rtl">
      <div className="glass-panel" style={{ padding: 24, borderRadius: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          <div>
            <h2 style={{ color: "#fff", margin: 0 }}>تحويلات المبيعات</h2>
            <p style={{ color: "#94a3b8", margin: "8px 0 0" }}>قياس مجهول من زيارة الخدمة حتى إتمام الطلب، بدون تخزين بيانات العميل.</p>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <button 
              onClick={fetchDailyReport}
              className="glass-btn" 
              style={{ padding: "8px 16px", borderRadius: 12, background: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)", display: "flex", gap: 8, alignItems: "center" }}
            >
              <span>📄</span>
              تقرير إنجاز اليوم
            </button>
            <select value={days} onChange={(event) => setDays(Number(event.target.value))} style={{ width: 150, padding: "8px 12px", borderRadius: 12, background: "rgba(15,23,42,0.8)", color: "#fff", border: "1px solid rgba(148,163,184,0.2)" }}>
              <option value={7}>آخر 7 أيام</option>
              <option value={30}>آخر 30 يومًا</option>
              <option value={90}>آخر 90 يومًا</option>
            </select>
          </div>
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

      {showDailyReport && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.95)", zIndex: 99999, display: "flex", flexDirection: "column", padding: "20px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", width: "100%", background: "#1e293b", borderRadius: 20, display: "flex", flexDirection: "column", maxHeight: "100%", overflow: "hidden" }}>
            
            <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <h2 style={{ margin: 0, color: "#fff", display: "flex", alignItems: "center", gap: 10 }}>
                <span>📊</span> تقرير الإنجاز
              </h2>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <select 
                  value={reportPeriod}
                  onChange={(e) => setReportPeriod(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(15,23,42,0.8)", color: "#fff", border: "1px solid rgba(148,163,184,0.2)", outline: "none" }}
                >
                  <option value="today">اليوم ({new Date().toLocaleDateString('ar-EG')})</option>
                  <option value="yesterday">الأمس</option>
                  <option value="last7days">آخر 7 أيام</option>
                  <option value="latest50">أحدث 50 طلب منجز</option>
                </select>
                <button 
                  onClick={() => {
                    const printContent = printRef.current;
                    const originalContent = document.body.innerHTML;
                    document.body.innerHTML = printContent.innerHTML;
                    window.print();
                    document.body.innerHTML = originalContent;
                    window.location.reload();
                  }}
                  className="glass-btn glass-btn-primary"
                  style={{ padding: "8px 16px", borderRadius: 8, display: "flex", gap: 8 }}
                >
                  <span>🖨️</span> طباعة / تصوير
                </button>
                <button 
                  onClick={() => setShowDailyReport(false)}
                  style={{ padding: "8px 16px", borderRadius: 8, background: "transparent", color: "#fca5a5", border: "1px solid #fca5a5", cursor: "pointer" }}
                >
                  إغلاق
                </button>
              </div>
            </div>

            <div ref={printRef} style={{ padding: "24px", overflowY: "auto", flex: 1, backgroundColor: "#fff", color: "#000" }}>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <h1 style={{ margin: "0 0 10px 0", fontSize: 24, color: "#111" }}>
                  تقرير الطلبات المنجزة 
                  {reportPeriod === "today" ? ` - ${new Date().toLocaleDateString('ar-EG')}` : ''}
                  {reportPeriod === "yesterday" ? ` - الأمس` : ''}
                  {reportPeriod === "last7days" ? ` - آخر 7 أيام` : ''}
                  {reportPeriod === "latest50" ? ` - أحدث الطلبات` : ''}
                </h1>
                <p style={{ margin: 0, color: "#555", fontSize: 16 }}>إجمالي الطلبات المنجزة المحددة: {dailyOrders.length} طلب</p>
              </div>

              {loadingDaily ? (
                <div style={{ textAlign: "center", padding: 40, color: "#666" }}>جاري تحميل الطلبات...</div>
              ) : dailyOrders.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "#666" }}>لا يوجد طلبات منجزة في هذه الفترة.</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                      <th style={{ padding: "12px 8px", textAlign: "right", border: "1px solid #e2e8f0" }}>رقم الطلب</th>
                      <th style={{ padding: "12px 8px", textAlign: "right", border: "1px solid #e2e8f0" }}>الخدمة</th>
                      <th style={{ padding: "12px 8px", textAlign: "right", border: "1px solid #e2e8f0" }}>الباقة / الكمية</th>
                      <th style={{ padding: "12px 8px", textAlign: "right", border: "1px solid #e2e8f0" }}>السعر</th>
                      <th style={{ padding: "12px 8px", textAlign: "center", border: "1px solid #e2e8f0" }}>الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyOrders.map(order => (
                      <tr key={order.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "10px 8px", border: "1px solid #e2e8f0" }}>#{order.id}</td>
                        <td style={{ padding: "10px 8px", border: "1px solid #e2e8f0", fontWeight: "bold" }}>{order.category_name} - {order.service_name}</td>
                        <td style={{ padding: "10px 8px", border: "1px solid #e2e8f0" }}>{order.package_name || `كمية: ${order.quantity}`}</td>
                        <td style={{ padding: "10px 8px", border: "1px solid #e2e8f0", color: "#16a34a", fontWeight: "bold", direction: "ltr", textAlign: "right" }}>${Number(order.package_price || 0).toFixed(2)}</td>
                        <td style={{ padding: "10px 8px", border: "1px solid #e2e8f0", textAlign: "center", color: "#16a34a" }}>منجز ✅</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              
              <style dangerouslySetInnerHTML={{__html: `
                @media print {
                  body * { visibility: hidden; }
                  h1, p, table, th, td, tr, div { visibility: visible; }
                  table { width: 100% !important; border-collapse: collapse !important; }
                  th, td { border: 1px solid #ccc !important; padding: 8px !important; }
                }
              `}} />
            </div>
          </div>
        </div>
      )}
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
