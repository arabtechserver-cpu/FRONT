import React, { useState } from "react";
import { API_BASE_URL } from "@/config";

export default function ServicesTab({
  serviceSearch,
  setServiceSearch,
  filteredServices,
  categories,
  baseCurrency,
  globalMarkupPercent,
  setGlobalMarkupPercent,
  savingMarkup,
  handleSaveGlobalMarkup,
  handleOpenEditService,
  handleDeleteService,
  handleClearAllServices,
  token,
  setServices
}) {
  const [quickFieldsServiceId, setQuickFieldsServiceId] = useState(null);
  const [quickFields, setQuickFields] = useState([]);
  const [quickFieldsTitle, setQuickFieldsTitle] = useState("");
  const [savingQuickFields, setSavingQuickFields] = useState(false);
  const [quickFieldsMsg, setQuickFieldsMsg] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const togglePopularService = async (service) => {
    try {
      const tkn = token || (typeof window !== "undefined" ? localStorage.getItem("adminToken") : "");
      const res = await fetch(`${API_BASE_URL}/api/services/${service.id}/popular`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${tkn}` },
        body: JSON.stringify({ is_popular: !service.is_popular })
      });
      if (!res.ok) throw new Error("فشل تحديث الخدمة");
      if (setServices) {
        setServices(prev => prev.map(s => s.id === service.id ? { ...s, is_popular: !service.is_popular } : s));
      }
    } catch (err) {
      alert("خطأ: " + err.message);
    }
  };

  const openQuickFields = (service) => {
    let parsedFields = [];
    try {
      parsedFields = typeof service.fields === "string" ? JSON.parse(service.fields) : (service.fields || []);
    } catch { parsedFields = []; }

    // Normalize: ensure each field has both 'id' and 'name'
    const normalized = parsedFields.map(f => ({
      id: (f.id || f.name || "").trim(),
      label: f.label || "",
      placeholder: f.placeholder || "",
      type: f.type || "text",
      required: f.required !== false
    })).filter(f => f.id !== "phone" && f.id !== "tel");

    setQuickFields(normalized);
    setQuickFieldsTitle(service.fields_title || "بيانات الخدمة");
    setQuickFieldsServiceId(service.id);
    setQuickFieldsMsg("");
  };

  const closeQuickFields = () => {
    setQuickFieldsServiceId(null);
    setQuickFields([]);
    setQuickFieldsMsg("");
  };

  const handleQuickFieldChange = (idx, key, val) => {
    setQuickFields(prev => prev.map((f, i) => i === idx ? { ...f, [key]: val } : f));
  };

  const addQuickField = () => {
    setQuickFields(prev => [...prev, { id: `field_${Date.now()}`, label: "", placeholder: "", type: "text", required: false }]);
  };

  const removeQuickField = (idx) => {
    setQuickFields(prev => prev.filter((_, i) => i !== idx));
  };

  const moveQuickFieldUp = (idx) => {
    if (idx === 0) return;
    setQuickFields(prev => {
      const newFields = [...prev];
      const temp = newFields[idx];
      newFields[idx] = newFields[idx - 1];
      newFields[idx - 1] = temp;
      return newFields;
    });
  };

  const moveQuickFieldDown = (idx) => {
    setQuickFields(prev => {
      if (idx === prev.length - 1) return prev;
      const newFields = [...prev];
      const temp = newFields[idx];
      newFields[idx] = newFields[idx + 1];
      newFields[idx + 1] = temp;
      return newFields;
    });
  };

  const saveQuickFields = async () => {
    setSavingQuickFields(true);
    setQuickFieldsMsg("");
    try {
      const tkn = token || (typeof window !== "undefined" ? localStorage.getItem("adminToken") : "");
      const res = await fetch(`${API_BASE_URL}/api/services/${quickFieldsServiceId}/fields`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${tkn}` },
        body: JSON.stringify({ fields: quickFields, fields_title: quickFieldsTitle })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "فشل الحفظ");
      setQuickFieldsMsg("✅ تم حفظ الحقول بنجاح!");
      // Update local state
      if (setServices) {
        setServices(prev => prev.map(s => s.id === quickFieldsServiceId ? { ...s, fields: data.fields, fields_title: data.fields_title } : s));
      }
      setTimeout(() => setQuickFieldsMsg(""), 3000);
    } catch (err) {
      setQuickFieldsMsg("❌ خطأ: " + err.message);
    } finally {
      setSavingQuickFields(false);
    }
  };

  return (
    <>
      <div className="table-filter-bar" style={{ justifyContent: "flex-start", gap: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input-premium"
            placeholder="ابحث باسم الخدمة أو القسم..."
            value={serviceSearch}
            onChange={(e) => setServiceSearch(e.target.value)}
          />
          <span className="search-input-icon">🔍</span>
        </div>

        <form onSubmit={handleSaveGlobalMarkup} style={{ display: "flex", alignItems: "center", gap: "10px", marginRight: "auto" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#94a3b8", whiteSpace: "nowrap" }}>
            هامش الربح العام للكل (%):
          </label>
          <input
            type="number"
            step="0.1"
            className="search-input-premium"
            style={{ width: "90px", textAlign: "center", padding: "8px !important" }}
            placeholder="0.0"
            value={globalMarkupPercent}
            onChange={(e) => setGlobalMarkupPercent(e.target.value)}
          />
          <button
            type="submit"
            className="action-btn"
            disabled={savingMarkup}
            style={{
              background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
              color: "#ffffff",
              boxShadow: "0 0 15px rgba(239, 68, 68, 0.3)",
              padding: "8px 16px",
              borderRadius: "10px",
              fontWeight: "800",
              fontSize: "0.85rem"
            }}
          >
            {savingMarkup ? "جاري الحفظ..." : "حفظ الهامش"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleClearAllServices}
          className="action-btn"
          style={{
            background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
            color: "#ffffff",
            boxShadow: "0 0 15px rgba(239, 68, 68, 0.3)",
            padding: "8px 16px",
            borderRadius: "10px",
            fontWeight: "800",
            fontSize: "0.85rem",
            border: "none",
            cursor: "pointer"
          }}
        >
          🗑️ حذف جميع الخدمات نهائياً
        </button>
      </div>

      <div className="premium-table-wrapper">
        <table className="premium-table">
          <thead>
            <tr>
              <th>رقم الخدمة</th>
              <th>الخدمة</th>
              <th>القسم التابع</th>
              <th>السعر الابتدائي</th>
              <th style={{ textAlign: "center" }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                  لا توجد خدمات مضافة حالياً.
                </td>
              </tr>
            ) : (
              filteredServices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((service) => {
                const parentCat = categories.find((c) => c.id === service.category_id);
                let parsedPackages = [];
                try {
                  parsedPackages = typeof service.packages === "string" ? JSON.parse(service.packages) : service.packages;
                } catch (e) {
                  parsedPackages = service.packages || [];
                }

                let parsedFields = [];
                try {
                  parsedFields = typeof service.fields === "string" ? JSON.parse(service.fields) : (service.fields || []);
                } catch { parsedFields = []; }
                const visibleFields = parsedFields.filter(f => (f.id || f.name || "") !== "phone" && (f.id || f.name || "") !== "tel");

                const isExpanded = quickFieldsServiceId === service.id;

                return (
                  <React.Fragment key={service.id}>
                    <tr style={{ background: isExpanded ? "rgba(59, 130, 246, 0.06)" : "" }}>
                      <td data-label="رقم الخدمة" style={{ fontWeight: 800, color: "#38bdf8" }}>#{service.id}</td>
                      <td data-label="الخدمة" style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "160px", maxWidth: "220px" }}>
                        <div style={{ width: "32px", height: "32px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}>
                          {service.image && (service.image.startsWith("data:image") || service.image.startsWith("http") || service.image.startsWith("/uploads")) ? (
                            <img src={service.image.startsWith("/uploads") ? `${API_BASE_URL}${service.image}` : service.image} alt={service.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                          ) : (
                            <span style={{ fontSize: "1.1rem" }}>
                              {service.image === "pubg" && "🔫"}
                              {service.image === "freefire" && "🔥"}
                              {service.image === "bigo" && "💬"}
                              {service.image === "vodafone" && "📱"}
                              {service.image === "usdt" && "🪙"}
                              {service.image === "canva" && "🎨"}
                              {service.image === "netflix" && "🎬"}
                              {service.image === "default" && "⚡"}
                            </span>
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.88rem", whiteSpace: "normal" }}>{service.name}</div>
                          <div style={{ fontSize: "0.7rem", color: visibleFields.length > 0 ? "#4ade80" : "#f87171" }}>
                            {visibleFields.length > 0
                              ? `✓ ${visibleFields.length} حقل: ${visibleFields.map(f => f.label || f.id || f.name).join(", ")}`
                              : "⚠️ لا توجد حقول"}
                          </div>
                        </div>
                      </td>
                      <td data-label="القسم التابع" style={{ fontWeight: 700 }}>{parentCat ? parentCat.name : `قسم #${service.category_id}`}</td>

                      <td data-label="السعر الابتدائي" style={{ fontWeight: 800, color: "#34d399" }}>
                        {parentCat && parentCat.currency === "USD" ? (
                          `$ ${Number(parsedPackages && parsedPackages.length > 0 ? (parsedPackages[0].usd_price || parsedPackages[0].price) : service.price).toFixed(2)}`
                        ) : service.price_type === "dynamic" ? (
                          `${Number(service.price_per_thousand || 0).toFixed(2)} ${baseCurrency} / 1000`
                        ) : service.price_type === "both" ? (
                          `${Number(service.price_per_thousand || 0).toFixed(2)} ${baseCurrency} / 1000`
                        ) : (
                          `${Number(service.price || 0).toFixed(2)} ${baseCurrency}`
                        )}
                      </td>
                      <td data-label="الإجراءات" style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                          <button onClick={() => handleOpenEditService(service)} className="action-btn btn-edit-premium">
                            تعديل
                          </button>
                          <button
                            onClick={() => togglePopularService(service)}
                            className="action-btn"
                            style={{ background: service.is_popular ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.05)", color: service.is_popular ? "#fbbf24" : "#94a3b8", border: `1px solid ${service.is_popular ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.1)"}`, padding: "5px 10px", fontSize: "0.78rem" }}
                            title={service.is_popular ? "إزالة من الأكثر طلباً" : "إضافة إلى الأكثر طلباً"}
                          >
                            {service.is_popular ? "⭐ رائج" : "☆ عادي"}
                          </button>
                          <button
                            onClick={() => isExpanded ? closeQuickFields() : openQuickFields(service)}
                            className="action-btn"
                            style={{ background: isExpanded ? "rgba(59,130,246,0.3)" : "rgba(34,197,94,0.15)", color: isExpanded ? "#60a5fa" : "#4ade80", border: `1px solid ${isExpanded ? "rgba(59,130,246,0.4)" : "rgba(34,197,94,0.3)"}`, padding: "5px 10px", fontSize: "0.78rem" }}
                          >
                            🔑 حقول
                          </button>
                          <button onClick={() => handleDeleteService(service.id)} className="action-btn btn-danger-premium">
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Quick Fields Editor Row */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={5} style={{ padding: 0, background: "rgba(15, 23, 42, 0.8)" }}>
                          <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(59,130,246,0.2)", borderBottom: "1px solid rgba(59,130,246,0.2)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                              <h4 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 800, color: "#38bdf8" }}>
                                🔑 حقول الخدمة: {service.name}
                              </h4>
                              <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>هذه الحقول ستظهر للعميل في صفحة الدفع</span>
                            </div>

                            {/* Fields Title */}
                            <div style={{ marginBottom: "12px" }}>
                              <label style={{ fontSize: "0.78rem", color: "#94a3b8", display: "block", marginBottom: "4px" }}>عنوان قسم الحقول:</label>
                              <input
                                type="text"
                                value={quickFieldsTitle}
                                onChange={e => setQuickFieldsTitle(e.target.value)}
                                placeholder="بيانات الخدمة"
                                style={{ width: "100%", maxWidth: "360px", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: "0.85rem" }}
                              />
                            </div>

                            {/* Fields List */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                              {quickFields.map((f, idx) => (
                                <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1.5fr auto auto auto", gap: "8px", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                  <input
                                    type="text"
                                    value={f.id}
                                    onChange={e => handleQuickFieldChange(idx, "id", e.target.value)}
                                    placeholder="ID الحقل"
                                    style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(13,18,36,0.7)", color: "#94a3b8", fontSize: "0.78rem" }}
                                  />
                                  <input
                                    type="text"
                                    value={f.label}
                                    onChange={e => handleQuickFieldChange(idx, "label", e.target.value)}
                                    placeholder="اسم الحقل (بالعربية)"
                                    style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(13,18,36,0.7)", color: "#fff", fontSize: "0.82rem", fontWeight: "bold" }}
                                  />
                                  <input
                                    type="text"
                                    value={f.placeholder}
                                    onChange={e => handleQuickFieldChange(idx, "placeholder", e.target.value)}
                                    placeholder="نص تلميحي"
                                    style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(13,18,36,0.7)", color: "#94a3b8", fontSize: "0.78rem" }}
                                  />
                                  <select
                                    value={f.type}
                                    onChange={e => handleQuickFieldChange(idx, "type", e.target.value)}
                                    style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(13,18,36,0.7)", color: "#fff", fontSize: "0.78rem" }}
                                  >
                                    <option value="text">نص</option>
                                    <option value="email">إيميل</option>
                                    <option value="number">رقم</option>
                                  </select>
                                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                    <input
                                      type="checkbox"
                                      checked={f.required}
                                      onChange={e => handleQuickFieldChange(idx, "required", e.target.checked)}
                                      id={`req_${idx}`}
                                      style={{ cursor: "pointer", accentColor: "#38bdf8" }}
                                    />
                                    <label htmlFor={`req_${idx}`} style={{ fontSize: "0.75rem", color: "#94a3b8", cursor: "pointer" }}>مطلوب</label>
                                  </div>
                                  <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
                                    <button
                                      onClick={() => moveQuickFieldUp(idx)}
                                      disabled={idx === 0}
                                      style={{ background: "none", border: "none", color: idx === 0 ? "rgba(255,255,255,0.2)" : "#60a5fa", cursor: idx === 0 ? "default" : "pointer", fontSize: "1.1rem", padding: "0 2px" }}
                                      title="تحريك لأعلى"
                                    >↑</button>
                                    <button
                                      onClick={() => moveQuickFieldDown(idx)}
                                      disabled={idx === quickFields.length - 1}
                                      style={{ background: "none", border: "none", color: idx === quickFields.length - 1 ? "rgba(255,255,255,0.2)" : "#60a5fa", cursor: idx === quickFields.length - 1 ? "default" : "pointer", fontSize: "1.1rem", padding: "0 2px" }}
                                      title="تحريك لأسفل"
                                    >↓</button>
                                    <button
                                      onClick={() => removeQuickField(idx)}
                                      style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: "1rem", padding: "0 2px", marginLeft: "4px" }}
                                      title="حذف الحقل"
                                    >✕</button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Actions */}
                            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                              <button
                                onClick={addQuickField}
                                style={{ background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.3)", color: "#22d3ee", padding: "7px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "0.82rem", fontWeight: "bold" }}
                              >
                                + إضافة حقل
                              </button>
                              <button
                                onClick={saveQuickFields}
                                disabled={savingQuickFields}
                                style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", border: "none", color: "#fff", padding: "7px 18px", borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "bold", opacity: savingQuickFields ? 0.7 : 1 }}
                              >
                                {savingQuickFields ? "جاري الحفظ..." : "💾 حفظ الحقول"}
                              </button>
                              <button
                                onClick={closeQuickFields}
                                style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", padding: "7px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "0.82rem" }}
                              >
                                إغلاق
                              </button>
                              {quickFieldsMsg && (
                                <span style={{ fontSize: "0.82rem", color: quickFieldsMsg.startsWith("✅") ? "#4ade80" : "#f87171", fontWeight: "bold" }}>
                                  {quickFieldsMsg}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {filteredServices.length > itemsPerPage && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginTop: "20px" }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="action-btn"
            style={{ padding: "8px 15px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: currentPage === 1 ? "#64748b" : "#fff", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
          >
            السابق
          </button>
          
          <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
            صفحة {currentPage} من {Math.ceil(filteredServices.length / itemsPerPage)}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredServices.length / itemsPerPage), p + 1))}
            disabled={currentPage === Math.ceil(filteredServices.length / itemsPerPage)}
            className="action-btn"
            style={{ padding: "8px 15px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: currentPage === Math.ceil(filteredServices.length / itemsPerPage) ? "#64748b" : "#fff", cursor: currentPage === Math.ceil(filteredServices.length / itemsPerPage) ? "not-allowed" : "pointer" }}
          >
            التالي
          </button>
        </div>
      )}
    </>
  );
}

