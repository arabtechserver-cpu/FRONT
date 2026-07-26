import React from "react";

export default function ExcelPricesTab({
  excelSettingsSuccessMsg,
  excelSettingsErrorMsg,
  handleUpdateExcelSettings,
  excelAppleUsdRate,
  setExcelAppleUsdRate,
  excelAppleMarkup,
  setExcelAppleMarkup,
  excelFrpUsdRate,
  setExcelFrpUsdRate,
  excelFrpMarkup,
  setExcelFrpMarkup,
  excelUploadLoading,
  handleUploadExcelFile,
  excelAppleUploadMsg,
  excelFrpUploadMsg
}) {
  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "30px", width: "100%" }}>
      
      {/* Exchange Rates & Markup Config */}
      <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "20px", padding: "30px", backdropFilter: "blur(25px)" }}>
        <h3 style={{ fontWeight: 800, fontSize: "1.25rem", marginBottom: "20px", color: "#a855f7", display: "flex", alignItems: "center", gap: "8px" }}>
          ⚙️ إعدادات أسعار الصرف ونسب الأرباح للقسمين
        </h3>
        
        {excelSettingsSuccessMsg && (
          <div style={{ background: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(34, 197, 94, 0.2)", color: "#4ade80", padding: "12px 18px", borderRadius: "12px", marginBottom: "20px", fontSize: "0.9rem" }}>
            {excelSettingsSuccessMsg}
          </div>
        )}
        {excelSettingsErrorMsg && (
          <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#f87171", padding: "12px 18px", borderRadius: "12px", marginBottom: "20px", fontSize: "0.9rem" }}>
            {excelSettingsErrorMsg}
          </div>
        )}

        <form onSubmit={handleUpdateExcelSettings} style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Apple Card */}
            <div style={{ background: "rgba(168, 85, 247, 0.03)", border: "1px solid rgba(168, 85, 247, 0.15)", borderRadius: "16px", padding: "20px" }}>
              <h4 style={{ color: "#a855f7", fontWeight: 800, marginBottom: "15px", display: "flex", alignItems: "center", gap: "6px" }}>
                🍎 قسم خدمات APPLE
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "#cbd5e1" }}>سعر صرف الدولار (ج.م):</label>
                  <input
                    type="number"
                    step="any"
                    value={excelAppleUsdRate}
                    onChange={(e) => setExcelAppleUsdRate(parseFloat(e.target.value) || 0)}
                    className="search-input-premium"
                    style={{ padding: "10px 14px !important" }}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "#cbd5e1" }}>نسبة الربح المضافة (%):</label>
                  <input
                    type="number"
                    step="any"
                    value={excelAppleMarkup}
                    onChange={(e) => setExcelAppleMarkup(parseFloat(e.target.value) || 0)}
                    className="search-input-premium"
                    style={{ padding: "10px 14px !important" }}
                    required
                  />
                </div>
              </div>
            </div>

            {/* FRP Card */}
            <div style={{ background: "rgba(16, 185, 129, 0.03)", border: "1px solid rgba(16, 185, 129, 0.15)", borderRadius: "16px", padding: "20px" }}>
              <h4 style={{ color: "#10b981", fontWeight: 800, marginBottom: "15px", display: "flex", alignItems: "center", gap: "6px" }}>
                🤖 قسم خدمات سيرفر FRP
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "#cbd5e1" }}>سعر صرف الدولار (ج.م):</label>
                  <input
                    type="number"
                    step="any"
                    value={excelFrpUsdRate}
                    onChange={(e) => setExcelFrpUsdRate(parseFloat(e.target.value) || 0)}
                    className="search-input-premium"
                    style={{ padding: "10px 14px !important" }}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "#cbd5e1" }}>نسبة الربح المضافة (%):</label>
                  <input
                    type="number"
                    step="any"
                    value={excelFrpMarkup}
                    onChange={(e) => setExcelFrpMarkup(parseFloat(e.target.value) || 0)}
                    className="search-input-premium"
                    style={{ padding: "10px 14px !important" }}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn-add-premium"
            style={{ padding: "14px 28px", background: "linear-gradient(135deg, #a855f7, #7c3aed)", border: "none", color: "#ffffff", fontWeight: 800, borderRadius: "12px", cursor: "pointer", width: "100%" }}
          >
            💾 حفظ الإعدادات وإعادة حساب الأسعار في الموقع
          </button>
        </form>
      </div>

      {/* Import Excel Sheets Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
        
        {/* Upload Apple Sheet */}
        <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "20px", padding: "30px", backdropFilter: "blur(25px)", display: "flex", flexDirection: "column", gap: "20px" }}>
          <h3 style={{ fontWeight: 800, fontSize: "1.1rem", color: "#a855f7", margin: 0 }}>
            📥 استيراد وتحديث خدمات APPLE
          </h3>
          <p style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: "1.6", margin: 0 }}>
            قم برفع ملف الإكسل الخاص بمنتجات آبل لتحديث قائمة الخدمات والباقات فوراً. سيتم مسح الخدمات القديمة في القسم واستبدالها بالجديدة.
          </p>
          
          <div style={{ border: "2px dashed rgba(168, 85, 247, 0.3)", borderRadius: "14px", padding: "30px 20px", textAlign: "center", position: "relative", background: "rgba(168, 85, 247, 0.01)" }}>
            <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "10px" }}>🍏</span>
            <label style={{ cursor: "pointer", background: "rgba(168, 85, 247, 0.15)", border: "1px solid rgba(168, 85, 247, 0.3)", padding: "10px 20px", borderRadius: "10px", color: "#c084fc", fontWeight: "bold", fontSize: "0.88rem", display: "inline-block" }}>
              اختر ملف iphone.xlsx
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={(e) => handleUploadExcelFile(e, 'apple')}
                style={{ display: "none" }}
                disabled={excelUploadLoading}
              />
            </label>
          </div>
          {excelAppleUploadMsg && (
            <div style={{ fontSize: "0.85rem", color: "#cbd5e1", background: "rgba(255,255,255,0.03)", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
              {excelAppleUploadMsg}
            </div>
          )}
        </div>

        {/* Upload FRP Sheet */}
        <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "20px", padding: "30px", backdropFilter: "blur(25px)", display: "flex", flexDirection: "column", gap: "20px" }}>
          <h3 style={{ fontWeight: 800, fontSize: "1.1rem", color: "#10b981", margin: 0 }}>
            📥 استيراد وتحديث خدمات سيرفر FRP
          </h3>
          <p style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: "1.6", margin: 0 }}>
            قم برفع ملف الإكسل الخاص بمنتجات الأندرويد/FRP لتحديث قائمة الخدمات والباقات فوراً. سيتم مسح الخدمات القديمة في القسم واستبدالها بالجديدة.
          </p>
          
          <div style={{ border: "2px dashed rgba(16, 185, 129, 0.3)", borderRadius: "14px", padding: "30px 20px", textAlign: "center", position: "relative", background: "rgba(16, 185, 129, 0.01)" }}>
            <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "10px" }}>🤖</span>
            <label style={{ cursor: "pointer", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "10px 20px", borderRadius: "10px", color: "#34d399", fontWeight: "bold", fontSize: "0.88rem", display: "inline-block" }}>
              اختر ملف android.xlsx
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={(e) => handleUploadExcelFile(e, 'frp')}
                style={{ display: "none" }}
                disabled={excelUploadLoading}
              />
            </label>
          </div>
          {excelFrpUploadMsg && (
            <div style={{ fontSize: "0.85rem", color: "#cbd5e1", background: "rgba(255,255,255,0.03)", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
              {excelFrpUploadMsg}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
