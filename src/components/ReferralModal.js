"use client";
import React, { useState, useEffect } from "react";
import { Copy, Check, Share2, X } from "lucide-react";

export default function ReferralModal({ customerUser, API_BASE_URL }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [referralCount, setReferralCount] = useState(0);

  useEffect(() => {
    // Only show once per session or day? The prompt says "يظهر اعلان اول متفتح الموقع لازمن يكون مسجل" 
    // Meaning it shows when the site opens and they are registered. We will show it once per session.
    if (customerUser && !sessionStorage.getItem("referral_modal_shown")) {
      setIsOpen(true);
      sessionStorage.setItem("referral_modal_shown", "true");
    }

    if (customerUser) {
      // Fetch referral code if missing
      fetch(`${API_BASE_URL}/api/customer/referral-info`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('customer_token')}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.referral_code) setReferralCode(data.referral_code);
        setReferralCount(data.referral_count || 0);
      })
      .catch(e => console.error(e));
    }
  }, [customerUser, API_BASE_URL]);

  if (!isOpen || !customerUser) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const referralLink = `${origin}/?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `سجل عبر الرابط الخاص بي في الموقع واحصل على أفضل الخدمات!`;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 999999,
      background: "rgba(15, 23, 42, 0.85)",
      backdropFilter: "blur(10px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div className="glass-panel" style={{
        width: "100%",
        maxWidth: "500px",
        padding: "30px",
        borderRadius: "24px",
        border: "1px solid rgba(245, 158, 11, 0.5)",
        boxShadow: "0 25px 50px rgba(0,0,0,0.5), 0 0 40px rgba(245, 158, 11, 0.2)",
        position: "relative",
        background: "linear-gradient(180deg, var(--bg-glass-deep) 0%, rgba(20, 25, 40, 0.95) 100%)",
        textAlign: "center"
      }}>
        <button 
          onClick={() => setIsOpen(false)}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
        >
          <X size={24} />
        </button>

        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 10px 25px rgba(245, 158, 11, 0.4)' }}>
          <Share2 size={40} color="white" />
        </div>

        <h2 style={{ fontSize: "1.7rem", fontWeight: "900", color: "#fbbf24", marginBottom: "12px", textShadow: "0 2px 10px rgba(245, 158, 11, 0.3)" }}>
          مكافأة 5 دولار مجاناً! 🎁
        </h2>
        
        <p style={{ color: "var(--text-color)", fontSize: "1.05rem", lineHeight: "1.6", marginBottom: "24px" }}>
          شارك الموقع مع <strong style={{ color: '#10b981' }}>30 شخص</strong> للحصول على مكافأة <strong style={{ color: '#fbbf24' }}>5 دولار</strong> تضاف لمحفظتك تلقائياً بمجرد تسجيلهم عبر رابطك!
        </p>

        <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>عدد المسجلين عبر رابطك حالياً:</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#10b981' }}>
            {referralCount} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>/ 30</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginTop: '12px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, (referralCount / 30) * 100)}%`, height: '100%', background: '#10b981', transition: 'width 1s ease-in-out' }}></div>
          </div>
        </div>

        <div style={{ textAlign: "right", marginBottom: "8px", color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: "bold" }}>رابط الدعوة الخاص بك:</div>
        
        <div style={{
          display: "flex",
          alignItems: "center",
          background: "rgba(0, 0, 0, 0.5)",
          border: "1px solid var(--border-glass)",
          borderRadius: "12px",
          padding: "8px",
          gap: "8px"
        }}>
          <input 
            type="text" 
            readOnly 
            value={referralCode ? referralLink : "جاري تحميل الرابط..."} 
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: "var(--text-color)",
              outline: "none",
              padding: "8px",
              fontSize: "0.9rem",
              direction: "ltr",
              textAlign: "left"
            }}
          />
          <button 
            onClick={handleCopy}
            disabled={!referralCode}
            style={{
              background: copied ? "#10b981" : "var(--primary-color)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {copied ? <Check size={20} /> : <Copy size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
