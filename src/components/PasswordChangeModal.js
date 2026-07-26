"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config";

export default function PasswordChangeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: Select Method, 2: Enter OTP, 3: New Password
  const [method, setMethod] = useState("email"); // email or telegram
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setStep(1);
      setError("");
      setSuccess("");
      setOtp("");
      setNewPassword("");
    };
    window.addEventListener("openPasswordChangeModal", handleOpen);
    return () => window.removeEventListener("openPasswordChangeModal", handleOpen);
  }, []);

  const closeModal = () => setIsOpen(false);

  const handleSendOTP = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("customer_token");
      const res = await fetch(`${API_BASE_URL}/api/customer/request-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ method })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      setStep(2);
      setSuccess("تم إرسال كود التحقق بنجاح.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTPAndChangePassword = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (!newPassword || newPassword.length < 6) {
        throw new Error("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
      }
      const token = localStorage.getItem("customer_token");
      const res = await fetch(`${API_BASE_URL}/api/customer/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ otp, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password");
      setSuccess("تم تغيير كلمة المرور بنجاح.");
      setStep(4); // success step
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10000 }}>
      <div style={{ background: "var(--bg-glass)", border: "var(--border-glass)", borderRadius: "16px", padding: "24px", width: "90%", maxWidth: "400px", color: "var(--text-main)", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.5)", position: "relative" }}>
        
        <button onClick={closeModal} style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: "30px", height: "30px", borderRadius: "50%", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "bold" }}>✕</button>

        <h3 style={{ marginTop: 0, marginBottom: "20px", fontSize: "1.3rem" }}>🔐 تغيير كلمة المرور</h3>

        {error && <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "10px", borderRadius: "8px", marginBottom: "15px", fontSize: "0.9rem" }}>{error}</div>}
        {success && step !== 4 && <div style={{ background: "rgba(34, 197, 94, 0.1)", color: "#22c55e", padding: "10px", borderRadius: "8px", marginBottom: "15px", fontSize: "0.9rem" }}>{success}</div>}

        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginBottom: "5px" }}>اختر وسيلة إرسال كود التحقق (OTP) لتأكيد هويتك:</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button 
                onClick={() => setMethod("email")}
                style={{ flex: 1, padding: "12px", borderRadius: "12px", border: method === "email" ? "2px solid var(--primary-color)" : "1px solid rgba(255,255,255,0.1)", background: method === "email" ? "rgba(99, 102, 241, 0.15)" : "transparent", cursor: "pointer", color: "var(--text-main)", fontWeight: "bold", transition: "0.3s" }}
              >
                📧 البريد الإلكتروني
              </button>
              <button 
                onClick={() => setMethod("telegram")}
                style={{ flex: 1, padding: "12px", borderRadius: "12px", border: method === "telegram" ? "2px solid #0088cc" : "1px solid rgba(255,255,255,0.1)", background: method === "telegram" ? "rgba(0, 136, 204, 0.15)" : "transparent", cursor: "pointer", color: "var(--text-main)", fontWeight: "bold", transition: "0.3s" }}
              >
                ✈️ تليجرام
              </button>
            </div>
            <button 
              onClick={handleSendOTP}
              disabled={loading}
              style={{ width: "100%", padding: "12px", background: "var(--primary-color)", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer", marginTop: "10px", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "جاري الإرسال..." : "إرسال كود التحقق"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <p style={{ fontSize: "0.95rem", color: "var(--text-muted)" }}>الرجاء إدخال كود التحقق المرسل لك، وكلمة المرور الجديدة:</p>
            
            <input 
              type="text" 
              placeholder="كود الـ OTP" 
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)", color: "#fff", textAlign: "center", fontSize: "1.2rem", letterSpacing: "2px" }}
            />
            
            <input 
              type="password" 
              placeholder="كلمة المرور الجديدة (6 أحرف على الأقل)" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)", color: "#fff" }}
            />

            <button 
              onClick={handleVerifyOTPAndChangePassword}
              disabled={loading}
              style={{ width: "100%", padding: "12px", background: "var(--primary-color)", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer", marginTop: "10px", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "جاري التغيير..." : "تأكيد وتغيير"}
            </button>
            
            <button 
              onClick={() => { setStep(1); setError(""); setSuccess(""); }}
              style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.85rem", textDecoration: "underline" }}
            >
              العودة
            </button>
          </div>
        )}

        {step === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px", alignItems: "center" }}>
            <div style={{ fontSize: "3rem", color: "#22c55e" }}>✅</div>
            <h4 style={{ margin: "10px 0", color: "#22c55e" }}>تم التغيير بنجاح!</h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>بإمكانك الآن استخدام كلمة المرور الجديدة لتسجيل الدخول.</p>
            <button 
              onClick={closeModal}
              style={{ width: "100%", padding: "12px", background: "var(--primary-color)", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }}
            >
              إغلاق
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
