import React, { useState, useEffect } from "react";

export default function CustomersTab({
  customers,
  customerSearch,
  setCustomerSearch,
  filteredCustomers,
  baseCurrency,
  walletTransactions,
  selectedCustomerId,
  setSelectedCustomerId,
  selectedCustomerTransactions,
  handleOpenEditCustomer,
  handleDeleteCustomer
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [txPage, setTxPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [customerSearch]);

  useEffect(() => {
    setTxPage(1);
  }, [selectedCustomerId]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const txItemsPerPage = 15;
  const totalTxPages = Math.ceil(selectedCustomerTransactions.length / txItemsPerPage) || 1;
  const paginatedTx = selectedCustomerTransactions.slice((txPage - 1) * txItemsPerPage, txPage * txItemsPerPage);

  return (
    <>
      <div className="premium-stats-grid">
        <div className="premium-stat-card" style={{ "--glow-color": "rgba(59, 130, 246, 0.15)" }}>
          <div className="stat-card-info">
            <span className="stat-card-title">عدد العملاء</span>
            <span className="stat-card-value">{customers.length}</span>
          </div>
          <div className="stat-card-icon-wrapper" style={{ "--icon-bg": "rgba(59, 130, 246, 0.1)", "--icon-border": "rgba(59, 130, 246, 0.2)", "--icon-color": "#60a5fa" }}>
            👥
          </div>
        </div>

        <div className="premium-stat-card" style={{ "--glow-color": "rgba(16, 185, 129, 0.15)" }}>
          <div className="stat-card-info">
            <span className="stat-card-title">إجمالي أرصدة العملاء</span>
            <span className="stat-card-value" style={{ fontSize: "1.1rem", display: "block", direction: "rtl", whiteSpace: "normal", marginTop: "4px" }}>
              {(() => {
                const egpSum = customers.reduce((sum, c) => sum + Number(c.balance || 0), 0);
                const result = [`${egpSum.toFixed(2)} ${baseCurrency}`];
                const currencySums = {};
                customers.forEach((c) => {
                  let customerBalances = {};
                  if (c.balances) {
                    customerBalances = typeof c.balances === "string" ? JSON.parse(c.balances) : c.balances;
                  }
                  if (customerBalances && typeof customerBalances === "object") {
                    Object.entries(customerBalances).forEach(([curr, val]) => {
                      currencySums[curr] = (currencySums[curr] || 0) + Number(val || 0);
                    });
                  }
                });
                Object.entries(currencySums).forEach(([curr, val]) => {
                  result.push(`${val.toFixed(2)} ${curr}`);
                });
                return result.join(" | ");
              })()}
            </span>
          </div>
          <div className="stat-card-icon-wrapper" style={{ "--icon-bg": "rgba(16, 185, 129, 0.1)", "--icon-border": "rgba(16, 185, 129, 0.2)", "--icon-color": "#34d399" }}>
            💰
          </div>
        </div>

        <div className="premium-stat-card" style={{ "--glow-color": "rgba(139, 92, 246, 0.15)" }}>
          <div className="stat-card-info">
            <span className="stat-card-title">المعاملات المسجلة</span>
            <span className="stat-card-value">{walletTransactions.length}</span>
          </div>
          <div className="stat-card-icon-wrapper" style={{ "--icon-bg": "rgba(139, 92, 246, 0.1)", "--icon-border": "rgba(139, 92, 246, 0.2)", "--icon-color": "#c084fc" }}>
            🧾
          </div>
        </div>
      </div>

      <div className="table-filter-bar">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input-premium"
            placeholder="ابحث بالاسم أو الهاتف أو الرصيد..."
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
          />
          <span className="search-input-icon">🔍</span>
        </div>
      </div>

      <div className="premium-table-wrapper">
        <table className="premium-table">
          <thead>
            <tr>
              <th>رقم العميل</th>
              <th>اسم المستخدم</th>
              <th>البريد الإلكتروني</th>
              <th>الهاتف</th>
              <th>كلمة المرور</th>
              <th>الرصيد</th>
              <th>الحالة</th>
              <th style={{ textAlign: "center" }}>الاختيار</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  لا يوجد عملاء يطابقون البحث.
                </td>
              </tr>
            ) : (
              paginatedCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td data-label="رقم العميل" style={{ fontWeight: 800, color: "#38bdf8" }}>#{customer.id}</td>
                  <td data-label="اسم المستخدم" style={{ fontWeight: 700 }}>{customer.username}</td>
                  <td data-label="البريد الإلكتروني" style={{ fontWeight: 700 }}>{customer.email || "-"}</td>
                  <td data-label="الهاتف" style={{ direction: "ltr", fontWeight: 700 }}>{customer.phone || "-"}</td>
                  <td data-label="كلمة المرور" style={{ color: "#94a3b8", fontWeight: 700 }}>{customer.password_masked || "مخفية"}</td>
                  <td data-label="الرصيد" style={{ fontWeight: 800, color: "#34d399" }}>{Number(customer.balance || 0).toFixed(2)} {baseCurrency}</td>
                  <td data-label="الحالة">
                    <span className={`premium-badge ${Number(customer.balance || 0) > 0 ? "premium-badge-approved" : "premium-badge-pending"}`}>
                      {Number(customer.balance || 0) > 0 ? "يوجد رصيد" : "صفر"}
                    </span>
                  </td>
                  <td data-label="الاختيار" style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                      <button type="button" className="action-btn btn-success-premium" onClick={() => setSelectedCustomerId(customer.id)}>
                        عرض السجل
                      </button>
                      <button
                        type="button"
                        className="action-btn"
                        style={{ background: "rgba(59, 130, 246, 0.12)", color: "#93c5fd", border: "1px solid rgba(59, 130, 246, 0.22)" }}
                        onClick={() => handleOpenEditCustomer(customer)}
                      >
                        تعديل
                      </button>
                      <button type="button" className="action-btn btn-danger-premium" onClick={() => handleDeleteCustomer(customer.id)}>
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Customers Pagination Controls */}
      {filteredCustomers.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px", background: "rgba(255, 255, 255, 0.03)", padding: "16px 20px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.05)", marginTop: "16px" }}>
          <div style={{ color: "#94a3b8", fontSize: "0.9rem", fontWeight: 600 }}>
            عرض من <span style={{ color: "#38bdf8", fontWeight: 800 }}>{(currentPage - 1) * itemsPerPage + 1}</span> إلى <span style={{ color: "#38bdf8", fontWeight: 800 }}>{Math.min(currentPage * itemsPerPage, filteredCustomers.length)}</span> من إجمالي <span style={{ color: "#fbbf24", fontWeight: 800 }}>{filteredCustomers.length}</span> عميل
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.85rem", color: "#64748b" }}>العملاء بالصفحة:</span>
              <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} style={{ background: "rgba(0, 0, 0, 0.4)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", color: "#fff", padding: "6px 10px", fontSize: "0.85rem", cursor: "pointer", outline: "none" }}>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} type="button" style={{ padding: "8px 16px", background: currentPage === 1 ? "rgba(255, 255, 255, 0.02)" : "rgba(59, 130, 246, 0.2)", border: `1px solid ${currentPage === 1 ? "rgba(255, 255, 255, 0.05)" : "rgba(59, 130, 246, 0.4)"}`, borderRadius: "10px", color: currentPage === 1 ? "#64748b" : "#3b82f6", fontWeight: "bold", fontSize: "0.85rem", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}>◀ السابق</button>
              <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#cbd5e1", padding: "0 6px" }}>صفحة <span style={{ color: "#38bdf8" }}>{currentPage}</span> من <span style={{ color: "#38bdf8" }}>{totalPages}</span></span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} type="button" style={{ padding: "8px 16px", background: currentPage === totalPages ? "rgba(255, 255, 255, 0.02)" : "rgba(59, 130, 246, 0.2)", border: `1px solid ${currentPage === totalPages ? "rgba(255, 255, 255, 0.05)" : "rgba(59, 130, 246, 0.4)"}`, borderRadius: "10px", color: currentPage === totalPages ? "#64748b" : "#3b82f6", fontWeight: "bold", fontSize: "0.85rem", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}>التالي ▶</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: "28px", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "18px", padding: "18px", background: "rgba(255,255,255,0.02)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", gap: "12px", flexWrap: "wrap" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800 }}>سجل معاملات العميل</h3>
            <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>
              {selectedCustomerId ? "يعرض التحويلات والخصومات الخاصة بالعميل المختار." : "اختر عميلًا لعرض سجله."}
            </p>
          </div>
        </div>

        <div className="premium-table-wrapper" style={{ marginBottom: 0 }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>النوع</th>
                <th>المبلغ</th>
                <th>الرصيد قبل</th>
                <th>الرصيد بعد</th>
                <th>المرجع</th>
                <th>الوصف</th>
                <th>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {selectedCustomerTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "36px", color: "#64748b" }}>
                    لا توجد معاملات لهذا العميل بعد.
                  </td>
                </tr>
              ) : (
                paginatedTx.map((tx) => (
                  <tr key={tx.id}>
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
                      {tx.reference_type === "order_refund" && `استرداد #${tx.reference_id}`}
                      {tx.reference_type === "wallet_request" && `شحن #${tx.reference_id}`}
                      {!tx.reference_type && "-"}
                    </td>
                    <td data-label="الوصف" style={{ color: "#e2e8f0" }}>{tx.description || "-"}</td>
                    <td data-label="التاريخ" style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                      {tx.created_at ? new Date(tx.created_at).toLocaleString("ar-EG") : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Transactions Pagination */}
        {selectedCustomerTransactions.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginTop: "16px", padding: "12px", background: "rgba(0,0,0,0.2)", borderRadius: "12px" }}>
            <button onClick={() => setTxPage(p => Math.max(1, p - 1))} disabled={txPage === 1} type="button" style={{ padding: "6px 12px", background: txPage === 1 ? "rgba(255, 255, 255, 0.05)" : "rgba(139, 92, 246, 0.2)", borderRadius: "8px", color: txPage === 1 ? "#64748b" : "#c084fc", border: "none", cursor: txPage === 1 ? "not-allowed" : "pointer" }}>السابق</button>
            <span style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>صفحة {txPage} / {totalTxPages}</span>
            <button onClick={() => setTxPage(p => Math.min(totalTxPages, p + 1))} disabled={txPage === totalTxPages} type="button" style={{ padding: "6px 12px", background: txPage === totalTxPages ? "rgba(255, 255, 255, 0.05)" : "rgba(139, 92, 246, 0.2)", borderRadius: "8px", color: txPage === totalTxPages ? "#64748b" : "#c084fc", border: "none", cursor: txPage === totalTxPages ? "not-allowed" : "pointer" }}>التالي</button>
          </div>
        )}
      </div>
    </>
  );
}
