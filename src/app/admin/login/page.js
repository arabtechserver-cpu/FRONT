"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/config";
import Link from "next/link";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState({ site_name: "عرب تك سيرفر", site_logo: "/logo.jpg" });
  
  // 2FA OTP state
  const [requireOtp, setRequireOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const router = useRouter();

  // Fetch settings on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/settings`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setSettings(data);
        }
      })
      .catch(err => console.error("Failed to fetch settings", err));
  }, []);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      router.push("/admin/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "فشل تسجيل الدخول، يرجى التحقق من البيانات.");
      }

      // Check if 2FA OTP is required by server
      if (data.requireOtp) {
        setRequireOtp(true);
        setOtpMessage(data.message || "تم إرسال كود التحقق إلى واتساب الأرقام المسجلة.");
        setSubmitting(false);
        return;
      }

      // Store token directly if OTP is not enforced
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_user", JSON.stringify(data.user));

      router.push("/admin/dashboard");
    } catch (err) {
      setError(err.message || "تعذر الاتصال بالخادم، تأكد من تشغيل الباك إند.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setVerifyingOtp(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-login-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password, otp_code: otpCode })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "كود التحقق غير صحيح أو انتهت صلاحيته.");
      }

      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_user", JSON.stringify(data.user));

      router.push("/admin/dashboard");
    } catch (err) {
      setError(err.message || "فشل التحقق من كود الواتساب.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "20px" }}>
      <div className="glass-panel" style={{ width: "100%", maxWidth: "420px", display: "flex", flexDirection: "column", gap: "25px" }}>
        
        {/* Logo and title */}
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "inline-flex", justifyContent: "center", marginBottom: "15px" }}>
            {settings.site_logo && settings.site_logo !== "default" ? (
              <img 
                src={settings.site_logo.startsWith("http") || settings.site_logo.startsWith("/") || settings.site_logo.startsWith("data:") ? settings.site_logo : `${API_BASE_URL}${settings.site_logo}`} 
                alt={settings.site_name} 
                style={{ width: "60px", height: "60px", borderRadius: "12px", objectFit: "cover" }} 
              />
            ) : (
              <div className="logo-circle" style={{ width: "60px", height: "60px", fontSize: "2rem", borderRadius: "12px" }}>
                {settings.site_name ? settings.site_name.charAt(0) : "ع"}
              </div>
            )}
          </div>
          <h2 style={{ fontWeight: 800 }}>{requireOtp ? "🔒 التحقق الثنائي (2FA)" : "بوابة المشرفين الآمنة"}</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "5px" }}>
            {requireOtp ? "أمان عالي للموافقة على الدخول إلى لوحة التحكم" : `تسجيل دخول لوحة تحكم ${settings.site_name}`}
          </p>
        </div>

        <hr style={{ opacity: 0.1 }} />

        {!requireOtp ? (
          /* Step 1: Login Form */
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="username">اسم المستخدم:</label>
              <input
                id="username"
                type="text"
                placeholder="مثال: admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="password">كلمة المرور الحساسة:</label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: "100%", paddingLeft: "48px" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  className="password-toggle-btn"
                >
                  {showPassword ? "إخفاء" : "إظهار"}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ padding: "10px 14px", background: "rgba(239, 68, 68, 0.1)", borderRight: "4px solid var(--danger-color)", color: "var(--danger-color)", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "600" }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="glass-btn glass-btn-primary"
              style={{ padding: "12px", width: "100%", borderRadius: "12px", fontWeight: "700" }}
            >
              {submitting ? "جاري التحقق والتوقيع..." : "تسجيل الدخول الآمن"}
            </button>
          </form>
        ) : (
          /* Step 2: OTP Verification Form */
          <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ padding: "12px 14px", background: "rgba(34, 197, 94, 0.12)", border: "1px solid rgba(34, 197, 94, 0.3)", borderRadius: "10px", color: "#4ade80", fontSize: "0.88rem", lineHeight: "1.6", textAlign: "center" }}>
              📲 {otpMessage}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="otpCode" style={{ textAlign: "center", display: "block", fontWeight: "700", marginBottom: "8px", color: "var(--primary-color)" }}>
                أدخل كود التحقق المكون من 6 أرقام:
              </label>
              <input
                id="otpCode"
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
                  border: "2px solid var(--primary-color)",
                  color: "#fff"
                }}
                autoFocus
                required
              />
            </div>

            {error && (
              <div style={{ padding: "10px 14px", background: "rgba(239, 68, 68, 0.1)", borderRight: "4px solid var(--danger-color)", color: "var(--danger-color)", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "600" }}>
                ❌ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={verifyingOtp || otpCode.length < 6}
              className="glass-btn glass-btn-primary"
              style={{ padding: "14px", width: "100%", borderRadius: "12px", fontWeight: "800", fontSize: "1rem" }}
            >
              {verifyingOtp ? "جاري التحقق من الكود..." : "تأكيد الدخول إلى الداشبورد 🚀"}
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "5px" }}>
              <button
                type="button"
                onClick={(e) => handleSubmit(e)}
                style={{ background: "none", border: "none", color: "var(--primary-color)", cursor: "pointer", fontSize: "0.85rem", textDecoration: "underline" }}
              >
                🔄 إعادة إرسال كود جديد
              </button>
              <button
                type="button"
                onClick={() => { setRequireOtp(false); setOtpCode(""); setError(""); }}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.85rem" }}
              >
                رجوع لتسجيل الدخول
              </button>
            </div>
          </form>
        )}

        <hr style={{ opacity: 0.1 }} />

        <div style={{ textAlign: "center" }}>
          <Link href="/" style={{ fontSize: "0.85rem", color: "var(--primary-color)", fontWeight: "600" }}>
            ← العودة للموقع الرئيسي
          </Link>
        </div>

      </div>
    </div>
  );
}
