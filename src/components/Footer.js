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
              <img src="/logo.jpg" alt={`${siteName} online`} style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 2px 5px rgba(234,179,8,0.2))" }} />
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
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <a href="https://wa.me/249123667227" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "10px", color: "#34d399", fontSize: "0.95rem", textDecoration: "none", transition: "opacity 0.2s" }}>
                <span style={{ background: "rgba(34, 197, 94, 0.15)", padding: "6px 10px", borderRadius: "8px" }}>💬</span>
                <bdi dir="ltr" style={{ fontWeight: "bold" }}>+249 12 366 7227</bdi>
              </a>
              <a href="https://wa.me/16728972935" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "10px", color: "#94a3b8", fontSize: "0.95rem", textDecoration: "none", transition: "opacity 0.2s" }}>
                <span style={{ background: "rgba(255,255,255,0.05)", padding: "6px 10px", borderRadius: "8px" }}>💬</span>
                <bdi dir="ltr" style={{ fontWeight: "bold" }}>+1 (672) 897-2935</bdi>
              </a>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#94a3b8", fontSize: "0.95rem", marginTop: "4px" }}>
                <span style={{ background: "rgba(255,255,255,0.05)", padding: "6px 10px", borderRadius: "8px" }}>✉️</span>
                arabtechserver@gmail.com
              </div>
            </div>
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
