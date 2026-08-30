const fs = require('fs');
const path = require('path');

const filePath = path.join('D:', 'pj', 'spider-store-front', 'frontend', 'src', 'app', 'wallet', 'page.js');
let content = fs.readFileSync(filePath, 'utf8');

const anchor = 'if (!hydrated) {';
const anchorIndex = content.indexOf(anchor);
if (anchorIndex === -1) {
  console.log("Could not find anchor");
  process.exit(1);
}

// Find the end of the if block
const ifEndIndex = content.indexOf('}', anchorIndex);
const contentBeforeReturn = content.substring(0, ifEndIndex + 1);

const newReturn = `\n
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "800px", margin: "0 auto" }}>
      {/* Wallet Balance Top Card */}
      <section className="glass-panel" style={{ padding: "30px", borderRadius: "24px", textAlign: "center", background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.05))", border: "1px solid rgba(34,197,94,0.3)", boxShadow: "0 10px 30px -10px rgba(34,197,94,0.2)" }}>
        <h2 style={{ color: "var(--text-muted)", fontSize: "1.1rem", marginBottom: "8px", fontWeight: "bold" }}>الرصيد الحالي للمحفظة</h2>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
          <div style={{ fontSize: "3rem", fontWeight: 900, color: "#22c55e", textShadow: "0 2px 10px rgba(34,197,94,0.2)" }}>
            $ {Number(customer?.balance || 0).toFixed(2)}
          </div>
          <span style={{ fontSize: "1.2rem", color: "#22c55e", fontWeight: "bold", opacity: 0.8, marginTop: "10px" }}>USD</span>
        </div>
      </section>

      {/* Recharge Wallet Section (Accordion Style) */}
      <section className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "24px", borderRadius: "24px" }}>
        <div>
          <h2 style={{ fontWeight: 900, fontSize: "1.4rem", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.6rem" }}>⚡</span> شحن المحفظة
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>اختر طريقة الدفع المناسبة لعرض بيانات التحويل وإرفاق الوصل.</p>
        </div>
        
        {paymentMethods.length === 0 ? (
          <div style={{ color: "var(--text-muted)" }}>يرجى تهيئة طرق الدفع من لوحة التحكم.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {paymentMethods.map((pm) => {
              const isSelected = selectedMethodId === pm.id;
              return (
                <div key={pm.id} style={{
                  border: isSelected ? "2px solid var(--primary-color)" : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "16px",
                  background: isSelected ? "rgba(139, 92, 246, 0.05)" : "rgba(255,255,255,0.02)",
                  overflow: "hidden",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                }}>
                  <button
                    type="button"
                    onClick={() => {
                      setError(""); // Clear error when switching
                      setSelectedMethodId(isSelected ? "" : pm.id);
                    }}
                    style={{
                      width: "100%", padding: "18px", background: "transparent", border: "none",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      cursor: "pointer", color: "var(--text-main)", fontSize: "1.1rem", fontWeight: 800,
                      outline: "none"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "1.5rem" }}>{pm.name.toLowerCase().includes("paypal") || pm.name.includes("باي بال") ? "🅿️" : pm.name.toLowerCase().includes("bnb") || pm.name.toLowerCase().includes("crypto") ? "🟡" : "🏦"}</span>
                      {pm.name}
                    </div>
                    <span style={{ transform: isSelected ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.4s ease", color: isSelected ? "var(--primary-color)" : "var(--text-muted)" }}>▼</span>
                  </button>

                  <div style={{
                    maxHeight: isSelected ? "2000px" : "0",
                    opacity: isSelected ? 1 : 0,
                    transition: "all 0.5s ease-in-out",
                    padding: isSelected ? "0 18px 18px 18px" : "0 18px"
                  }}>
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "18px", marginTop: "4px" }}>
                      
                      <div style={{ marginBottom: "20px" }}>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "16px", background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "10px" }}>
                          {pm.description}
                        </p>
                        
                        <div style={{ padding: "16px", borderRadius: "16px", background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.2)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 800, marginBottom: "6px", color: "var(--text-muted)" }}>رقم أو عنوان التحويل:</div>
                            <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--text-main)", direction: "ltr", userSelect: "all", wordBreak: "break-all" }}>{pm.value}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(pm.value);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            style={{ background: copied ? "#10b981" : "#3b82f6", color: "#ffffff", border: "none", borderRadius: "10px", padding: "10px 16px", fontSize: "0.9rem", cursor: "pointer", fontWeight: "bold", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "6px" }}
                          >
                            {copied ? "تم النسخ ✓" : "نسخ 📋"}
                          </button>
                        </div>
                      </div>

                      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>عملة التحويل والدفع:</label>
                          <select value={selectedCurrency} onChange={(e) => setSelectedCurrency(e.target.value)} style={{ width: "100%", padding: "14px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "12px", color: "var(--text-main)", outline: "none", fontSize: "1rem" }}>
                            {globalCurrencies.map((curr) => (
                              <option key={curr} value={curr} style={{ background: "var(--bg-color)" }}>
                                {curr} {curr === "USD" ? "(الدولار الأمريكي 🇺🇸)" : curr === "EGP" ? "(الجنيه المصري 🇪🇬)" : curr === "SDG" ? "(الجنيه السوداني 🇸🇩)" : curr === "USDT" ? "(تيزر 🟢)" : ""}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>المبلغ المطلوب إضافته للمحفظة بالدولار (USD):</label>
                          <input type="number" min="0.01" step="0.01" placeholder="مثال: 10" value={amount} onChange={(e) => setAmount(e.target.value)} required style={{ padding: "14px", fontSize: "1rem", borderRadius: "12px" }} />
                          {amount && (
                            <div style={{ marginTop: "12px", padding: "14px", background: "rgba(96, 165, 250, 0.08)", borderRight: "4px solid var(--primary-color)", borderRadius: "10px", fontSize: "0.9rem", color: "#60a5fa", display: "flex", flexDirection: "column", gap: "6px" }}>
                              <div>💵 سيتم إضافة: <strong>$ {Number(amount).toFixed(2)} USD</strong></div>
                              {selectedCurrency !== baseCurrency && (
                                <div>💸 المبلغ المطلوب تحويله: <strong>{Number(Number(amount) * (selectedCurrency === baseCurrency ? 1 : (exchangeRates[selectedCurrency] || 50))).toFixed(2)} {selectedCurrency}</strong></div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>رقم الهاتف / اسم المحفظة المحول منها: <span style={{ color: "var(--danger-color)" }}>*</span></label>
                          <input type="text" placeholder="الرقم أو اسم الحساب" value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} required style={{ padding: "14px", fontSize: "1rem", borderRadius: "12px" }} />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>صورة وصل التحويل: <span style={{ color: "var(--danger-color)" }}>*</span></label>
                          <div style={{ border: "2px dashed rgba(255,255,255,0.15)", borderRadius: "14px", padding: "24px", textAlign: "center", background: "rgba(255,255,255,0.02)", cursor: "pointer", transition: "background 0.2s" }} onClick={() => document.getElementById("receipt-upload-input").click()} onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"} onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}>
                            <input id="receipt-upload-input" type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const file = e.target.files[0]; if (file) { setReceiptImageFile(file); const reader = new FileReader(); reader.onload = (ev) => setReceiptImagePreview(ev.target.result); reader.readAsDataURL(file); } }} />
                            {receiptImagePreview ? (
                              <div>
                                <img src={receiptImagePreview} alt="وصل التحويل" style={{ maxWidth: "100%", maxHeight: "250px", borderRadius: "10px", objectFit: "contain", boxShadow: "0 4px 15px rgba(0,0,0,0.3)" }} />
                                <div style={{ fontSize: "0.9rem", color: "#10b981", marginTop: "12px", fontWeight: "bold" }}>✓ تم إرفاق الصورة بنجاح</div>
                              </div>
                            ) : (
                              <div style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                                <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>📸</div>
                                اضغط هنا لرفع صورة إيصال الدفع
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>ملاحظات إضافية:</label>
                          <textarea rows="2" placeholder="اكتب أي تفاصيل..." value={notes} onChange={(e) => setNotes(e.target.value)} style={{ padding: "14px", fontSize: "1rem", borderRadius: "12px" }} />
                        </div>

                        {error && (
                          <div style={{ padding: "12px 16px", background: "rgba(244, 63, 94, 0.1)", borderRight: "4px solid var(--danger-color)", color: "var(--danger-color)", borderRadius: "10px", fontSize: "0.9rem", fontWeight: "600" }}>
                            ⚠️ {error}
                          </div>
                        )}

                        <button type="submit" disabled={submitting} className="glass-btn glass-btn-primary" style={{ padding: "16px", borderRadius: "14px", fontSize: "1.05rem", marginTop: "8px" }}>
                          {submitting ? "جاري إرسال الطلب..." : "إرسال طلب الشحن 🚀"}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* WhatsApp Modal */}
      {pendingWhatsapp && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "24px", padding: "24px", maxWidth: "420px", width: "100%", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "3.5rem" }}>{pendingWhatsapp.autoSent ? "🤖" : "✅"}</div>
              <h3 style={{ fontWeight: 900, marginTop: "10px", fontSize: "1.3rem" }}>تم تسجيل طلبك بنجاح!</h3>
              <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "4px" }}>رقم الطلب: <strong style={{ color: "var(--primary-color)" }}>#{pendingWhatsapp.requestId}</strong></div>
            </div>

            {pendingWhatsapp.autoSent ? (
              <div style={{ background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.25)", borderRadius: "16px", padding: "18px", textAlign: "center" }}>
                <div style={{ fontSize: "1.8rem", marginBottom: "8px" }}>💬✓</div>
                <div style={{ color: "#34d399", fontWeight: "bold", fontSize: "1rem" }}>تم إرسال الطلب وصورة الوصل تلقائياً للأدمن عبر واتساب!</div>
                <div style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "8px" }}>لا تحتاج لفعل أي شيء — انتظر تأكيد الأدمن</div>
              </div>
            ) : (
              <>
                <div style={{ background: "rgba(37,211,102,0.08)", border: "1px solid rgba(37,211,102,0.2)", borderRadius: "12px", padding: "12px", fontSize: "0.85rem", whiteSpace: "pre-wrap", color: "#cbd5e1", direction: "rtl", maxHeight: "150px", overflowY: "auto" }}>
                  {pendingWhatsapp.text}
                </div>
                <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "12px", padding: "12px", fontSize: "0.85rem", color: "#fbbf24", textAlign: "center" }}>
                  📎 <strong>يرجى إرسال الوصل يدوياً عبر الواتساب لاكتمال الطلب</strong>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {whatsappNumbers.length > 0 ? whatsappNumbers.map((num, i) => (
                    <button key={i} onClick={() => { openWhatsapp(num); setWhatsappSent(true); }} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "14px", background: "linear-gradient(135deg, #25d366, #128c7e)", border: "none", borderRadius: "14px", color: "#fff", fontWeight: 900, fontSize: "1rem", cursor: "pointer", transition: "transform 0.2s" }} onMouseEnter={(e)=>e.currentTarget.style.transform="scale(1.02)"} onMouseLeave={(e)=>e.currentTarget.style.transform="scale(1)"}>
                      <span style={{ fontSize: "1.3rem" }}>💬</span> إرسال الوصل عبر واتساب {whatsappNumbers.length > 1 ? \`(\${i + 1})\` : ""}
                    </button>
                  )) : (
                    <div style={{ color: "var(--text-muted)", textAlign: "center", fontSize: "0.9rem" }}>⚠️ رقم الواتساب غير متوفر</div>
                  )}
                </div>
                {whatsappSent && <div style={{ color: "#10b981", fontWeight: "bold", textAlign: "center", fontSize: "0.85rem" }}>✓ تم فتح واتساب — لا تنسَ إرفاق صورة الوصل</div>}
              </>
            )}
            <button onClick={() => setPendingWhatsapp(null)} style={{ padding: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", color: "var(--text-main)", cursor: "pointer", fontWeight: "bold", fontSize: "1rem", marginTop: "4px" }} onMouseEnter={(e)=>e.currentTarget.style.background="rgba(255,255,255,0.1)"} onMouseLeave={(e)=>e.currentTarget.style.background="rgba(255,255,255,0.05)"}>
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Order History */}
      <section className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "24px", borderRadius: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "16px" }}>
          <div>
            <h3 style={{ fontWeight: 900, marginBottom: "4px", fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "1.4rem" }}>📜</span> سجل طلبات الشحن
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>تابع حالة طلبات شحن رصيدك هنا.</p>
          </div>
          <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: "8px 16px", borderRadius: "12px", color: "#10b981", fontWeight: 800 }}>
            {requests.length} طلب
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>جاري التحميل...</div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", background: "rgba(255,255,255,0.02)", borderRadius: "16px" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>🏜️</div>
            لا توجد طلبات شحن رصيد بعد.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {requests.map((request) => (
              <div key={request.id} style={{ padding: "18px", borderRadius: "16px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  <strong style={{ fontSize: "1.1rem" }}>طلب #{request.id}</strong>
                  <span className={\`badge badge-\${request.status}\`} style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "0.85rem" }}>
                    {request.status === "pending" && "قيد الانتظار ⏳"}
                    {request.status === "approved" && "تم الاعتماد ✅"}
                    {request.status === "rejected" && "مرفوض ❌"}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                  <div>المبلغ: <strong style={{ color: "var(--text-main)" }}>$ {Number(request.amount).toFixed(2)} USD</strong></div>
                  <div>العملة: <strong style={{ color: "var(--text-main)" }}>{request.currency || "USD"}</strong></div>
                  <div>من رقم: <strong style={{ color: "var(--text-main)" }}>{request.sender_phone || "-"}</strong></div>
                  <div>بتاريخ: <strong style={{ color: "var(--text-main)" }}>{new Date(request.created_at).toLocaleString("ar-EG")}</strong></div>
                  {request.notes && (
                    <div style={{ gridColumn: "span 2", background: "rgba(0,0,0,0.2)", padding: "10px", borderRadius: "8px", marginTop: "4px" }}>
                      الملاحظات: <strong style={{ color: "var(--text-main)" }}>{request.notes.replace(/^\\[تم تحويل:[^\\]]+\\]\\s*/, "")}</strong>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      <div style={{ textAlign: "center", marginBottom: "40px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
        🔒 شحنك للمحفظة يخضع لـ <Link href="/terms" style={{ color: "var(--primary-color)", fontWeight: "bold", textDecoration: "underline" }}>شروط الاستخدام وسياسة الاسترجاع</Link>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(filePath, contentBeforeReturn + newReturn, 'utf8');
console.log('Successfully updated wallet page layout');
