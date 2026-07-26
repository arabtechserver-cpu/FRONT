"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config";

export default function GmailTab() {
  const [emailUser, setEmailUser] = useState("");
  const [emailPass, setEmailPass] = useState("");
  const [testEmailInput, setTestEmailInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [testSuccess, setTestSuccess] = useState("");
  const [testError, setTestError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token") || sessionStorage.getItem("admin_token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE_URL}/api/settings`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setEmailUser(data.email_user || "");
          setEmailPass(data.email_pass || "");
          if (data.email_user) {
            setTestEmailInput(data.email_user);
          }
        }
      })
      .catch(err => console.error("Error fetching settings:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveCredentials = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const token = localStorage.getItem("admin_token") || sessionStorage.getItem("admin_token");
    if (!token) {
      setError("يرجى تسجيل الدخول كأدمن أولاً من لوحة التحكم.");
      return;
    }

    if (!emailUser.trim() || !emailPass.trim()) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة مرور التطبيقات معاً.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          email_user: emailUser.trim(),
          email_pass: emailPass.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "فشل حفظ بيانات الربط");
      }

      setSuccess("🚀 تم حفظ وتحديث بيانات ربط Gmail بنجاح في السيرفر!");
      if (!testEmailInput) setTestEmailInput(emailUser.trim());
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء حفظ الإعدادات.");
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    setTestError("");
    setTestSuccess("");
    const token = localStorage.getItem("admin_token") || sessionStorage.getItem("admin_token");
    if (!token) {
      setTestError("يرجى تسجيل الدخول كأدمن لإرسال رسالة تجريبية.");
      return;
    }

    if (!testEmailInput.trim()) {
      setTestError("يرجى إدخال البريد الإلكتروني المستلم للتجربة.");
      return;
    }

    setTesting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings/test-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ testEmail: testEmailInput.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "فشل إرسال الرسالة التجريبية");
      }

      setTestSuccess(`🎉 ${data.message}`);
    } catch (err) {
      setTestError(err.message || "تعذر إرسال الرسالة التجريبية. تأكد من صحة كلمة مرور التطبيقات وأن الحساب مفعّل.");
    } finally {
      setTesting(false);
    }
  };

  const isConnected = Boolean(emailUser && emailPass && emailPass.length >= 12);

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>⏳ جاري جلب حالة اتصال Gmail...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Top Status Alert */}
      <div style={{ background: isConnected ? "rgba(16, 185, 129, 0.08)" : "rgba(245, 158, 11, 0.08)", border: `1px solid ${isConnected ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"}`, borderRadius: "20px", padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: isConnected ? "#10b981" : "#f59e0b", boxShadow: `0 0 16px ${isConnected ? "#10b981" : "#f59e0b"}` }} />
          <div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: isConnected ? "#34d399" : "#fbbf24" }}>
              {isConnected ? "🟢 خادم الإيميل متصل وجاهز للإرسال الفوري" : "⚠️ البريد الإلكتروني غير متصل أو غير مفعّل"}
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#ffffff", margin: "4px 0 0" }}>
              {isConnected 
                ? `يتم الآن إرسال جميع الإشعارات وأكواد التحقق (OTP) للعملاء تلقائياً عبر: ${emailUser}`
                : "يرجى إدخال بريد Gmail وكلمة مرور التطبيقات (App Password) أدناه لتفعيل إرسال الأكواد والإشعارات."
              }
            </p>
          </div>
        </div>
        <div style={{ padding: "8px 16px", borderRadius: "10px", background: isConnected ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)", color: isConnected ? "#34d399" : "#fbbf24", fontWeight: 900, fontSize: "0.85rem" }}>
          {isConnected ? "✓ متصل ويعمل 100%" : "❌ يحتاج إعداد"}
        </div>
      </div>

      {/* Two Column Grid: Credentials & Test Box */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        
        {/* Credentials Box */}
        <div className="glass-panel" style={{ padding: "26px", borderRadius: "22px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "14px" }}>
            <span style={{ fontSize: "1.4rem" }}>🔐</span>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "#ffffff" }}>إعدادات الربط الرسمية (SMTP Credentials)</h3>
          </div>

          <form onSubmit={handleSaveCredentials} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 700, color: "#ffffff", marginBottom: "8px" }}>
                البريد الإلكتروني (Gmail):
              </label>
              <input
                type="email"
                placeholder="example@gmail.com"
                value={emailUser}
                onChange={(e) => setEmailUser(e.target.value)}
                className="white-text-input"
                style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: "0.95rem", direction: "ltr", textAlign: "left" }}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 700, color: "#ffffff", marginBottom: "8px" }}>
                كلمة مرور التطبيقات (App Password - 16 حرف):
              </label>
              <input
                type="password"
                placeholder="xxxx xxxx xxxx xxxx"
                value={emailPass}
                onChange={(e) => setEmailPass(e.target.value)}
                className="white-text-input"
                style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: "1.1rem", direction: "ltr", textAlign: "left", letterSpacing: "2px" }}
                required
              />
              <span style={{ display: "block", fontSize: "0.75rem", color: "#ffffff", marginTop: "6px" }}>
                💡 لا تستخدم كلمة سر الجميل العادية. استخدم كلمة مرور التطبيقات المكونة من 16 حرف.
              </span>
            </div>

            {error && (
              <div style={{ padding: "12px", background: "rgba(244, 63, 94, 0.12)", borderRight: "4px solid #f43f5e", borderRadius: "10px", color: "#fda4af", fontSize: "0.85rem", fontWeight: 600 }}>
                ⚠️ {error}
              </div>
            )}

            {success && (
              <div style={{ padding: "12px", background: "rgba(16, 185, 129, 0.12)", borderRight: "4px solid #10b981", borderRadius: "10px", color: "#6ee7b7", fontSize: "0.85rem", fontWeight: 600 }}>
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="glass-btn glass-btn-primary"
              style={{ padding: "14px", borderRadius: "14px", fontWeight: 800, fontSize: "1rem", marginTop: "8px", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", border: "none", cursor: "pointer" }}
            >
              {saving ? "⏳ جاري الحفظ والتفعيل..." : "🚀 حفظ الإعدادات وتفعيل الربط"}
            </button>
          </form>
        </div>

        {/* Instant Test Box */}
        <div className="glass-panel" style={{ padding: "26px", borderRadius: "22px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "14px" }}>
            <span style={{ fontSize: "1.4rem" }}>🧪</span>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "#ffffff" }}>اختبار وتجربة الإرسال الفوري (Live Test)</h3>
          </div>

          <p style={{ fontSize: "0.88rem", color: "#ffffff", lineHeight: 1.6, margin: 0 }}>
            أرسل رسالة تحقق تجريبية فوراً لتتأكد من أن السيرفر قادر على الإرسال إلى صندوق الوارد في الجميل بسرعة وبدون حظر.
          </p>

          <form onSubmit={handleSendTestEmail} style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1, justifyContent: "flex-end" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 700, color: "#ffffff", marginBottom: "8px" }}>
                البريد الإلكتروني التجريبي للاستلام:
              </label>
              <input
                type="email"
                placeholder="أدخل بريد الاستلام للاختبار"
                value={testEmailInput}
                onChange={(e) => setTestEmailInput(e.target.value)}
                className="white-text-input"
                style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: "0.95rem", direction: "ltr", textAlign: "left" }}
                required
              />
            </div>

            {testError && (
              <div style={{ padding: "12px", background: "rgba(244, 63, 94, 0.12)", borderRight: "4px solid #f43f5e", borderRadius: "10px", color: "#fda4af", fontSize: "0.85rem", fontWeight: 600 }}>
                ⚠️ {testError}
              </div>
            )}

            {testSuccess && (
              <div style={{ padding: "12px", background: "rgba(16, 185, 129, 0.12)", borderRight: "4px solid #10b981", borderRadius: "10px", color: "#6ee7b7", fontSize: "0.85rem", fontWeight: 600 }}>
                {testSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={testing || !isConnected}
              className="glass-btn"
              style={{ padding: "14px", borderRadius: "14px", fontWeight: 800, fontSize: "1rem", marginTop: "8px", background: isConnected ? "rgba(16, 185, 129, 0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${isConnected ? "rgba(16, 185, 129, 0.4)" : "rgba(255,255,255,0.1)"}`, color: isConnected ? "#34d399" : "#ffffff", cursor: isConnected ? "pointer" : "not-allowed" }}
            >
              {testing ? "📨 جاري إرسال التجربة الآن..." : "📨 إرسال رسالة بريد تجريبية الآن"}
            </button>
          </form>
        </div>

      </div>

      {/* Step-by-Step Instructions */}
      <div className="glass-panel" style={{ padding: "28px", borderRadius: "22px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "16px" }}>
          <span style={{ fontSize: "1.6rem" }}>📖</span>
          <div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 900, margin: 0, color: "#38bdf8" }}>دليل استخراج &quot;كلمة مرور التطبيقات (App Password)&quot; في 3 خطوات بسيطة</h3>
            <p style={{ fontSize: "0.82rem", color: "#ffffff", margin: "4px 0 0" }}>كيف تحصل على الكود المكون من 16 حرف من حساب جوجل بدون تعطيل الأمان</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "18px" }}>
          {[
            {
              step: "1️⃣ الخطوة الأولى",
              title: "الدخول على إعدادات الأمان",
              desc: "ادخل على حساب Google الخاص بك (myaccount.google.com)، ثم اضغط من القائمة الجانبية على تبويب (الأمان - Security)."
            },
            {
              step: "2️⃣ الخطوة الثانية",
              title: "تفعيل التحقق بخطوتين",
              desc: "تأكد أن خاصية (التحقق بخطوتين - 2-Step Verification) مفعّلة في حسابك. إذا كانت غير مفعلة، قم بتفعيلها برقم هاتفك أولاً."
            },
            {
              step: "3️⃣ الخطوة الثالثة",
              title: "إنشاء كلمة مرور التطبيقات",
              desc: "ابحث في شريط بحث إعدادات جوجل عن (كلمات مرور التطبيقات - App Passwords). اضغط إنشاء واكتب اسم التطبيق ArabTech وانسخ الـ 16 حرف هنا."
            }
          ].map((card, idx) => (
            <div key={idx} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "18px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#38bdf8", background: "rgba(56, 189, 248, 0.1)", padding: "4px 10px", borderRadius: "8px", width: "fit-content" }}>
                {card.step}
              </span>
              <h4 style={{ fontSize: "1.02rem", fontWeight: 800, margin: "4px 0 0", color: "#ffffff" }}>{card.title}</h4>
              <p style={{ fontSize: "0.84rem", color: "#ffffff", lineHeight: 1.6, margin: 0 }}>{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
