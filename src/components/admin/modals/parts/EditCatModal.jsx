import React, { useContext } from "react";
import { AdminDashboardContext } from "../../AdminDashboardContext";

export default function EditCatModal() {
  const { editCatModal, errorMsg } = useContext(AdminDashboardContext);
  const { showEditCatModal, setShowEditCatModal, handleEditCategory, editCatName, setEditCatName, editCatImage, setEditCatImage, editCatUploadedFile, setEditCatUploadedFile, editCatFieldsTitle, setEditCatFieldsTitle, editCatFields, handleAddEditCatField, handleRemoveEditCatField, handleEditCatFieldChange, editCatParentId, setEditCatParentId, applyToServices, setApplyToServices, editCatId } = editCatModal;

  if (!(showEditCatModal)) return null;

  return (
    <div className="premium-overlay" onClick={() => setShowEditCatModal(false)}>
          <div className="premium-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="premium-modal-header">
              <h3 className="premium-modal-title">تعديل القسم</h3>
              <button className="close-btn-premium" onClick={() => setShowEditCatModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleEditCategory} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>اسم القسم:</label>
                <input
                  type="text"
                  placeholder="مثال: شحن ألعاب، شحن تطبيقات"
                  value={editCatName}
                  onChange={(e) => setEditCatName(e.target.value)}
                  className="search-input-premium"
                  style={{ padding: "12px 16px !important" }}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>القسم الرئيسي (اختياري - لجعله قسماً فرعياً):</label>
                <select 
                  value={editCatParentId || ""} 
                  onChange={(e) => setEditCatParentId(e.target.value)}
                  style={{
                    padding: "12px 18px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    background: "rgba(13, 18, 36, 0.7)",
                    color: "#ffffff",
                    fontSize: "0.95rem",
                    outline: "none",
                    width: "100%"
                  }}
                >
                  <option value="">-- قسم رئيسي (بدون قسم أب) --</option>
                  {categories.filter(c => !c.parent_id && c.id !== editCatId).map(c => (
                    <option key={c.id} value={c.id}>📁 {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>تجميع أقسام فرعية داخل هذا القسم (Linked Categories):</label>
                <select
                  multiple
                  value={editCatLinkedCategories || []}
                  onChange={(e) => {
                    const options = Array.from(e.target.options);
                    const selected = options.filter(o => o.selected).map(o => o.value);
                    setEditCatLinkedCategories(selected);
                  }}
                  className="search-input-premium"
                  style={{ padding: "12px 18px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.08)", background: "rgba(13, 18, 36, 0.7)", color: "#fff", fontSize: "0.95rem", outline: "none", width: "100%", height: "150px" }}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      📁 {cat.name}
                    </option>
                  ))}
                </select>
                <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "5px" }}>يمكنك تحديد أكثر من قسم (باستخدام Ctrl أو Command).</p>
              </div>


              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>أيقونة القسم التعبيرية (الافتراضية):</label>
                <select 
                  value={editCatImage} 
                  onChange={(e) => setEditCatImage(e.target.value)}
                  style={{
                    padding: "12px 18px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    background: "rgba(13, 18, 36, 0.7)",
                    color: "#ffffff",
                    fontSize: "0.95rem",
                    outline: "none",
                    width: "100%"
                  }}
                >
                  <option value="games">🎮 ألعاب</option>
                  <option value="apps">📱 تطبيقات شات</option>
                  <option value="telecom">📞 أرصدة واتصالات</option>
                  <option value="payment">💳 دفع إلكتروني وبطاقات</option>
                  <option value="software">💻 تفعيل برامج ومفاتيح</option>
                  <option value="accounts">🔑 حسابات واشتراكات</option>
                  <option value="default">📁 مجلد افتراضي</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>أو رفع صورة مخصصة من الجهاز (اختياري - ستحل محل الأيقونة):</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setEditCatUploadedFile(reader.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    background: "rgba(13, 18, 36, 0.7)",
                    color: "#ffffff",
                    fontSize: "0.95rem",
                    width: "100%"
                  }}
                />
                {editCatUploadedFile && (
                  <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <img src={editCatUploadedFile.startsWith("/uploads") ? `${API_BASE_URL}${editCatUploadedFile}` : editCatUploadedFile} alt="Preview" style={{ width: "60px", height: "60px", objectFit: "contain", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.1)" }} />
                    <button
                      type="button"
                      onClick={() => setEditCatUploadedFile(null)}
                      className="action-btn btn-danger-premium"
                      style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                    >
                      حذف الصورة المرفوعة
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: "14px" }}>
                <label>عنوان قسم بيانات الخدمة (اختياري - الافتراضي: &quot;بيانات الخدمة&quot;):</label>
                <input
                  type="text"
                  placeholder="مثال: بيانات الخدمة، بيانات لاعب ببجي"
                  value={editCatFieldsTitle}
                  onChange={(e) => setEditCatFieldsTitle(e.target.value)}
                  className="search-input-premium"
                  style={{ padding: "12px 16px !important" }}
                />
              </div>

              {/* Custom Fields Builder for Edit Category */}
              <div style={{ border: "1px solid rgba(255, 255, 255, 0.05)", padding: "18px", borderRadius: "16px", background: "rgba(255, 255, 255, 0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <h4 style={{ fontWeight: 800, fontSize: "0.9rem" }}>حقول البيانات المطلوبة من العميل عند الشراء:</h4>
                  <button 
                    type="button" 
                    onClick={handleAddEditCatField} 
                    className="action-btn"
                    style={{ background: "rgba(6, 182, 212, 0.2)", color: "#22d3ee", border: "1px solid rgba(6, 182, 212, 0.3)" }}
                  >
                    + إضافة حقل
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {editCatFields.map((f, idx) => (
                    <div key={idx} style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      borderRadius: "12px",
                      padding: "12px",
                      marginBottom: "10px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.82rem", color: "#22d3ee", fontWeight: "800" }}>الحقل المطلوب #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveEditCatField(idx)}
                          style={{ background: "none", border: "none", color: "#f87171", fontSize: "0.82rem", cursor: "pointer", fontWeight: "bold" }}
                        >
                          حذف الحقل ×
                        </button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: "bold" }}>معرّف الحقل (ID):</span>
                          <input
                            type="text"
                            placeholder="معرّف الحقل (ID مثل: player_id)"
                            value={f.id}
                            onChange={(e) => handleEditCatFieldChange(idx, "id", e.target.value)}
                            required
                          />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: "bold" }}>اسم الحقل بالعربية:</span>
                          <input
                            type="text"
                            placeholder="اسم الحقل بالعربية"
                            value={f.label}
                            onChange={(e) => handleEditCatFieldChange(idx, "label", e.target.value)}
                            required
                          />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: "bold" }}>نص تلميح تلميحي:</span>
                          <input
                            type="text"
                            placeholder="نص تلميح تلميحي"
                            value={f.placeholder || ""}
                            onChange={(e) => handleEditCatFieldChange(idx, "placeholder", e.target.value)}
                          />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: "bold" }}>نوع المدخل:</span>
                          <select
                            value={f.type}
                            onChange={(e) => handleEditCatFieldChange(idx, "type", e.target.value)}
                            style={{
                              padding: "8px 12px",
                              borderRadius: "10px",
                              border: "1px solid rgba(255, 255, 255, 0.06)",
                              background: "rgba(13, 18, 36, 0.7)",
                              color: "#ffffff",
                              fontSize: "0.85rem",
                              width: "100%",
                              boxSizing: "border-box"
                            }}
                          >
                            <option value="text">نص (text)</option>
                            <option value="tel">هاتف (tel)</option>
                            <option value="number">رقم (number)</option>
                            <option value="email">إيميل (email)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {errorMsg && (
                <div style={{ color: "#f87171", fontSize: "0.85rem", fontWeight: "600" }}>
                  ⚠️ {errorMsg}
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "6px 0 12px 0" }}>
                <input
                  type="checkbox"
                  id="apply_to_services_checkbox"
                  checked={applyToServices}
                  onChange={(e) => setApplyToServices(e.target.checked)}
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                />
                <label htmlFor="apply_to_services_checkbox" style={{ fontSize: "0.85rem", cursor: "pointer", color: "var(--text-muted)", userSelect: "none", textAlign: "right", flex: 1 }}>
                  تطبيق هذه الحقول والعنوان المخصص على جميع الخدمات الحالية في هذا القسم
                </label>
              </div>

              <button type="submit" className="btn-add-premium" style={{ width: "100%", padding: "14px" }}>
                حفظ وتعديل القسم
              </button>
            </form>
          </div>
        </div>
  );
}
