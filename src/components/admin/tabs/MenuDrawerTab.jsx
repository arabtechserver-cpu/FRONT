import React, { useState } from "react";

export default function MenuDrawerTab({
  categories,
  handleToggleCategoryMenuVisibility
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredCategories = categories.filter(c => {
    if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filter === "visible") return c.show_in_menu !== false;
    if (filter === "hidden") return c.show_in_menu === false;
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ background: "linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)", padding: "24px", borderRadius: "20px", border: "1px solid rgba(79, 70, 229, 0.3)" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "900", color: "#fff", marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
          <span>📱</span> إدارة القائمة الجانبية (الهامبورجر)
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.6" }}>
          تحكم بكل سهولة في الأقسام التي تظهر في القائمة الجانبية للموبايل. إخفاء القسم من هنا يخفيه من القائمة فقط ولا يحذفه من الموقع!
        </p>
      </div>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", background: "var(--bg-glass)", padding: "16px", borderRadius: "16px", border: "var(--border-glass)" }}>
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
        
        <select 
          className="form-input-premium" 
          style={{ width: "auto", minWidth: "150px" }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">الكل</option>
          <option value="visible">الظاهرة فقط 👁️</option>
          <option value="hidden">المخفية فقط 👁️‍🗨️</option>
        </select>
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
              <div style={{ flex: 1, fontWeight: "bold", fontSize: "1rem", color: "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {cat.name}
              </div>
            </div>

            <button 
              onClick={() => handleToggleCategoryMenuVisibility(cat.id, cat.show_in_menu === false)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "10px",
                border: cat.show_in_menu === false ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(239, 68, 68, 0.4)",
                background: cat.show_in_menu === false ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                color: cat.show_in_menu === false ? "#10b981" : "#ef4444",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s"
              }}
            >
              {cat.show_in_menu === false ? (
                <><span>👁️</span> إظهار في القائمة</>
              ) : (
                <><span>👁️‍🗨️</span> إخفاء من القائمة</>
              )}
            </button>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div style={{ padding: "40px", textAlign: "center", background: "var(--bg-glass)", borderRadius: "16px", border: "var(--border-glass)" }}>
          <span style={{ fontSize: "3rem", display: "block", marginBottom: "15px", opacity: 0.5 }}>🔍</span>
          <h3 style={{ color: "var(--text-main)", fontSize: "1.2rem", fontWeight: "bold" }}>لا توجد أقسام مطابقة</h3>
        </div>
      )}
    </div>
  );
}
