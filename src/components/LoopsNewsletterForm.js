"use client";

import { useState } from "react";

export default function LoopsNewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error, rateLimit
  const [errorMessage, setErrorMessage] = useState("");

  const FORM_ACTION_URL = "https://app.loops.so/api/newsletter-form/cmrulxcnp00he0i0ommjwznbf";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.trim()) return;

    // Rate limiting check
    const now = Date.now();
    const prevTimestamp = localStorage.getItem("loops-form-timestamp");
    if (prevTimestamp && Number(prevTimestamp) + 60000 > now) {
      setStatus("rateLimit");
      setErrorMessage("لقد قمت بالاشتراك مؤخراً، يرجى الانتظار دقيقة واحدة قبل المحاولة مجدداً.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    const formBody = "userGroup=&mailingLists=&email=" + encodeURIComponent(email.trim());

    try {
      const res = await fetch(FORM_ACTION_URL, {
        method: "POST",
        body: formBody,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (res.ok) {
        localStorage.setItem("loops-form-timestamp", now.toString());
        setStatus("success");
        setEmail("");
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus("error");
        setErrorMessage(data.message || "حدث خطأ أثناء الاشتراك، يرجى المحاولة لاحقاً.");
      }
    } catch (err) {
      console.error("Loops form error:", err);
      if (err.message === "Failed to fetch") {
        setStatus("rateLimit");
        setErrorMessage("تعذر الاتصال بالسيرفر، يرجى المحاولة لاحقاً.");
      } else {
        setStatus("error");
        setErrorMessage(err.message || "حدث خطأ أثناء الاتصال بالخدمة.");
      }
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setErrorMessage("");
  };

  return (
    <div className="loops-newsletter-container" style={{ width: "100%", marginTop: "15px" }}>
      <h4 className="footer-title" style={{ marginBottom: "8px" }}>📬 اشترك في النشرة البريدية</h4>
      <p className="footer-desc" style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "12px" }}>
        احصل على أحدث التحديثات والعروض الحصرية مباشرة على بريدك الإلكتروني.
      </p>

      {status === "success" ? (
        <div style={{
          background: "rgba(34, 197, 94, 0.15)",
          border: "1px solid #22c55e",
          borderRadius: "8px",
          padding: "12px",
          textAlign: "center",
          color: "#4ade80",
          fontSize: "0.9rem",
          fontWeight: "600"
        }}>
          ✅ تم الاشتراك بنجاح! شكراً لانضمامك إلينا ❤️
        </div>
      ) : status === "rateLimit" || status === "error" ? (
        <div>
          <div style={{
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid #ef4444",
            borderRadius: "8px",
            padding: "10px",
            textAlign: "center",
            color: "#fca5a5",
            fontSize: "0.85rem",
            marginBottom: "8px"
          }}>
            ⚠️ {errorMessage || "حدث خطأ ما."}
          </div>
          <button
            type="button"
            onClick={handleReset}
            style={{
              background: "transparent",
              border: "none",
              color: "#60a5fa",
              cursor: "pointer",
              fontSize: "0.85rem",
              textDecoration: "underline",
              display: "block",
              margin: "0 auto"
            }}
          >
            ← محاولة مرة أخرى
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@gmail.com"
            required
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #334155",
              background: "#0f172a",
              color: "#f8fafc",
              fontSize: "0.9rem",
              outline: "none",
              boxSizing: "border-box"
            }}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            style={{
              width: "100%",
              padding: "10px 16px",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "#ffffff",
              fontWeight: "700",
              fontSize: "0.9rem",
              cursor: status === "loading" ? "not-allowed" : "pointer",
              opacity: status === "loading" ? 0.7 : 1,
              transition: "all 0.2s ease"
            }}
          >
            {status === "loading" ? "جاري الاشتراك..." : "اشترك الآن 🚀"}
          </button>
        </form>
      )}
    </div>
  );
}
