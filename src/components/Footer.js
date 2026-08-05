"use client";

import React from "react";
import Link from "next/link";

export default function Footer({ siteName = "Arab Tech Server", siteLogo = "/logo.jpg" }) {
  return (
    <footer style={{
      background: "rgba(10, 15, 30, 0.95)",
      borderTop: "1px solid rgba(255, 255, 255, 0.05)",
      padding: "60px 20px 30px",
      marginTop: "auto",
      position: "relative",
      zIndex: 10,
      backdropFilter: "blur(20px)"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "40px" }}>
        
        {/* Top Section */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "40px", direction: "rtl" }}>
          
          {/* Brand & About */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <img src={siteLogo} alt={siteName} style={{ width: "45px", height: "45px", borderRadius: "12px", objectFit: "contain", border: "1px solid rgba(255,255,255,0.1)" }} />
              <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 900, background: "linear-gradient(135deg, #fff 0%, #a8b2d1 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {siteName}
              </h3>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: "1.7", margin: 0 }}>
              المنصة الرائدة لخدمات السيرفرات، أدوات السوفت وير، وتفعيل الباقات بأسعار تنافسية. نقدم خدمات احترافية لدعم أعمالك التقنية.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 800, marginBottom: "20px", position: "relative", display: "inline-block" }}>
              روابط سريعة
              <div style={{ position: "absolute", bottom: "-8px", right: 0, width: "40%", height: "2px", background: "var(--primary-color, #3b82f6)", borderRadius: "2px" }}></div>
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              <li><Link href="/" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.95rem", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "#fff"} onMouseLeave={e => e.target.style.color = "#94a3b8"}>الرئيسية</Link></li>
              <li><Link href="/services" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.95rem", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "#fff"} onMouseLeave={e => e.target.style.color = "#94a3b8"}>الخدمات</Link></li>
              <li><Link href="/wallet" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.95rem", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "#fff"} onMouseLeave={e => e.target.style.color = "#94a3b8"}>شحن الرصيد</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 800, marginBottom: "20px", position: "relative", display: "inline-block" }}>
              السياسات والشروط
              <div style={{ position: "absolute", bottom: "-8px", right: 0, width: "40%", height: "2px", background: "var(--primary-color, #3b82f6)", borderRadius: "2px" }}></div>
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              <li><Link href="/terms" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.95rem", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "#fff"} onMouseLeave={e => e.target.style.color = "#94a3b8"}>شروط الاستخدام</Link></li>
              <li><Link href="/privacy" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.95rem", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "#fff"} onMouseLeave={e => e.target.style.color = "#94a3b8"}>سياسة الخصوصية</Link></li>
              <li><Link href="/terms" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.95rem", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "#fff"} onMouseLeave={e => e.target.style.color = "#94a3b8"}>سياسة الاسترجاع</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 800, marginBottom: "20px", position: "relative", display: "inline-block" }}>
              تواصل معنا
              <div style={{ position: "absolute", bottom: "-8px", right: 0, width: "40%", height: "2px", background: "var(--primary-color, #3b82f6)", borderRadius: "2px" }}></div>
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#94a3b8", fontSize: "0.95rem" }}>
                <span style={{ background: "rgba(255,255,255,0.05)", padding: "8px", borderRadius: "8px" }}>✉️</span>
                arabtechserver@gmail.com
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#94a3b8", fontSize: "0.95rem" }}>
                <span style={{ background: "rgba(255,255,255,0.05)", padding: "8px", borderRadius: "8px" }}>💬</span>
                الدعم الفني عبر واتساب
              </div>
            </div>
          </div>

        </div>

        {/* Developer Credit Banner */}
        <div style={{
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 50%, rgba(139, 92, 246, 0.1) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "20px",
          padding: "24px 30px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justify-content: "space-between",
          gap: "20px",
          direction: "rtl",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(10px)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <div style={{
              width: "55px",
              height: "55px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
              display: "flex",
              alignItems: "center",
              justify-content: "center",
              fontSize: "1.8rem",
              boxShadow: "0 0 20px rgba(14, 165, 233, 0.4)",
              flexShrink: 0
            }}>
              👨‍💻
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 900, color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                تصميم وتطوير المبرمج: <span style={{ color: "#38bdf8" }}>مينا سمير</span> ✨
              </h4>
              <p style={{ margin: "6px 0 0", color: "#cbd5e1", fontSize: "0.9rem", lineHeight: "1.5" }}>
                هل تريد سيرفر أو موقع متجر إلكتروني احترافي متكامل مثل هذا المتجر لعملك؟ تواصل معي الآن لتحويل فكرتك إلى واقع بأعلى جودة! 🚀
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <a 
              href="https://portfolio-18f21.web.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                padding: "10px 20px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.88rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.3s ease"
              }}
            >
              🌐 معرض أعمالي
            </a>
            <a 
              href="https://wa.me/201279301263" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                padding: "10px 22px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                color: "#fff",
                fontWeight: 800,
                fontSize: "0.88rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 15px rgba(34, 197, 94, 0.4)",
                transition: "all 0.3s ease"
              }}
            >
              <span>💬</span> 01279301263
            </a>
          </div>
        </div>

        {/* Bottom Section */}
        <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "30px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0, textAlign: "center" }}>
            جميع الحقوق محفوظة © {new Date().getFullYear()} - {siteName}
          </p>
          <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            <span style={{ color: "#64748b", fontSize: "0.8rem" }}>
              Developed with ❤️ by <a href="https://portfolio-18f21.web.app/" target="_blank" rel="noopener noreferrer" style={{ color: "#38bdf8", textDecoration: "none", fontWeight: "bold" }}>Mina Samir</a>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
