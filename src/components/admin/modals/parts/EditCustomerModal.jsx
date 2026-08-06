import React, { useContext } from "react";
import { AdminDashboardContext } from "../../AdminDashboardContext";

export default function EditCustomerModal() {
  const { customerModal, errorMsg, baseCurrency } = useContext(AdminDashboardContext);
  const { showEditCustomerModal, setShowEditCustomerModal, handleUpdateCustomer, editCustomerUsername, setEditCustomerUsername, editCustomerEmail, setEditCustomerEmail, editCustomerPhone, setEditCustomerPhone, editCustomerBalance, setEditCustomerBalance, globalCurrencies, editCustomerBalances, setEditCustomerBalances, editCustomerNewPassword, setEditCustomerNewPassword } = customerModal;

  if (!(showEditCustomerModal)) return null;

  return (
    <div className="premium-overlay" onClick={() => setShowEditCustomerModal(false)}>
          <div className="premium-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "620px", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="premium-modal-header">
              <h3 className="premium-modal-title">تعديل بيانات العميل</h3>
              <button className="close-btn-premium" onClick={() => setShowEditCustomerModal(false)}>×</button>
            </div>

            <form onSubmit={handleUpdateCustomer} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>اسم المستخدم:</label>
                <input
                  type="text"
                  value={editCustomerUsername}
                  onChange={(e) => setEditCustomerUsername(e.target.value)}
                  className="search-input-premium"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>البريد الإلكتروني:</label>
                <input
                  type="email"
                  value={editCustomerEmail}
                  onChange={(e) => setEditCustomerEmail(e.target.value)}
                  className="search-input-premium"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>رقم الهاتف:</label>
                <input
                  type="tel"
                  value={editCustomerPhone}
                  onChange={(e) => setEditCustomerPhone(e.target.value)}
                  className="search-input-premium"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>الرصيد الحالي ({baseCurrency}):</label>
                <input
                  type="number"
                  step="0.01"
                  value={editCustomerBalance}
                  onChange={(e) => setEditCustomerBalance(e.target.value)}
                  className="search-input-premium"
                  required
                />
              </div>

              <div style={{ marginTop: "16px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "14px" }}>
                <label style={{ fontWeight: "bold", display: "block", marginBottom: "8px" }}>أرصدة العملات الإضافية:</label>
                {globalCurrencies.length === 0 ? (
                  <div style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "10px" }}>لا توجد عملات إضافية مضافة في إعدادات الموقع العامة.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "10px" }}>
                    {globalCurrencies.filter(c => c !== baseCurrency).map((currency) => (
                      <div key={currency} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <span style={{ minWidth: "80px", fontSize: "0.85rem", color: "#cbd5e1", fontWeight: "bold" }}>رصيد {currency}:</span>
                        <input
                          type="number"
                          step="0.01"
                          value={editCustomerBalances[currency] !== undefined ? editCustomerBalances[currency] : 0}
                          onChange={(e) => {
                            const newVal = parseFloat(e.target.value);
                            setEditCustomerBalances(prev => ({
                              ...prev,
                              [currency]: isNaN(newVal) ? 0 : newVal
                            }));
                          }}
                          className="search-input-premium"
                          style={{ flex: 1, padding: "8px 12px" }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>كلمة مرور جديدة (اختياري):</label>
                <input
                  type="text"
                  placeholder="اتركها فارغة إذا لا تريد تغييرها"
                  value={editCustomerNewPassword}
                  onChange={(e) => setEditCustomerNewPassword(e.target.value)}
                  className="search-input-premium"
                />
                <div style={{ marginTop: "8px", fontSize: "0.82rem", color: "#94a3b8" }}>
                  كلمة المرور القديمة لا يمكن إظهارها لأنها محفوظة بشكل مشفّر.
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                <button type="button" className="action-btn btn-danger-premium" onClick={() => setShowEditCustomerModal(false)}>
                  إلغاء
                </button>
                <button type="submit" className="btn-add-premium">
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
  );
}
