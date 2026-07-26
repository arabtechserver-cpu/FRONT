"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config";
import Link from "next/link";

export default function WhatsAppPortalPage() {
  // Gate step: 1 (password), 2 (otp), 3 (portal access granted)
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");

  // Portal token after successful verification
  const [portalToken, setPortalToken] = useState("");

  // WhatsApp status & settings inside portal
  const [waStatus, setWaStatus] = useState("disconnected");
  const [qrCode, setQrCode] = useState(null);
  const [numbers, setNumbers] = useState([]);
  const [newNumber, setNewNumber] = useState("");
  const [portalPasswordSetting, setPortalPasswordSetting] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  // Check if session portal token exists on mount
  useEffect(() => {
    const savedToken = sessionStorage.getItem("wa_portal_token");
    if (savedToken) {
      setPortalToken(savedToken);
      setStep(3);
    }
  }, []);

  // Poll WhatsApp status when in Step 3
  useEffect(() => {
    if (step !== 3) return;

    const fetchStatusAndSettings = async () => {
      try {
        // Fetch WA status
        const resStatus = await fetch(`${API_BASE_URL}/api/whatsapp/status`);
        if (resStatus.ok) {
          const data = await resStatus.json();
          setWaStatus(data.status || "disconnected");
          setQrCode(data.qr || null);
        }

        // Fetch settings (to load numbers and portal password)
        const resSettings = await fetch(`${API_BASE_URL}/api/settings`);
        if (resSettings.ok) {
          const dataSettings = await resSettings.json();
          setNumbers(Array.isArray(dataSettings.whatsapp_numbers) ? dataSettings.whatsapp_numbers : []);
          setPortalPasswordSetting(dataSettings.whatsapp_portal_password || "");
        }
      } catch (err) {
        console.error("Failed to fetch WhatsApp portal status/settings:", err);
      }
    };

    fetchStatusAndSettings();
    const interval = setInterval(fetchStatusAndSettings, 5000);
    return () => clearInterval(interval);
  }, [step]);

  // Step 1: Submit Password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/whatsapp-portal/request-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "كلمة المرور غير صحيحة.");
      }

      if (data.requireOtp) {
        setInfoMessage(data.message || "تم إرسال كود التحقق إلى الواتساب.");
        setStep(2);
      } else {
        // Direct access granted (e.g. if OTP is not enforced yet because no numbers connected)
        setPortalToken(data.token);
        sessionStorage.setItem("wa_portal_token", data.token);
        setStep(3);
      }
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء طلب الوصول.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/whatsapp-portal/verify-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, otp_code: otpCode })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "كود التحقق غير صحيح أو منتهي الصلاحية.");
      }

      setPortalToken(data.token);
      sessionStorage.setItem("wa_portal_token", data.token);
      setStep(3);
    } catch (err) {
      setError(err.message || "فشل التحقق من الكود.");
    } finally {
      setLoading(false);
    }
  };

  // Restart / Reset WhatsApp session
  const handleRestartWA = async () => {
    if (!confirm("هل أنت متأكد من إعادة تشغيل خدمة الواتساب؟ سيتم توليد كود QR جديد للمسح.")) return;
    setLoading(true);
    try {
      await fetch(`${API_BASE_URL}/api/whatsapp/restart`, { method: "POST" });
      setWaStatus("disconnected");
      setQrCode(null);
      alert("تم طلب إعادة التشغيل بنجاح. انتظر ثوانٍ لظهور الكيو آر كود الجديد.");
    } catch (err) {
      alert("حدث خطأ أثناء إعادة التشغيل.");
    } finally {
      setLoading(false);
    }
  };

  // Add notification number
  const handleAddNumber = (e) => {
    e.preventDefault();
    const clean = newNumber.trim();
    if (!clean) return;
    if (numbers.includes(clean)) {
      alert("هذا الرقم مضاف بالفعل!");
      return;
    }
    setNumbers([...numbers, clean]);
    setNewNumber("");
  };

  // Remove notification number
  const handleRemoveNumber = (num) => {
    setNumbers(numbers.filter(n => n !== num));
  };

  // Save Settings (Numbers & Portal Password)
  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      // Get admin JWT from local storage (or if portal has admin rights)
      const adminToken = localStorage.getItem("admin_token");
      if (!adminToken) {
        alert("تنبيه: تحديث إعدادات الأرقام وكلمة المرور يتطلب تسجيل الدخول في الداشبورد الرئيسي أولاً كمشرف.");
      }

      const res = await fetch(`${API_BASE_URL}/api/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": adminToken ? `Bearer ${adminToken}` : ""
        },
        body: JSON.stringify({
          whatsapp_numbers: numbers,
          whatsapp_portal_password: portalPasswordSetting
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "فشل حفظ الإعدادات. تأكد من تسجيل دخولك كأدمن.");
      }

      alert("✅ تم حفظ إعدادات الواتساب وكلمة مرور البوابة بنجاح!");
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setSavingSettings(false);
    }
  };

  // Send test notification
  const handleSendTest = async (e) => {
    e.preventDefault();
    if (!testPhone.trim()) return;
    setSendingTest(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/whatsapp/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: testPhone.trim(), message: "🎉 إشعار تجريبي من بوابة إدارة الواتساب الآمنة (ArabTech Server)." })
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ تم إرسال الرسالة التجريبية بنجاح!");
        setTestPhone("");
      } else {
        alert(`❌ فشل الإرسال: ${data.message || "الواتساب غير متصل"}`);
      }
    } catch (err) {
      alert("❌ حدث خطأ أثناء إرسال الرسالة.");
    } finally {
      setSendingTest(false);
    }
  };

  // Logout from Portal
  const handlePortalLogout = () => {
    sessionStorage.removeItem("wa_portal_token");
    setPortalToken("");
    setStep(1);
    setPassword("");
    setOtpCode("");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px", background: "radial-gradient(circle at top right, rgba(16, 185, 129, 0.1), transparent 60%), var(--bg-main)" }}>
      <div className="glass-panel" style={{ width: "100%", maxWidth: step === 3 ? "850px" : "450px", transition: "max-width 0.3s ease", padding: "30px", borderRadius: "20px" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", marginBottom: "12px" }}>
            💬
          </div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: "800", color: "#fff" }}>بوابة إدارة الواتساب المنفصلة</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "6px" }}>
            إدارة جلسة الواتساب، مسح كيو آر كود (QR Code)، وأكواد التحقق الثنائي (OTP) لأمان السيرفر
          </p>
        </div>

        <hr style={{ opacity: 0.1, marginBottom: "25px" }} />

        {/* Step 1: Password Gate */}
        {step === 1 && (
          <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ padding: "14px", background: "rgba(59, 130, 246, 0.1)", borderRight: "4px solid #3b82f6", borderRadius: "8px", fontSize: "0.86rem", color: "#60a5fa", lineHeight: "1.6" }}>
              🔒 <strong>حماية البوابة المنفصلة:</strong> يرجى إدخال كلمة مرور بوابة الواتساب (أو كلمة مرور المشرف الرئيسي) للمتابعة.
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="portalPass" style={{ fontWeight: "700" }}>كلمة المرور الخاصة ببوابة الواتساب:</label>
              <input
                id="portalPass"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", padding: "12px", borderRadius: "10px", background: "rgba(0,0,0,0.3)" }}
                required
                autoFocus
              />
            </div>

            {error && (
              <div style={{ padding: "10px 14px", background: "rgba(239, 68, 68, 0.12)", borderRight: "4px solid var(--danger-color)", color: "var(--danger-color)", borderRadius: "8px", fontSize: "0.86rem", fontWeight: "600" }}>
                ❌ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="glass-btn glass-btn-primary"
              style={{ padding: "14px", width: "100%", borderRadius: "12px", fontWeight: "800", fontSize: "1rem" }}
            >
              {loading ? "جاري التحقق من كلمة المرور..." : "متابعة للدخول الآمن ←"}
            </button>
          </form>
        )}

        {/* Step 2: OTP Gate */}
        {step === 2 && (
          <form onSubmit={handleOtpSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ padding: "14px", background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "10px", color: "#4ade80", fontSize: "0.88rem", lineHeight: "1.6", textAlign: "center" }}>
              📲 {infoMessage || "تم إرسال كود تحقق من 6 أرقام على الواتساب. يرجى إدخاله لفتح البوابة."}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="otpInput" style={{ textAlign: "center", display: "block", fontWeight: "700", marginBottom: "8px", color: "#10b981" }}>
                أدخل كود التحقق (OTP):
              </label>
              <input
                id="otpInput"
                type="text"
                placeholder="1 2 3 4 5 6"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                style={{
                  width: "100%",
                  textAlign: "center",
                  fontSize: "1.6rem",
                  letterSpacing: "8px",
                  fontWeight: "800",
                  padding: "12px",
                  borderRadius: "12px",
                  background: "rgba(0, 0, 0, 0.3)",
                  border: "2px solid #10b981",
                  color: "#fff"
                }}
                autoFocus
                required
              />
            </div>

            {error && (
              <div style={{ padding: "10px 14px", background: "rgba(239, 68, 68, 0.12)", borderRight: "4px solid var(--danger-color)", color: "var(--danger-color)", borderRadius: "8px", fontSize: "0.86rem", fontWeight: "600" }}>
                ❌ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || otpCode.length < 6}
              className="glass-btn glass-btn-primary"
              style={{ padding: "14px", width: "100%", borderRadius: "12px", fontWeight: "800", fontSize: "1rem" }}
            >
              {loading ? "جاري التحقق من الكود..." : "تأكيد وفتح البوابة 🔓"}
            </button>

            <div style={{ textAlign: "center" }}>
              <button
                type="button"
                onClick={() => { setStep(1); setOtpCode(""); setError(""); }}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.85rem", textDecoration: "underline" }}
              >
                ← العودة لإدخال كلمة المرور
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Portal Dashboard */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            
            {/* Top Status Bar */}
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "15px", padding: "16px 20px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "14px", border: "1px solid rgba(255, 255, 255, 0.07)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  background: waStatus === "ready" ? "#10b981" : waStatus === "qr" ? "#f59e0b" : "#ef4444",
                  boxShadow: waStatus === "ready" ? "0 0 10px #10b981" : "none",
                  display: "inline-block"
                }} />
                <div>
                  <div style={{ fontWeight: "800", fontSize: "1rem" }}>
                    الحالة الحالية: {waStatus === "ready" ? "متصل وشغال ✅" : waStatus === "qr" ? "بانتظار مسح كود QR 📱" : "غير متصل / جاري التهيئة ⏳"}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    يتم التحديث تلقائياً كل 5 ثوانٍ من السيرفر المحلي
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={handleRestartWA}
                  disabled={loading}
                  className="glass-btn"
                  style={{ padding: "8px 15px", fontSize: "0.85rem", background: "rgba(239, 68, 68, 0.15)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.3)" }}
                >
                  🔄 مسح الجلسة وإعادة تشغيل
                </button>
                <button
                  type="button"
                  onClick={handlePortalLogout}
                  className="glass-btn"
                  style={{ padding: "8px 15px", fontSize: "0.85rem" }}
                >
                  🔒 خروج من البوابة
                </button>
              </div>
            </div>

            {/* QR Code Section */}
            {waStatus === "qr" && qrCode && (
              <div style={{ textAlign: "center", padding: "25px", background: "rgba(0,0,0,0.4)", borderRadius: "16px", border: "2px dashed rgba(245, 158, 11, 0.4)" }}>
                <h3 style={{ color: "#fbbf24", marginBottom: "10px", fontWeight: "800" }}>📱 امسح الكيو آر كود (QR Code) الآن</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.86rem", marginBottom: "20px" }}>
                  افتح تطبيق واتساب في هاتفك ← الأجهزة المرتبطة ← ربط جهاز، ثم وجه الكاميرا على الكود أدناه:
                </p>
                <div style={{ display: "inline-block", padding: "15px", background: "#fff", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}>
                  <img src={qrCode} alt="WhatsApp QR Code" style={{ width: "260px", height: "260px", display: "block" }} />
                </div>
              </div>
            )}

            {/* Numbers & Portal Settings Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              
              {/* Phone Numbers Setting */}
              <div style={{ padding: "20px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", flexDirection: "column", gap: "15px" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                  📞 أرقام استلام الإشعارات و OTP
                </h3>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                  الأرقام المسجلة هنا هي التي يصلها أكواد الـ OTP عند طلب أي عمليات حذف أو دخول للداشبورد.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "150px", overflowY: "auto" }}>
                  {numbers.length === 0 ? (
                    <div style={{ padding: "10px", background: "rgba(245, 158, 11, 0.1)", borderRadius: "8px", fontSize: "0.82rem", color: "#fbbf24" }}>
                      ⚠️ لا توجد أرقام مسجلة بعد! أضف رقمك (مع كود الدولة مثل 201xxxxxxxxx).
                    </div>
                  ) : (
                    numbers.map((num, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(0,0,0,0.3)", borderRadius: "8px" }}>
                        <span style={{ fontWeight: "700", color: "#fff", direction: "ltr" }}>{num}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveNumber(num)}
                          style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontWeight: "700", fontSize: "0.9rem" }}
                        >
                          حذف ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddNumber} style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
                  <input
                    type="text"
                    placeholder="2010xxxxxxxx"
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                  <button type="submit" className="glass-btn" style={{ padding: "8px 14px", background: "var(--primary-color)", color: "#fff", fontWeight: "700" }}>
                    + إضافة
                  </button>
                </form>
              </div>

              {/* Portal Dedicated Password & Test */}
              <div style={{ padding: "20px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", flexDirection: "column", gap: "15px" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                  🔐 تغيير كلمة مرور بوابة الواتساب
                </h3>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                  تخصيص كلمة مرور مستقلة لهذه الصفحة فقط (غير كلمة مرور المشرف الرئيسي).
                </p>

                <div>
                  <label htmlFor="portalPassChange" style={{ display: "block", fontSize: "0.85rem", marginBottom: "6px", fontWeight: "600" }}>
                    كلمة مرور البوابة الجديدة:
                  </label>
                  <input
                    id="portalPassChange"
                    type="text"
                    placeholder="اتركه فارغاً لاستخدام كلمة مرور الأدمن"
                    value={portalPasswordSetting}
                    onChange={(e) => setPortalPasswordSetting(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="glass-btn glass-btn-primary"
                  style={{ width: "100%", padding: "12px", borderRadius: "10px", fontWeight: "700", marginTop: "auto" }}
                >
                  {savingSettings ? "جاري الحفظ..." : "💾 حفظ الأرقام وكلمة المرور"}
                </button>
              </div>

            </div>

            {/* Test Notification Bar */}
            <div style={{ padding: "18px 20px", background: "rgba(16, 185, 129, 0.06)", borderRadius: "16px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#34d399", marginBottom: "10px" }}>
                🧪 إرسال رسالة تجريبية للتأكد من ربط البوت
              </h4>
              <form onSubmit={handleSendTest} style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  placeholder="رقم الهاتف لاختبار الإرسال (مثال: 201xxxxxxxxx)"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  style={{ flex: 1, padding: "10px 14px", borderRadius: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)" }}
                  required
                />
                <button
                  type="submit"
                  disabled={sendingTest || !testPhone.trim()}
                  className="glass-btn"
                  style={{ padding: "10px 20px", background: "#10b981", color: "#fff", fontWeight: "700", borderRadius: "10px" }}
                >
                  {sendingTest ? "جاري الإرسال..." : "🚀 إرسال الآن"}
                </button>
              </form>
            </div>

          </div>
        )}

        <hr style={{ opacity: 0.1, margin: "25px 0 15px" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
          <Link href="/admin/dashboard" style={{ color: "var(--primary-color)", fontWeight: "600" }}>
            ← الانتقال للداشبورد الرئيسي
          </Link>
          <Link href="/" style={{ color: "var(--text-muted)" }}>
            الصفحة الرئيسية للموقع
          </Link>
        </div>

      </div>
    </div>
  );
}
