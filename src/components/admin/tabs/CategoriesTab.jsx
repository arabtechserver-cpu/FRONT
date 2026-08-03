import React, { useState } from "react";
import { API_BASE_URL } from "@/config";

export default function CategoriesTab({
  catSearch,
  setCatSearch,
  filteredCategories,
  categories,
  handleOpenEditCat,
  handleDeleteCategory,
  handleClearAllCategories,
  handleToggleCategoryMenuVisibility,
  handleOpenMergeCategories,
  catModal,
  API_BASE_URL
}) {
  const [selectedCats, setSelectedCats] = useState([]);
  const [visibilityFilter, setVisibilityFilter] = useState("all");

  const finalFilteredCats = filteredCategories;

  const toggleSelectCat = (id) => {
    setSelectedCats(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };



  const handleSelectAll = () => {
    if (selectedCats.length === finalFilteredCats.length) {
      setSelectedCats([]);
    } else {
      setSelectedCats(finalFilteredCats.map(c => c.id));
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header and Add Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px", background: "var(--bg-glass)", padding: "20px", borderRadius: "16px", border: "var(--border-glass)", boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.5rem", color: "var(--text-color)" }}>إدارة الأقسام</h2>
          <p style={{ margin: "5px 0 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>أضف أقسام جديدة، عدّل الحالية، أو تحكم في ظهورها في القائمة.</p>
        </div>
        <button 
          className="action-btn"
          onClick={() => catModal?.setShowCatModal(true)}
          style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            color: "white",
            padding: "12px 24px",
            borderRadius: "12px",
            fontWeight: "bold",
            fontSize: "1rem",
            boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
            border: "none"
          }}
        >
          ➕ إضافة قسم جديد
        </button>
      </div>

      {/* Filters and Delete All */}
      <div className="table-filter-bar" style={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px", background: "rgba(255, 255, 255, 0.02)", padding: "16px", borderRadius: "16px" }}>
        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", flex: 1 }}>
          <div className="search-input-wrapper" style={{ flex: 1, minWidth: "250px" }}>
            <input
              type="text"
              className="search-input-premium"
              placeholder="ابحث باسم القسم..."
              value={catSearch}
              onChange={(e) => setCatSearch(e.target.value)}
              style={{ width: "100%" }}
            />
            <span className="search-input-icon">🔍</span>
          </div>

        </div>
        
        <button
          onClick={handleClearAllCategories}
          className="action-btn"
          style={{
            background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(185, 28, 28, 0.1) 100%)",
            color: "#ef4444",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            padding: "10px 20px",
            borderRadius: "10px",
            fontWeight: "bold",
            fontSize: "0.9rem",
            cursor: "pointer"
          }}
        >
          🗑️ حذف جميع الأقسام
        </button>
      </div>

      {/* Bulk Actions Panel */}
      {selectedCats.length > 0 && (
        <div style={{
          background: "linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)",
          border: "1px solid rgba(147, 51, 234, 0.2)",
          borderRadius: "16px",
          padding: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "15px"
        }}>
          <div>
            <h3 style={{ margin: 0, color: "var(--text-color)", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ background: "var(--primary-color)", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "0.9rem" }}>{selectedCats.length}</span>
              أقسام محددة
            </h3>
            <button onClick={() => setSelectedCats([])} style={{ background: "transparent", border: "none", color: "var(--text-muted)", marginTop: "8px", cursor: "pointer", textDecoration: "underline" }}>إلغاء التحديد</button>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>

            <button 
              onClick={() => handleOpenMergeCategories(selectedCats, () => setSelectedCats([]))} 
              className="action-btn"
              style={{ background: "linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%)", color: "white", padding: "10px 20px", border: "none" }}
            >
              🔄 تجميع (دمج)
            </button>
          </div>
        </div>
      )}

      {/* Grid Header / Select All */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255, 255, 255, 0.05)", padding: "12px 20px", borderRadius: "12px" }}>
        <input 
          type="checkbox" 
          checked={finalFilteredCats.length > 0 && selectedCats.length === finalFilteredCats.length}
          onChange={handleSelectAll}
          style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "var(--primary-color)" }}
        />
        <span style={{ fontWeight: "bold", cursor: "pointer", fontSize: "1.1rem" }} onClick={handleSelectAll}>تحديد كل الأقسام المعروضة</span>
      </div>

      {/* Grid */}
      <div className="category-grid-premium">
        {finalFilteredCats.map((cat) => (
          <div 
            className="category-card-premium" 
            key={cat.id} 
            style={{ 
              position: "relative",
              border: selectedCats.includes(cat.id) ? "2px solid var(--primary-color)" : "1px solid rgba(255,255,255,0.05)",
              transform: selectedCats.includes(cat.id) ? "translateY(-4px)" : "none",
              transition: "all 0.3s ease"
            }}
          >


            {/* Checkbox */}
            <div style={{ position: "absolute", top: "15px", right: "15px", zIndex: 10 }}>
              <input 
                type="checkbox" 
                checked={selectedCats.includes(cat.id)}
                onChange={() => toggleSelectCat(cat.id)}
                style={{ width: "22px", height: "22px", cursor: "pointer", accentColor: "var(--primary-color)" }}
              />
            </div>

            <span className="category-icon-big" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "90px", cursor: "pointer", marginTop: "10px" }} onClick={() => toggleSelectCat(cat.id)}>
              {cat.image && (cat.image.startsWith("data:image") || cat.image.startsWith("http") || cat.image.startsWith("/uploads")) ? (
                <img src={cat.image.startsWith("/uploads") ? `${API_BASE_URL}${cat.image}` : cat.image} alt={cat.name} style={{ width: "80px", height: "80px", objectFit: "contain", borderRadius: "12px", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))" }} />
              ) : (
                <span style={{ fontSize: "3rem", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}>
                  {cat.image === "games" && "🎮"}
                  {cat.image === "apps" && "📱"}
                  {cat.image === "telecom" && "📞"}
                  {cat.image === "payment" && "💳"}
                  {cat.image === "software" && "💻"}
                  {cat.image === "accounts" && "🔑"}
                  {cat.image === "default" && "📁"}
                </span>
              )}
            </span>
            
            <h3 className="category-title-premium" style={{ marginTop: "15px", marginBottom: "5px", fontSize: "1.1rem", lineHeight: "1.4", minHeight: "45px" }}>{cat.name}</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "center", marginBottom: "15px" }}>
              {cat.parent_id ? (
                <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: "100px", background: "rgba(99, 102, 241, 0.1)", color: "#818cf8", fontSize: "0.8rem", fontWeight: "600", border: "1px solid rgba(99, 102, 241, 0.2)" }}>
                  🏷️ فرعي
                </span>
              ) : (
                <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: "100px", background: "rgba(16, 185, 129, 0.1)", color: "#34d399", fontSize: "0.8rem", fontWeight: "600", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                  📁 رئيسي
                </span>
              )}
            </div>

            <div style={{ marginTop: "auto", display: "flex", gap: "8px", flexDirection: "column", width: "100%" }}>

              <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                <button onClick={() => handleOpenEditCat(cat)} className="action-btn btn-edit-premium" style={{ flex: 1, justifyContent: "center", borderRadius: "10px" }}>
                  ✏️ تعديل
                </button>
                <button onClick={() => handleDeleteCategory(cat.id)} className="action-btn btn-danger-premium" style={{ flex: 1, justifyContent: "center", borderRadius: "10px" }}>
                  🗑️ حذف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {finalFilteredCats.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", background: "var(--bg-glass)", borderRadius: "16px", color: "var(--text-muted)" }}>
          <h3>لا توجد أقسام مطابقة للبحث أو الفلتر</h3>
        </div>
      )}
    </div>
  );
}
