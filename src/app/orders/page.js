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
        <div key={key} style={{ background: "rgba(255, 255, 255, 0.05)", padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)", fontSize: "0.82rem" }}>
          <span style={{ color: "var(--text-muted)" }}>{label}:</span> <span style={{ direction: "ltr", display: "inline-block", fontWeight: "bold", color: "white" }}>{String(value)}</span>
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
          <span style={{ color: "#cbd5e1" }}>{label}:</span>
          <strong style={{ color: "#22d3ee", direction: "ltr", textAlign: "left" }}>{String(value)}</strong>
        </div>
      );
    });
  };

  if (!hydrated) return null;

  return (
    <>
      {/* Main content */}
      <div style={{ marginBottom: "40px" }}>
        {isLoggedIn ? (
          /* Logged In: Show purchase history */
          <div>
            <h2 className="section-title">مشترياتي وطلباتي السابقة</h2>

            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", fontWeight: "bold" }}>جاري تحميل طلباتك...</div>
            ) : orders.length === 0 ? (
              <div className="glass-panel" style={{ textAlign: "center", padding: "50px 20px" }}>
                <span style={{ fontSize: "3.5rem" }}>🛍️</span>
                <h3 style={{ margin: "15px 0" }}>لم تقم بأي عمليات شراء بعد!</h3>
                <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>تصفح أقسام البرمجيات والخدمات وتفعيل السوفت وير فوراً.</p>
                <Link href="/" className="glass-btn glass-btn-primary">قم بطلب خدمة</Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {orders.map((order) => (
                  <div className="glass-panel" key={order.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", padding: "20px 30px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontWeight: 900, color: "var(--accent-color)" }}>طلب رقم #{order.id}</span>
                        <span className={`badge badge-${order.status}`} style={{ fontSize: "0.75rem" }}>
                          {order.status === "pending" && "انتظار"}
                          {order.status === "processing" && "قيد المعالجة"}
                          {order.status === "completed" && "مكتمل"}
                          {order.status === "cancelled" && "ملغي"}
                        </span>
                      </div>
                      <h3 style={{ fontWeight: 800, fontSize: "1.2rem", marginTop: "4px" }}>{order.service_name}</h3>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        الباقة: <strong>{order.package_name}</strong> | القيمة: <strong>{Number(order.package_price || 0).toFixed(2)} {baseCurrency}</strong>
                      </p>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
                        {renderOrderFields(order)}
                      </div>
                      {order.code && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "12px", maxWidth: "400px" }}>
                          <span style={{ color: "#c084fc", fontSize: "0.85rem", fontWeight: "bold" }}>🔑 كود التفعيل / رسالة الخدمة:</span>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "12px",
                            background: "rgba(10, 12, 26, 0.4)",
                            padding: "10px 14px",
                            borderRadius: "10px",
                            border: "1px solid rgba(255, 255, 255, 0.06)"
                          }}>
                            <span style={{
                              fontFamily: "monospace",
                              fontWeight: "bold",
                              fontSize: "1.1rem",
                              color: "#ffffff",
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-all",
                              direction: "ltr",
                              textAlign: "left"
                            }}>
                              {order.code}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(order.code);
                                alert("تم نسخ الكود بنجاح! 📋");
                              }}
                              style={{
                                background: "rgba(255, 255, 255, 0.05)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                borderRadius: "6px",
                                color: "#cbd5e1",
                                padding: "4px 10px",
                                fontSize: "0.75rem",
                                cursor: "pointer",
                                fontWeight: "bold",
                                transition: "all 0.2s"
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = "rgba(255, 255, 255, 0.1)";
                                e.target.style.color = "#ffffff";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = "rgba(255, 255, 255, 0.05)";
                                e.target.style.color = "#cbd5e1";
                              }}
                            >
                              نسخ 📋
                            </button>
                          </div>
                        </div>
                      )}
                      {order.download_link && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "12px", maxWidth: "400px" }}>
                          <span style={{ color: "#38bdf8", fontSize: "0.85rem", fontWeight: "bold" }}>📥 رابط تحميل الأداة / التطبيق:</span>
                          <a
                            href={order.download_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "8px",
                              background: "rgba(56, 189, 248, 0.1)",
                              padding: "12px 18px",
                              borderRadius: "12px",
                              border: "1px solid rgba(56, 189, 248, 0.25)",
                              color: "#38bdf8",
                              fontWeight: "bold",
                              textDecoration: "none",
                              transition: "all 0.2s",
                              textAlign: "center"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = "rgba(56, 189, 248, 0.2)";
                              e.target.style.borderColor = "rgba(56, 189, 248, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = "rgba(56, 189, 248, 0.1)";
                              e.target.style.borderColor = "rgba(56, 189, 248, 0.25)";
                            }}
                          >
                            📥 {order.download_link_title || "تحميل الأداة"}
                          </a>
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        {new Date(order.created_at).toLocaleString("ar-EG")}
                      </span>
                      {(order.status === "pending" || order.status === "processing") && (
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end", marginTop: "6px" }}>
                          <a
                            href={getSpeedUpWhatsAppUrl("16728972935", order, customer?.username)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="glass-btn"
                            style={{ padding: "6px 14px", fontSize: "0.8rem", borderRadius: "8px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.35)", color: "#4ade80", fontWeight: "bold", display: "inline-flex", alignItems: "center", gap: "6px" }}
                          >
                            <span>⚡ تسريع الطلب (إدارة 1)</span>
                          </a>
                          <a
                            href={getSpeedUpWhatsAppUrl("249123667227", order, customer?.username)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="glass-btn"
                            style={{ padding: "6px 14px", fontSize: "0.8rem", borderRadius: "8px", background: "rgba(34, 197, 94, 0.15)", border: "1px solid rgba(34, 197, 94, 0.35)", color: "#86efac", fontWeight: "bold", display: "inline-flex", alignItems: "center", gap: "6px" }}
                          >
                            <span>⚡ تسريع الطلب (إدارة 2)</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Guest: Search by ID & Phone form */
          <div className="orders-layout">

            {/* Form Column */}
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
                  <input
                    id="track_id"
                    type="number"
                    placeholder="مثال: 12"
                    value={trackId}
                    onChange={(e) => setTrackId(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="track_phone">رقم الهاتف المستخدم:</label>
                  <input
                    id="track_phone"
                    type="text"
                    placeholder="مثال: 01023456789"
                    value={trackPhone}
                    onChange={(e) => setTrackPhone(e.target.value)}
                    required
                  />
                </div>

                {trackError && (
                  <div style={{ padding: "10px 14px", background: "rgba(244, 63, 94, 0.1)", borderRight: "4px solid var(--danger-color)", color: "var(--danger-color)", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "600" }}>
                    ⚠️ {trackError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={trackLoading}
                  className="glass-btn glass-btn-primary"
                  style={{ padding: "12px", borderRadius: "12px" }}
                >
                  {trackLoading ? "جاري البحث..." : "تتبع حالة الطلب 🔍"}
                </button>
              </form>
            </div>

            {/* Result Column or Info */}
            <div className="glass-panel" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              {singleOrder ? (
                /* Order found */
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  <div style={{ textAlign: "center" }}>
                    <span style={{ fontSize: "3rem" }}>📦</span>
                    <h3 style={{ fontWeight: 900, marginTop: "10px", color: "#ffffff" }}>تفاصيل الطلب #{singleOrder.id}</h3>

                    <div style={{ display: "inline-block", marginTop: "10px" }}>
                      <span className={`badge badge-${singleOrder.status}`} style={{ fontSize: "0.9rem", padding: "6px 16px" }}>
                        {singleOrder.status === "pending" && "طلبك قيد الانتظار"}
                        {singleOrder.status === "processing" && "طلبك قيد المعالجة ⚡"}
                        {singleOrder.status === "completed" && "تم تنفيذ طلبك بنجاح ✅"}
                        {singleOrder.status === "cancelled" && "تم إلغاء الطلب ❌"}
                      </span>
                    </div>
                  </div>

                  <hr style={{ opacity: 0.12, borderColor: "rgba(255,255,255,0.08)" }} />

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.92rem", padding: "16px", borderRadius: "16px", background: "linear-gradient(180deg, rgba(13, 18, 36, 0.95), rgba(13, 18, 36, 0.75))", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ color: "#cbd5e1" }}>الخدمة:</span>
                      <strong style={{ color: "#ffffff", textAlign: "left" }}>{singleOrder.service_name} ({singleOrder.category_name})</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ color: "#cbd5e1" }}>الباقة المطلوبة:</span>
                      <strong style={{ color: "#ffffff", textAlign: "left" }}>{singleOrder.package_name}</strong>
                    </div>
                    {renderGuestOrderFields(singleOrder)}
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ color: "#cbd5e1" }}>القيمة الإجمالية:</span>
                      <strong style={{ color: "#34d399" }}>{Number(singleOrder.package_price || 0).toFixed(2)} {baseCurrency}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ color: "#cbd5e1" }}>تاريخ الطلب:</span>
                      <span style={{ color: "#f8fafc" }}>{new Date(singleOrder.created_at).toLocaleString("ar-EG")}</span>
                    </div>
                    {singleOrder.code && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "10px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
                        <span style={{ color: "#c084fc", fontSize: "0.85rem", fontWeight: "bold" }}>🔑 كود التفعيل / رسالة الخدمة:</span>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "12px",
                          background: "rgba(10, 12, 26, 0.4)",
                          padding: "10px 14px",
                          borderRadius: "10px",
                          border: "1px solid rgba(255, 255, 255, 0.06)"
                        }}>
                          <span style={{
                            fontFamily: "monospace",
                            fontWeight: "bold",
                            fontSize: "1.1rem",
                            color: "#ffffff",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-all",
                            direction: "ltr",
                            textAlign: "left"
                          }}>
                            {singleOrder.code}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(singleOrder.code);
                              alert("تم نسخ الكود بنجاح! 📋");
                            }}
                            style={{
                              background: "rgba(255, 255, 255, 0.05)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              borderRadius: "6px",
                              color: "#cbd5e1",
                              padding: "4px 10px",
                              fontSize: "0.75rem",
                              cursor: "pointer",
                              fontWeight: "bold",
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = "rgba(255, 255, 255, 0.1)";
                              e.target.style.color = "#ffffff";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = "rgba(255, 255, 255, 0.05)";
                              e.target.style.color = "#cbd5e1";
                            }}
                          >
                            نسخ 📋
                          </button>
                        </div>
                      </div>
                    )}
                    {singleOrder.download_link && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "10px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
                        <span style={{ color: "#38bdf8", fontSize: "0.85rem", fontWeight: "bold" }}>📥 رابط تحميل الأداة / التطبيق:</span>
                        <a
                          href={singleOrder.download_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            background: "rgba(56, 189, 248, 0.1)",
                            padding: "12px 18px",
                            borderRadius: "12px",
                            border: "1px solid rgba(56, 189, 248, 0.25)",
                            color: "#38bdf8",
                            fontWeight: "bold",
                            textDecoration: "none",
                            transition: "all 0.2s",
                            textAlign: "center"
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = "rgba(56, 189, 248, 0.2)";
                            e.target.style.borderColor = "rgba(56, 189, 248, 0.4)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "rgba(56, 189, 248, 0.1)";
                            e.target.style.borderColor = "rgba(56, 189, 248, 0.25)";
                          }}
                        >
                          📥 {singleOrder.download_link_title || "تحميل الأداة"}
                        </a>
                      </div>
                    )}
                  </div>

                  {(singleOrder.status === "pending" || singleOrder.status === "processing") && (
                    <div style={{ display: "flex", gap: "10px", marginTop: "14px", flexDirection: "column", background: "rgba(16, 185, 129, 0.06)", padding: "16px", borderRadius: "14px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                      <div style={{ fontSize: "0.92rem", color: "#4ade80", textAlign: "center", fontWeight: "bold" }}>
                        ⚡ لتسريع تنفيذ الطلب فوراً عبر واتساب الإدارة:
                      </div>
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <a
                          href={getSpeedUpWhatsAppUrl("16728972935", singleOrder, customer?.username)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="glass-btn"
                          style={{ flex: "1 1 200px", padding: "12px 14px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.2)", border: "1px solid rgba(16, 185, 129, 0.4)", color: "#ffffff", fontWeight: "bold", textAlign: "center", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                        >
                          <span>🟢 واتساب الإدارة 1 (+1 672-897-2935)</span>
                        </a>
                        <a
                          href={getSpeedUpWhatsAppUrl("249123667227", singleOrder, customer?.username)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="glass-btn"
                          style={{ flex: "1 1 200px", padding: "12px 14px", borderRadius: "10px", background: "rgba(34, 197, 94, 0.2)", border: "1px solid rgba(34, 197, 94, 0.4)", color: "#ffffff", fontWeight: "bold", textAlign: "center", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                        >
                          <span>🟢 واتساب الإدارة 2 (+249 12-366-7227)</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Static Guidance */
                <div style={{ textAlign: "center", padding: "20px 10px" }}>
                  <span style={{ fontSize: "3.5rem" }}>🔑</span>
                  <h3 style={{ fontWeight: 900, margin: "15px 0" }}>تسجيل الدخول لتتبع أسهل</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: "1.7", marginBottom: "20px" }}>
                    عند تسجيل حساب جديد، ستتمكن من مراجعة وتتبع جميع طلبات الخدمات السابقة الخاصة بك في مكان واحد ودون الحاجة لإدخال أرقام الهواتف أو أرقام الطلبات يدوياً في كل مرة.
                  </p>
                  <Link href="/login" className="glass-btn glass-btn-primary" style={{ width: "100%", padding: "12px", borderRadius: "12px" }}>
                    تسجيل الدخول / إنشاء حساب
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </>
  );
}
