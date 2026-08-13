"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/config";

export default function OrdersHistory() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [token, setToken] = useState("");
  const [customerUserStr, setCustomerUserStr] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [baseCurrency, setBaseCurrency] = useState("USD");

  const [services, setServices] = useState([]);

  // Guest tracking states
  const [trackId, setTrackId] = useState("");
  const [trackPhone, setTrackPhone] = useState("");
  const [singleOrder, setSingleOrder] = useState(null);
  const [trackError, setTrackError] = useState("");
  const [trackLoading, setTrackLoading] = useState(false);
  const [filterTab, setFilterTab] = useState("all");
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  const customer = useMemo(() => {
    try {
      return customerUserStr ? JSON.parse(customerUserStr) : null;
    } catch {
      return null;
    }
  }, [customerUserStr]);
  const isLoggedIn = Boolean(token && customer);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
    setToken(localStorage.getItem("customer_token") || "");
    setCustomerUserStr(localStorage.getItem("customer_user") || "");
    setTheme(document.documentElement.getAttribute("data-theme") || localStorage.getItem("theme") || "dark");

    fetch(`${API_BASE_URL}/api/services`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setServices(data))
      .catch(err => console.error("Error loading services in orders page:", err));

    fetch(`${API_BASE_URL}/api/settings`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.base_currency) {
          setBaseCurrency(data.base_currency);
        }
      })
      .catch(err => console.error("Error loading settings in orders page:", err));
  }, []);

  async function fetchCustomerOrders(currentToken) {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/orders`, {
        headers: {
          "Authorization": `Bearer ${currentToken}`
        }
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error("Error fetching customer orders:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!hydrated || !token || !customerUserStr) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCustomerOrders(token);

    fetch(`${API_BASE_URL}/api/customer/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((profile) => {
        if (profile) {
          const profileStr = JSON.stringify(profile);
          if (profileStr !== customerUserStr) {
            setCustomerUserStr(profileStr);
            localStorage.setItem("customer_user", profileStr);
          }
        }
      })
      .catch(() => { });
  }, [hydrated, token, customerUserStr]);

  const handleTrackSingleOrder = async (e) => {
    e.preventDefault();
    setTrackError("");
    setSingleOrder(null);

    if (!trackId.trim() || !trackPhone.trim()) {
      setTrackError("يرجى ملء جميع الحقول لتتبع طلبك.");
      return;
    }

    setTrackLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/track?id=${trackId.trim()}&phone=${encodeURIComponent(trackPhone.trim())}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "تعذر العثور على الطلب.");
      }

      setSingleOrder(data);
    } catch (err) {
      setTrackError(err.message || "تأكد من إدخال رقم الطلب ورقم الهاتف بشكل صحيح.");
    } finally {
      setTrackLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_user");
    setToken("");
    setCustomerUserStr("");
    setOrders([]);
    router.refresh();
  };

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, setTheme] = useState("dark");

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const getSpeedUpWhatsAppUrl = (phoneNum, orderObj, customerName = "") => {
    const custName = customerName || orderObj.customer_username || (orderObj.phone ? `زائر (${orderObj.phone})` : "عميل");
    const text = `🟢 *طلب تسريع خدمة (عرب تك)* ⚡\n\n` +
      `▫️ *رقم الطلب:* #${orderObj.id}\n` +
      `▫️ *اسم العميل:* ${custName}\n` +
      `▫️ *الخدمة:* ${orderObj.service_name || "خدمة"}\n` +
      (orderObj.package_name ? `▫️ *الباقة:* ${orderObj.package_name}\n` : "") +
      (orderObj.player_id ? `▫️ *معرف الحساب / ID:* ${orderObj.player_id}\n` : "") +
      `\nأرجو تسريع معالجة هذا الطلب في أسرع وقت ممكن، وشكراً لكم. 🙏`;
    return `https://wa.me/${phoneNum}?text=${encodeURIComponent(text)}`;
  };

  const renderOrderFields = (order) => {
    const serviceObj = services.find(s => Number(s.id) === Number(order.service_id));
    let fieldsConfig = [];
    if (serviceObj) {
      fieldsConfig = Array.isArray(serviceObj.fields) ? serviceObj.fields : [];
      if (fieldsConfig.length === 0) {
        fieldsConfig = Array.isArray(serviceObj.category_fields) ? serviceObj.category_fields : [];
      }
    }

    let customFieldsMap = {};
    if (order.custom_fields) {
      try {
        customFieldsMap = typeof order.custom_fields === 'string' ? JSON.parse(order.custom_fields) : order.custom_fields;
      } catch (e) { }
    }

    // Ensure player_id value is always rendered
    if (order.player_id && !customFieldsMap.player_id && !customFieldsMap.PlayerID) {
      customFieldsMap.player_id = order.player_id;
    }

    return Object.entries(customFieldsMap).map(([key, value]) => {
      if (value === null || value === undefined || String(value).trim() === '') return null;

      const field = fieldsConfig.find(f => (f.name || f.id || "").toLowerCase().trim() === key.toLowerCase().trim());
      let label = field?.label || key;
      if (label === 'player_id' || label === 'playerID' || label === 'PlayerID') {
        label = "معرّف الحساب (ID)";
      } else if (label === 'phone' || label === 'tel') {
        label = "رقم الهاتف";
      }

      return (
        <div key={key} style={{ background: "var(--primary-light)", padding: "6px 12px", borderRadius: "8px", border: "var(--border-glass)", fontSize: "0.82rem" }}>
          <span style={{ color: "var(--text-muted)" }}>{label}:</span> <span style={{ direction: "ltr", display: "inline-block", fontWeight: "bold", color: "var(--text-main)" }}>{String(value)}</span>
        </div>
      );
    });
  };

  const renderGuestOrderFields = (order) => {
    const serviceObj = services.find(s => Number(s.id) === Number(order.service_id));
    let fieldsConfig = [];
    if (serviceObj) {
      fieldsConfig = Array.isArray(serviceObj.fields) ? serviceObj.fields : [];
      if (fieldsConfig.length === 0) {
        fieldsConfig = Array.isArray(serviceObj.category_fields) ? serviceObj.category_fields : [];
      }
    }

    let customFieldsMap = {};
    if (order.custom_fields) {
      try {
        customFieldsMap = typeof order.custom_fields === 'string' ? JSON.parse(order.custom_fields) : order.custom_fields;
      } catch (e) { }
    }

    if (order.player_id && !customFieldsMap.player_id && !customFieldsMap.PlayerID) {
      customFieldsMap.player_id = order.player_id;
    }

    return Object.entries(customFieldsMap).map(([key, value]) => {
      if (value === null || value === undefined || String(value).trim() === '') return null;

      const field = fieldsConfig.find(f => (f.name || f.id || "").toLowerCase().trim() === key.toLowerCase().trim());
      let label = field?.label || key;
      if (label === 'player_id' || label === 'playerID' || label === 'PlayerID') {
        label = "معرّف الحساب (ID)";
      } else if (label === 'phone' || label === 'tel') {
        label = "رقم الهاتف";
      }

      return (
        <div key={key} style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
          <span style={{ color: "var(--text-main)" }}>{label}:</span>
          <strong style={{ color: "#22d3ee", direction: "ltr", textAlign: "left" }}>{String(value)}</strong>
        </div>
      );
    });
  };

  if (!hydrated) return null;

  return (
    <>
      {/* Main content */}
      <div style={{ marginBottom: "40px", marginTop: "20px" }}>
        {isLoggedIn ? (
          /* Logged In: Show purchase history */
          <div className="orders-dashboard">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 className="section-title" style={{ margin: 0 }}>طلباتي</h2>
            </div>

            {/* Top Cards */}
            <div className="orders-top-cards" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "30px" }}>
              <div className="glass-panel" onClick={() => setFilterTab("pending")} style={{ padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: "20px", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ width: "50px", height: "50px", background: "rgba(22, 119, 238, 0.1)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", color: "var(--brand-blue)" }}>
                    👜
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "900", margin: "0 0 4px 0" }}>الطلبات النشطة</h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>عرض الطلبات النشطة</p>
                  </div>
                </div>
                <div style={{ background: "var(--bg-glass)", borderRadius: "10px", padding: "6px 14px", fontSize: "1.3rem", color: "var(--text-main)", fontWeight: "bold" }}>
                  {orders.filter(o => o.status === "pending" || o.status === "processing").length}
                </div>
              </div>

              <div className="glass-panel" onClick={() => setFilterTab("completed")} style={{ padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: "20px", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ width: "50px", height: "50px", background: "rgba(34, 197, 94, 0.1)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", color: "#22c55e" }}>
                    🛡️
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "900", margin: "0 0 4px 0" }}>الطلبات المكتملة</h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>عرض الطلبات المكتملة</p>
                  </div>
                </div>
                <div style={{ background: "var(--bg-glass)", borderRadius: "10px", padding: "6px 14px", fontSize: "1.3rem", color: "var(--text-main)", fontWeight: "bold" }}>
                  {orders.filter(o => o.status === "completed").length}
                </div>
              </div>

              <Link href="/wallet" className="glass-panel" style={{ padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: "20px", textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ width: "50px", height: "50px", background: "rgba(56, 189, 248, 0.1)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", color: "#38bdf8" }}>
                    💳
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "900", margin: "0 0 4px 0", color: "var(--text-main)" }}>المحفظة</h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>عرض الرصيد والمعاملات</p>
                  </div>
                </div>
                <div style={{ background: "var(--bg-glass)", borderRadius: "10px", padding: "6px 14px", fontSize: "1.1rem", color: "var(--text-main)", fontWeight: "bold", direction: "ltr" }}>
                  {customer ? Number(customer.balance || 0).toFixed(2) : "0.00"} {baseCurrency}
                </div>
              </Link>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px", overflowX: "auto", paddingBottom: "10px", borderBottom: "1px solid var(--border-glass)" }}>
              {["all", "pending", "processing", "completed"].map(tab => {
                const labels = {
                  "all": "الكل",
                  "pending": "قيد المراجعة",
                  "processing": "قيد التنفيذ",
                  "completed": "مكتمل"
                };
                return (
                  <button
                    key={tab}
                    onClick={() => setFilterTab(tab)}
                    style={{
                      padding: "8px 24px",
                      borderRadius: "10px",
                      fontWeight: "bold",
                      fontSize: "0.95rem",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      background: filterTab === tab ? "var(--brand-blue)" : "transparent",
                      color: filterTab === tab ? "#fff" : "var(--text-muted)",
                      border: filterTab === tab ? "none" : "1px solid var(--border-glass)",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </div>

            {/* Data Cards (Replaced Table to remove mobile scroll) */}
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", fontWeight: "bold" }}>جاري تحميل طلباتك...</div>
            ) : orders.length === 0 ? (
              <div className="glass-panel" style={{ textAlign: "center", padding: "50px 20px" }}>
                <span style={{ fontSize: "3.5rem" }}>🛍️</span>
                <h3 style={{ margin: "15px 0" }}>لم تقم بأي عمليات شراء بعد!</h3>
                <Link href="/" className="glass-btn glass-btn-primary">قم بطلب خدمة</Link>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
                {orders.filter(o => {
                  if (filterTab === "all") return true;
                  if (filterTab === "pending" && o.status === "pending") return true;
                  if (filterTab === "processing" && o.status === "processing") return true;
                  if (filterTab === "completed" && o.status === "completed") return true;
                  return false;
                }).map((order) => {
                  
                  // Calculate Stepper State
                  const statusSteps = [
                    { key: "received", label: "الاستلام" },
                    { key: "pending", label: "مراجعة" },
                    { key: "processing", label: "تنفيذ" },
                    { key: "completed", label: "مكتمل" }
                  ];
                  
                  let currentIndex = 1; // default to pending
                  if (order.status === "processing") currentIndex = 2;
                  if (order.status === "completed") currentIndex = 3;
                  if (order.status === "cancelled") currentIndex = -1; // handle cancelled if needed

                  return (
                    <div key={order.id} className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", borderRadius: "16px", position: "relative" }}>
                      
                      {/* Header: Service Name & Order ID */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <div style={{ width: "40px", height: "40px", background: "var(--primary-glow)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <img src="/services-icon.png" alt="" style={{ width: "24px", height: "24px", objectFit: "contain", filter: "invert(1)" }} onError={(e) => e.target.style.display="none"} />
                          </div>
                          <div>
                            <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: "bold", color: "var(--text-main)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                              {order.service_name}
                            </h4>
                            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", direction: "ltr", display: "inline-block", marginTop: "4px" }}>
                              #ATS-{new Date().getFullYear()}-{order.id.toString().padStart(4, '0')}
                            </span>
                          </div>
                        </div>
                        <div style={{ textAlign: "left", flexShrink: 0 }}>
                          <div style={{ fontWeight: "900", color: "var(--primary-color)", direction: "ltr" }}>{Number(order.package_price || 0).toFixed(2)} {baseCurrency}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>{order.created_at.split('T')[0].replace(/-/g, '/')}</div>
                        </div>
                      </div>

                      {/* Package info */}
                      {order.package_name && (
                        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", background: "var(--bg-glass-deep)", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                          <strong>الباقة:</strong> {order.package_name}
                        </div>
                      )}

                      {/* STATUS STEPPER */}
                      <div style={{ padding: "10px 0", marginTop: "auto" }}>
                        {order.status === "cancelled" ? (
                          <div style={{ color: "var(--danger-color)", fontWeight: "bold", textAlign: "center", padding: "10px", background: "rgba(244, 63, 94, 0.1)", borderRadius: "8px" }}>طلب ملغي</div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", width: "100%", margin: "0 auto", maxWidth: "100%" }}>
                            {/* connecting line */}
                            <div style={{ position: "absolute", top: "14px", left: "10px", right: "10px", height: "3px", background: "var(--border-glass)", zIndex: 0, borderRadius: "10px" }}></div>
                            <div style={{ position: "absolute", top: "14px", right: "10px", width: `calc(${(currentIndex / (statusSteps.length - 1)) * 100}% - 20px)`, height: "3px", background: "var(--brand-blue)", zIndex: 1, transition: "width 0.4s ease", borderRadius: "10px" }}></div>
                            
                            {statusSteps.map((step, idx) => {
                              const isPast = idx <= currentIndex;
                              const isCurrent = idx === currentIndex;
                              return (
                                <div key={step.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", zIndex: 2 }}>
                                  <div style={{
                                    width: "16px", height: "16px", borderRadius: "50%",
                                    background: isCurrent ? "var(--brand-blue)" : (isPast ? "var(--brand-cyan)" : "var(--bg-glass-deep)"),
                                    boxShadow: isCurrent ? "0 0 10px var(--brand-blue)" : "none",
                                    border: isPast ? "none" : "2px solid var(--border-glass)"
                                  }}></div>
                                  <div style={{ fontSize: "0.65rem", color: isPast ? "var(--text-main)" : "var(--text-muted)", fontWeight: "bold" }}>{step.label}</div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>

                      {/* Action button */}
                      <button
                        onClick={() => setSelectedOrderDetails(order)}
                        className="glass-btn"
                        style={{ padding: "10px 14px", fontSize: "0.9rem", background: "rgba(22, 119, 238, 0.1)", color: "var(--brand-blue)", border: "1px solid rgba(22, 119, 238, 0.3)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginTop: "5px" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-blue)"; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(22, 119, 238, 0.1)"; e.currentTarget.style.color = "var(--brand-blue)"; }}
                      >
                        <span style={{ fontWeight: "bold" }}>تفاصيل الطلب</span>
                        <span style={{ fontSize: "1rem" }}>❮</span>
                      </button>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Guest: Search by ID & Phone form */
          <div className="orders-layout">
            <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <h2 style={{ fontWeight: 900 }}>تتبع حالة طلب الخدمة</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>
                  أدخل رقم الطلب ورقم الهاتف الذي استخدمته عند طلب الخدمة لمعرفة حالة طلبك فوراً.
                </p>
              </div>

              <hr style={{ opacity: 0.1 }} />

              <form onSubmit={handleTrackSingleOrder} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="track_id">رقم الطلب (Order ID):</label>
                  <input id="track_id" type="number" placeholder="مثال: 12" value={trackId} onChange={(e) => setTrackId(e.target.value)} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="track_phone">رقم الهاتف المستخدم:</label>
                  <input id="track_phone" type="text" placeholder="مثال: 01023456789" value={trackPhone} onChange={(e) => setTrackPhone(e.target.value)} required />
                </div>
                {trackError && <div style={{ padding: "10px 14px", background: "rgba(244, 63, 94, 0.1)", borderRight: "4px solid var(--danger-color)", color: "var(--danger-color)", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "600" }}>⚠️ {trackError}</div>}
                <button type="submit" disabled={trackLoading} className="glass-btn glass-btn-primary" style={{ marginTop: "10px", width: "100%", padding: "14px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  {trackLoading ? "جاري البحث..." : "تتبع الطلب الآن 🔍"}
                </button>
              </form>

              {singleOrder && (
                <div className="glass-panel" style={{ marginTop: "15px", border: "1px solid var(--border-glass)", background: "var(--primary-light)", display: "flex", flexDirection: "column", gap: "10px", padding: "18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 900, color: "var(--accent-color)" }}>الطلب #{singleOrder.id}</span>
                    <span className={`badge badge-${singleOrder.status}`}>{singleOrder.status === "completed" ? "مكتمل" : singleOrder.status === "processing" ? "قيد التنفيذ" : singleOrder.status === "pending" ? "قيد المراجعة" : "ملغي"}</span>
                  </div>
                  <h3 style={{ margin: "5px 0", fontSize: "1.1rem" }}>{singleOrder.service_name}</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "10px" }}>
                    {singleOrder.code && (
                      <div style={{ padding: "12px", background: "var(--bg-glass-deep)", borderRadius: "8px", border: "var(--border-glass)", fontFamily: "monospace", color: "var(--text-main)", fontWeight: "bold" }}>
                        {singleOrder.code}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      {/* ── Bottom Server Stats Banner (Orders Page Mockup) ── */}
      <div style={{ marginTop: "50px", marginBottom: "40px", position: "relative", padding: "40px 20px", borderRadius: "24px", background: "var(--bg-glass-deep)", border: "1px solid var(--border-glass)", overflow: "hidden", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
        
        {/* Glow & Graphic */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "300px", height: "100%", background: "radial-gradient(circle, rgba(22, 119, 238, 0.15) 0%, transparent 60%)", pointerEvents: "none", zIndex: 0 }}></div>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1, pointerEvents: "none", opacity: 0.9 }}>
           {/* Fallback server icon if no image */}
           <div style={{ fontSize: "8rem", filter: "drop-shadow(0 10px 20px rgba(22,119,238,0.4))" }}>🗄️</div>
        </div>

        {/* Right side items (in RTL) */}
        <div style={{ display: "flex", flex: 1, gap: "20px", zIndex: 2, justifyContent: "flex-start", flexWrap: "wrap" }}>
          
          <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            <div style={{ color: "var(--brand-blue)", fontSize: "2rem" }}>🛡️</div>
            <div>
              <h4 style={{ margin: "0 0 5px 0", fontSize: "1.1rem", fontWeight: 800 }}>أمان وموثوقية</h4>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: "160px" }}>حماية متقدمة لبياناتك على مدار الساعة</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            <div style={{ color: "var(--brand-blue)", fontSize: "2rem" }}>⏱️</div>
            <div>
              <h4 style={{ margin: "0 0 5px 0", fontSize: "1.1rem", fontWeight: 800 }}>أداء عالي</h4>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: "160px" }}>بنية تحتية قوية وسرعة استجابة فائقة</p>
            </div>
          </div>

        </div>

        {/* Center Spacer for Graphic */}
        <div style={{ flex: "0 1 200px" }}></div>

        {/* Left side items (in RTL) */}
        <div style={{ display: "flex", flex: 1, gap: "20px", zIndex: 2, justifyContent: "flex-end", flexWrap: "wrap" }}>
          
          <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            <div style={{ color: "var(--brand-blue)", fontSize: "2rem" }}>🎧</div>
            <div>
              <h4 style={{ margin: "0 0 5px 0", fontSize: "1.1rem", fontWeight: 800 }}>دعم فني متخصص</h4>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: "160px" }}>فريق محترف جاهز لمساعدتك دائماً</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            <div style={{ color: "var(--brand-blue)", fontSize: "2rem" }}>🎛️</div>
            <div>
              <h4 style={{ margin: "0 0 5px 0", fontSize: "1.1rem", fontWeight: 800 }}>إدارة سهلة</h4>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: "160px" }}>لوحة تحكم متقدمة تجربة سلسة ومرنة</p>
            </div>
          </div>

        </div>

      </div>

      </div>

      {/* Order Details Modal (Glassmorphism, Dark/Light Mode Supported) */}
      {selectedOrderDetails && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }} onClick={() => setSelectedOrderDetails(null)}>
          <div className="glass-panel" style={{ width: "100%", maxWidth: "500px", padding: "30px", borderRadius: "24px", position: "relative", display: "flex", flexDirection: "column", gap: "20px", background: "var(--bg-glass-deep)", border: "1px solid var(--border-glass)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-glass)", paddingBottom: "15px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ width: "45px", height: "45px", background: "var(--primary-glow)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src="/services-icon.png" alt="" style={{ width: "24px", height: "24px", objectFit: "contain", filter: "invert(1)" }} onError={(e) => e.target.style.display="none"} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "900", color: "var(--text-main)" }}>تفاصيل الطلب</h3>
                  <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--text-muted)", direction: "ltr" }}>
                    #ATS-{new Date().getFullYear()}-{selectedOrderDetails.id.toString().padStart(4, '0')}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedOrderDetails(null)} style={{ background: "rgba(244, 63, 94, 0.1)", color: "var(--danger-color)", border: "none", width: "36px", height: "36px", borderRadius: "10px", fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background="rgba(244, 63, 94, 0.2)"} onMouseLeave={(e) => e.currentTarget.style.background="rgba(244, 63, 94, 0.1)"}>
                ✕
              </button>
            </div>

            {/* Main Info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "var(--bg-glass)", borderRadius: "12px", border: "1px solid var(--border-glass)" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: "bold" }}>الخدمة</span>
                <span style={{ color: "var(--text-main)", fontWeight: "900", textAlign: "left", maxWidth: "60%" }}>{selectedOrderDetails.service_name}</span>
              </div>
              
              {selectedOrderDetails.package_name && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "var(--bg-glass)", borderRadius: "12px", border: "1px solid var(--border-glass)" }}>
                  <span style={{ color: "var(--text-muted)", fontWeight: "bold" }}>الباقة</span>
                  <span style={{ color: "var(--text-main)", fontWeight: "bold", textAlign: "left", maxWidth: "70%" }}>{selectedOrderDetails.package_name}</span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "var(--bg-glass)", borderRadius: "12px", border: "1px solid var(--border-glass)" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: "bold" }}>السعر</span>
                <span style={{ color: "var(--primary-color)", fontWeight: "900", direction: "ltr" }}>{Number(selectedOrderDetails.package_price || 0).toFixed(2)} {baseCurrency}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "var(--bg-glass)", borderRadius: "12px", border: "1px solid var(--border-glass)" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: "bold" }}>الحالة</span>
                <span className={`badge badge-${selectedOrderDetails.status}`} style={{ fontSize: "0.85rem", padding: "4px 10px", borderRadius: "8px" }}>
                  {selectedOrderDetails.status === "completed" ? "مكتمل" : selectedOrderDetails.status === "processing" ? "قيد التنفيذ" : selectedOrderDetails.status === "pending" ? "قيد المراجعة" : "ملغي"}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "var(--bg-glass)", borderRadius: "12px", border: "1px solid var(--border-glass)" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: "bold" }}>تاريخ الطلب</span>
                <span style={{ color: "var(--text-main)", fontWeight: "bold", direction: "ltr" }}>{selectedOrderDetails.created_at.replace('T', ' ').substring(0, 16)}</span>
              </div>
            </div>

            {/* Custom Fields (Player ID, etc) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <h4 style={{ margin: "10px 0 5px", fontSize: "1rem", color: "var(--text-main)" }}>معلومات إضافية</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {renderOrderFields(selectedOrderDetails)}
                {/* Fallback if no fields are rendered but there's a player_id just in case */}
                {selectedOrderDetails.player_id && renderOrderFields(selectedOrderDetails).every(item => item === null) && (
                   <div style={{ background: "var(--primary-light)", padding: "6px 12px", borderRadius: "8px", border: "1px solid var(--border-glass)", fontSize: "0.82rem" }}>
                     <span style={{ color: "var(--text-muted)" }}>معرّف الحساب (ID):</span> <span style={{ direction: "ltr", display: "inline-block", fontWeight: "bold", color: "var(--text-main)" }}>{selectedOrderDetails.player_id}</span>
                   </div>
                )}
              </div>
            </div>

            {/* Code Result (If any) */}
            {selectedOrderDetails.code && (
              <div style={{ marginTop: "10px" }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: "1rem", color: "#10b981", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>✅</span> النتيجة / الكود
                </h4>
                <div style={{ padding: "16px", background: "rgba(16, 185, 129, 0.05)", borderRadius: "12px", border: "1px solid rgba(16, 185, 129, 0.2)", color: "var(--text-main)", fontFamily: "monospace", fontSize: "1.1rem", fontWeight: "bold", textAlign: "center", wordBreak: "break-all", userSelect: "all" }}>
                  {selectedOrderDetails.code}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
              {selectedOrderDetails.status !== "completed" && selectedOrderDetails.status !== "cancelled" && (
                <a href={getSpeedUpWhatsAppUrl("+201019080766", selectedOrderDetails, customer?.username)} target="_blank" rel="noopener noreferrer" className="glass-btn glass-btn-primary" style={{ flex: 1, padding: "12px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", textDecoration: "none", background: "#25D366", color: "#fff", border: "none" }}>
                  تسريع الطلب عبر واتساب
                </a>
              )}
              <button onClick={() => setSelectedOrderDetails(null)} className="glass-btn" style={{ flex: selectedOrderDetails.status === "completed" ? 1 : "0 0 100px", padding: "12px", borderRadius: "12px", fontWeight: "bold", background: "var(--bg-glass)", color: "var(--text-main)", border: "1px solid var(--border-glass)", cursor: "pointer" }}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}