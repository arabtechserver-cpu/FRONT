import React, { useState } from "react";

export default function ApiResellersTab({
  customers,
  customerSearch,
  setCustomerSearch,
  filteredCustomers,
  token,
  API_BASE_URL
}) {
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [apiEnabled, setApiEnabled] = useState(false);
  const [apiMarkup, setApiMarkup] = useState(0);
  const [apiAllowedIps, setApiAllowedIps] = useState("");
  const [apiBlockedServices, setApiBlockedServices] = useState("");
  const [loading, setLoading] = useState(false);

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setApiEnabled(customer.api_enabled || false);
    setApiMarkup(customer.api_markup || 0);
    setApiAllowedIps((customer.api_allowed_ips || []).join(", "));
    setApiBlockedServices((customer.api_blocked_services || []).join(", "));
  };

  const handleSaveApiSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const parsedIps = apiAllowedIps.split(",").map(s => s.trim()).filter(s => s);
      const parsedBlocked = apiBlockedServices.split(",").map(s => Number(s.trim())).filter(s => !isNaN(s));

      const response = await fetch(`${API_BASE_URL}/api/customer/admin/${editingCustomer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          api_enabled: apiEnabled,
          api_markup: Number(apiMarkup),
          api_allowed_ips: parsedIps,
          api_blocked_services: parsedBlocked
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "فشل تحديث الإعدادات.");
      }

      alert("تم حفظ إعدادات الـ API بنجاح!");
      window.location.reload(); // Refresh the page to get updated customers list
    } catch (err) {
      alert("خطأ: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateNewKey = async (customerId) => {
    if (!window.confirm("هل أنت متأكد من تغيير مفتاح الـ API لهذا العميل؟ سيؤدي ذلك إلى تعطيل المفتاح القديم فورا.")) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/admin/${customerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          regenerate_api_key: true
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "فشل توليد المفتاح.");
      }

      alert("تم إنشاء مفتاح API جديد بنجاح!");
      window.location.reload();
    } catch (err) {
      alert("خطأ: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [newResellerSearch, setNewResellerSearch] = useState("");

  const apiResellers = customers.filter(c => c.api_enabled || c.api_requested || c.api_key);
  
  // Apply the existing search filter to our filtered list
  const displayCustomers = apiResellers.filter(c => 
    c.username.toLowerCase().includes(customerSearch.toLowerCase()) || 
    (c.phone && c.phone.includes(customerSearch)) ||
    c.id.toString() === customerSearch
  );

  return (
    <>
      <div className="premium-stats-grid">
        <div className="premium-stat-card" style={{ "--glow-color": "rgba(234, 179, 8, 0.15)" }}>
          <div className="stat-card-info">
            <span className="stat-card-title">موزعي الـ API المفعلين</span>
            <span className="stat-card-value">
              {apiResellers.filter(c => c.api_enabled).length}
            </span>
          </div>
          <div className="stat-card-icon-wrapper" style={{ "--icon-bg": "rgba(234, 179, 8, 0.1)", "--icon-border": "rgba(234, 179, 8, 0.2)", "--icon-color": "#eab308" }}>
            🔑
          </div>
        </div>
        
        <div className="premium-stat-card" style={{ "--glow-color": "rgba(14, 165, 233, 0.15)" }}>
          <div className="stat-card-info">
            <span className="stat-card-title">طلبات الـ API المعلقة</span>
            <span className="stat-card-value">
              {apiResellers.filter(c => c.api_requested && !c.api_enabled).length}
            </span>
          </div>
          <div className="stat-card-icon-wrapper" style={{ "--icon-bg": "rgba(14, 165, 233, 0.1)", "--icon-border": "rgba(14, 165, 233, 0.2)", "--icon-color": "#0ea5e9" }}>
            ⏳
          </div>
        </div>
      </div>

      <div className="table-filter-bar" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <div className="search-input-wrapper" style={{ flex: 1, minWidth: "250px" }}>
          <input
            type="text"
            className="search-input-premium"
            placeholder="ابحث بالاسم أو الهاتف..."
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
          />
          <span className="search-input-icon">🔍</span>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="action-btn" 
          style={{ background: "#10b981", color: "white", padding: "10px 20px", fontWeight: "bold" }}
        >
          + إضافة موزع جديد
        </button>
      </div>

      <div className="premium-table-wrapper">
        <table className="premium-table">
          <thead>
            <tr>
              <th>رقم العميل</th>
              <th>اسم المستخدم</th>
              <th>حالة الـ API</th>
              <th>مفتاح الـ API</th>
              <th>نسبة الربح (Markup)</th>
              <th style={{ textAlign: "center" }}>الإعدادات</th>
            </tr>
          </thead>
          <tbody>
            {displayCustomers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  لا يوجد موزعين أو طلبات مطابقة.
                </td>
              </tr>
            ) : (
              displayCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td data-label="رقم العميل" style={{ fontWeight: 800, color: "#38bdf8" }}>#{customer.id}</td>
                  <td data-label="اسم المستخدم" style={{ fontWeight: 700 }}>{customer.username}</td>
                  <td data-label="حالة الـ API">
                    {customer.api_enabled ? (
                      <span className="premium-badge premium-badge-approved">مفعل</span>
                    ) : customer.api_requested ? (
                      <span className="premium-badge" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24", border: "1px solid rgba(245, 158, 11, 0.3)" }}>طلب معلق</span>
                    ) : (
                      <span className="premium-badge premium-badge-rejected">معطل</span>
                    )}
                  </td>
                  <td data-label="مفتاح الـ API" style={{ direction: "ltr", fontSize: "0.85rem", color: "#94a3b8" }}>
                    {customer.api_key || "لا يوجد مفتاح"}
                  </td>
                  <td data-label="نسبة الربح (Markup)" style={{ fontWeight: 800, color: "#34d399" }}>
                    {customer.api_markup || 0}%
                  </td>
                  <td data-label="الإعدادات" style={{ textAlign: "center" }}>
                    <button
                      type="button"
                      className="action-btn"
                      style={{ background: "rgba(234, 179, 8, 0.12)", color: "#fde047", border: "1px solid rgba(234, 179, 8, 0.22)" }}
                      onClick={() => openEditModal(customer)}
                    >
                      إدارة الـ API
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)} style={{ zIndex: 9999 }}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2>إضافة موزع API جديد</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: 0 }}>
                ابحث عن العميل المراد تحويله إلى موزع API، ثم اضغط على اسمه لفتح إعداداته.
              </p>
              <input 
                type="text"
                className="form-input-premium"
                placeholder="ابحث باسم المستخدم أو البريد..."
                value={newResellerSearch}
                onChange={e => setNewResellerSearch(e.target.value)}
              />
              <div style={{ maxHeight: "300px", overflowY: "auto", background: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "10px" }}>
                {customers
                  .filter(c => !c.api_enabled && !c.api_requested)
                  .filter(c => newResellerSearch ? c.username.toLowerCase().includes(newResellerSearch.toLowerCase()) || c.email?.toLowerCase().includes(newResellerSearch.toLowerCase()) : true)
                  .slice(0, 20)
                  .map(c => (
                    <div 
                      key={c.id}
                      style={{ padding: "10px", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                      onClick={() => {
                        setShowAddModal(false);
                        openEditModal(c);
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <div>
                        <div style={{ fontWeight: "bold", color: "#e2e8f0" }}>{c.username}</div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>{c.email || c.phone || 'لا يوجد بيانات'}</div>
                      </div>
                      <span style={{ color: "#38bdf8", fontSize: "0.85rem", fontWeight: "bold" }}>اختر</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {editingCustomer && (
        <div className="modal-overlay" onClick={() => setEditingCustomer(null)} style={{ zIndex: 9999 }}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: "550px" }}>
            <div className="modal-header">
              <h2>إدارة API للعميل: {editingCustomer.username}</h2>
              <button className="close-btn" onClick={() => setEditingCustomer(null)}>×</button>
            </div>
            <form onSubmit={handleSaveApiSettings} className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              
              <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <input 
                  type="checkbox" 
                  id="apiEnabledCheck"
                  checked={apiEnabled}
                  onChange={(e) => setApiEnabled(e.target.checked)}
                  style={{ width: "20px", height: "20px", accentColor: "#3b82f6" }}
                />
                <label htmlFor="apiEnabledCheck" style={{ margin: 0, fontWeight: "bold", color: "#fff", cursor: "pointer" }}>
                  تفعيل حساب الـ API لهذا الموزع
                </label>
              </div>

              <div className="form-group">
                <label>مفتاح الربط (API Key):</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="text"
                    className="form-input-premium"
                    value={editingCustomer.api_key || "لا يوجد مفتاح"}
                    readOnly
                    style={{ flex: 1, color: "#94a3b8", background: "rgba(0,0,0,0.2)" }}
                  />
                  <button type="button" onClick={() => generateNewKey(editingCustomer.id)} className="action-btn btn-danger-premium" style={{ width: 'auto', padding: '0 15px' }}>توليد مفتاح جديد</button>
                </div>
              </div>

              <div className="form-group">
                <label>نسبة المكسب المضافة (Markup %) - تطبق على أسعار الخدمات لهذا الموزع:</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input-premium"
                  value={apiMarkup}
                  onChange={(e) => setApiMarkup(e.target.value)}
                  placeholder="مثال: 10 (تعني 10%)"
                />
              </div>

              <div className="form-group">
                <label>عناوين الـ IP المسموح لها (IP Whitelist):</label>
                <input
                  type="text"
                  className="form-input-premium"
                  value={apiAllowedIps}
                  onChange={(e) => setApiAllowedIps(e.target.value)}
                  placeholder="مثال: 192.168.1.1, 8.8.8.8 (افصل بينها بفاصلة)"
                />
                <small style={{ color: "#94a3b8", marginTop: "4px", display: "block" }}>
                  اتركه فارغاً للسماح من أي مكان. يفضل وضع الـ IP الخاص بسيرفر الموزع للحماية.
                </small>
              </div>

              <div className="form-group">
                <label>أرقام الخدمات المحجوبة (Blocked Services IDs):</label>
                <input
                  type="text"
                  className="form-input-premium"
                  value={apiBlockedServices}
                  onChange={(e) => setApiBlockedServices(e.target.value)}
                  placeholder="مثال: 15, 20, 22 (افصل بينها بفاصلة)"
                />
                <small style={{ color: "#94a3b8", marginTop: "4px", display: "block" }}>
                  لن تظهر هذه الخدمات للموزع ولن يتمكن من طلبها.
                </small>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="action-btn"
                  style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "white", flex: 1, padding: "12px", borderRadius: "8px", fontWeight: "bold" }}
                >
                  {loading ? "جاري الحفظ..." : "حفظ الإعدادات"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="action-btn"
                  style={{ background: "rgba(255,255,255,0.1)", color: "white", flex: 1, padding: "12px", borderRadius: "8px", fontWeight: "bold" }}
                >
                  إلغاء
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}
