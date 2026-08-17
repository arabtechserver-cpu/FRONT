"use client";

import { useEffect, useState, useRef } from "react";
import { API_BASE_URL } from "@/config";
import OrderInspectionView from "../OrderInspectionView";

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
  
  // Orders Analytics & Inspection State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState("");

  // Daily Report State
  const [showDailyReport, setShowDailyReport] = useState(false);
  const [dailyOrders, setDailyOrders] = useState([]);
  const [allFetchedOrders, setAllFetchedOrders] = useState([]);
  const [reportPeriod, setReportPeriod] = useState("today");
  const [loadingDaily, setLoadingDaily] = useState(false);
  const printRef = useRef(null);

  const fetchOrdersForInspection = async () => {
    setOrdersLoading(true);
    const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("admin_token") : "") || "";
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders?limit=150`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data) ? data : [];
        setOrders(list);
        if (list.length > 0 && !selectedOrder) {
          setSelectedOrder(list[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load orders for analytics:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchDailyReport = async () => {
    setShowDailyReport(true);
    setLoadingDaily(true);
    const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("admin_token") : "") || "";
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders?limit=500`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!response.ok) throw new Error("تعذر جلب الطلبات");
      const allOrders = await response.json();
      const completed = allOrders.filter(o => o.status === "completed");
      setAllFetchedOrders(completed);
      
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
    const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("admin_token") : "") || "";
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

    fetchOrdersForInspection();

    return () => { active = false; };
  }, [days, token]);

  const valueFor = (key) => key === "uniqueSessions"
    ? summary?.uniqueSessions || 0
    : summary?.counts?.[key] || 0;

  // Filter orders for search
  const filteredOrders = orders.filter(o => {
    if (!orderSearchQuery.trim()) return true;
    const q = orderSearchQuery.toLowerCase();
    return (
      String(o.id).includes(q) ||
      (o.player_id && String(o.player_id).toLowerCase().includes(q)) ||
      (o.service_name && o.service_name.toLowerCase().includes(q)) ||
      (o.customer_username && o.customer_username.toLowerCase().includes(q)) ||
      (o.api_order_id && String(o.api_order_id).toLowerCase().includes(q))
    );
  });

  return (
    <div className="tab-content" dir="rtl" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* ── TOP CONVERSION SUMMARY PANEL ── */}
      <div className="glass-panel" style={{ padding: 24, borderRadius: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          <div>
            <h2 style={{ color: "var(--text-main)", margin: 0, fontSize: "1.4rem", fontWeight: 900 }}>
              تحليلات المبيعات ونشاط الطلبات
            </h2>
            <p style={{ color: "var(--text-muted)", margin: "6px 0 0", fontSize: "0.95rem" }}>
              إحصائيات دقيقة وفحص كامل لبيانات الطلبات ومعدلات الإنجاز عبر السيرفر والـ API.
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <button 
              onClick={fetchDailyReport}
              className="glass-btn" 
              style={{ padding: "8px 16px", borderRadius: 12, background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)", display: "flex", gap: 8, alignItems: "center", fontWeight: "bold" }}
            >
              <span>📄</span>
              تقرير إنجاز اليوم
            </button>
            <select value={days} onChange={(event) => setDays(Number(event.target.value))} style={{ width: 150, padding: "8px 12px", borderRadius: 12, background: "var(--bg-secondary)", color: "var(--text-main)", border: "1px solid var(--border-color)" }}>
              <option value={7}>آخر 7 أيام</option>
              <option value={30}>آخر 30 يومًا</option>
              <option value={90}>آخر 90 يومًا</option>
            </select>
          </div>
        </div>

        {loading && <div style={{ color: "var(--text-muted)", padding: 24 }}>جاري تحميل الإحصائيات...</div>}
        {error && <div style={{ color: "#fca5a5", background: "rgba(239,68,68,.12)", padding: 14, borderRadius: 12 }}>{error}</div>}

        {!loading && !error && summary && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
              {metricDefinitions.map(([key, label, icon]) => (
                <div key={key} style={{ padding: 18, borderRadius: 16, background: "var(--bg-glass)", border: "1px solid var(--border-color)" }}>
                  <div style={{ color: "var(--text-muted)", fontSize: 14, fontWeight: 700 }}>{icon} {label}</div>
                  <div style={{ color: "var(--text-main)", fontSize: 30, fontWeight: 900, marginTop: 8 }}>{valueFor(key).toLocaleString("ar-EG")}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14, marginTop: 18 }}>
              <RateCard label="من مشاهدة الخدمة إلى بدء الطلب" value={summary.rates?.serviceToCheckout} />
              <RateCard label="من بدء الطلب إلى الإتمام" value={summary.rates?.checkoutToOrder} />
              <RateCard label="من مشاهدة الخدمة إلى البيع" value={summary.rates?.serviceToOrder} />
            </div>
          </>
        )}
      </div>

      {/* ── GSM SERVER / DHRU ORDER INSPECTION & ANALYTICS SECTION ── */}
      <div className="glass-panel" style={{ padding: 24, borderRadius: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 900, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🔍</span>
              <span>فحص وتحليل تفاصيل الطلبات (DHRU / GSM Order Analytics)</span>
            </h3>
            <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              عرض بيانات الطلب الدقيقة وحساب الوقت وتكاليف الـ API وتعديل الردود وإرجاع الرصيد.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flex: "1 1 300px", maxWidth: "450px" }}>
            <input
              type="text"
              value={orderSearchQuery}
              onChange={(e) => setOrderSearchQuery(e.target.value)}
              placeholder="ابحث برقم الطلب أو الـ IMEI أو اسم الخدمة أو العميل..."
              style={{
                width: "100%", padding: "10px 14px", borderRadius: "10px",
                border: "1px solid var(--border-color)", background: "var(--bg-secondary)",
                color: "var(--text-main)", outline: "none", fontSize: "0.9rem"
              }}
            />
            {orderSearchQuery && (
              <button
                onClick={() => setOrderSearchQuery("")}
                style={{ padding: "8px 12px", background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Orders Selector Grid (Quick Tabs) */}
        <div style={{
          display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "12px", marginBottom: "20px",
          borderBottom: "1px solid var(--border-color)"
        }}>
          {ordersLoading ? (
            <div style={{ color: "var(--text-muted)", padding: "10px" }}>جاري تحميل قائمة الطلبات...</div>
          ) : filteredOrders.length === 0 ? (
            <div style={{ color: "var(--text-muted)", padding: "10px" }}>لا توجد طلبات مطابقة للبحث.</div>
          ) : (
            filteredOrders.slice(0, 20).map((ord) => {
              const isSelected = selectedOrder && selectedOrder.id === ord.id;
              const badgeBg = ord.status === "completed" ? "rgba(16, 185, 129, 0.15)" : ord.status === "pending" ? "rgba(234, 179, 8, 0.15)" : "rgba(239, 68, 68, 0.15)";
              const badgeColor = ord.status === "completed" ? "#10b981" : ord.status === "pending" ? "#eab308" : "#ef4444";

              return (
                <button
                  key={ord.id}
                  onClick={() => setSelectedOrder(ord)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    border: isSelected ? "2px solid #00b4d8" : "1px solid var(--border-color)",
                    background: isSelected ? "rgba(0, 180, 216, 0.2)" : "var(--bg-glass)",
                    color: "var(--text-main)",
                    fontWeight: isSelected ? 800 : 500,
                    fontSize: "0.88rem",
                    transition: "all 0.2s ease"
                  }}
                >
                  <span style={{ fontWeight: 900 }}>#{ord.id}</span>
                  <span style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis" }}>{ord.service_name}</span>
                  <span style={{ padding: "2px 6px", borderRadius: "4px", fontSize: "0.75rem", background: badgeBg, color: badgeColor, fontWeight: "bold" }}>
                    {ord.status === "completed" ? "Replied" : ord.status === "pending" ? "Pending" : "Rejected"}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Active Order Full Inspection View */}
        {selectedOrder ? (
          <div style={{ marginTop: "10px" }}>
            <OrderInspectionView
              order={selectedOrder}
              token={token}
              onOrderUpdated={(updated) => {
                setSelectedOrder(updated);
                setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
              }}
            />
          </div>
        ) : (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            اختر طلباً من القائمة بالأعلى لعرض بياناته وتحليله الكامل.
          </div>
        )}
      </div>

      {/* ── DAILY REPORT MODAL ── */}
      {showDailyReport && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.95)", zIndex: 99999, display: "flex", flexDirection: "column", padding: "20px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", width: "100%", background: "var(--bg-secondary)", borderRadius: 20, display: "flex", flexDirection: "column", maxHeight: "100%", overflow: "hidden" }}>
            
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <h2 style={{ margin: 0, color: "var(--text-main)", display: "flex", alignItems: "center", gap: 10 }}>
                <span>📊</span> تقرير الإنجاز
              </h2>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <select 
                  value={reportPeriod}
                  onChange={(e) => setReportPeriod(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: 8, background: "var(--bg-color)", color: "var(--text-main)", border: "1px solid var(--border-color)", outline: "none" }}
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
      <div style={{ color: "var(--brand-cyan, #10b981)", fontSize: 14, fontWeight: 700 }}>{label}</div>
      <div style={{ color: "#10b981", fontSize: 28, fontWeight: 900, marginTop: 8 }}>{Number(value || 0).toLocaleString("ar-EG")}%</div>
    </div>
  );
}
