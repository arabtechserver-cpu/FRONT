"use client";

import { useState } from "react";
import { API_BASE_URL } from "@/config";

export default function TransactionPasswordModal({ isOpen, onClose, onSuccess, title = "رمز المعاملات والقفل 🔒" }) {
  const [txPassword, setTxPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!txPassword.trim()) {
      setError("يرجى إدخال كلمة مرور المعاملات.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const token = localStorage.getItem("customer_token");
      const res = await fetch(`${API_BASE_URL}/api/customer/transaction-password/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ txPassword })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "كلمة مرور المعاملات غير صحيحة.");

      setSuccessMsg("تم التحقق بنجاح 🔓");
      setTimeout(() => {
        setTxPassword("");
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 600);
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء التحقق من كلمة مرور المعاملات.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 99999,
      background: "rgba(15, 23, 42, 0.85)",
      backdropFilter: "blur(12px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)",
        border: "2px solid #f59e0b",
        borderRadius: "24px",
        padding: "32px",
        maxWidth: "440px",
        width: "100%",
        boxShadow: "0 20px 50px rgba(245, 158, 11, 0.3)",
        textAlign: "center",
        color: "#ffffff"
      }}>
        <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🔒</div>
        <h3 style={{ fontSize: "1.4rem", fontWeight: "900", color: "#fbbf24", marginBottom: "8px" }}>
          {title}
        </h3>
        <p style={{ fontSize: "0.95rem", color: "#cbd5e1", marginBottom: "24px", lineHeight: "1.6" }}>
          لقد مضى أكثر من 30 دقيقة بدون استخدام. يرجى إدخال كلمة مرور المعاملات والقفل لمتابعة الشحن أو الطلب.
        </p>

        {error && (
          <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", color: "#fca5a5", padding: "10px 14px", borderRadius: "12px", fontSize: "0.9rem", marginBottom: "16px" }}>
            ⚠️ {error}
          </div>
        )}

        {successMsg && (
          <div style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid #10b981", color: "#6ee7b7", padding: "10px 14px", borderRadius: "12px", fontSize: "0.9rem", marginBottom: "16px" }}>
            ✓ {successMsg}
          </div>
        )}

        <form onSubmit={handleVerify}>
          <input
            type="password"
            placeholder="أدخل كلمة مرور المعاملات"
            value={txPassword}
            onChange={(e) => setTxPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "14px 18px",
              borderRadius: "14px",
              background: "rgba(255, 255, 255, 0.07)",
              border: "1px solid rgba(245, 158, 11, 0.4)",
              color: "#ffffff",
              fontSize: "1.1rem",
              textAlign: "center",
              letterSpacing: "4px",
              marginBottom: "20px",
              outline: "none"
            }}
            autoFocus
          />

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="submit"
              disabled={loading}
              className="btn-show-more-gold"
              style={{ flex: 1, padding: "12px", borderRadius: "14px", fontSize: "1rem" }}
            >
              {loading ? "جاري التحقق..." : "تأكيد وفتح 🔓"}
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "12px 20px",
                  borderRadius: "14px",
                  background: "rgba(255, 255, 255, 0.1)",
                  color: "#cbd5e1",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                إلغاء
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
