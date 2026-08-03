import React, { useContext } from "react";
import { AdminDashboardContext } from "../../AdminDashboardContext";
import { API_BASE_URL } from "@/config";

export default function OrderDetailsModal() {
  const { orderModal, errorMsg } = useContext(AdminDashboardContext);
  const { showOrderDetailsModal, setShowOrderDetailsModal, orderDetailsData, baseCurrency, isUnlockerOrder, handleApproveOrder, handleOpenCodeModal, updateOrderStatus, cancelUnlockerOrder } = orderModal;

  if (!(showOrderDetailsModal && orderDetailsData)) return null;

  return (
    <div className="premium-overlay" onClick={() => setShowOrderDetailsModal(false)}>
          <div className="premium-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "540px", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="premium-modal-header">
              <h3 className="premium-modal-title">📋 تفاصيل الطلب #{orderDetailsData.id}</h3>
              <button className="close-btn-premium" onClick={() => setShowOrderDetailsModal(false)}>×</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Status */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <span className={`premium-badge premium-badge-${orderDetailsData.status}`} style={{ fontSize: "0.9rem", padding: "6px 18px" }}>
                  <span className="badge-dot" />
                  {orderDetailsData.status === "pending" && "قيد الانتظار"}
                  {orderDetailsData.status === "completed" && "مكتمل"}
                  {orderDetailsData.status === "cancelled" && "ملغي"}
                </span>
              </div>

              {/* Details Grid */}
              {[
                { label: "رقم الطلب", value: `#${orderDetailsData.id}`, color: "#38bdf8" },
                { label: "حساب العميل", value: `${orderDetailsData.customer_username || "زائر"}${orderDetailsData.customer_id ? ` (ID: ${orderDetailsData.customer_id})` : ""}`, color: "#fbbf24" },
                { label: "الخدمة", value: orderDetailsData.service_name },
                { label: "التصنيف", value: orderDetailsData.category_name },
                { label: "الباقة", value: `${orderDetailsData.package_name}${orderDetailsData.quantity > 1 ? ` × ${orderDetailsData.quantity}` : ""}` },
                { label: "السعر", value: `${Number(orderDetailsData.package_price || 0).toFixed(2)} ${baseCurrency}`, color: "#34d399" },
                { label: "معرّف الحساب (ID)", value: orderDetailsData.player_id, color: "#c084fc", ltr: true },
                { label: "رقم الهاتف", value: orderDetailsData.phone, ltr: true },
                // Custom fields mapping
                ...(() => {
                  if (!orderDetailsData.custom_fields) return [];
                  try {
                    const parsed = typeof orderDetailsData.custom_fields === 'string' ? JSON.parse(orderDetailsData.custom_fields) : orderDetailsData.custom_fields;
                    return Object.entries(parsed)
                      .map(([key, val]) => ({
                        label: key,
                        value: String(val),
                        color: "#22d3ee"
                      }));
                  } catch {
                    return [];
                  }
                })(),
                { label: "طريقة الدفع", value: orderDetailsData.payment_method === "wallet" ? "المحفظة 💳" : orderDetailsData.payment_method === "transfer" ? `تحويل إلى ${orderDetailsData.transfer_to || ""}` : "غير محدد", color: orderDetailsData.payment_method === "wallet" ? "#34d399" : "#38bdf8" },
                ...(orderDetailsData.payment_method === "transfer" ? [
                  { label: "رقم المحول", value: orderDetailsData.sender_phone || "-", ltr: true },
                  { label: "مبلغ التحويل", value: Number(orderDetailsData.transfer_amount || 0) > 0 ? `${Number(orderDetailsData.transfer_amount).toFixed(2)} ${baseCurrency}` : "-" },
                ] : []),
                { label: "تاريخ الطلب", value: new Date(orderDetailsData.created_at).toLocaleString("ar-EG"), color: "#94a3b8" },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.04)", gap: "12px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 700, flexShrink: 0 }}>{row.label}</span>
                  <span style={{ fontSize: "0.88rem", fontWeight: 800, color: row.color || "#cbd5e1", direction: row.ltr ? "ltr" : "rtl", textAlign: "left", wordBreak: "break-all" }}>{row.value || "-"}</span>
                </div>
              ))}

              {/* Receipt Image */}
              {orderDetailsData.receipt_image && (
                <a
                  href={`${API_BASE_URL}${orderDetailsData.receipt_image}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-add-premium"
                  style={{ textAlign: "center", textDecoration: "none", display: "block", padding: "10px", borderRadius: "12px", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ade80", fontWeight: 800 }}
                >
                  📸 عرض إيصال التحويل
                </a>
              )}

              {/* Code */}
              {orderDetailsData.code && (
                <div style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: "12px", padding: "12px 14px" }}>
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "6px", fontWeight: 700 }}>🔑 كود التفعيل / رسالة الخدمة</div>
                  <div style={{ fontFamily: "monospace", fontSize: "0.95rem", color: "#c084fc", wordBreak: "break-all", whiteSpace: "pre-wrap" }}>{orderDetailsData.code}</div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "14px" }}>
                {orderDetailsData.status === "pending" && (
                  <>
                    <button
                      onClick={() => { setShowOrderDetailsModal(false); handleApproveOrder(orderDetailsData); }}
                      className="btn-add-premium"
                      style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399" }}
                    >
                      {isUnlockerOrder(orderDetailsData) ? "⚡ اعتماد وإرسال للـAPI" : "✅ تم الشحن"}
                    </button>
                    <button
                      onClick={() => {
                        if (isUnlockerOrder(orderDetailsData) && cancelUnlockerOrder) {
                          cancelUnlockerOrder(orderDetailsData.id);
                        } else {
                          updateOrderStatus(orderDetailsData.id, "cancelled");
                        }
                        setShowOrderDetailsModal(false);
                      }}
                      className="action-btn btn-danger-premium"
                    >
                      ❌ إلغاء
                    </button>
                  </>
                )}
                {orderDetailsData.status === "cancelled" && (
                  <button
                    onClick={async () => {
                      if (confirm("هل تريد إعادة تفعيل هذا الطلب كـ 'قيد الانتظار'؟ سيقوم النظام بخصم قيمة الباقة من رصيد محفظة العميل مجدداً.")) {
                        await updateOrderStatus(orderDetailsData.id, "pending");
                        setShowOrderDetailsModal(false);
                      }
                    }}
                    className="action-btn btn-edit-premium"
                    style={{ background: "rgba(56, 189, 248, 0.15)", border: "1px solid rgba(56, 189, 248, 0.3)", color: "#38bdf8" }}
                  >
                    🔄 إعادة تفعيل الطلب (خصم وتعليق الرصيد)
                  </button>
                )}
                <button
                  onClick={() => { setShowOrderDetailsModal(false); handleOpenCodeModal(orderDetailsData, null); }}
                  className="action-btn btn-edit-premium"
                  style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.2)", color: "#c084fc" }}
                >
                  🔑 تعديل الكود
                </button>
                <button onClick={() => setShowOrderDetailsModal(false)} className="action-btn btn-edit-premium">
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
  );
}
