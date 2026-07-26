import React from "react";

export default function AmrrUnlockerTab({
  unlockerBalanceEmail,
  unlockerBalance,
  unlockerBalanceLoading,
  fetchUnlockerBalance,
  unlockerExchangeRate,
  setUnlockerExchangeRate,
  unlockerMarkupPercent,
  setUnlockerMarkupPercent,
  unlockerImportTargetCat,
  setUnlockerImportTargetCat,
  categories,
  unlockerNewCatName,
  setUnlockerNewCatName,
  unlockerGroupAsPackages,
  setUnlockerGroupAsPackages,
  fetchUnlockerServices,
  unlockerLoading,
  importSelectedUnlockerServices,
  selectedUnlockerServices,
  setSelectedUnlockerServices,
  unlockerSyncMsg,
  unlockerServices,
  unlockerSearch,
  setUnlockerSearch,
  unlockerPage,
  setUnlockerPage,
  unlockerCategoryFilter,
  setUnlockerCategoryFilter,
  unlockerPageSize,
  setUnlockerPageSize,
  unlockerSortOrder,
  setUnlockerSortOrder,
  filteredUnlockerServices,
  paginatedUnlockerServices,
  importedUnlockerServiceIds,
  unlockerCurrency,
  unlockerCustomPrices,
  setUnlockerCustomPrices,
  unlockerCustomDiscounts,
  setUnlockerCustomDiscounts,
  totalUnlockerPages,
  unlockerCategories,
  apiAutoSubmit,
  handleToggleAutoSubmit,
  handleWipeAndSyncAll
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* 1. API Connection Status (Hardcoded & Secure) */}
      <div className="premium-card-solid" style={{ padding: "20px" }}>
        <h3 style={{ margin: "0 0 12px", fontSize: "1.1rem", fontWeight: 800, color: "#38bdf8", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>🔓</span> بوابة Amrr Unlocker متصلة بنجاح
        </h3>
        <p style={{ color: "#94a3b8", fontSize: "0.88rem", margin: 0, lineHeight: "1.6" }}>
          تم ربط وتهيئة اتصال لوحة التحكم ببوابة الخدمات الخارجية تلقائياً بشكل آمن وجاهز للتشغيل.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", marginTop: "12px", fontSize: "0.85rem", color: "#cbd5e1", background: "rgba(255,255,255,0.02)", padding: "12px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}>
          <div><strong>اسم المستخدم:</strong> <span style={{ color: "#38bdf8" }}>Hassen1990</span></div>
          {unlockerBalanceEmail && (
            <div><strong>بريد الحساب:</strong> <span style={{ color: "#e2e8f0" }}>{unlockerBalanceEmail}</span></div>
          )}
          <div><strong>حالة الاتصال:</strong> <span style={{ color: "#34d399", fontWeight: "bold" }}>● متصل بالخدمة</span></div>
          
          <div style={{ marginRight: "auto", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>رصيدك لدى المزود:</span>
            <span style={{ fontSize: "1.15rem", fontWeight: "900", color: "#fbbf24", background: "rgba(251, 191, 36, 0.1)", padding: "4px 12px", borderRadius: "6px", border: "1px solid rgba(251, 191, 36, 0.2)", display: "inline-flex", direction: "ltr" }}>
              {unlockerBalanceLoading ? "جاري التحميل..." : (unlockerBalance || "غير متوفر")}
            </span>
            <button 
              onClick={fetchUnlockerBalance} 
              disabled={unlockerBalanceLoading}
              style={{ background: "rgba(56, 189, 248, 0.12)", border: "1px solid rgba(56, 189, 248, 0.3)", color: "#38bdf8", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "0.78rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px", transition: "all 0.2s" }}
              title="تحديث الرصيد"
            >
              {unlockerBalanceLoading ? "انتظر..." : "🔄 تحديث"}
            </button>
          </div>
        </div>

        {/* Auto-Submit Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "16px", padding: "14px 18px", background: apiAutoSubmit ? "rgba(34, 197, 94, 0.06)" : "rgba(239, 68, 68, 0.06)", borderRadius: "10px", border: `1px solid ${apiAutoSubmit ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)"}`, transition: "all 0.3s ease" }}>
          <div 
            onClick={() => handleToggleAutoSubmit(!apiAutoSubmit)}
            style={{ 
              width: "48px", height: "26px", borderRadius: "13px", cursor: "pointer", position: "relative", transition: "all 0.3s ease",
              background: apiAutoSubmit ? "rgba(34, 197, 94, 0.6)" : "rgba(100, 116, 139, 0.4)",
              border: `1px solid ${apiAutoSubmit ? "rgba(34, 197, 94, 0.5)" : "rgba(100, 116, 139, 0.3)"}`,
              flexShrink: 0
            }}
          >
            <div style={{ 
              width: "20px", height: "20px", borderRadius: "50%", background: "#fff", position: "absolute", top: "2px",
              transition: "all 0.3s ease", boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
              ...(apiAutoSubmit ? { right: "2px" } : { left: "2px" })
            }} />
          </div>
          <div>
            <div style={{ fontSize: "0.9rem", fontWeight: 800, color: apiAutoSubmit ? "#4ade80" : "#f87171" }}>
              {apiAutoSubmit ? "⚡ الإرسال التلقائي مُفعّل" : "🔒 وضع المراجعة اليدوية"}
            </div>
            <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "2px" }}>
              {apiAutoSubmit 
                ? "الطلبات المدفوعة من المحفظة تُرسل فوراً للمزود بدون مراجعة." 
                : "الطلبات تبقى \"قيد الانتظار\" حتى يعتمدها المسؤول يدوياً من لوحة التحكم."}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Services Sync Controls */}
      <div className="premium-card-solid" style={{ padding: "20px" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: "1.1rem", fontWeight: 800, color: "#a855f7", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>🔄</span> مزامنة واستيراد الخدمات
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "20px" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "6px", display: "block" }}>سعر صرف الدولار (EGP / USD):</label>
            <input 
              type="number" 
              value={unlockerExchangeRate} 
              onChange={(e) => setUnlockerExchangeRate(e.target.value)} 
              className="search-input-premium" 
              style={{ padding: "10px 14px", width: "100%" }}
              min="1"
              step="0.1"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "6px", display: "block" }}>هامش الربح (%):</label>
            <input 
              type="number" 
              value={unlockerMarkupPercent} 
              onChange={(e) => setUnlockerMarkupPercent(e.target.value)} 
              className="search-input-premium" 
              style={{ padding: "10px 14px", width: "100%" }}
              min="0"
              step="0.5"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "6px", display: "block" }}>📥 استيراد إلى القسم المحلي:</label>
            <select 
              value={unlockerImportTargetCat} 
              onChange={(e) => setUnlockerImportTargetCat(e.target.value)} 
              className="search-input-premium" 
              style={{ padding: "10px 14px", width: "100%", height: "42px", background: "rgba(15,23,42,0.8)" }}
            >
              <option value="auto">📂 نفس اسم القسم في المزود (تلقائي)</option>
              <option value="new">🆕 إنشاء قسم جديد باسم مخصص...</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>📁 {c.name}</option>
              ))}
            </select>
          </div>

          {unlockerImportTargetCat === "new" && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ color: "#38bdf8", fontSize: "0.85rem", marginBottom: "6px", display: "block" }}>✨ اسم القسم الجديد:</label>
              <input 
                type="text" 
                placeholder="أدخل اسم القسم الجديد" 
                value={unlockerNewCatName} 
                onChange={(e) => setUnlockerNewCatName(e.target.value)} 
                className="search-input-premium" 
                style={{ padding: "10px 14px", width: "100%" }}
              />
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "14px 0 20px 0", padding: "10px 14px", background: "rgba(139, 92, 246, 0.05)", borderRadius: "10px", border: "1px solid rgba(139, 92, 246, 0.15)" }}>
          <input 
            type="checkbox" 
            id="group_as_packages" 
            checked={unlockerGroupAsPackages} 
            onChange={(e) => setUnlockerGroupAsPackages(e.target.checked)}
            style={{ width: "18px", height: "18px", cursor: "pointer" }}
          />
          <label htmlFor="group_as_packages" style={{ fontSize: "0.85rem", color: "#e9d5ff", cursor: "pointer", fontWeight: "bold", userSelect: "none" }}>
            📦 دمج الخدمات المحددة في منتج واحد يحتوي على باقات (موصى به للألعاب كـ PUBG وشحن الرصيد)
          </label>
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginBottom: "20px", flexWrap: "wrap" }}>
          <button 
            onClick={handleWipeAndSyncAll} 
            className="action-btn"
            style={{ 
              padding: "10px 24px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: "8px", 
              fontWeight: "bold",
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              marginLeft: "auto"
            }}
            disabled={unlockerLoading}
            title="تحذير: سيقوم بمسح كافة الأقسام والخدمات المحلية ومزامنتها من جديد بالكامل من الـ API"
          >
            🔥 مسح الكل والمزامنة الشاملة
          </button>
          <button 
            onClick={fetchUnlockerServices} 
            className="action-btn btn-edit-premium"
            style={{ padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: "bold" }}
            disabled={unlockerLoading}
          >
            🔍 {unlockerLoading ? "جاري الاتصال..." : "جلب الخدمات"}
          </button>
          <button 
            onClick={importSelectedUnlockerServices} 
            className="action-btn btn-success-premium"
            style={{ padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: "bold" }}
            disabled={unlockerLoading || selectedUnlockerServices.length === 0}
          >
            📥 استيراد المحددة ({selectedUnlockerServices.length})
          </button>
        </div>

        <div style={{ fontSize: "0.88rem", padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", marginBottom: "16px", color: "#cbd5e1" }}>
          {unlockerSyncMsg || "اضغط على زر (جلب الخدمات) لعرض الخدمات المتاحة وتحديد المطلوب استيرادها للموقع."}
        </div>

        {unlockerServices.length > 0 && (
          <>
            {/* Search & Filter Bar for remote services */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "16px", background: "rgba(15, 23, 42, 0.4)", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "6px" }}>🔍 بحث بالاسم أو ID:</label>
                <input 
                  type="text" 
                  placeholder="ابحث عن خدمة أو قسم أو رقم ID..." 
                  value={unlockerSearch} 
                  onChange={(e) => { setUnlockerSearch(e.target.value); setUnlockerPage(1); }} 
                  className="search-input-premium" 
                  style={{ padding: "10px 14px", fontSize: "0.88rem", width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "6px" }}>📂 تصفية حسب القسم:</label>
                <select 
                  value={unlockerCategoryFilter} 
                  onChange={(e) => { setUnlockerCategoryFilter(e.target.value); setUnlockerPage(1); }} 
                  className="search-input-premium" 
                  style={{ padding: "10px 14px", fontSize: "0.88rem", width: "100%" }}
                >
                  <option value="ALL">🌐 جميع الأقسام ({unlockerServices.length})</option>
                  {unlockerCategories.filter(c => c !== "ALL").map(cat => {
                    const count = unlockerServices.filter(s => s.category === cat).length;
                    return <option key={cat} value={cat}>{cat} ({count})</option>;
                  })}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "6px" }}>📊 عدد النتائج بالصفحة:</label>
                <select 
                  value={unlockerPageSize} 
                  onChange={(e) => { setUnlockerPageSize(Number(e.target.value)); setUnlockerPage(1); }} 
                  className="search-input-premium" 
                  style={{ padding: "10px 14px", fontSize: "0.88rem", width: "100%" }}
                >
                  <option value={25}>25 خدمة في الصفحة</option>
                  <option value={50}>50 خدمة في الصفحة</option>
                  <option value={100}>100 خدمة في الصفحة</option>
                  <option value={250}>250 خدمة في الصفحة</option>
                  <option value={500}>500 خدمة في الصفحة</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "6px" }}>🔀 ترتيب عرض الخدمات:</label>
                <select 
                  value={unlockerSortOrder} 
                  onChange={(e) => setUnlockerSortOrder(e.target.value)} 
                  className="search-input-premium" 
                  style={{ padding: "10px 14px", fontSize: "0.88rem", width: "100%" }}
                >
                  <option value="original">📋 نفس ترتيب سيرفر المزود (الأصلي)</option>
                  <option value="alphabetical">🔤 الترتيب الأبجدي بالحروف (أ-ي)</option>
                </select>
              </div>
            </div>

            {/* Selection Summary */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", background: "rgba(56, 189, 248, 0.08)", padding: "10px 16px", borderRadius: "8px", border: "1px solid rgba(56, 189, 248, 0.2)", fontSize: "0.88rem", flexWrap: "wrap", gap: "8px" }}>
              <div>
                <span style={{ color: "#38bdf8", fontWeight: "bold" }}>تم العثور على: </span>
                <span style={{ color: "#fff", fontWeight: "bold" }}>{filteredUnlockerServices.length}</span> من أصل <span style={{ color: "#94a3b8" }}>{unlockerServices.length}</span> خدمة
              </div>
              <div>
                <span style={{ color: "#38bdf8", fontWeight: "bold" }}>المحدد للاستيراد: </span>
                <span style={{ color: "#4ade80", fontWeight: "bold", fontSize: "0.95rem" }}>{selectedUnlockerServices.length}</span> خدمة
                {selectedUnlockerServices.length > 0 && (
                  <button 
                    onClick={() => setSelectedUnlockerServices([])} 
                    style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer", fontSize: "0.82rem", marginRight: "10px", textDecoration: "underline" }}
                  >
                    إلغاء التحديد
                  </button>
                )}
              </div>
            </div>

            {/* Remote Services list table */}
            <div className="premium-table-wrapper" style={{ maxHeight: "500px", overflowY: "auto", marginBottom: "16px" }}>
              <table className="premium-table">
                <thead>
                  <tr>
                    <th style={{ width: "40px", textAlign: "center" }}>
                      <input 
                        type="checkbox" 
                        onChange={(e) => {
                          if (e.target.checked) {
                            const filteredIds = filteredUnlockerServices.map(s => s.id);
                            setSelectedUnlockerServices(prev => Array.from(new Set([...prev, ...filteredIds])));
                          } else {
                            const filteredIdsSet = new Set(filteredUnlockerServices.map(s => s.id));
                            setSelectedUnlockerServices(prev => prev.filter(id => !filteredIdsSet.has(id)));
                          }
                        }}
                        checked={filteredUnlockerServices.length > 0 && filteredUnlockerServices.every(s => selectedUnlockerServices.includes(s.id))}
                        title="تحديد الكل في القائمة المصفاة حالياً"
                      />
                    </th>
                    <th>ID الخدمة</th>
                    <th>اسم الخدمة</th>
                    <th>القسم (المجموعة)</th>
                    <th>سعر المزود ({unlockerCurrency})</th>
                    <th>سعر البيع المقترح</th>
                    <th>الخصم (%) (اختياري)</th>
                    <th>حالة الاستيراد</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUnlockerServices.length > 0 ? (
                    paginatedUnlockerServices.map((s) => {
                      const isSelected = selectedUnlockerServices.includes(s.id);
                      const isAlreadyImported = importedUnlockerServiceIds.has(String(s.id));
                      
                      const apiPriceUsd = parseFloat(s.price) || 0;
                      const isTargetCatUsd = (categories.find(c => c.id === Number(unlockerImportTargetCat))?.currency === 'USD');
                      
                      let multiplier = 1;
                       if (unlockerCurrency === 'USD' && !isTargetCatUsd) {
                         multiplier = parseFloat(unlockerExchangeRate) || 50;
                       } else if (unlockerCurrency === 'EGP' && isTargetCatUsd) {
                         multiplier = 1 / (parseFloat(unlockerExchangeRate) || 50);
                       }
                       const estPrice = apiPriceUsd * multiplier * (1 + (parseFloat(unlockerMarkupPercent) || 0) / 100);
                      
                      const pricePlaceholder = isTargetCatUsd
                        ? `$ ${estPrice.toFixed(2)}`
                        : `${Math.ceil(estPrice)} ج.م`;

                      return (
                        <tr key={s.id} style={{ background: isAlreadyImported ? "rgba(34,197,94,0.03)" : isSelected ? "rgba(56, 189, 248, 0.08)" : "" }}>
                          <td style={{ textAlign: "center" }}>
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => {
                                if (isSelected) {
                                  setSelectedUnlockerServices(prev => prev.filter(id => id !== s.id));
                                } else {
                                  setSelectedUnlockerServices(prev => [...prev, s.id]);
                                }
                              }}
                            />
                          </td>
                          <td data-label="ID الخدمة" style={{ fontWeight: "bold", color: "#64748b" }}>{s.id}</td>
                          <td data-label="اسم الخدمة" style={{ fontWeight: 700 }}>{s.name}</td>
                          <td data-label="القسم">{s.category}</td>
                          <td data-label={`سعر المزود (${unlockerCurrency})`} style={{ color: "#38bdf8", fontWeight: "bold" }}>
                             {unlockerCurrency === 'USD' ? '$' : ''}{apiPriceUsd.toFixed(2)}{unlockerCurrency !== 'USD' ? ' ' + unlockerCurrency : ''}
                           </td>
                          <td data-label="سعر البيع">
                            <input 
                              type="number" 
                              step="0.01"
                              placeholder={pricePlaceholder}
                              value={unlockerCustomPrices[s.id] || ""} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setUnlockerCustomPrices(prev => ({ ...prev, [s.id]: val }));
                                if (!isSelected) {
                                  setSelectedUnlockerServices(prev => [...prev, s.id]);
                                }
                              }}
                              style={{ width: "100px", padding: "6px 8px", fontSize: "0.8rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", textAlign: "center" }}
                            />
                          </td>
                          <td data-label="الخصم (%)">
                            <input 
                              type="number" 
                              placeholder="0"
                              min="0"
                              max="99"
                              value={unlockerCustomDiscounts[s.id] || ""} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setUnlockerCustomDiscounts(prev => ({ ...prev, [s.id]: val }));
                                if (!isSelected) {
                                  setSelectedUnlockerServices(prev => [...prev, s.id]);
                                }
                              }}
                              style={{ width: "70px", padding: "6px 8px", fontSize: "0.8rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", textAlign: "center" }}
                            />
                          </td>
                          <td data-label="حالة الاستيراد">
                            {isAlreadyImported ? (
                              <span style={{ color: "#4ade80", fontSize: "0.8rem", background: "rgba(34,197,94,0.12)", padding: "4px 8px", borderRadius: "6px", fontWeight: "bold" }}>
                                ✓ مستورد مسبقاً
                              </span>
                            ) : (
                              <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                                جاهز للاستيراد
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", padding: "24px", color: "#94a3b8" }}>
                        لا توجد خدمات مطابقة للبحث أو التصفية الحالية.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalUnlockerPages > 1 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(15, 23, 42, 0.6)", padding: "12px 18px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                  عرض من <span style={{ color: "#fff", fontWeight: "bold" }}>{(unlockerPage - 1) * unlockerPageSize + 1}</span> إلى <span style={{ color: "#fff", fontWeight: "bold" }}>{Math.min(unlockerPage * unlockerPageSize, filteredUnlockerServices.length)}</span> من إجمالي <span style={{ color: "#38bdf8", fontWeight: "bold" }}>{filteredUnlockerServices.length}</span> خدمة
                </div>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <button 
                    onClick={() => setUnlockerPage(1)} 
                    disabled={unlockerPage === 1}
                    className="btn-premium"
                    style={{ padding: "6px 12px", fontSize: "0.8rem", opacity: unlockerPage === 1 ? 0.4 : 1, cursor: unlockerPage === 1 ? "not-allowed" : "pointer" }}
                  >
                    « الأولى
                  </button>
                  <button 
                    onClick={() => setUnlockerPage(p => Math.max(1, p - 1))} 
                    disabled={unlockerPage === 1}
                    className="btn-premium"
                    style={{ padding: "6px 12px", fontSize: "0.8rem", opacity: unlockerPage === 1 ? 0.4 : 1, cursor: unlockerPage === 1 ? "not-allowed" : "pointer" }}
                  >
                    ‹ السابقة
                  </button>
                  <span style={{ padding: "4px 12px", background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", borderRadius: "6px", fontWeight: "bold", fontSize: "0.88rem" }}>
                    صفحة {unlockerPage} من {totalUnlockerPages}
                  </span>
                  <button 
                    onClick={() => setUnlockerPage(p => Math.min(totalUnlockerPages, p + 1))} 
                    disabled={unlockerPage === totalUnlockerPages}
                    className="btn-premium"
                    style={{ padding: "6px 12px", fontSize: "0.8rem", opacity: unlockerPage === totalUnlockerPages ? 0.4 : 1, cursor: unlockerPage === totalUnlockerPages ? "not-allowed" : "pointer" }}
                  >
                    التالية ›
                  </button>
                  <button 
                    onClick={() => setUnlockerPage(totalUnlockerPages)} 
                    disabled={unlockerPage === totalUnlockerPages}
                    className="btn-premium"
                    style={{ padding: "6px 12px", fontSize: "0.8rem", opacity: unlockerPage === totalUnlockerPages ? 0.4 : 1, cursor: unlockerPage === totalUnlockerPages ? "not-allowed" : "pointer" }}
                  >
                    الأخيرة »
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}
