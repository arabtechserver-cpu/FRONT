import React, { useState } from "react";

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
  API_BASE_URL
}) {
  const [selectedCats, setSelectedCats] = useState([]);
  const [visibilityFilter, setVisibilityFilter] = useState("all");

  const finalFilteredCats = filteredCategories.filter(c => {
    if (visibilityFilter === "visible") return c.show_in_menu !== false;
    if (visibilityFilter === "hidden") return c.show_in_menu === false;
    return true;
  });

  const toggleSelectCat = (id) => {
    setSelectedCats(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const handleBulkToggleVisibility = async (show) => {
    if (!window.confirm('هل أنت متأكد من ' + (show ? 'إظهار' : 'إخفاء') + ' الأقسام المحددة (' + selectedCats.length + ')؟')) return;
    for (const id of selectedCats) {
      await handleToggleCategoryMenuVisibility(id, show);
    }
    setSelectedCats([]);
  };

  const handleSelectAll = () => {
    if (selectedCats.length === finalFilteredCats.length) {
      setSelectedCats([]);
    } else {
      setSelectedCats(finalFilteredCats.map(c => c.id));
    }
  };

  return (
    <>
      <div className="table-filter-bar" style={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input-premium"
            placeholder="ابحث باسم القسم..."
            value={catSearch}
            onChange={(e) => setCatSearch(e.target.value)}
          />
          <span className="search-input-icon">🔍</span>
        </div>
        
        <select 
          className="form-input-premium" 
          style={{ width: "auto", minWidth: "200px" }} 
          value={visibilityFilter} 
          onChange={(e) => setVisibilityFilter(e.target.value)}
        >
          <option value="all">-- كل الأقسام --</option>
          <option value="visible">👁️ الأقسام الظاهرة بالقائمة فقط</option>
          <option value="hidden">👁️‍🗨️ الأقسام المخفية من القائمة فقط</option>
        </select>
        <button
          onClick={handleClearAllCategories}
          className="action-btn"
          style={{
            background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
            color: "#ffffff",
            boxShadow: "0 0 15px rgba(239, 68, 68, 0.3)",
            padding: "10px 20px",
            borderRadius: "10px",
            fontWeight: "800",
            fontSize: "0.85rem",
            border: "none",
            cursor: "pointer"
          }}
        >
          🗑️ حذف جميع الأقسام نهائياً
        </button>
      </div>

      {selectedCats.length > 0 && (
        <div style={{
          background: "var(--bg-glass)",
          border: "var(--border-glass)",
          borderRadius: "12px",
          padding: "16px",
          marginTop: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
        }}>
          <div>
            <span style={{ fontWeight: "bold", color: "var(--primary-color)" }}>تم تحديد {selectedCats.length} أقسام</span>
            <button onClick={() => setSelectedCats([])} style={{ background: "transparent", border: "none", color: "var(--text-muted)", marginRight: "10px", cursor: "pointer" }}>إلغاء التحديد</button>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              onClick={() => handleOpenMergeCategories(selectedCats, () => setSelectedCats([]))} 
              className="action-btn"
              style={{ background: "linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%)", color: "white", padding: "8px 16px", borderRadius: "8px" }}
            >
              🔄 دمج الأقسام المحددة
            </button>
          </div>
        </div>
      )}

      <div className="category-grid-premium" style={{ marginTop: "20px" }}>
        <div style={{ width: "100%", padding: "10px 20px", display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", marginBottom: "10px" }}>
          <input 
            type="checkbox" 
            checked={finalFilteredCats.length > 0 && selectedCats.length === finalFilteredCats.length}
            onChange={handleSelectAll}
            style={{ width: "18px", height: "18px", cursor: "pointer" }}
          />
          <span style={{ fontWeight: "bold", cursor: "pointer" }} onClick={handleSelectAll}>تحديد الكل</span>
        </div>
        {finalFilteredCats.map((cat) => (
          <div className="category-card-premium" key={cat.id} style={{ position: "relative" }}>
            <div style={{ position: "absolute", top: "15px", right: "15px", zIndex: 10 }}>
              <input 
                type="checkbox" 
                checked={selectedCats.includes(cat.id)}
                onChange={() => toggleSelectCat(cat.id)}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
            </div>
            <span className="category-icon-big" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80px", cursor: "pointer" }} onClick={() => toggleSelectCat(cat.id)}>
              {cat.image && (cat.image.startsWith("data:image") || cat.image.startsWith("http") || cat.image.startsWith("/uploads")) ? (
                <img src={cat.image.startsWith("/uploads") ? `${API_BASE_URL}${cat.image}` : cat.image} alt={cat.name} style={{ width: "80px", height: "80px", objectFit: "contain", borderRadius: "12px" }} />
              ) : (
                <>
                  {cat.image === "games" && "🎮"}
                  {cat.image === "apps" && "📱"}
                  {cat.image === "telecom" && "📞"}
                  {cat.image === "payment" && "💳"}
                  {cat.image === "software" && "💻"}
                  {cat.image === "accounts" && "🔑"}
                  {cat.image === "default" && "📁"}
                </>
              )}
            </span>
            <h3 className="category-title-premium">{cat.name}</h3>
            <span className="category-slug">
              أيقونة: {cat.image && (cat.image.startsWith("data:image") || cat.image.startsWith("http") || cat.image.startsWith("/uploads")) ? "صورة مخصصة" : cat.image}
            </span>
            {cat.parent_id ? (
              <span style={{ display: "inline-block", marginTop: "6px", padding: "4px 10px", borderRadius: "100px", background: "rgba(99, 102, 241, 0.15)", color: "#818cf8", fontSize: "0.8rem", fontWeight: "600", border: "1px solid rgba(99, 102, 241, 0.3)" }}>
                🏷️ قسم فرعي من: {categories.find((c) => c.id === Number(cat.parent_id))?.name || "قسم رئيسي"}
              </span>
            ) : (
              <span style={{ display: "inline-block", marginTop: "6px", padding: "4px 10px", borderRadius: "100px", background: "rgba(16, 185, 129, 0.15)", color: "#34d399", fontSize: "0.8rem", fontWeight: "600", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                📁 قسم رئيسي
              </span>
            )}

            <div style={{ marginTop: "15px", display: "flex", gap: "8px", flexDirection: "column" }}>
              <button
                onClick={() => handleToggleCategoryMenuVisibility(cat.id, cat.show_in_menu === false)}
                className="action-btn"
                style={{
                  background: cat.show_in_menu === false ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
                  color: cat.show_in_menu === false ? "#ef4444" : "#10b981",
                  border: cat.show_in_menu === false ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(16, 185, 129, 0.3)",
                  justifyContent: "center",
                  padding: "8px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                {cat.show_in_menu === false ? "👁️‍🗨️ مخفي من القائمة" : "👁️ يظهر في القائمة"}
              </button>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => handleOpenEditCat(cat)} className="action-btn btn-edit-premium" style={{ flex: 1, justifyContent: "center" }}>
                  تعديل
                </button>
                <button onClick={() => handleDeleteCategory(cat.id)} className="action-btn btn-danger-premium" style={{ flex: 1, justifyContent: "center" }}>
                  حذف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
