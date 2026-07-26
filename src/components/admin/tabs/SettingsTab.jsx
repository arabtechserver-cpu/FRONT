import React, { useState } from "react";

const AccordionItem = ({ isActive, onToggle, title, icon, children, isDanger }) => {
  const baseColor = isDanger ? "#f87171" : "#38bdf8";
  const bgHover = isDanger ? "rgba(248, 113, 113, 0.1)" : "rgba(56, 189, 248, 0.1)";
  
  return (
    <div style={{
      background: "rgba(255, 255, 255, 0.02)",
      border: "1px solid rgba(255, 255, 255, 0.05)",
      borderRadius: "16px",
      overflow: "hidden",
      backdropFilter: "blur(25px)",
      marginBottom: "15px",
      transition: "all 0.3s ease"
    }}>
      <div 
        onClick={onToggle}
        style={{
          padding: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          background: isActive ? bgHover : "transparent",
          borderBottom: isActive ? `1px solid ${baseColor}33` : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: 800, fontSize: "1.1rem", color: isActive ? baseColor : "#cbd5e1" }}>
          <span>{icon}</span>
          <span>{title}</span>
        </div>
        <span style={{ transform: isActive ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s", color: isActive ? baseColor : "#94a3b8" }}>
          ▼
        </span>
      </div>
      
      {isActive && (
        <div style={{ padding: "25px", animation: "fadeIn 0.3s ease-in-out" }}>
          {children}
        </div>
      )}
    </div>
  );
};

export default function SettingsTab({
  siteName,
  setSiteName,
  baseCurrency,
  setBaseCurrency,
  globalMarkupPercent,
  setGlobalMarkupPercent,
  hideWalletPayment,
  setHideWalletPayment,
  logoUploadedFile,
  setLogoUploadedFile,
  siteLogo,
  setSiteLogo,
  faviconUploadedFile,
  setFaviconUploadedFile,
  siteFavicon,
  setSiteFavicon,
  paymentMethodsList,
  setPaymentMethodsList,
  globalCurrencies,
  setGlobalCurrencies,
  exchangeRates,
  setExchangeRates,
  addCurrencySelect,
  setAddCurrencySelect,
  addCurrencyCustomCode,
  setAddCurrencyCustomCode,
  addCurrencyRate,
  setAddCurrencyRate,
  whatsappNumbers,
  setWhatsappNumbers,
  newWhatsappNumber,
  setNewWhatsappNumber,
  homeStats,
  setHomeStats,
  emailUser,
  setEmailUser,
  emailPass,
  setEmailPass,
  announcementText,
  setAnnouncementText,
  errorMsg,
  handleUpdateSettings,
  handleUpdateCredentials,
  newAdminUsername,
  setNewAdminUsername,
  newAdminPassword,
  setNewAdminPassword,
  showAdminPassword,
  setShowAdminPassword,
  credentialsErrorMsg,
  credentialsSuccessMsg,
  token,
  API_BASE_URL
}) {
  const [activeAccordion, setActiveAccordion] = useState(0);

  const toggleAccordion = (idx) => {
    setActiveAccordion(activeAccordion === idx ? null : idx);
  };



  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      <form onSubmit={handleUpdateSettings} style={{ display: "flex", flexDirection: "column" }}>
        
        <AccordionItem isActive={activeAccordion === 0} onToggle={() => toggleAccordion(0)} title="إعدادات الموقع العامة" icon="⚙️">
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#cbd5e1" }}>اسم الموقع بالكامل:</label>
              <input
                type="text"
                className="search-input-premium"
                style={{ padding: "12px 16px !important" }}
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="مثال: عرب تك لخدمات الإلكترونية"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#cbd5e1" }}>العملة الأساسية للموقع (رمز العملة، مثال: ج.م, USD, EUR):</label>
              <input
                type="text"
                className="search-input-premium"
                style={{ padding: "12px 16px !important" }}
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value)}
                placeholder="مثال: ج.م أو USD أو EUR"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#cbd5e1" }}>📈 نسبة الزيادة العامة على جميع أسعار الخدمات (%):</label>
              <input
                type="number"
                className="search-input-premium"
                style={{ padding: "12px 16px !important" }}
                value={globalMarkupPercent}
                onChange={(e) => setGlobalMarkupPercent(parseFloat(e.target.value) || 0)}
                placeholder="مثال: 10 للزيادة بنسبة 10% (0 للتعطيل)"
                step="0.1"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#cbd5e1" }}>📢 نص شريط الإعلانات المتحرك (أعلى الموقع):</label>
              <input
                type="text"
                className="search-input-premium"
                style={{ padding: "12px 16px !important" }}
                value={announcementText || ""}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="مثال: 🟢 واتساب الإدارة: +1 (672) 897-2935"
              />
            </div>

            <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px", background: "rgba(16, 185, 129, 0.05)", padding: "12px", borderRadius: "10px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
              <input
                type="checkbox"
                id="hide-wallet-payment-checkbox"
                checked={hideWalletPayment}
                onChange={(e) => setHideWalletPayment(e.target.checked)}
                style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "#10b981" }}
              />
              <label htmlFor="hide-wallet-payment-checkbox" style={{ fontWeight: "bold", color: "#cbd5e1", cursor: "pointer", fontSize: "0.85rem", userSelect: "none" }}>
                💳 إخفاء طرق التحويل اليدوي عند شراء الخدمات (إجبار العملاء على الدفع من المحفظة الرقمية فقط)
              </label>
            </div>
          </div>
        </AccordionItem>

        <AccordionItem isActive={activeAccordion === 1} onToggle={() => toggleAccordion(1)} title="الشعارات والأيقونات" icon="🖼️">
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#cbd5e1" }}>شعار (لجو) الموقع:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setLogoUploadedFile(reader.result);
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
              {(logoUploadedFile || (siteLogo && siteLogo !== "default")) && (
                <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <img 
                    src={logoUploadedFile || (siteLogo.startsWith("/uploads") ? `${API_BASE_URL}${siteLogo}` : siteLogo)} 
                    alt="Logo Preview" 
                    style={{ width: "60px", height: "60px", objectFit: "contain", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.1)" }} 
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSiteLogo("default");
                      setLogoUploadedFile(null);
                    }}
                    className="action-btn btn-danger-premium"
                    style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                  >
                    إعادة الشعار الافتراضي
                  </button>
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#cbd5e1" }}>أيقونة التبويب (Favicon):</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setFaviconUploadedFile(reader.result);
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
              {(faviconUploadedFile || (siteFavicon && siteFavicon !== "default")) && (
                <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <img 
                    src={faviconUploadedFile || (siteFavicon.startsWith("/uploads") ? `${API_BASE_URL}${siteFavicon}` : siteFavicon)} 
                    alt="Favicon Preview" 
                    style={{ width: "32px", height: "32px", objectFit: "contain", borderRadius: "4px", border: "1px solid rgba(255, 255, 255, 0.1)" }} 
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSiteFavicon("default");
                      setFaviconUploadedFile(null);
                    }}
                    className="action-btn btn-danger-premium"
                    style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                  >
                    إعادة الأيقونة الافتراضية
                  </button>
                </div>
              )}
            </div>
          </div>
        </AccordionItem>

        <AccordionItem isActive={activeAccordion === 2} onToggle={() => toggleAccordion(2)} title="إحصائيات الصفحة الرئيسية" icon="📊">
          <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "15px" }}>قم بتعديل الأرقام التي تظهر في قسم الإحصائيات بالصفحة الرئيسية.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
            {Array.isArray(homeStats) && homeStats.map((stat, idx) => (
              <div key={idx} style={{ background: "rgba(0,0,0,0.2)", padding: "15px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <span style={{ fontSize: "1.5rem" }}>{stat.icon}</span>
                  <input 
                    type="text" 
                    value={stat.label} 
                    onChange={(e) => {
                      const newStats = [...homeStats];
                      newStats[idx].label = e.target.value;
                      setHomeStats(newStats);
                    }}
                    className="search-input-premium"
                    style={{ padding: "5px 10px", flex: 1, fontSize: "0.9rem" }}
                    placeholder="العنوان"
                  />
                </div>
                <input 
                  type="text" 
                  value={stat.value} 
                  onChange={(e) => {
                    const newStats = [...homeStats];
                    newStats[idx].value = e.target.value;
                    setHomeStats(newStats);
                  }}
                  className="search-input-premium"
                  style={{ padding: "8px 10px", width: "100%", textAlign: "center", fontWeight: "bold", color: "#38bdf8" }}
                  placeholder="الرقم (مثال: 10K+)"
                />
              </div>
            ))}
          </div>
        </AccordionItem>

        <AccordionItem isActive={activeAccordion === 3} onToggle={() => toggleAccordion(3)} title="إدارة طرق التحويل والتحصيل" icon="💳">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "14px" }}>
            <button
              type="button"
              onClick={() => {
                setPaymentMethodsList(prev => [
                  ...prev,
                  { id: `pay_${Date.now()}`, name: "", value: "", description: "" }
                ]);
              }}
              className="action-btn"
              style={{ background: "rgba(6, 182, 212, 0.2)", color: "#22d3ee", border: "1px solid rgba(6, 182, 212, 0.3)" }}
            >
              + إضافة طريقة دفع
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {paymentMethodsList.length === 0 ? (
              <div style={{ fontSize: "0.8rem", color: "#94a3b8", textAlign: "center", padding: "10px" }}>لا توجد طرق دفع مضافة حالياً.</div>
            ) : (
              paymentMethodsList.map((pm, idx) => (
                <div key={pm.id} style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "12px", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.82rem", color: "#22d3ee", fontWeight: 800 }}>طريقة الدفع #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethodsList(prev => prev.filter(item => item.id !== pm.id));
                      }}
                      style={{ background: "none", border: "none", color: "#f87171", fontSize: "0.82rem", cursor: "pointer", fontWeight: "bold" }}
                    >
                      حذف ×
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: "bold" }}>اسم الطريقة (مثلاً: إنستاباي):</span>
                      <input
                        type="text"
                        value={pm.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPaymentMethodsList(prev => prev.map(item => item.id === pm.id ? { ...item, name: val } : item));
                        }}
                        placeholder="مثال: محفظة فودافون كاش أو إنستاباي"
                        required
                        style={{ padding: "8px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(13, 18, 36, 0.7)", color: "#ffffff", fontSize: "0.85rem", outline: "none" }}
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: "bold" }}>الرقم أو العنوان للتحويل إليه:</span>
                      <input
                        type="text"
                        value={pm.value}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPaymentMethodsList(prev => prev.map(item => item.id === pm.id ? { ...item, value: val } : item));
                        }}
                        placeholder="مثال: 01026785879 أو example@instapay"
                        required
                        style={{ padding: "8px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(13, 18, 36, 0.7)", color: "#ffffff", fontSize: "0.85rem", outline: "none" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: "bold" }}>وصف / تعليمات التحويل للعميل:</span>
                      <textarea
                        value={pm.description}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPaymentMethodsList(prev => prev.map(item => item.id === pm.id ? { ...item, description: val } : item));
                        }}
                        placeholder="مثال: بعد التحويل اكتب الرقم المحول منه للتحقق..."
                        rows="2"
                        required
                        style={{ padding: "8px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(13, 18, 36, 0.7)", color: "#ffffff", fontSize: "0.85rem", outline: "none", resize: "vertical" }}
                      />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: "bold" }}>صورة خلفية / لوجو لطريقة الدفع (اختياري):</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setPaymentMethodsList(prev => prev.map(item => item.id === pm.id ? { ...item, logo: reader.result } : item));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          style={{ padding: "8px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(13, 18, 36, 0.7)", color: "#ffffff", fontSize: "0.85rem", outline: "none" }}
                        />
                        {pm.logo && (
                          <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
                            <img 
                              src={pm.logo.startsWith("data:image") ? pm.logo : `${API_BASE_URL}${pm.logo}`} 
                              alt="Payment Method Logo" 
                              style={{ width: "60px", height: "60px", objectFit: "contain", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.1)", background: "white" }} 
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setPaymentMethodsList(prev => prev.map(item => item.id === pm.id ? { ...item, logo: "" } : item));
                              }}
                              className="action-btn btn-danger-premium"
                              style={{ padding: "4px 8px", fontSize: "0.75rem", width: "auto" }}
                            >
                              إزالة اللوجو
                            </button>
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: "bold" }}>صورة / باركود (QR Code) لطريقة الدفع (اختياري):</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setPaymentMethodsList(prev => prev.map(item => item.id === pm.id ? { ...item, image: reader.result } : item));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          style={{ padding: "8px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(13, 18, 36, 0.7)", color: "#ffffff", fontSize: "0.85rem", outline: "none" }}
                        />
                        {pm.image && (
                          <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
                            <img 
                              src={pm.image.startsWith("data:image") ? pm.image : `${API_BASE_URL}${pm.image}`} 
                              alt="Payment Method QR Code" 
                              style={{ width: "60px", height: "60px", objectFit: "contain", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.1)", background: "white" }} 
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setPaymentMethodsList(prev => prev.map(item => item.id === pm.id ? { ...item, image: "" } : item));
                              }}
                              className="action-btn btn-danger-premium"
                              style={{ padding: "4px 8px", fontSize: "0.75rem", width: "auto" }}
                            >
                              إزالة الباركود
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </AccordionItem>

        <AccordionItem isActive={activeAccordion === 4} onToggle={() => toggleAccordion(4)} title="أسعار العملات الإضافية" icon="💱">
          <label style={{ display: "block", marginBottom: "12px", fontWeight: "bold", color: "#cbd5e1" }}>تهيئة أسعار صرف العملات الإضافية (سعر 1 وحدة من العملة الإضافية مقابل الـ {baseCurrency}):</label>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
            {globalCurrencies.map((currency) => (
              <div key={currency} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span style={{ minWidth: "120px", fontSize: "0.85rem", color: "#cbd5e1" }}>1 {currency} =</span>
                <input
                  type="number"
                  step="0.000001"
                  placeholder="مثال: 50"
                  value={exchangeRates[currency] !== undefined ? exchangeRates[currency] : 50}
                  onChange={(e) => {
                    const rate = parseFloat(e.target.value) || 0;
                    setExchangeRates(prev => ({ ...prev, [currency]: rate }));
                  }}
                  className="search-input-premium"
                  style={{ flex: 1, padding: "8px 12px" }}
                />
                <span style={{ fontSize: "0.85rem", color: "#60a5fa", fontWeight: "bold", minWidth: "50px" }}>{baseCurrency}</span>
                <button
                  type="button"
                  onClick={() => {
                    setGlobalCurrencies(prev => prev.filter(c => c !== currency));
                    const updatedRates = { ...exchangeRates };
                    delete updatedRates[currency];
                    setExchangeRates(updatedRates);
                  }}
                  className="action-btn btn-danger-premium"
                  style={{ padding: "8px 12px" }}
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
          
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", width: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "bold" }}>اختر العملة:</span>
              <select
                value={addCurrencySelect}
                onChange={(e) => setAddCurrencySelect(e.target.value)}
                style={{
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(13, 18, 36, 0.7)",
                  color: "#ffffff",
                  fontSize: "0.88rem",
                  outline: "none",
                  width: "100%"
                }}
              >
                <option value="USD">USD (الدولار الأمريكي)</option>
                <option value="USDT">USDT (الدولار الرقمي)</option>
                <option value="EUR">EUR (اليورو)</option>
                <option value="TRY">TRY (الليرة التركية)</option>
                <option value="SAR">SAR (الريال السعودي)</option>
                <option value="AED">AED (الدرهم الإماراتي)</option>
                <option value="EGP">EGP (الجنيه المصري)</option>
                <option value="KWD">KWD (الدينار الكويتي)</option>
                <option value="QAR">QAR (الريال قطر)</option>
                <option value="BHD">BHD (الدينار البحريني)</option>
                <option value="OMR">OMR (الريال العماني)</option>
                {globalCurrencies.filter(curr => !["USD", "USDT", "EUR", "TRY", "SAR", "AED", "EGP", "KWD", "QAR", "BHD", "OMR"].includes(curr)).map(curr => (
                  <option key={curr} value={curr}>{curr} (عملة مضافة)</option>
                ))}
                <option value="CUSTOM">أخرى (كتابة يدوية)</option>
              </select>
            </div>

            {addCurrencySelect === "CUSTOM" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "bold" }}>رمز العملة المخصص:</span>
                <input
                  type="text"
                  value={addCurrencyCustomCode}
                  onChange={(e) => setAddCurrencyCustomCode(e.target.value.trim().toUpperCase())}
                  placeholder="مثال: GBP"
                  className="search-input-premium"
                  style={{ padding: "8px 12px" }}
                />
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 2 }}>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "bold" }}>سعر العملة الإضافية مقابل الـ {baseCurrency}:</span>
              <input
                type="number"
                step="0.000001"
                value={addCurrencyRate}
                onChange={(e) => setAddCurrencyRate(e.target.value)}
                placeholder="مثال: 50"
                className="search-input-premium"
                style={{ padding: "8px 12px" }}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                const code = addCurrencySelect === "CUSTOM" ? addCurrencyCustomCode : addCurrencySelect;
                const rate = parseFloat(addCurrencyRate) || 0;
                if (code && rate > 0) {
                  if (globalCurrencies.includes(code)) {
                    alert("العملة مضافة بالفعل!");
                    return;
                  }
                  setGlobalCurrencies(prev => [...prev, code]);
                  setExchangeRates(prev => ({ ...prev, [code]: rate }));
                  setAddCurrencyCustomCode("");
                  setAddCurrencyRate("");
                } else {
                  alert("يرجى إدخال رمز عملة وسعر صرف صحيح (أكبر من 0)!");
                }
              }}
              className="btn-add-premium"
              style={{ padding: "10px 16px", fontSize: "0.85rem", whiteSpace: "nowrap", alignSelf: "flex-end", height: "42px" }}
            >
              + إضافة العملة
            </button>
          </div>
        </AccordionItem>

        <AccordionItem isActive={activeAccordion === 5} onToggle={() => toggleAccordion(5)} title="إشعارات واتساب" icon="💬">
          <label style={{ display: "block", marginBottom: "12px", fontWeight: "bold", color: "#cbd5e1" }}>
            💬 أرقام واتساب لاستقبال طلبات شحن المحفظة (بالصيغة الدولية مثل: 201012345678):
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
            {whatsappNumbers.length === 0 && (
              <div style={{ color: "#64748b", fontSize: "0.85rem", textAlign: "center", padding: "10px" }}>
                لا توجد أرقام مضافة بعد
              </div>
            )}
            {whatsappNumbers.map((num, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.03)", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontSize: "1.2rem" }}>💬</span>
                <span style={{ flex: 1, fontFamily: "monospace", color: "#34d399", fontWeight: "bold" }}>{num}</span>
                <a href={`https://wa.me/${num}`} target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa", fontSize: "0.78rem", textDecoration: "none" }}>
                  اختبار
                </a>
                <button
                  type="button"
                  onClick={() => setWhatsappNumbers(prev => prev.filter((_, idx) => idx !== i))}
                  className="action-btn btn-danger-premium"
                  style={{ padding: "4px 10px" }}
                >
                  حذف
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="tel"
              value={newWhatsappNumber}
              onChange={(e) => setNewWhatsappNumber(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="مثال: 201012345678"
              className="search-input-premium"
              style={{ flex: 1, padding: "10px 14px", direction: "ltr" }}
            />
            <button
              type="button"
              onClick={() => {
                const clean = newWhatsappNumber.replace(/[^0-9]/g, "");
                if (clean.length < 8) { alert("يرجى إدخال رقم صحيح بالصيغة الدولية"); return; }
                if (whatsappNumbers.includes(clean)) { alert("الرقم مضاف بالفعل!"); return; }
                setWhatsappNumbers(prev => [...prev, clean]);
                setNewWhatsappNumber("");
              }}
              className="btn-add-premium"
              style={{ padding: "10px 16px", whiteSpace: "nowrap" }}
            >
              + إضافة
            </button>
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "8px" }}>
            ⚠️ اكتب الرقم بالصيغة الدولية بدون + (مثال: 201012345678 للمصري، 966501234567 للسعودي)
          </div>
        </AccordionItem>

        <AccordionItem isActive={activeAccordion === 6} onToggle={() => toggleAccordion(6)} title="إعدادات البريد الإلكتروني (Gmail)" icon="📧">
          <p style={{ fontSize: "0.8rem", color: "#cbd5e1", marginBottom: "14px", lineHeight: "1.5" }}>
            يتم إرسال رسائل شيكة بتصميم HTML احترافي للعميل عند طلب الخدمة وعند اكتمالها. يرجى إدخال حساب الـ Gmail و<strong>كلمة مرور التطبيقات (App Password)</strong> المكونة من 16 حرفاً من إعدادات أمان جوجل.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "bold", color: "#94a3b8", marginBottom: "6px" }}>البريد الإلكتروني (Gmail):</label>
              <input
                type="email"
                value={emailUser || ""}
                onChange={(e) => setEmailUser && setEmailUser(e.target.value)}
                placeholder="مثال: example@gmail.com"
                className="search-input-premium"
                style={{ width: "100%", padding: "10px 14px", direction: "ltr" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "bold", color: "#94a3b8", marginBottom: "6px" }}>كلمة مرور التطبيقات (App Password):</label>
              <input
                type="password"
                value={emailPass || ""}
                onChange={(e) => setEmailPass && setEmailPass(e.target.value)}
                placeholder="xxxx xxxx xxxx xxxx"
                className="search-input-premium"
                style={{ width: "100%", padding: "10px 14px", direction: "ltr", fontFamily: "monospace" }}
              />
            </div>
          </div>
        </AccordionItem>

        {errorMsg && (
          <div style={{ color: "#f87171", fontSize: "0.85rem", fontWeight: "600", marginBottom: "15px" }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <button type="submit" className="btn-add-premium" style={{ width: "100%", padding: "14px", marginBottom: "30px", borderRadius: "16px", fontSize: "1.05rem" }}>
          💾 حفظ التغييرات وإعادة التحميل
        </button>
      </form>

      <form onSubmit={handleUpdateCredentials}>
        <AccordionItem isActive={activeAccordion === 7} onToggle={() => toggleAccordion(7)} title="تغيير بيانات تسجيل الدخول للوحة التحكم" icon="🔐">
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", color: "#cbd5e1", fontSize: "0.85rem" }}>اسم المستخدم المسؤول الجديد:</label>
              <input
                type="text"
                className="search-input-premium"
                value={newAdminUsername}
                onChange={(e) => setNewAdminUsername(e.target.value)}
                placeholder="مثال: admin"
                required
                style={{ padding: "10px 14px !important", fontSize: "0.9rem !important" }}
              />
            </div>
            
            <div className="form-group" style={{ position: "relative", marginBottom: 0 }}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", color: "#cbd5e1", fontSize: "0.85rem" }}>كلمة المرور الجديدة (أتركها فارغة إذا لم ترغب بتغييرها):</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showAdminPassword ? "text" : "password"}
                  className="search-input-premium"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="كلمة مرور جديدة (الحد الأدنى 6 أحرف)"
                  style={{ padding: "10px 45px 10px 14px !important", fontSize: "0.9rem !important", width: "100%" }}
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    zIndex: 10,
                    userSelect: "none"
                  }}
                  title={showAdminPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showAdminPassword ? "👀" : "👁️"}
                </button>
              </div>
            </div>

            {credentialsErrorMsg && (
              <div style={{ color: "#f87171", fontSize: "0.82rem", fontWeight: "600" }}>
                ⚠️ {credentialsErrorMsg}
              </div>
            )}

            {credentialsSuccessMsg && (
              <div style={{ color: "#34d399", fontSize: "0.82rem", fontWeight: "600" }}>
                ✓ {credentialsSuccessMsg}
              </div>
            )}

            <button type="submit" className="action-btn btn-success-premium" style={{ width: "100%", padding: "12px", justifyContent: "center", borderRadius: "10px", fontSize: "0.9rem" }}>
              تحديث بيانات تسجيل الدخول
            </button>
          </div>
        </AccordionItem>
      </form>

      <AccordionItem isActive={activeAccordion === 8} onToggle={() => toggleAccordion(8)} title="تفريغ مساحة السيرفر (صور التحويلات)" icon="🗑️" isDanger={true}>
        <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "15px", lineHeight: "1.5" }}>
          يمكنك حذف كافة صور التحويلات واللقطات المرفوعة من العملاء لتوفير مساحة على السيرفر (الحد الأقصى المسموح به هو 1 جيجابايت).
        </p>
        <button 
          type="button" 
          onClick={async () => {
            if (!confirm("هل أنت متأكد من حذف كافة صور إيصالات التحويل من السيرفر نهائياً؟ لا يمكن التراجع عن هذا الإجراء.")) return;
            try {
              const res = await fetch(`${API_BASE_URL}/api/orders/receipts/clear`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
              });
              const data = await res.json();
              alert(data.message || "تم تفريغ كافة صور الإيصالات بنجاح.");
            } catch (err) {
              alert("حدث خطأ أثناء تفريغ صور الإيصالات.");
            }
          }}
          className="action-btn btn-danger-premium" 
          style={{ width: "100%", padding: "12px", justifyContent: "center", borderRadius: "10px", fontSize: "0.9rem", fontWeight: "bold" }}
        >
          حذف كافة إيصالات التحويل من السيرفر
        </button>
      </AccordionItem>
    </div>
  );
}

