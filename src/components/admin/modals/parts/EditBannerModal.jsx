import React, { useContext } from "react";
import { AdminDashboardContext } from "../../AdminDashboardContext";
import { API_BASE_URL } from "@/config";

export default function EditBannerModal() {
  const { editBannerModal, errorMsg } = useContext(AdminDashboardContext);
  const { showEditBannerModal, setShowEditBannerModal, handleEditBanner, editBannerTitle, setEditBannerTitle, editBannerHighlight, setEditBannerHighlight, editBannerDesc, setEditBannerDesc, editBannerBadge, setEditBannerBadge, editBannerColor, setEditBannerColor, editBannerIcon, setEditBannerIcon, editBannerUploadedFile, setEditBannerUploadedFile } = editBannerModal;

  if (!(showEditBannerModal)) return null;

  return (
    <div className="premium-overlay" onClick={() => setShowEditBannerModal(false)}>
          <div className="premium-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="premium-modal-header">
              <h3 className="premium-modal-title">تعديل الشريحة الإعلانية</h3>
              <button className="close-btn-premium" onClick={() => setShowEditBannerModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleEditBanner} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", gap: "14px" }}>
                <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                  <label>العنوان الرئيسي:</label>
                  <input
                    type="text"
                    placeholder="مثال: شدات ببجي موبايل بأقل الأسعار"
                    value={editBannerTitle}
                    onChange={(e) => setEditBannerTitle(e.target.value)}
                    className="search-input-premium"
                    style={{ padding: "10px 14px !important" }}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                  <label>النص المميز (الملون):</label>
                  <input
                    type="text"
                    placeholder="مثال: PUBG Mobile UC"
                    value={editBannerHighlight}
                    onChange={(e) => setEditBannerHighlight(e.target.value)}
                    className="search-input-premium"
                    style={{ padding: "10px 14px !important" }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>الوصف:</label>
                <textarea
                  placeholder="اكتب وصف الشريحة هنا..."
                  rows="2"
                  value={editBannerDesc}
                  onChange={(e) => setEditBannerDesc(e.target.value)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    background: "rgba(13, 18, 36, 0.7)",
                    color: "#ffffff",
                    fontSize: "0.95rem",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "14px", alignItems: "flex-end" }}>
                <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                  <label>الشارة / التنبيه:</label>
                  <input
                    type="text"
                    placeholder="مثال: عرض خاص"
                    value={editBannerBadge}
                    onChange={(e) => setEditBannerBadge(e.target.value)}
                    className="search-input-premium"
                    style={{ padding: "10px 14px !important" }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0, width: "120px" }}>
                  <label>لون الهوية:</label>
                  <input
                    type="color"
                    value={editBannerColor}
                    onChange={(e) => setEditBannerColor(e.target.value)}
                    style={{
                      padding: "4px",
                      borderRadius: "12px",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      background: "rgba(13, 18, 36, 0.7)",
                      width: "100%",
                      height: "40px",
                      cursor: "pointer"
                    }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0, width: "120px" }}>
                  <label>أيقونة تعبيرية:</label>
                  <input
                    type="text"
                    placeholder="مثال: 🎮"
                    value={editBannerIcon}
                    onChange={(e) => setEditBannerIcon(e.target.value)}
                    className="search-input-premium"
                    style={{ padding: "10px 14px !important" }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>أو رفع صورة مخصصة للبانر (اختياري - ستحل محل الأيقونة):</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setEditBannerUploadedFile(reader.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    background: "rgba(13, 18, 36, 0.7)",
                    color: "#ffffff",
                    fontSize: "0.9rem",
                    width: "100%"
                  }}
                />
                {editBannerUploadedFile && (
                  <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <img src={editBannerUploadedFile.startsWith("/uploads") ? `${API_BASE_URL}${editBannerUploadedFile}` : editBannerUploadedFile} alt="Preview" style={{ width: "50px", height: "50px", objectFit: "contain", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.1)" }} />
                    <button
                      type="button"
                      onClick={() => setEditBannerUploadedFile(null)}
                      className="action-btn btn-danger-premium"
                      style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                    >
                      حذف الصورة
                    </button>
                  </div>
                )}
              </div>

              {errorMsg && (
                <div style={{ color: "#f87171", fontSize: "0.85rem", fontWeight: "600" }}>
                  ⚠️ {errorMsg}
                </div>
              )}

              <button type="submit" className="btn-add-premium" style={{ width: "100%", padding: "12px" }}>
                حفظ التعديلات
              </button>
            </form>
          </div>
        </div>
  );
}
