import React from "react";

export default function WalletsTab({
  walletRequests,
  walletSearch,
  setWalletSearch,
  walletFilter,
  setWalletFilter,
  filteredWalletRequests,
  updateWalletRequestStatus
}) {
  return (
    <>
      <div className="premium-stats-grid">
        <div className="premium-stat-card" style={{ "--glow-color": "rgba(6, 182, 212, 0.15)" }}>
          <div className="stat-card-info">
            <span className="stat-card-title">إجمالي الطلبات</span>
            <span className="stat-card-value">{walletRequests.length}</span>
          </div>
          <div className="stat-card-icon-wrapper" style={{ "--icon-bg": "rgba(6, 182, 212, 0.1)", "--icon-border": "rgba(6, 182, 212, 0.2)", "--icon-color": "#22d3ee" }}>
            💳
          </div>
        </div>

        <div className="premium-stat-card" style={{ "--glow-color": "rgba(245, 158, 11, 0.15)" }}>
          <div className="stat-card-info">
            <span className="stat-card-title">قيد الانتظار</span>
            <span className="stat-card-value">{walletRequests.filter((r) => r.status === "pending").length}</span>
          </div>
          <div className="stat-card-icon-wrapper" style={{ "--icon-bg": "rgba(245, 158, 11, 0.1)", "--icon-border": "rgba(245, 158, 11, 0.2)", "--icon-color": "#fbbf24" }}>
            ⏳
          </div>
        </div>

        <div className="premium-stat-card" style={{ "--glow-color": "rgba(16, 185, 129, 0.15)" }}>
          <div className="stat-card-info">
            <span className="stat-card-title">تمت الموافقة</span>
            <span className="stat-card-value">{walletRequests.filter((r) => r.status === "approved").length}</span>
          </div>
          <div className="stat-card-icon-wrapper" style={{ "--icon-bg": "rgba(16, 185, 129, 0.1)", "--icon-border": "rgba(16, 185, 129, 0.2)", "--icon-color": "#34d399" }}>
            ✅
          </div>
        </div>

        <div className="premium-stat-card" style={{ "--glow-color": "rgba(239, 68, 68, 0.15)" }}>
          <div className="stat-card-info">
            <span className="stat-card-title">مرفوضة</span>
            <span className="stat-card-value">{walletRequests.filter((r) => r.status === "rejected").length}</span>
          </div>
          <div className="stat-card-icon-wrapper" style={{ "--icon-bg": "rgba(239, 68, 68, 0.1)", "--icon-border": "rgba(239, 68, 68, 0.2)", "--icon-color": "#f87171" }}>
            ❌
          </div>
        </div>
      </div>

      <div className="table-filter-bar">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input-premium"
            placeholder="ابحث بالاسم، المبلغ، الملاحظة..."
            value={walletSearch}
            onChange={(e) => setWalletSearch(e.target.value)}
          />
          <span className="search-input-icon">🔍</span>
        </div>

        <div className="status-tabs-wrapper">
          <button className={`status-tab-btn ${walletFilter === "all" ? "active" : ""}`} onClick={() => setWalletFilter("all")}>الكل</button>
          <button className={`status-tab-btn ${walletFilter === "pending" ? "active" : ""}`} onClick={() => setWalletFilter("pending")}>قيد الانتظار</button>
          <button className={`status-tab-btn ${walletFilter === "approved" ? "active" : ""}`} onClick={() => setWalletFilter("approved")}>مقبولة</button>
          <button className={`status-tab-btn ${walletFilter === "rejected" ? "active" : ""}`} onClick={() => setWalletFilter("rejected")}>مرفوضة</button>
        </div>
      </div>

      <div className="premium-table-wrapper">
        <table className="premium-table">
          <thead>
            <tr>
              <th>رقم الطلب</th>
              <th>العميل</th>
              <th>المبلغ</th>
              <th>رقم التحويل</th>
              <th>ملاحظات</th>
              <th>تاريخ الطلب</th>
              <th>الحالة</th>
              <th style={{ textAlign: "center" }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredWalletRequests.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  لا توجد طلبات شحن رصيد تطابق معايير البحث.
                </td>
              </tr>
            ) : (
              filteredWalletRequests.map((request) => (
                <tr key={request.id}>
                  <td data-label="رقم الطلب" style={{ fontWeight: 800, color: "#38bdf8" }}>#{request.id}</td>
                  <td data-label="العميل">
                    <div style={{ fontWeight: 700 }}>{request.customer_username}</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>ID: {request.customer_id}</div>
                  </td>
                  <td data-label="المبلغ" style={{ fontWeight: 800, color: "#34d399" }}>
                    $ {Number(request.amount).toFixed(2)} USD
                    {request.currency && request.currency !== "USD" && (
                      <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "2px" }}>
                        الدفع: {request.currency}
                      </div>
                    )}
                  </td>
                  <td data-label="رقم التحويل" style={{ direction: "ltr" }}>{request.sender_phone || "-"}</td>
                  <td data-label="ملاحظات" style={{ maxWidth: "220px", color: "#cbd5e1" }}>{request.notes ? request.notes.replace(/^\[تم تحويل:[^\]]+\]\s*/, "") : "-"}</td>
                  <td data-label="تاريخ الطلب" style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                    {new Date(request.created_at).toLocaleString("ar-EG")}
                  </td>
                  <td data-label="الحالة">
                    <span className={`premium-badge premium-badge-${request.status}`}>
                      <span className="badge-dot" />
                      {request.status === "pending" && "انتظار"}
                      {request.status === "approved" && "مقبول"}
                      {request.status === "rejected" && "مرفوض"}
                    </span>
                  </td>
                  <td data-label="الإجراءات" style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                    {request.status === "pending" ? (
                      <>
                        <button onClick={() => updateWalletRequestStatus(request.id, "approved")} className="action-btn btn-success-premium">
                          <span>اعتماد</span>
                        </button>
                        <button onClick={() => updateWalletRequestStatus(request.id, "rejected")} className="action-btn btn-danger-premium">
                          <span>رفض</span>
                        </button>
                      </>
                    ) : (
                      <span style={{ color: "#475569", fontSize: "0.85rem", fontWeight: 600 }}>
                        {request.processed_at ? new Date(request.processed_at).toLocaleString("ar-EG") : "منتهي"}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
