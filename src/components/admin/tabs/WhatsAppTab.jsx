import React from "react";

export default function WhatsAppTab({
  waStatus,
  setWaStatus,
  waQR,
  setWaQR,
  whatsappNumbers,
  setWhatsappNumbers,
  newWhatsappNumber,
  setNewWhatsappNumber,
  token,
  API_BASE_URL,
  fetchWaStatus
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "680px" }}>

      {/* Standalone Portal Notice */}
      <div style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.05))", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "18px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
        <div>
          <h4 style={{ color: "#34d399", fontWeight: "800", fontSize: "1.05rem", margin: "0 0 4px" }}>
            🔐 بوابة إدارة الواتساب المستقلة 2FA
          </h4>
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: 0 }}>
            يمكنك الوصول إلى صفحة إدارة مسح الكيو آر كود وتغيير كلمة مرور البوت بشكل منفصل وآمن عبر الرابط الخاص.
          </p>
        </div>
        <a
          href="/whatsapp-portal"
          target="_blank"
          rel="noopener noreferrer"
          className="glass-btn"
          style={{ padding: "10px 18px", background: "#10b981", color: "#fff", fontWeight: "800", borderRadius: "12px", textDecoration: "none", fontSize: "0.88rem" }}
        >
          🚀 فتح البوابة المنفصلة ←
        </a>
      </div>

      {/* Connection Status Card */}
      <div style={{ background: "rgba(37,211,102,0.05)", border: "1px solid rgba(37,211,102,0.2)", borderRadius: "20px", padding: "28px", backdropFilter: "blur(25px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg,#25d366,#128c7e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", boxShadow: "0 4px 15px rgba(37,211,102,0.3)" }}>💬</div>
          <div>
            <h3 style={{ fontWeight: 900, fontSize: "1.1rem", color: "#fff", margin: 0 }}>ربط واتساب البوت</h3>
            <p style={{ color: "#64748b", fontSize: "0.82rem", margin: "4px 0 0" }}>امسح QR Code بتطبيق واتساب لربط الحساب وإرسال الإشعارات تلقائياً</p>
          </div>
        </div>

        {/* Status badge */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "30px",
            background: waStatus === "ready" ? "rgba(37,211,102,0.15)" : waStatus === "qr" ? "rgba(250,204,21,0.15)" : waStatus === "loading" ? "rgba(96,165,250,0.15)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${waStatus === "ready" ? "rgba(37,211,102,0.3)" : waStatus === "qr" ? "rgba(250,204,21,0.3)" : waStatus === "loading" ? "rgba(96,165,250,0.3)" : "rgba(239,68,68,0.2)"}`,
            color: waStatus === "ready" ? "#34d399" : waStatus === "qr" ? "#facc15" : waStatus === "loading" ? "#60a5fa" : "#f87171",
            fontWeight: "bold", fontSize: "0.9rem"
          }}>
            <span>{waStatus === "ready" ? "🟢" : waStatus === "qr" ? "🟡" : waStatus === "loading" ? "🔵" : "🔴"}</span>
            <span>
              {waStatus === "ready" ? "متصل ويعمل" : waStatus === "qr" ? "في انتظار مسح QR Code" : waStatus === "loading" ? "جاري التهيئة..." : "غير متصل"}
            </span>
          </div>
        </div>

        {/* QR Code */}
        {waStatus === "qr" && waQR && (
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ display: "inline-block", padding: "16px", background: "#ffffff", borderRadius: "16px", boxShadow: "0 8px 30px rgba(0,0,0,0.3)" }}>
              <img src={waQR} alt="WhatsApp QR Code" style={{ width: "220px", height: "220px", display: "block" }} />
            </div>
            <div style={{ marginTop: "14px", color: "#fbbf24", fontWeight: "bold", fontSize: "0.9rem" }}>
              📱 افتح واتساب ← الإعدادات ← الأجهزة المرتبطة → ربط جهاز → امسح الكود
            </div>
          </div>
        )}

        {waStatus === "loading" && (
          <div style={{ textAlign: "center", padding: "30px", color: "#60a5fa" }}>
            <div style={{ fontSize: "2rem", marginBottom: "8px", animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</div>
            <div style={{ fontWeight: "bold" }}>جاري تحميل الجلسة... انتظر لحظة</div>
          </div>
        )}

        {waStatus === "ready" && (
          <div style={{ textAlign: "center", padding: "20px", background: "rgba(37,211,102,0.08)", borderRadius: "14px", border: "1px solid rgba(37,211,102,0.2)", marginBottom: "20px" }}>
            <div style={{ fontSize: "2rem", marginBottom: "8px" }}>✅</div>
            <div style={{ color: "#34d399", fontWeight: "bold" }}>واتساب البوت متصل ويعمل بشكل تلقائي</div>
            <div style={{ color: "#64748b", fontSize: "0.8rem", marginTop: "6px" }}>سيُرسل وصل التحويل وتفاصيل كل طلب شحن تلقائياً</div>
          </div>
        )}

        {waStatus === "disconnected" && (
          <div style={{ textAlign: "center", padding: "20px", marginBottom: "16px" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>📵</div>
            <div style={{ color: "#94a3b8", fontSize: "0.88rem" }}>اضغط &quot;تشغيل البوت&quot; ثم امسح QR Code</div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {waStatus === "disconnected" || waStatus === "loading" ? (
            <button
              type="button"
              onClick={async () => {
                setWaStatus("loading");
                try {
                  await fetch(`${API_BASE_URL}/api/whatsapp/start`, {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${token}` }
                  });
                  setTimeout(fetchWaStatus, 2000);
                } catch { setWaStatus("disconnected"); }
              }}
              style={{ flex: 1, padding: "13px 20px", background: "linear-gradient(135deg,#25d366,#128c7e)", border: "none", borderRadius: "12px", color: "#fff", fontWeight: 800, fontSize: "0.95rem", cursor: "pointer" }}
            >
              ▶ تشغيل البوت وعرض QR
            </button>
          ) : null}

          {waStatus === "qr" && (
            <button
              type="button"
              onClick={fetchWaStatus}
              style={{ flex: 1, padding: "13px 20px", background: "rgba(250,204,21,0.15)", border: "1px solid rgba(250,204,21,0.3)", borderRadius: "12px", color: "#facc15", fontWeight: 800, fontSize: "0.95rem", cursor: "pointer" }}
            >
              🔄 تحديث QR Code
            </button>
          )}

          {(waStatus === "ready" || waStatus === "qr" || waStatus === "loading") && (
            <button
              type="button"
              onClick={async () => {
                if (!confirm("هل تريد قطع الاتصال ومسح الجلسة؟")) return;
                await fetch(`${API_BASE_URL}/api/whatsapp/logout`, {
                  method: "POST",
                  headers: { "Authorization": `Bearer ${token}` }
                });
                setWaStatus("disconnected");
                setWaQR(null);
              }}
              style={{ padding: "13px 20px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "12px", color: "#f87171", fontWeight: 800, fontSize: "0.9rem", cursor: "pointer" }}
            >
              🔌 قطع الاتصال
            </button>
          )}
        </div>
      </div>

      {/* Numbers management card */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", padding: "28px", backdropFilter: "blur(25px)" }}>
        <h3 style={{ fontWeight: 900, fontSize: "1rem", color: "#fff", marginBottom: "16px" }}>📋 أرقام واتساب التي ترسل إليها الإشعارات</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
          {whatsappNumbers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px dashed rgba(255,255,255,0.08)", color: "#64748b", fontSize: "0.88rem" }}>
              📭 لا توجد أرقام مضافة بعد
            </div>
          ) : whatsappNumbers.map((num, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(37,211,102,0.05)", border: "1px solid rgba(37,211,102,0.12)", padding: "12px 16px", borderRadius: "12px" }}>
              <span style={{ fontSize: "1rem" }}>💬</span>
              <span style={{ flex: 1, fontFamily: "monospace", color: "#34d399", fontWeight: "bold", direction: "ltr" }}>+{num}</span>
              <button
                type="button"
                onClick={async () => {
                  const updated = whatsappNumbers.filter((_, idx) => idx !== i);
                  setWhatsappNumbers(updated);
                  await fetch(`${API_BASE_URL}/api/settings`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify({ whatsapp_numbers: updated })
                  });
                }}
                className="action-btn btn-danger-premium"
                style={{ padding: "5px 10px" }}
              >
                حذف
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="tel"
            value={newWhatsappNumber}
            onChange={(e) => setNewWhatsappNumber(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="201012345678"
            className="search-input-premium"
            style={{ flex: 1, padding: "11px 14px", direction: "ltr", letterSpacing: "0.5px" }}
          />
          <button
            type="button"
            onClick={async () => {
              const clean = newWhatsappNumber.replace(/[^0-9]/g, "");
              if (clean.length < 8) { alert("يرجى إدخال رقم صحيح بالصيغة الدولية (مثال: 201012345678)"); return; }
              if (whatsappNumbers.includes(clean)) { alert("هذا الرقم مضاف بالفعل!"); return; }
              const updated = [...whatsappNumbers, clean];
              setWhatsappNumbers(updated);
              setNewWhatsappNumber("");
              await fetch(`${API_BASE_URL}/api/settings`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ whatsapp_numbers: updated })
              });
              alert("✅ تم حفظ الرقم!");
            }}
            style={{ padding: "11px 20px", background: "linear-gradient(135deg,#25d366,#128c7e)", border: "none", borderRadius: "12px", color: "#fff", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}
          >
            + إضافة
          </button>
        </div>
        <div style={{ marginTop: "8px", fontSize: "0.76rem", color: "#64748b" }}>
          الصيغة الدولية بدون + مثال: <span style={{ color: "#34d399", fontFamily: "monospace" }}>201012345678</span>
        </div>
      </div>

      {/* Info card */}
      <div style={{ background: "rgba(96,165,250,0.05)", border: "1px solid rgba(96,165,250,0.15)", borderRadius: "16px", padding: "20px", fontSize: "0.85rem", color: "#cbd5e1", lineHeight: "1.8" }}>
        <div style={{ fontWeight: "bold", color: "#60a5fa", marginBottom: "10px" }}>💡 كيف يعمل البوت تلقائياً؟</div>
        <ul style={{ paddingRight: "20px", margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
          <li>امسح QR Code بواتساب لربط الحساب</li>
          <li>عندما يرسل العميل طلب شحن: <strong>يُرسَل إليك الطلب + صورة الوصل تلقائياً</strong></li>
          <li>الرسالة تحتوي على: اسم العميل، المبلغ، العملة، رقم التحويل، رقم الطلب #ID</li>
          <li>راجع الطلب في <strong>طلبات شحن الرصيد</strong> واعتمده أو ارفضه</li>
          <li>إذا كان البوت غير متصل → يظهر للعميل خيار الإرسال اليدوي عبر واتساب</li>
        </ul>
      </div>
    </div>
  );
}
