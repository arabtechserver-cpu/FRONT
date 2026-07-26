import React, { useContext } from "react";
import { AdminDashboardContext } from "../../AdminDashboardContext";

export default function ServiceModal() {
  const { serviceModal } = useContext(AdminDashboardContext);
  const { showServiceModal, setShowServiceModal, handleAddService, newServiceName, setNewServiceName, newServiceDesc, setNewServiceDesc, newServiceCatId, setNewServiceCatId, newServicePrice, setNewServicePrice, newServiceImage, setNewServiceImage, serviceUploadedFile, setServiceUploadedFile, newServiceApiProviderId, setNewServiceApiProviderId, newServicePriceType, setNewServicePriceType, newServicePricePerThousand, setNewServicePricePerThousand, newServiceIsPopular, setNewServiceIsPopular, newServiceShowInMenu, setNewServiceShowInMenu, newServiceIsBundle, setNewServiceIsBundle, newServiceBundleServices, setNewServiceBundleServices, newServicePackages, handleAddPkgInput, handleRemovePkgInput, handlePkgChange, newServiceFieldsTitle, setNewServiceFieldsTitle, newServiceFields, handleAddCatField, handleRemoveCatField, handleCatFieldChange, newServiceDownloadLink, setNewServiceDownloadLink, newServiceDownloadLinkTitle, setNewServiceDownloadLinkTitle } = serviceModal;
  const { categories, apiProviders } = useContext(AdminDashboardContext);

  if (!(showServiceModal)) return null;

  return (
    <div className="premium-overlay" onClick={() => setShowServiceModal(false)}>
          <div className="premium-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="premium-modal-header">
              <h3 className="premium-modal-title">إضافة خدمة شحن جديدة</h3>
              <button className="close-btn-premium" onClick={() => setShowServiceModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleAddService} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>القسم الرئيسي:</label>
                <select 
                  value={newServiceCatId} 
                  onChange={(e) => setNewServiceCatId(e.target.value)}
                  style={{
                    padding: "12px 18px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    background: "rgba(13, 18, 36, 0.7)",
                    color: "#ffffff",
                    fontSize: "0.95rem",
                    outline: "none"
                  }}
                >
                  {categories.map(c => {
                    const parent = categories.find(p => p.id === Number(c.parent_id));
                    return (
                      <option key={c.id} value={c.id}>
                        {parent ? `↳ ${parent.name} > ${c.name}` : `📁 ${c.name}`}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>اسم الخدمة:</label>
                <input
                  type="text"
                  placeholder="مثال: ببجي موبايل (PUBG Mobile)"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="search-input-premium"
                  style={{ padding: "12px 16px !important" }}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>وصف الخدمة:</label>
                <textarea
                  placeholder="اكتب وصفاً جذاباً للخدمة للعميل هنا..."
                  rows="3"
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                  style={{
                    padding: "12px 18px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    background: "rgba(13, 18, 36, 0.7)",
                    color: "#ffffff",
                    fontSize: "0.95rem",
                    outline: "none"
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>رمز الأيقونة للخدمة (الافتراضية):</label>
                <select 
                  value={newServiceImage} 
                  onChange={(e) => setNewServiceImage(e.target.value)}
                  style={{
                    padding: "12px 18px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    background: "rgba(13, 18, 36, 0.7)",
                    color: "#ffffff",
                    fontSize: "0.95rem",
                    outline: "none",
                    width: "100%"
                  }}
                >
                  <option value="pubg">🔫 ببجي / أسلحة</option>
                  <option value="freefire">🔥 فري فاير / نار</option>
                  <option value="bigo">💬 بيجو لايف / دردشة</option>
                  <option value="vodafone">📱 فودافون / كاش</option>
                  <option value="usdt">🪙 USDT / عملة رقمية</option>
                  <option value="canva">🎨 كانفا / تصميم</option>
                  <option value="netflix">🎬 نتفليكس / أفلام</option>
                  <option value="default">⚡ صاعقة / افتراضي</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>أو رفع صورة مخصصة من الجهاز (اختياري - ستحل محل الأيقونة):</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setServiceUploadedFile(reader.result);
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
                {serviceUploadedFile && (
                  <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <img src={serviceUploadedFile} alt="Preview" style={{ width: "60px", height: "60px", objectFit: "contain", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.1)" }} />
                    <button
                      type="button"
                      onClick={() => setServiceUploadedFile(null)}
                      className="action-btn btn-danger-premium"
                      style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                    >
                      حذف الصورة المرفوعة
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>مزود الـ API الخارجي (اختياري - للربط التلقائي):</label>
                <select 
                  value={newServiceApiProviderId || ""} 
                  onChange={(e) => setNewServiceApiProviderId(e.target.value)}
                  style={{
                    padding: "12px 18px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    background: "rgba(13, 18, 36, 0.7)",
                    color: "#ffffff",
                    fontSize: "0.95rem",
                    outline: "none",
                    width: "100%"
                  }}
                >
                  <option value="">بدون ربط (خدمة داخلية)</option>
                  {apiProviders?.map(provider => (
                    <option key={provider.id} value={provider.id}>
                      🔌 {provider.name}
                    </option>
                  ))}
                </select>
                <small style={{ color: "#94a3b8", display: "block", marginTop: "6px" }}>
                  عند اختيار مزود، سيتم إرسال الطلبات تلقائياً إليه عند اعتمادها.
                </small>
              </div>

              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>نوع التسعير:</label>
                <select
                  value={newServicePriceType}
                  onChange={(e) => setNewServicePriceType(e.target.value)}
                  style={{
                    padding: "16px 20px",
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    borderRadius: "14px",
                    border: "2px solid #3b82f6",
                    background: "rgba(13, 18, 36, 0.9)",
                    color: "#ffffff",
                    width: "100%",
                    boxSizing: "border-box",
                    outline: "none"
                  }}
                >
                  <option value="fixed" style={{ color: "#ffffff", background: "#0d1224" }}>📦 باقات (Packages)</option>
                  <option value="dynamic" style={{ color: "#ffffff", background: "#0d1224" }}>⚡ عادي (Normal / SMM)</option>
                  <option value="both" style={{ color: "#ffffff", background: "#0d1224" }}>🔄 الاثنين معاً (باقات وبالكمية)</option>
                </select>
              </div>

              {(newServicePriceType === "dynamic" || newServicePriceType === "both") && (
                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label>سعر الـ 1000 وحدة ({baseCurrency}):</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="مثال: 50.00"
                    value={newServicePricePerThousand || ""}
                    onChange={(e) => setNewServicePricePerThousand(e.target.value)}
                    className="search-input-premium"
                    style={{ padding: "12px 16px", direction: "ltr" }}
                    required={newServicePriceType === "dynamic" || newServicePriceType === "both"}
                  />
                </div>
              )}

              {(newServicePriceType === "fixed" || newServicePriceType === "both") && (
                /* Package Builder List */
                <div style={{ border: "1px solid rgba(255, 255, 255, 0.05)", padding: "18px", borderRadius: "16px", background: "rgba(255, 255, 255, 0.02)", marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <h4 style={{ fontWeight: 800, fontSize: "0.9rem" }}>الباقات المتوفرة (الحزم):</h4>
                    <button 
                      type="button" 
                      onClick={handleAddPkgInput} 
                      className="action-btn"
                      style={{ background: "rgba(139, 92, 246, 0.2)", color: "#c084fc", border: "1px solid rgba(139, 92, 246, 0.3)" }}
                    >
                      + إضافة باقة
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {newServicePackages.map((pkg, idx) => (
                      <div key={idx} style={{
                        background: "rgba(255, 255, 255, 0.02)",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                        borderRadius: "12px",
                        padding: "12px",
                        marginBottom: "10px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.82rem", color: "#c084fc", fontWeight: "800" }}>الباقة #{idx + 1}</span>
                          {newServicePackages.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePkgInput(idx)}
                              style={{ background: "none", border: "none", color: "#f87171", fontSize: "0.82rem", cursor: "pointer", fontWeight: "bold" }}
                            >
                              حذف الباقة ×
                            </button>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          <div style={{ flex: "2 1 180px", display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: "bold" }}>اسم الباقة (مثلاً: 325 شدة):</span>
                            <input
                              type="text"
                              placeholder="اسم الباقة"
                              value={pkg.name}
                              onChange={(e) => handlePkgChange(idx, "name", e.target.value)}
                              required
                            />
                          </div>
                          <div style={{ flex: "1 1 100px", display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: "bold" }}>السعر ({baseCurrency}):</span>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="السعر"
                              value={pkg.price || ""}
                              onChange={(e) => handlePkgChange(idx, "price", e.target.value)}
                              style={{ direction: "ltr" }}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ border: "1px solid rgba(255, 255, 255, 0.05)", padding: "18px", borderRadius: "16px", background: "rgba(255, 255, 255, 0.02)", marginBottom: "20px" }}>
                <h4 style={{ fontWeight: 800, fontSize: "0.9rem", marginBottom: "14px" }}>رابط تحميل الأداة (اختياري):</h4>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <div style={{ flex: "2 1 180px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: "bold" }}>رابط التحميل (مثال: https://...):</span>
                    <input
                      type="text"
                      placeholder="رابط التحميل"
                      value={newServiceDownloadLink}
                      onChange={(e) => setNewServiceDownloadLink(e.target.value)}
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
                  <div style={{ flex: "1 1 100px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: "bold" }}>عنوان زر التحميل:</span>
                    <input
                      type="text"
                      placeholder="مثال: تحميل الأداة"
                      value={newServiceDownloadLinkTitle}
                      onChange={(e) => setNewServiceDownloadLinkTitle(e.target.value)}
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
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "14px" }}>
                <label>عنوان قسم بيانات الخدمة (اختياري - في حال رغبتك بتخصيصه لهذه الخدمة فقط):</label>
                <input
                  type="text"
                  placeholder="مثال: بيانات الخدمة، بيانات لاعب ببجي"
                  value={newServiceFieldsTitle}
                  onChange={(e) => setNewServiceFieldsTitle(e.target.value)}
                  className="search-input-premium"
                      style={{ padding: "12px 16px !important" }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "14px", display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <input
                  type="checkbox"
                  id="newServiceIsPopular"
                  checked={newServiceIsPopular}
                  onChange={(e) => setNewServiceIsPopular(e.target.checked)}
                  style={{ width: "20px", height: "20px", accentColor: "#f59e0b", cursor: "pointer" }}
                />
                <label htmlFor="newServiceIsPopular" style={{ cursor: "pointer", fontWeight: "bold", color: "#fcd34d", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>⭐ إضافة إلى قسم "الخدمات الأكثر طلباً" في الصفحة الرئيسية</span>
                </label>
              </div>

              <div className="form-group" style={{ marginBottom: "14px", display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <input
                  type="checkbox"
                  id="newServiceShowInMenu"
                  checked={newServiceShowInMenu}
                  onChange={(e) => setNewServiceShowInMenu(e.target.checked)}
                  style={{ width: "20px", height: "20px", accentColor: "#3b82f6", cursor: "pointer" }}
                />
                <label htmlFor="newServiceShowInMenu" style={{ cursor: "pointer", fontWeight: "bold", color: "#93c5fd", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>🍔 إظهار في القائمة الجانبية (الهامبرجر)</span>
                </label>
              </div>

              <div className="form-group" style={{ marginBottom: "14px", display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <input
                  type="checkbox"
                  id="newServiceIsBundle"
                  checked={newServiceIsBundle}
                  onChange={(e) => setNewServiceIsBundle(e.target.checked)}
                  style={{ width: "20px", height: "20px", accentColor: "#10b981", cursor: "pointer" }}
                />
                <label htmlFor="newServiceIsBundle" style={{ cursor: "pointer", fontWeight: "bold", color: "#6ee7b7", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>📦 هذه الخدمة عبارة عن باقة مجمعة (Bundle)</span>
                </label>
              </div>
              
              {newServiceIsBundle && (
                <div className="form-group" style={{ marginBottom: "14px", background: "rgba(16, 185, 129, 0.05)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                  <label style={{ display: "block", marginBottom: "8px", color: "#6ee7b7", fontWeight: "bold" }}>أرقام (ID) الخدمات الفرعية:</label>
                  <input
                    type="text"
                    value={Array.isArray(newServiceBundleServices) ? newServiceBundleServices.join(', ') : newServiceBundleServices}
                    onChange={(e) => setNewServiceBundleServices(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    placeholder="مثال: 12, 15, 20"
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.3)", background: "rgba(0,0,0,0.2)", color: "#fff" }}
                  />
                  <small style={{ display: "block", marginTop: "6px", color: "var(--text-muted)" }}>أدخل أرقام الخدمات مفصولة بفاصلة (,). عند اختيار هذه الخدمة سيظهر للعميل قائمة لاختيار إحدى هذه الخدمات الفرعية.</small>
                </div>
              )}

              {/* Custom Fields Builder */}
              <div style={{ border: "1px solid rgba(255, 255, 255, 0.05)", padding: "18px", borderRadius: "16px", background: "rgba(255, 255, 255, 0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <h4 style={{ fontWeight: 800, fontSize: "0.9rem" }}>حقول البيانات المطلوبة من العميل:</h4>
                  <button 
                    type="button" 
                    onClick={handleAddField} 
                    className="action-btn"
                    style={{ background: "rgba(6, 182, 212, 0.2)", color: "#22d3ee", border: "1px solid rgba(6, 182, 212, 0.3)" }}
                  >
                    + إضافة حقل
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {newServiceFields.map((f, idx) => (
                    <div key={idx} style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      borderRadius: "12px",
                      padding: "12px",
                      marginBottom: "10px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.82rem", color: "#22d3ee", fontWeight: "800" }}>الحقل المطلوب #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveField(idx)}
                          style={{ background: "none", border: "none", color: "#f87171", fontSize: "0.82rem", cursor: "pointer", fontWeight: "bold" }}
                        >
                          حذف الحقل ×
                        </button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: "bold" }}>معرّف الحقل (ID):</span>
                          <input
                            type="text"
                            placeholder="معرّف الحقل (ID مثل: player_id)"
                            value={f.id}
                            onChange={(e) => handleFieldChange(idx, "id", e.target.value)}
                            required
                          />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: "bold" }}>اسم الحقل بالعربية:</span>
                          <input
                            type="text"
                            placeholder="اسم الحقل بالعربية"
                            value={f.label}
                            onChange={(e) => handleFieldChange(idx, "label", e.target.value)}
                            required
                          />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: "bold" }}>نص تلميح تلميحي:</span>
                          <input
                            type="text"
                            placeholder="نص تلميح تلميحي"
                            value={f.placeholder}
                            onChange={(e) => handleFieldChange(idx, "placeholder", e.target.value)}
                          />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: "bold" }}>نوع المدخل:</span>
                          <select
                            value={f.type}
                            onChange={(e) => handleFieldChange(idx, "type", e.target.value)}
                            style={{
                              padding: "8px 12px",
                              borderRadius: "10px",
                              border: "1px solid rgba(255, 255, 255, 0.06)",
                              background: "rgba(13, 18, 36, 0.7)",
                              color: "#ffffff",
                              fontSize: "0.85rem",
                              width: "100%",
                              boxSizing: "border-box"
                            }}
                          >
                            <option value="text">نص (text)</option>
                            <option value="tel">هاتف (tel)</option>
                            <option value="number">رقم (number)</option>
                            <option value="email">إيميل (email)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {errorMsg && (
                <div style={{ color: "#f87171", fontSize: "0.85rem", fontWeight: "600" }}>
                  ⚠️ {errorMsg}
                </div>
              )}

              <button type="submit" className="btn-add-premium" style={{ width: "100%", padding: "14px" }}>
                حفظ وإضافة الخدمة
              </button>
            </form>
          </div>
        </div>
  );
}
