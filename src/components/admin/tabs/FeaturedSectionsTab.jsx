"use client";
import React, { useState, useRef } from "react";
import { API_BASE_URL } from "@/config";

// ─── helpers ──────────────────────────────────────────────────────────────────
function toBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

// ─── Item editor (one service inside a section) ──────────────────────────────
function ItemRow({ item, onChange, onRemove, index, availableServices, isFirst, isLast, onMoveUp, onMoveDown }) {
  const imgRef = useRef();

  const handleImgUpload = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const b64 = await toBase64(f);
    onChange({ ...item, img: b64 });
  };

  return (
    <div style={{
      display: "flex", gap: 10, alignItems: "flex-start",
      background: "rgba(255,255,255,0.03)", borderRadius: 12,
      padding: "12px", border: "1px solid rgba(255,255,255,0.07)",
      flexWrap: "wrap"
    }}>
      {/* service image */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div
          onClick={() => imgRef.current?.click()}
          style={{
            width: 80, height: 54, borderRadius: 8, overflow: "hidden",
            background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(255,255,255,0.15)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0
          }}
        >
          {item.img
            ? <img src={item.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <span style={{ fontSize: 20, opacity: 0.4 }}>🖼️</span>}
        </div>
        <span style={{ fontSize: 10, color: "#64748b", cursor: "pointer" }}
          onClick={() => imgRef.current?.click()}>صورة الخدمة</span>
        <input ref={imgRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImgUpload} />
      </div>

      {/* fields */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, minWidth: 200 }}>
        
        {/* Service Selector */}
        {(() => {
          const expandedAvailableServices = [];
          (availableServices || []).forEach(s => {
            let parsedPackages = [];
            try {
              parsedPackages = typeof s.packages === "string" ? JSON.parse(s.packages) : (s.packages || []);
            } catch (e) {
              parsedPackages = [];
            }

            if (Array.isArray(parsedPackages) && parsedPackages.length > 0) {
              parsedPackages.forEach(pkg => {
                const pkgName = (pkg.name === "تفعيل فوري تلقائي" || !pkg.name) ? s.name : pkg.name;
                expandedAvailableServices.push({
                  id: `${s.id}-${pkg.id}`,
                  name: `${s.name} - ${pkgName}`,
                  title: pkgName,
                  url: `/service/${s.id}?package=${pkg.id}`,
                  time: s.time || ""
                });
              });
            } else {
              expandedAvailableServices.push({
                id: s.id.toString(),
                name: s.name,
                title: s.name,
                url: `/service/${s.id}`,
                time: s.time || ""
              });
            }
          });

          if (expandedAvailableServices.length === 0) return null;

          return (
            <select
              value={item.serviceId || ""}
              onChange={(e) => {
                const key = e.target.value;
                const s = expandedAvailableServices.find(x => x.id === key);
                if (s) {
                  onChange({
                    ...item,
                    serviceId: key,
                    title: s.title,
                    url: s.url,
                    time: s.time
                  });
                } else {
                  onChange({ ...item, serviceId: "" });
                }
              }}
              style={{
                width: "100%", background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)",
                borderRadius: 8, padding: "8px 12px", color: "#34d399", fontSize: "0.85rem",
                outline: "none", cursor: "pointer"
              }}
            >
              <option value="">-- الجلب التلقائي (اختر خدمة أو باقة من النظام) --</option>
              {expandedAvailableServices.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          );
        })()}

        <input
          type="text"
          placeholder="عنوان الخدمة (مثال: #7552 Tecno ANTI-CRACK...)"
          value={item.title}
          onChange={e => onChange({ ...item, title: e.target.value })}
          style={{
            width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: "0.85rem"
          }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            placeholder="رابط الخدمة (مثال: /service/7552)"
            value={item.url}
            onChange={e => onChange({ ...item, url: e.target.value })}
            style={{
              flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: "0.85rem"
            }}
          />
          <input
            type="text"
            placeholder="الوقت (مثال: 30 Min)"
            value={item.time}
            onChange={e => onChange({ ...item, time: e.target.value })}
            style={{
              width: 110, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: "0.85rem"
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <button
          onClick={onRemove}
          title="حذف"
          style={{
            background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
            color: "#f87171", borderRadius: 8, padding: "6px 12px", cursor: "pointer",
            fontSize: "0.8rem", fontWeight: 700, flexShrink: 0
          }}
        >✕</button>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            title="تحريك لأعلى"
            style={{
              background: isFirst ? "rgba(255,255,255,0.05)" : "rgba(56,189,248,0.1)", 
              border: `1px solid ${isFirst ? "rgba(255,255,255,0.1)" : "rgba(56,189,248,0.3)"}`,
              color: isFirst ? "#64748b" : "#38bdf8", borderRadius: 6, padding: "4px 8px", 
              cursor: isFirst ? "not-allowed" : "pointer", flex: 1
            }}
          >↑</button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            title="تحريك لأسفل"
            style={{
              background: isLast ? "rgba(255,255,255,0.05)" : "rgba(56,189,248,0.1)", 
              border: `1px solid ${isLast ? "rgba(255,255,255,0.1)" : "rgba(56,189,248,0.3)"}`,
              color: isLast ? "#64748b" : "#38bdf8", borderRadius: 6, padding: "4px 8px", 
              cursor: isLast ? "not-allowed" : "pointer", flex: 1
            }}
          >↓</button>
        </div>
      </div>
    </div>
  );
}

// ─── Section editor ───────────────────────────────────────────────────────────
function SectionEditor({ section, onChange, onRemove, index, categories, services }) {
  const coverRef = useRef();

  const handleCoverUpload = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const b64 = await toBase64(f);
    onChange({ ...section, image: b64 });
  };

  const addItem = () => {
    onChange({ ...section, items: [...(section.items || []), { title: "", url: "#", img: "", time: "" }] });
  };

  const updateItem = (i, upd) => {
    const items = [...(section.items || [])];
    items[i] = upd;
    onChange({ ...section, items });
  };

  const removeItem = (i) => {
    onChange({ ...section, items: (section.items || []).filter((_, j) => j !== i) });
  };

  const moveItem = (i, direction) => {
    const items = [...(section.items || [])];
    if (direction === "up" && i > 0) {
      [items[i - 1], items[i]] = [items[i], items[i - 1]];
    } else if (direction === "down" && i < items.length - 1) {
      [items[i], items[i + 1]] = [items[i + 1], items[i]];
    }
    onChange({ ...section, items });
  };

  const filteredServices = section.categoryId
    ? (services || []).filter(s => s.category_id?.toString() === section.categoryId.toString())
    : (services || []);

  const totalExpandedCount = (() => {
    let count = 0;
    filteredServices.forEach(s => {
      let parsed = [];
      try {
        parsed = typeof s.packages === "string" ? JSON.parse(s.packages) : (s.packages || []);
      } catch (e) {
        parsed = [];
      }
      if (Array.isArray(parsed) && parsed.length > 0) {
        count += parsed.length;
      } else {
        count += 1;
      }
    });
    return count;
  })();

  return (
    <div style={{
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16, padding: 20, marginBottom: 20
    }}>
      {/* section header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontWeight: 800, color: "#38bdf8", fontSize: "1rem" }}>
          📁 قسم #{index + 1}
        </span>
        <button
          onClick={onRemove}
          style={{
            background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
            color: "#f87171", borderRadius: 8, padding: "6px 14px", cursor: "pointer",
            fontSize: "0.85rem", fontWeight: 700
          }}
        >🗑️ حذف القسم</button>
      </div>

      {/* category selector */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ margin: "0 0 8px", fontSize: "0.82rem", color: "#94a3b8" }}>
          🔍 <strong style={{ color: "#e2e8f0" }}>فلترة الخدمات (اختياري)</strong>: اختر قسم من نظامك ليسهل عليك جلب الخدمات تلقائياً.
        </p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <select
            value={section.categoryId || ""}
            onChange={(e) => onChange({ ...section, categoryId: e.target.value })}
            style={{
              flex: "1 1 200px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: "0.9rem", outline: "none"
            }}
          >
            <option value="">-- عرض كل الخدمات في النظام --</option>
            {(categories || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {section.categoryId && (
            <button
              onClick={() => {
                const newItems = [];
                filteredServices.forEach(s => {
                  let parsedPackages = [];
                  try {
                    parsedPackages = typeof s.packages === "string" ? JSON.parse(s.packages) : (s.packages || []);
                  } catch (e) {
                    parsedPackages = [];
                  }

                  if (Array.isArray(parsedPackages) && parsedPackages.length > 0) {
                    parsedPackages.forEach(pkg => {
                      const title = (pkg.name === "تفعيل فوري تلقائي" || !pkg.name) ? s.name : pkg.name;
                      newItems.push({
                        title: title,
                        url: `/service/${s.id}?package=${pkg.id}`,
                        img: "",
                        time: s.time || "",
                        serviceId: `${s.id}-${pkg.id}`
                      });
                    });
                  } else {
                    newItems.push({
                      title: s.name,
                      url: `/service/${s.id}`,
                      img: "",
                      time: s.time || "",
                      serviceId: s.id.toString()
                    });
                  }
                });

                const existingIds = (section.items || []).map(i => i.serviceId?.toString());
                const toAdd = newItems.filter(item => !existingIds.includes(item.serviceId));
                if (toAdd.length > 0) {
                  onChange({ ...section, items: [...(section.items || []), ...toAdd] });
                } else {
                  alert("جميع خدمات وباقات هذا القسم موجودة بالفعل في القائمة.");
                }
              }}
              style={{
                background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)",
                color: "#34d399", borderRadius: 8, padding: "10px 16px", cursor: "pointer",
                fontSize: "0.9rem", fontWeight: 700, whiteSpace: "nowrap"
              }}
              title="سحب جميع الخدمات الموجودة في هذا القسم وإضافتها للقائمة بنقرة واحدة"
            >
              📥 جلب جميع خدمات القسم ({totalExpandedCount})
            </button>
          )}
        </div>
      </div>

      {/* cover image */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap" }}>
        <div
          onClick={() => coverRef.current?.click()}
          style={{
            width: 140, height: 90, borderRadius: 10, overflow: "hidden",
            background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(56,189,248,0.3)",
            cursor: "pointer", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", flexShrink: 0
          }}
        >
          {section.image
            ? <img src={section.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <>
                <span style={{ fontSize: 28, opacity: 0.3 }}>🖼️</span>
                <span style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>صورة القسم</span>
              </>}
        </div>
        <input ref={coverRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleCoverUpload} />

        <div style={{ flex: 1, minWidth: 200 }}>
          <p style={{ margin: "0 0 8px", fontSize: "0.82rem", color: "#94a3b8", lineHeight: 1.5 }}>
            📷 <strong style={{ color: "#e2e8f0" }}>صورة القسم الرئيسية</strong><br />
            ستظهر في الجزء العلوي من البطاقة. اضغط على المربع لاختيار صورة.
          </p>
          {section.image && (
            <button
              onClick={() => onChange({ ...section, image: "" })}
              style={{
                background: "none", border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171", borderRadius: 6, padding: "4px 10px",
                fontSize: "0.78rem", cursor: "pointer"
              }}
            >✕ إزالة الصورة</button>
          )}
        </div>
      </div>

      {/* items */}
      <div style={{ marginBottom: 14 }}>
        <p style={{ margin: "0 0 10px", fontSize: "0.82rem", color: "#94a3b8", fontWeight: 700 }}>
          📋 الخدمات داخل هذا القسم ({(section.items || []).length}) - <span>اضغط على الأسهم للترتيب</span>
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {(section.items || []).map((item, i) => (
            <ItemRow
              key={i}
              index={i}
              item={item}
              onChange={upd => updateItem(i, upd)}
              onRemove={() => removeItem(i)}
              availableServices={filteredServices}
              isFirst={i === 0}
              isLast={i === (section.items || []).length - 1}
              onMoveUp={() => moveItem(i, "up")}
              onMoveDown={() => moveItem(i, "down")}
            />
          ))}
        </div>
      </div>

      <button
        onClick={addItem}
        style={{
          background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)",
          color: "#34d399", borderRadius: 8, padding: "8px 16px", cursor: "pointer",
          fontSize: "0.85rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 6
        }}
      >➕ إضافة خدمة</button>
    </div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────
export default function FeaturedSectionsTab({ featuredSections, setFeaturedSections, token, categories, services }) {
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success"); // success | error

  const addSection = () => {
    setFeaturedSections([
      ...(featuredSections || []),
      { image: "", items: [{ title: "", url: "#", img: "", time: "" }] }
    ]);
  };

  const updateSection = (i, upd) => {
    const arr = [...(featuredSections || [])];
    arr[i] = upd;
    setFeaturedSections(arr);
  };

  const removeSection = (i) => {
    setFeaturedSections((featuredSections || []).filter((_, j) => j !== i));
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ featured_sections: featuredSections || [] })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "فشل الحفظ");
      setMsg("✅ تم حفظ الأقسام المميزة بنجاح!");
      setMsgType("success");
    } catch (err) {
      setMsg("❌ " + err.message);
      setMsgType("error");
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 4000);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* header */}
      <div style={{
        background: "var(--bg-glass)", border: "var(--border-glass)", borderRadius: 16,
        padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 16, boxShadow: "0 4px 30px rgba(0,0,0,0.1)"
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.5rem", color: "var(--text-color)", display: "flex", gap: 10, alignItems: "center" }}>
            ⭐ إدارة الأقسام المميزة
          </h2>
          <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>
            أضف أقساماً مميزة في الصفحة الرئيسية مع صورة القسم وروابط الخدمات وصورها.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={addSection}
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "#fff", padding: "12px 22px", borderRadius: 12, border: "none",
              fontWeight: 800, fontSize: "0.95rem", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
              boxShadow: "0 4px 14px rgba(16,185,129,0.4)"
            }}
          >➕ إضافة قسم جديد</button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: saving ? "rgba(56,189,248,0.2)" : "linear-gradient(135deg, #0ea5e9, #0284c7)",
              color: saving ? "#94a3b8" : "#fff", padding: "12px 22px", borderRadius: 12, border: "none",
              fontWeight: 800, fontSize: "0.95rem", cursor: saving ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 8,
              boxShadow: saving ? "none" : "0 4px 14px rgba(14,165,233,0.4)"
            }}
          >{saving ? "⏳ جارٍ الحفظ..." : "💾 حفظ التغييرات"}</button>
        </div>
      </div>

      {/* status message */}
      {msg && (
        <div style={{
          background: msgType === "success" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
          border: `1px solid ${msgType === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
          color: msgType === "success" ? "#34d399" : "#f87171",
          borderRadius: 12, padding: "14px 20px", fontWeight: 700, fontSize: "0.95rem"
        }}>
          {msg}
        </div>
      )}

      {/* info box */}
      <div style={{
        background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.15)",
        borderRadius: 14, padding: "16px 20px"
      }}>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.87rem", lineHeight: 1.7 }}>
          💡 <strong style={{ color: "#38bdf8" }}>كيفية الاستخدام:</strong> كل قسم مميز عبارة عن بطاقة تظهر في الصفحة الرئيسية.<br />
          لكل قسم: <strong style={{ color: "#e2e8f0" }}>صورة رئيسية</strong> + قائمة خدمات (كل خدمة لها عنوان + رابط + صورة + وقت التنفيذ).<br />
          الترتيب كما هو ظاهر يساوي الترتيب على الصفحة الرئيسية.
        </p>
      </div>

      {/* sections list */}
      {(!featuredSections || featuredSections.length === 0) ? (
        <div style={{
          background: "var(--bg-glass)", border: "var(--border-glass)", borderRadius: 16,
          padding: "50px 20px", textAlign: "center", color: "#64748b"
        }}>
          <span style={{ fontSize: "2.5rem", display: "block", marginBottom: 12 }}>⭐</span>
          <p style={{ margin: 0, fontSize: "1rem" }}>لا توجد أقسام مميزة بعد. اضغط «إضافة قسم جديد» للبدء.</p>
        </div>
      ) : (
        <div>
          {(featuredSections || []).map((sec, i) => (
            <SectionEditor
              key={i}
              index={i}
              section={sec}
              categories={categories}
              services={services}
              onChange={upd => updateSection(i, upd)}
              onRemove={() => removeSection(i)}
            />
          ))}
        </div>
      )}

      {/* floating save */}
      {featuredSections && featuredSections.length > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: saving ? "rgba(56,189,248,0.2)" : "linear-gradient(135deg, #0ea5e9, #0284c7)",
              color: saving ? "#94a3b8" : "#fff", padding: "14px 32px", borderRadius: 14, border: "none",
              fontWeight: 800, fontSize: "1rem", cursor: saving ? "not-allowed" : "pointer",
              boxShadow: saving ? "none" : "0 6px 20px rgba(14,165,233,0.45)"
            }}
          >{saving ? "⏳ جارٍ الحفظ..." : "💾 حفظ جميع التغييرات"}</button>
        </div>
      )}
    </div>
  );
}
