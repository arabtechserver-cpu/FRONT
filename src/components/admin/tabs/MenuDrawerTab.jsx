import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "@/config";

export default function MenuDrawerTab({
  categories,
  services,
  token,
  setServices,
  handleToggleCategoryMenuVisibility,
  handleHideAllCategoriesFromMenu
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");
  const [placements, setPlacements] = useState({ desktop: true, mobile: true, footer: true });
  const [savingPlacements, setSavingPlacements] = useState(false);
  const [placementMessage, setPlacementMessage] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/settings/admin`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (data?.services_menu_placements) setPlacements(data.services_menu_placements);
      })
      .catch(() => { });
  }, [token]);

  const savePlacements = async (nextPlacements) => {
    setPlacements(nextPlacements);
    setSavingPlacements(true);
    setPlacementMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ services_menu_placements: nextPlacements })
      });
      if (!response.ok) throw new Error("Failed to save menu placement.");
      setPlacementMessage("Saved");
    } catch (error) {
      setPlacementMessage(error.message);
    } finally {
      setSavingPlacements(false);
    }
  };

  const toggleServiceMenuVisibility = async (service) => {
    const nextValue = service.show_in_menu !== true;
    try {
      const response = await fetch(`${API_BASE_URL}/api/services/${service.id}/menu-visibility`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ show_in_menu: nextValue })
      });
      if (!response.ok) throw new Error("Failed to update service visibility.");
      setServices?.((current) => current.map((item) => item.id === service.id ? { ...item, show_in_menu: nextValue } : item));
    } catch (error) {
      setPlacementMessage(error.message);
    }
  };

  const filteredCategories = categories.filter(c => {
    if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });
  const filteredServices = (services || []).filter((service) => {
    const query = serviceSearchTerm.trim().toLowerCase();
    return !query || service.name.toLowerCase().includes(query);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ background: "linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)", padding: "24px", borderRadius: "20px", border: "1px solid rgba(79, 70, 229, 0.3)" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "900", color: "#fff", marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
          <span>📱</span> إدارة القائمة الجانبية (الهامبورجر)
        </h2>
        <p style={{ color: "#fff", fontSize: "0.95rem", lineHeight: "1.6" }}>
          تحكم بكل سهولة في الأقسام التي تظهر في القائمة الجانبية للموبايل. إخفاء القسم من هنا يخفيه من القائمة فقط ولا يحذفه من الموقع!
        </p>
      </div>

      <div style={{ background: "var(--bg-glass)", padding: "18px", borderRadius: "16px", border: "var(--border-glass)", display: "flex", flexDirection: "column", gap: "12px" }}>
        <strong style={{ color: "#fff" }}>Where should the Services menu appear?</strong>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
          {[
            ["desktop", "Desktop header dropdown"],
            ["mobile", "Mobile drawer"],
            ["footer", "Footer quick links"]
          ].map(([key, label]) => (
            <label key={key} style={{ display: "flex", alignItems: "center", gap: "8px", color: "#fff", padding: "10px", borderRadius: "10px", background: "rgba(255,255,255,0.04)", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={placements[key] === true}
                onChange={(event) => savePlacements({ ...placements, [key]: event.target.checked })}
                disabled={savingPlacements}
              />
              {label}
            </label>
          ))}
        </div>
        {placementMessage && <small style={{ color: placementMessage === "Saved" ? "#34d399" : "#f87171" }}>{placementMessage}</small>}
      </div>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", background: "rgba(0,0,0,0.3)", padding: "16px", borderRadius: "16px", border: "var(--border-glass)", alignItems: "center" }}>
        <div className="search-input-wrapper" style={{ flex: 1, minWidth: "250px" }}>
          <input 
            type="text" 
            className="search-input-premium" 
            placeholder="ابحث عن قسم..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-input-icon">🔍</span>
        </div>
        
        <button 
          onClick={handleHideAllCategoriesFromMenu}
          style={{
            background: "rgba(239, 68, 68, 0.15)",
            color: "#f87171",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            padding: "10px 20px",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "0.95rem",
            fontWeight: "bold",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)"; }}
          onMouseOut={(e) => { e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)"; }}
        >
          <i className="fa fa-eye-slash"></i>
          إخفاء الكل
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
        {filteredCategories.map(cat => (
          <div key={cat.id} style={{ 
            background: "rgba(255,255,255,0.02)", 
            border: "1px solid rgba(255,255,255,0.05)", 
            borderRadius: "16px", 
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            transition: "all 0.3s ease"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: cat.color || "var(--primary-color)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1.2rem" }}>
                {cat.icon ? <i className={`fa fa-${cat.icon}`}></i> : "📁"}
              </div>
              <div style={{ flex: 1, fontWeight: "bold", fontSize: "1rem", color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {cat.name}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "10px" }}>
              <span style={{ fontSize: "0.85rem", color: "#fff", fontWeight: "bold" }}>
                {cat.show_in_menu ? "🟢 يظهر في القائمة" : "🔴 مخفي من القائمة"}
              </span>
              <button
                onClick={() => handleToggleCategoryMenuVisibility(cat.id, cat.show_in_menu)}
                style={{
                  background: cat.show_in_menu ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)",
                  color: cat.show_in_menu ? "#f87171" : "#4ade80",
                  border: `1px solid ${cat.show_in_menu ? "rgba(239, 68, 68, 0.3)" : "rgba(34, 197, 94, 0.3)"}`,
                  padding: "6px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  transition: "all 0.2s"
                }}
              >
                {cat.show_in_menu ? "إخفاء" : "إظهار"}
              </button>
            </div>          </div>
        ))}
      </div>

      <div style={{ background: "var(--bg-glass)", border: "var(--border-glass)", borderRadius: "16px", padding: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <strong style={{ color: "#fff" }}>Services shown in the menu</strong>
          <input
            type="search"
            placeholder="Search services..."
            value={serviceSearchTerm}
            onChange={(event) => setServiceSearchTerm(event.target.value)}
            style={{ minWidth: "220px", padding: "9px 12px", borderRadius: "9px", background: "rgba(255,255,255,0.05)", color: "#fff", border: "var(--border-glass)" }}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "10px", maxHeight: "520px", overflowY: "auto" }}>
          {filteredServices.map((service) => (
            <div key={service.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", padding: "11px 12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={service.name}>{service.name}</span>
              <button
                type="button"
                onClick={() => toggleServiceMenuVisibility(service)}
                style={{ flexShrink: 0, padding: "5px 10px", borderRadius: "7px", cursor: "pointer", color: service.show_in_menu ? "#f87171" : "#4ade80", background: service.show_in_menu ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)", border: `1px solid ${service.show_in_menu ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}` }}
              >
                {service.show_in_menu ? "Hide" : "Show"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {filteredCategories.length === 0 && (
        <div style={{ padding: "40px", textAlign: "center", background: "var(--bg-glass)", borderRadius: "16px", border: "var(--border-glass)" }}>
          <span style={{ fontSize: "3rem", display: "block", marginBottom: "15px", opacity: 0.5 }}>🔍</span>
          <h3 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: "bold" }}>لا توجد أقسام مطابقة</h3>
        </div>
      )}
    </div>
  );
}
