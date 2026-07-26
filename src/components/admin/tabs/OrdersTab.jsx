import React from "react";

export default function OrdersTab({
  stats,
  baseCurrency,
  orderSearch,
  setOrderSearch,
  orderFilter,
  setOrderFilter,
  orders,
  filteredOrders,
  setOrderDetailsData,
  setShowOrderDetailsModal,
  handleApproveOrder,
  handleOpenCodeModal,
  updateOrderStatus,
  checkUnlockerOrderStatus,
  cancelUnlockerOrder,
  handleManualRefund,
  deleteOrder,
  walletTransactions,
  filteredWalletTransactions
}) {
  return (
    <>
      <div className="premium-stats-grid">
        <div className="premium-stat-card" style={{ "--glow-color": "rgba(99, 102, 241, 0.15)" }}>
          <div className="stat-card-info">
            <span className="stat-card-title">إجمالي الطلبات</span>
            <span className="stat-card-value">{stats.totalOrders}</span>
          </div>
          <div className="stat-card-icon-wrapper" style={{ "--icon-bg": "rgba(99, 102, 241, 0.1)", "--icon-border": "rgba(99, 102, 241, 0.2)", "--icon-color": "#818cf8" }}>
            📦
          </div>
        </div>

        <div className="premium-stat-card" style={{ "--glow-color": "rgba(245, 158, 11, 0.15)" }}>
          <div className="stat-card-info">
            <span className="stat-card-title">قيد الانتظار</span>
            <span className="stat-card-value">{stats.pendingOrders}</span>
          </div>
          <div className="stat-card-icon-wrapper" style={{ "--icon-bg": "rgba(245, 158, 11, 0.1)", "--icon-border": "rgba(245, 158, 11, 0.2)", "--icon-color": "#fbbf24" }}>
            ⏳
          </div>
        </div>

        <div className="premium-stat-card" style={{ "--glow-color": "rgba(16, 185, 129, 0.15)" }}>
          <div className="stat-card-info">
            <span className="stat-card-title">الطلبات المكتملة</span>
            <span className="stat-card-value">{stats.completedOrders}</span>
          </div>
          <div className="stat-card-icon-wrapper" style={{ "--icon-bg": "rgba(16, 185, 129, 0.1)", "--icon-border": "rgba(16, 185, 129, 0.2)", "--icon-color": "#34d399" }}>
            ✅
          </div>
        </div>

        <div className="premium-stat-card" style={{ "--glow-color": "rgba(6, 182, 212, 0.15)" }}>
          <div className="stat-card-info">
            <span className="stat-card-title">الأرباح الإجمالية</span>
            <span className="stat-card-value" style={{ color: "#22d3ee" }}>{stats.revenue.toFixed(2)} {baseCurrency}</span>
          </div>
          <div className="stat-card-icon-wrapper" style={{ "--icon-bg": "rgba(6, 182, 212, 0.1)", "--icon-border": "rgba(6, 182, 212, 0.2)", "--icon-color": "#22d3ee", "--icon-shadow": "0 0 15px rgba(6, 182, 212, 0.3)" }}>
            💰
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="table-filter-bar">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input-premium"
            placeholder="ابحث برقم الطلب، الخدمة، الـ ID..."
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
          />
          <span className="search-input-icon">🔍</span>
        </div>

        <div className="status-tabs-wrapper">
          <button
            className={`status-tab-btn ${orderFilter === "all" ? "active" : ""}`}
            onClick={() => setOrderFilter("all")}
          >
            الكل
          </button>
          <button
            className={`status-tab-btn ${orderFilter === "pending" ? "active" : ""}`}
            onClick={() => setOrderFilter("pending")}
          >
            قيد الانتظار ({orders.filter(o => o.status === "pending").length})
          </button>
          <button
            className={`status-tab-btn ${orderFilter === "completed" ? "active" : ""}`}
            onClick={() => setOrderFilter("completed")}
          >
            المكتملة
          </button>
          <button
            className={`status-tab-btn ${orderFilter === "cancelled" ? "active" : ""}`}
            onClick={() => setOrderFilter("cancelled")}
          >
            الملغاة
          </button>
        </div>
      </div>

      {/* Orders Cards (Mobile-Friendly, No Scroll) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#64748b", fontSize: "1rem", fontWeight: 600, background: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.04)" }}>
            لا توجد أي طلبات شحن تطابق معايير البحث.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "16px",
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              transition: "border-color 0.2s"
            }}>
              {/* Row 1: Order # + Status + Date */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <span style={{ fontWeight: 900, color: "#38bdf8", fontSize: "1rem" }}>#{order.id}</span>
                <span className={`premium-badge premium-badge-${order.status}`}>
                  <span className="badge-dot" />
                  {order.status === "pending" && "انتظار"}
                  {order.status === "completed" && "مكتمل"}
                  {order.status === "cancelled" && "ملغي"}
                </span>
                <span style={{ fontSize: "0.78rem", color: "#64748b" }}>{new Date(order.created_at).toLocaleString("ar-EG")}</span>
              </div>

              {/* Row 2: Customer + Service */}
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "120px" }}>
                  <div style={{ fontSize: "0.73rem", color: "#64748b", marginBottom: "2px" }}>العميل</div>
                  <div style={{ fontWeight: 700, color: order.customer_username && order.customer_username.includes("زائر") ? "#94a3b8" : "#fbbf24", fontSize: "0.9rem" }}>
                    {order.customer_username || "زائر"}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#c084fc", marginTop: "4px", direction: "ltr", textAlign: "right" }}>
                    ID: {order.player_id}
                  </div>
                </div>
                <div style={{ flex: 2, minWidth: "140px" }}>
                  <div style={{ fontSize: "0.73rem", color: "#64748b", marginBottom: "2px" }}>الخدمة</div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{order.service_name}</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{order.package_name} • <span style={{ color: "#34d399" }}>{Number(order.package_price || 0).toFixed(2)} {baseCurrency}</span></div>
                  {order.custom_fields && (() => {
                    try {
                      const parsed = typeof order.custom_fields === 'string' ? JSON.parse(order.custom_fields) : order.custom_fields;
                      const entries = Object.entries(parsed);
                      if (entries.length === 0) return null;
                      return (
                        <div style={{ marginTop: "6px", fontSize: "0.8rem", color: "#cbd5e1", background: "rgba(255,255,255,0.03)", padding: "6px 10px", borderRadius: "8px" }}>
                          {entries.map(([key, val]) => (
                            <div key={key}>
                              <span style={{ color: "#64748b" }}>{key}:</span> <strong style={{ color: "#22d3ee", direction: "ltr", display: "inline-block" }}>{val}</strong>
                            </div>
                          ))}
                        </div>
                      );
                    } catch {
                      return null;
                    }
                  })()}
                  {order.api_order_id && (
                    <div style={{ fontSize: "0.75rem", background: "rgba(14,165,233,0.12)", color: "#38bdf8", padding: "4px 10px", borderRadius: "8px", display: "inline-flex", gap: "6px", alignItems: "center", marginTop: "6px", fontWeight: "bold" }}>
                      <span>🔓 طلب API خارجي: #{order.api_order_id}</span>
                      <span style={{ opacity: 0.85 }}>({order.api_status || 'Pending'})</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 3: Actions */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "10px" }}>
                <button
                  onClick={() => { setOrderDetailsData(order); setShowOrderDetailsModal(true); }}
                  className="action-btn btn-edit-premium"
                  style={{ fontSize: "0.8rem", padding: "6px 14px" }}
                >
                  📋 تفاصيل
                </button>
                {order.status === "pending" && (
                  <>
                    {order.api_source === "amrr-unlocker" ? (
                      <>
                        <button onClick={() => handleApproveOrder(order)} className="action-btn" style={{ background: "rgba(14,165,233,0.18)", border: "1px solid rgba(14,165,233,0.3)", color: "#0ea5e9", fontSize: "0.8rem", padding: "6px 14px", fontWeight: "bold" }}>
                          ⚡ اعتماد وإرسال للـAPI
                        </button>
                        <button onClick={() => handleOpenCodeModal(order, "completed")} className="action-btn btn-success-premium" style={{ fontSize: "0.8rem", padding: "6px 14px" }}>
                          ✅ تم الشحن (يدوي)
                        </button>
                        <button onClick={() => updateOrderStatus(order.id, "cancelled")} className="action-btn btn-danger-premium" style={{ fontSize: "0.8rem", padding: "6px 14px" }}>
                          ❌ إلغاء (يدوي)
                        </button>
                        <button onClick={() => cancelUnlockerOrder(order.id)} className="action-btn btn-danger-premium" style={{ fontSize: "0.8rem", padding: "6px 14px" }}>
                          ❌ إلغاء من المزود
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleApproveOrder(order)} className="action-btn btn-success-premium">
                          ✅ تم الشحن
                        </button>
                        <button onClick={() => updateOrderStatus(order.id, "cancelled")} className="action-btn btn-danger-premium">
                          ❌ إلغاء
                        </button>
                      </>
                    )}
                  </>
                )}
                {order.status === "processing" && order.api_source === "amrr-unlocker" && (
                  <>
                    <button onClick={() => checkUnlockerOrderStatus(order.id)} className="action-btn" style={{ background: "rgba(34,197,94,0.18)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e", fontSize: "0.8rem", padding: "6px 14px", fontWeight: "bold" }}>
                      🔄 تحديث حالة API
                    </button>
                    <button onClick={() => handleOpenCodeModal(order, "completed")} className="action-btn btn-success-premium" style={{ fontSize: "0.8rem", padding: "6px 14px" }}>
                      ✅ تم الشحن (يدوي)
                    </button>
                    <button onClick={() => updateOrderStatus(order.id, "cancelled")} className="action-btn btn-danger-premium" style={{ fontSize: "0.8rem", padding: "6px 14px" }}>
                      ❌ إلغاء (يدوي)
                    </button>
                    <button onClick={() => cancelUnlockerOrder(order.id)} className="action-btn btn-danger-premium" style={{ fontSize: "0.8rem", padding: "6px 14px" }}>
                      ❌ إلغاء واسترداد
                    </button>
                  </>
                )}
                {order.payment_method === "wallet" && (
                  <button
                    onClick={() => handleManualRefund(order.id)}
                    className="action-btn"
                    style={{ background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.25)", color: "#facc15", fontSize: "0.8rem", padding: "6px 14px", fontWeight: "bold" }}
                  >
                    💸 إرجاع رصيد
                  </button>
                )}
                <button
                  onClick={() => handleOpenCodeModal(order, null)}
                  className="action-btn btn-edit-premium"
                  style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.2)", color: "#c084fc" }}
                >
                  🔑 كود
                </button>
                <button onClick={() => deleteOrder(order.id)} className="action-btn btn-danger-premium">
                  🗑️ حذف
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: "28px", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "18px", padding: "18px", background: "rgba(255,255,255,0.02)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", gap: "12px", flexWrap: "wrap" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800 }}>سجل الحركات في المحفظة</h3>
            <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>
              كل إضافة شحن أو خصم شراء يظهر هنا مع الرصيد قبل وبعد العملية.
            </p>
          </div>
          <div style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>
            إجمالي العمليات: <strong style={{ color: "#ffffff" }}>{walletTransactions.length}</strong>
          </div>
        </div>

        <div className="premium-table-wrapper" style={{ marginBottom: 0 }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>العميل</th>
                <th>النوع</th>
                <th>المبلغ</th>
                <th>الرصيد قبل</th>
                <th>الرصيد بعد</th>
                <th>المرجع</th>
                <th>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {filteredWalletTransactions.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "36px", color: "#64748b" }}>
                    لا توجد حركات محفظة مطابقة للبحث.
                  </td>
                </tr>
              ) : (
                filteredWalletTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td data-label="ID" style={{ fontWeight: 800, color: tx.type === "credit" ? "#34d399" : "#f87171" }}>#{tx.id}</td>
                    <td data-label="العميل">
                      <div style={{ fontWeight: 700 }}>{tx.customer_username}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>ID: {tx.customer_id}</div>
                    </td>
                    <td data-label="النوع">
                      <span className={`premium-badge ${tx.type === "credit" ? "premium-badge-approved" : "premium-badge-rejected"}`}>
                        {tx.type === "credit" ? "إضافة" : "خصم"}
                      </span>
                    </td>
                    <td data-label="المبلغ" style={{ fontWeight: 800, color: tx.type === "credit" ? "#34d399" : "#f87171" }}>
                      {Number(tx.amount || 0).toFixed(2)} {baseCurrency}
                    </td>
                    <td data-label="الرصيد قبل">{Number(tx.balance_before || 0).toFixed(2)} {baseCurrency}</td>
                    <td data-label="الرصيد بعد">{Number(tx.balance_after || 0).toFixed(2)} {baseCurrency}</td>
                    <td data-label="المرجع" style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>
                      {tx.reference_type === "order" && `طلب #${tx.reference_id}`}
                      {tx.reference_type === "wallet_request" && `شحن #${tx.reference_id}`}
                      {!tx.reference_type && "-"}
                    </td>
                    <td data-label="التاريخ" style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                      {tx.created_at ? new Date(tx.created_at).toLocaleString("ar-EG") : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
