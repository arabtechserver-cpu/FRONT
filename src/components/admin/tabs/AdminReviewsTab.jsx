"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config";

export default function AdminReviewsTab({ token }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Form state
  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [countryCode, setCountryCode] = useState("EG"); // Default to Egypt

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleAddReview = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!customerName || !comment) {
      setErrorMsg("يرجى ملء جميع الحقول المطلوبة.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: customerName,
          rating: rating,
          review: comment,
          country_code: countryCode
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "فشل إضافة الرأي.");

      setSuccessMsg("تم إضافة رأي العميل بنجاح!");
      setCustomerName("");
      setComment("");
      setRating(5);
      setCountryCode("EG");
      fetchReviews();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الرأي؟")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("فشل حذف الرأي.");
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="tab-content" dir="rtl">
      <div className="glass-panel" style={{ padding: "24px", borderRadius: "20px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#fff", marginBottom: "16px" }}>إضافة رأي جديد</h2>
        
        <form onSubmit={handleAddReview} style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "30px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>اسم العميل:</label>
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required placeholder="مثال: أحمد محمد" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>كود الدولة (للعلم):</label>
              <input type="text" value={countryCode} onChange={(e) => setCountryCode(e.target.value)} placeholder="مثال: EG, SA, AE" maxLength={2} style={{ textTransform: "uppercase" }} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>التقييم (من 1 إلى 5):</label>
            <input type="number" min="1" max="5" value={rating} onChange={(e) => setRating(parseInt(e.target.value))} required />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>التعليق:</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} required placeholder="رأي العميل في الخدمة..."></textarea>
          </div>

          {errorMsg && <div style={{ color: "#ef4444", padding: "10px", background: "rgba(239, 68, 68, 0.1)", borderRadius: "8px" }}>{errorMsg}</div>}
          {successMsg && <div style={{ color: "#10b981", padding: "10px", background: "rgba(16, 185, 129, 0.1)", borderRadius: "8px" }}>{successMsg}</div>}

          <button type="submit" className="glass-btn primary" style={{ padding: "12px", fontSize: "1rem" }}>+ إضافة الرأي</button>
        </form>

        <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#fff", marginBottom: "16px", marginTop: "40px" }}>الآراء الحالية</h2>
        
        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>جاري التحميل...</div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>لا توجد آراء مسجلة حتى الآن.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "15px" }}>
            {reviews.map(review => (
              <div key={review.id} style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ color: "#fff", fontSize: "1.1rem" }}>{review.name}</strong>
                  <span style={{ fontSize: "1.2rem" }}>{"⭐".repeat(review.rating)}</span>
                </div>
                <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", flex: 1 }}>{review.review}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "10px" }}>
                  <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>دولة: {review.country_code || "N/A"}</span>
                  <button onClick={() => handleDeleteReview(review.id)} style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)", padding: "4px 8px", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer" }}>حذف</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
