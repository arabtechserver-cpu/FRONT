import React, { useContext } from "react";
import { AdminDashboardContext } from "../../AdminDashboardContext";

export default function CodeModal() {
  const { codeModal } = useContext(AdminDashboardContext);
  const { codeModalOrder, showCodeModal, setShowCodeModal, codeModalStatusToUpdate, codeValue, setCodeValue, orderDownloadLinkValue, setOrderDownloadLinkValue, orderDownloadLinkTitleValue, setOrderDownloadLinkTitleValue, handleSubmitCodeModal, updateOrderCodeAndStatus } = codeModal;

  if (!(showCodeModal && codeModalOrder)) return null;

  return (
    <div className="premium-overlay" onClick={() => setShowCodeModal(false)}>
          <div className="premium-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px", maxHeight: "85vh", overflowY: "auto" }}>
            <div className="premium-modal-header">
              <h3 className="premium-modal-title">
                {codeModalStatusToUpdate === "completed" 
                  ? `إتمام التنفيذ وإرسال كود التفعيل للطلب #${codeModalOrder.id}` 
                  : `تعديل كود التفعيل للطلب #${codeModalOrder.id}`}
              </h3>
              <button className="close-btn-premium" onClick={() => setShowCodeModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmitCodeModal} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)", fontSize: "0.85rem", color: "#cbd5e1" }}>
                <div>الخدمة: <strong>{codeModalOrder.service_name}</strong></div>
                <div style={{ marginTop: "4px" }}>الباقة: <strong>{codeModalOrder.package_name}</strong></div>
                <div style={{ marginTop: "4px" }}>معرف الحساب (ID): <strong style={{ color: "#c084fc" }}>{codeModalOrder.player_id}</strong></div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>كود التفعيل أو رسالة الخدمة للعميل:</label>
                <textarea
                  placeholder="أدخل كود التفعيل، كود البطاقة، أو أي رسالة توضيحية للعميل هنا..."
                  rows="4"
                  value={codeValue}
                  onChange={(e) => setCodeValue(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    background: "rgba(13, 18, 36, 0.7)",
                    color: "#ffffff",
                    fontSize: "0.95rem",
                    outline: "none",
                    fontFamily: "monospace"
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>رابط تحميل الأداة أو التطبيق للعميل (اختياري):</label>
                <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                  <input
                    type="text"
                    placeholder="رابط التحميل (مثال: https://...)"
                    value={orderDownloadLinkValue}
                    onChange={(e) => setOrderDownloadLinkValue(e.target.value)}
                    style={{
                      flex: 2,
                      padding: "10px 14px",
                      borderRadius: "12px",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      background: "rgba(13, 18, 36, 0.7)",
                      color: "#ffffff",
                      fontSize: "0.95rem",
                      outline: "none"
                    }}
                  />
                  <input
                    type="text"
                    placeholder="عنوان زر التحميل (مثال: تحميل الأداة)"
                    value={orderDownloadLinkTitleValue}
                    onChange={(e) => setOrderDownloadLinkTitleValue(e.target.value)}
                    style={{
                      flex: 1,
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
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                <button 
                  type="button" 
                  className="action-btn btn-danger-premium" 
                  onClick={() => setShowCodeModal(false)}
                >
                  إلغاء
                </button>
                
                {codeModalStatusToUpdate === "completed" && (
                  <button 
                    type="button" 
                    className="action-btn btn-edit-premium"
                    style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)" }}
                    onClick={async () => {
                      await updateOrderCodeAndStatus(codeModalOrder.id, "completed", "", orderDownloadLinkValue, orderDownloadLinkTitleValue);
                      setShowCodeModal(false);
                      setCodeModalOrder(null);
                      setCodeValue("");
                      setOrderDownloadLinkValue("");
                      setOrderDownloadLinkTitleValue("");
                    }}
                  >
                    شحن بدون كود
                  </button>
                )}

                <button type="submit" className="btn-add-premium">
                  {codeModalStatusToUpdate === "completed" ? "إتمام التنفيذ وحفظ الكود" : "حفظ الكود"}
                </button>
              </div>
            </form>
          </div>
        </div>
  );
}
