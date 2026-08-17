"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

const paymentMethodsList = [
  {
    name: "USDT TRC20",
    nameAr: "USDT تيذر",
    badge: "Crypto",
    color: "#26A17B",
    bg: "rgba(38, 161, 123, 0.12)",
    border: "rgba(38, 161, 123, 0.35)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="16" fill="#26A17B"/>
        <path d="M17.9 14.5c-.1 0-1 .1-1.9.1-1 0-1.7-.1-1.9-.1v-2.3h7.8V9.4h-19v2.8h7.4v2.3c-.3 0-1.1.1-2 .1-.9 0-1.8-.1-1.9-.1-4.4-.2-7.7-1.1-7.7-2.1 0-1.1 3.3-1.9 7.7-2.1v3.3c.3 0 1.2.1 2 .1.9 0 1.7-.1 2-.1V10.4c4.4.2 7.7 1.1 7.7 2.1-.1 1.1-3.4 1.9-7.8 2.1zm0 1c4.3-.2 7.5-1 7.5-2 0-.2-.1-.4-.4-.6-1.1 1-4 1.8-7.1 1.9v7.9h-3.8v-7.9c-3.1-.1-6-.9-7.1-1.9-.3.2-.4.4-.4.6 0 1 3.2 1.8 7.5 2v7.9h3.8v-7.9z" fill="#fff"/>
      </svg>
    )
  },
  {
    name: "Binance Pay",
    nameAr: "بايننس باي",
    badge: "Instant",
    color: "#F3BA2F",
    bg: "rgba(243, 186, 47, 0.12)",
    border: "rgba(243, 186, 47, 0.35)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="16" fill="#181A20"/>
        <path d="M16 6.5l3.2 3.2-3.2 3.2-3.2-3.2L16 6.5zm-6.3 6.3l3.2 3.2-3.2 3.2-3.2-3.2 3.2-3.2zm12.6 0l3.2 3.2-3.2 3.2-3.2-3.2 3.2-3.2zM16 19.1l3.2 3.2-3.2 3.2-3.2-3.2 3.2-3.2zm0-4.3l2.1 2.1-2.1 2.1-2.1-2.1 2.1-2.1z" fill="#F3BA2F"/>
      </svg>
    )
  },
  {
    name: "Bitcoin (BTC)",
    nameAr: "بيتكوين",
    badge: "Crypto",
    color: "#F7931A",
    bg: "rgba(247, 147, 26, 0.12)",
    border: "rgba(247, 147, 26, 0.35)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="16" fill="#F7931A"/>
        <path d="M22.7 13.7c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.6-.4-.7 2.6c-.4-.1-.9-.2-1.3-.3l.7-2.7-1.7-.4-.7 2.7c-.4-.1-.7-.2-1.1-.2l-2.3-.6-.4 1.8s1 .2 1 .2c.5.1.8.4.7.7l-1.8 7.2c-.1.2-.3.4-.6.3 0 0-1-.2-1-.2l-.9 2 2.2.5c.4.1.8.2 1.2.3l-.7 2.8 1.6.4.7-2.7c.4.1.9.2 1.3.3l-.7 2.7 1.7.4.7-2.7c2.8.5 4.9.3 5.8-2.2.7-2-.1-3.2-1.5-3.9 1.1-.3 1.9-1 2.1-2.4zm-3.8 5.2c-.5 2.1-4 1-5.1.7l.9-3.7c1.1.3 4.7.8 4.2 3zm.5-5.3c-.5 1.9-3.4.9-4.3.7l.8-3.3c.9.2 3.9.7 3.5 2.6z" fill="#fff"/>
      </svg>
    )
  },
  {
    name: "Visa Card",
    nameAr: "فيزا كارد",
    badge: "Cards",
    color: "#2563EB",
    bg: "rgba(37, 99, 235, 0.12)",
    border: "rgba(37, 99, 235, 0.35)",
    icon: (
      <svg width="24" height="22" viewBox="0 0 36 24" fill="none">
        <rect width="36" height="24" rx="4" fill="#0D1B2A"/>
        <path d="M14.2 16.5l1.9-11.8h2.9l-1.9 11.8h-2.9zm11.3-11.5c-.6-.2-1.5-.4-2.7-.4-3 0-5.1 1.6-5.1 3.8 0 1.7 1.5 2.6 2.6 3.1 1.2.6 1.6.9 1.6 1.5 0 .8-1 1.2-1.9 1.2-1.3 0-2-.2-3-.6l-.4-.2-.4 2.6c.7.3 2 .6 3.4.6 3.2 0 5.3-1.6 5.3-4 0-1.3-.8-2.4-2.6-3.2-1.1-.5-1.7-.9-1.7-1.4 0-.5.6-1 1.8-1 1 0 1.8.2 2.4.5l.3.1.4-2.6zm7.2 0h-2.3c-.7 0-1.3.2-1.6 1l-4.5 10.8h3.1l.6-1.7h3.8l.4 1.7h2.7l-2.2-11.8zm-3.9 7.7l1.6-4.3.9 4.3h-2.5zM11.6 4.7l-2.8 8-0.3-1.5c-.5-1.7-2.1-3.6-3.9-4.5l2.6 9.8h3.1l4.6-11.8h-3.3z" fill="#F7B600"/>
      </svg>
    )
  },
  {
    name: "MasterCard",
    nameAr: "ماستركارد",
    badge: "Cards",
    color: "#EB001B",
    bg: "rgba(235, 0, 27, 0.12)",
    border: "rgba(235, 0, 27, 0.35)",
    icon: (
      <svg width="24" height="22" viewBox="0 0 36 24" fill="none">
        <rect width="36" height="24" rx="4" fill="#141414"/>
        <circle cx="14" cy="12" r="7" fill="#EB001B"/>
        <circle cx="22" cy="12" r="7" fill="#F79E1B"/>
        <path d="M18 6.9a6.98 6.98 0 012.2 5.1c0 2-0.9 3.9-2.2 5.1A6.98 6.98 0 0115.8 12c0-2 0.9-3.9 2.2-5.1z" fill="#FF5F00"/>
      </svg>
    )
  },
  {
    name: "PayPal",
    nameAr: "بايبال",
    badge: "Global",
    color: "#0079C1",
    bg: "rgba(0, 121, 193, 0.15)",
    border: "rgba(0, 121, 193, 0.35)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="16" fill="#003087"/>
        <path d="M21.5 10.3c-.4 2.6-2.2 4.4-4.8 4.4h-2.1l-1.3 8.3h-3.3l3-18.7h5.9c2.3 0 4.1 1.2 3.6 4l-1 2z" fill="#0079C1"/>
        <path d="M19.2 12.5c-.3 2.1-1.8 3.5-3.9 3.5h-1.7l-1 6.6h-2.7l2.4-15h4.7c1.8 0 3.3 1 2.9 3.2l-.7 1.7z" fill="#00457C"/>
        <path d="M22.8 11.5c-.3 2.3-1.9 3.8-4.2 3.8h-1.9l-1.1 7.2h-2.9l2.7-16.8h5.3c2.1 0 3.7 1.1 3.2 3.6l-1.1 2.2z" fill="#0079C1"/>
      </svg>
    )
  },
  {
    name: "Apple Pay",
    nameAr: "أبل باي",
    badge: "Mobile",
    color: "#38bdf8",
    bg: "rgba(255, 255, 255, 0.08)",
    border: "rgba(255, 255, 255, 0.2)",
    icon: (
      <svg width="24" height="22" viewBox="0 0 36 24" fill="none">
        <rect width="36" height="24" rx="4" fill="#000000" stroke="rgba(255,255,255,0.2)"/>
        <path d="M12.5 12.3c0-1.8 1.4-2.7 1.5-2.8-0.8-1.2-2.1-1.4-2.5-1.4-1.1-0.1-2.1 0.6-2.7 0.6s-1.4-0.6-2.3-0.6c-1.2 0-2.3 0.7-2.9 1.7-1.3 2.2-0.3 5.4 0.9 7.2.6 0.9 1.3 1.8 2.2 1.8.9 0 1.3-0.6 2.3-0.6 1.1 0 1.4 0.6 2.3 0.6 1 0 1.6-0.9 2.2-1.7.7-1 1-2 1-2.1-0.1 0-1.9-0.7-1.9-2.7zm-1.5-5.2c0.5-0.6 0.8-1.4 0.7-2.1-0.7 0-1.5 0.5-2 1-0.4 0.5-0.8 1.3-0.7 2.1 0.8 0.1 1.5-0.4 2-1z" fill="#fff"/>
        <text x="18" y="15" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="sans-serif">Pay</text>
      </svg>
    )
  },
  {
    name: "Google Pay",
    nameAr: "جوجل باي",
    badge: "Mobile",
    color: "#4285F4",
    bg: "rgba(66, 133, 244, 0.12)",
    border: "rgba(66, 133, 244, 0.35)",
    icon: (
      <svg width="24" height="22" viewBox="0 0 36 24" fill="none">
        <rect width="36" height="24" rx="4" fill="#ffffff"/>
        <path d="M14.5 12.2c0-.3 0-.6-.1-.9h-4.3v1.7h2.5c-.1.6-.5 1.1-1 1.4v1.2h1.6c1-.9 1.3-2.3 1.3-3.4z" fill="#4285F4"/>
        <path d="M10.1 16.6c1.2 0 2.2-.4 3-1.1l-1.6-1.2c-.4.3-.9.5-1.4.5-1.1 0-2-.7-2.3-1.7H6.2v1.2c.7 1.4 2.2 2.3 3.9 2.3z" fill="#34A853"/>
        <path d="M7.8 13.1c-.1-.3-.1-.6-.1-.9s0-.6.1-.9V10.1H6.2c-.4.7-.6 1.4-.6 2.1s.2 1.4.6 2.1l1.6-1.2z" fill="#FBBC05"/>
        <path d="M10.1 8.8c.7 0 1.2.2 1.7.7l1.3-1.3c-.8-.8-1.8-1.2-3-1.2-1.7 0-3.2.9-3.9 2.3l1.6 1.2c.3-1 1.2-1.7 2.3-1.7z" fill="#EA4335"/>
        <text x="17" y="15" fill="#5F6368" fontSize="8.5" fontWeight="bold" fontFamily="sans-serif">Pay</text>
      </svg>
    )
  },
  {
    name: "Bankak | BOK",
    nameAr: "بنكك (بنك الخرطوم)",
    badge: "سودان 🇸🇩",
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.15)",
    border: "rgba(16, 185, 129, 0.35)",
    icon: (
      <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "linear-gradient(135deg, #00833E, #004d24)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "900", fontSize: "10px", border: "1px solid rgba(255,255,255,0.4)" }}>
        BOK
      </div>
    )
  },
  {
    name: "Vodafone Cash",
    nameAr: "فودافون كاش",
    badge: "مصر 🇪🇬",
    color: "#E60000",
    bg: "rgba(230, 0, 0, 0.12)",
    border: "rgba(230, 0, 0, 0.35)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="16" fill="#E60000"/>
        <path d="M16 8c-4.4 0-8 3.6-8 8 0 2.2.9 4.2 2.4 5.7l1.4-1.4C10.6 19 10 17.6 10 16c0-3.3 2.7-6 6-6s6 2.7 6 6c0 1.6-.6 3-1.8 4.3l1.4 1.4C23.1 20.2 24 18.2 24 16c0-4.4-3.6-8-8-8z" fill="#fff"/>
        <circle cx="16" cy="16" r="3" fill="#fff"/>
      </svg>
    )
  },
  {
    name: "InstaPay",
    nameAr: "إنستاباي",
    badge: "مصر 🇪🇬",
    color: "#A855F7",
    bg: "rgba(108, 29, 95, 0.15)",
    border: "rgba(168, 85, 247, 0.35)",
    icon: (
      <div style={{ width: "22px", height: "22px", borderRadius: "6px", background: "linear-gradient(135deg, #6C1D5F, #A855F7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "900", fontSize: "9px" }}>
        IP
      </div>
    )
  },
  {
    name: "STC Pay",
    nameAr: "إس تي سي باي",
    badge: "السعودية 🇸🇦",
    color: "#c084fc",
    bg: "rgba(79, 0, 140, 0.15)",
    border: "rgba(168, 85, 247, 0.35)",
    icon: (
      <div style={{ width: "22px", height: "22px", borderRadius: "6px", background: "#4F008C", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF375E", fontWeight: "900", fontSize: "8px" }}>
        stc
      </div>
    )
  },
  {
    name: "Zain Cash",
    nameAr: "زين كاش",
    badge: "عراق / أردن 🇮🇶",
    color: "#00ACC1",
    bg: "rgba(0, 172, 193, 0.15)",
    border: "rgba(0, 172, 193, 0.35)",
    icon: (
      <div style={{ width: "22px", height: "22px", borderRadius: "6px", background: "linear-gradient(135deg, #263238, #00ACC1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "900", fontSize: "8px" }}>
        Zain
      </div>
    )
  },
  {
    name: "Payeer",
    nameAr: "باير",
    badge: "E-Wallet",
    color: "#008EE0",
    bg: "rgba(0, 142, 224, 0.12)",
    border: "rgba(0, 142, 224, 0.35)",
    icon: (
      <div style={{ width: "22px", height: "22px", borderRadius: "6px", background: "#008EE0", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "900", fontSize: "11px" }}>
        P
      </div>
    )
  },
  {
    name: "Perfect Money",
    nameAr: "بيرفكت موني",
    badge: "Global",
    color: "#ED1C24",
    bg: "rgba(237, 28, 36, 0.12)",
    border: "rgba(237, 28, 36, 0.35)",
    icon: (
      <div style={{ width: "22px", height: "22px", borderRadius: "6px", background: "#ED1C24", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "900", fontSize: "9px" }}>
        PM
      </div>
    )
  }
];

export default function Footer({ siteName = "Arab Tech Server", showServices = false }) {
  const { t, meta } = useI18n();
  const underlineSide = meta.dir === "rtl" ? { right: 0 } : { left: 0 };

  const linkStyle = {
    color: "#94a3b8",
    textDecoration: "none",
    fontSize: "0.95rem",
    transition: "color 0.2s"
  };

  const sectionTitleStyle = {
    color: "#fff",
    fontSize: "1.1rem",
    fontWeight: 800,
    marginBottom: "20px",
    position: "relative",
    display: "inline-block"
  };

  const underlineStyle = {
    position: "absolute",
    bottom: "-8px",
    ...underlineSide,
    width: "40%",
    height: "2px",
    background: "var(--primary-color, #3b82f6)",
    borderRadius: "2px"
  };

  const setHover = (event, color) => {
    event.currentTarget.style.color = color;
  };

  return (
    <footer
      dir={meta.dir}
      data-i18n-skip
      style={{
        background: "rgba(10, 15, 30, 0.95)",
        borderTop: "1px solid rgba(255, 255, 255, 0.05)",
        padding: "60px 20px 30px",
        marginTop: "auto",
        position: "relative",
        zIndex: 10,
        backdropFilter: "blur(20px)"
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "40px" }}>
        
        {/* ── TOP COLUMNS GRID ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "40px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <img src="/logo.jpg" alt={siteName} style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 2px 5px rgba(234,179,8,0.2))" }} />
              <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 900, background: "linear-gradient(135deg, #fff 0%, #a8b2d1 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {siteName}
              </h3>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: "1.7", margin: 0 }}>
              {t("footerAbout") || "المنصة الرائدة لخدمات السيرفرات، أدوات السوفت وير، وتفعيل الباقات بأسعار تنافسية. نقدم خدمات احترافية لدعم أعمالك التقنية."}
            </p>
          </div>

          <div>
            <h4 style={sectionTitleStyle}>
              {t("quickLinks") || "روابط سريعة"}
              <div style={underlineStyle}></div>
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              <li><Link href="/" style={linkStyle} onMouseEnter={(e) => setHover(e, "#fff")} onMouseLeave={(e) => setHover(e, "#94a3b8")}>{t("home") || "الرئيسية"}</Link></li>
              {showServices && (
                <li><Link href="/services" style={linkStyle} onMouseEnter={(e) => setHover(e, "#fff")} onMouseLeave={(e) => setHover(e, "#94a3b8")}>{t("services") || "الخدمات"}</Link></li>
              )}
              <li><Link href="/wallet" style={linkStyle} onMouseEnter={(e) => setHover(e, "#fff")} onMouseLeave={(e) => setHover(e, "#94a3b8")}>{t("chargeBalance") || "شحن رصيدي"}</Link></li>
              <li><Link href="/tickets/new" style={linkStyle} onMouseEnter={(e) => setHover(e, "#fff")} onMouseLeave={(e) => setHover(e, "#94a3b8")}>تذاكر الدعم الفني 🤖</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={sectionTitleStyle}>
              {t("policiesTerms") || "السياسات والشروط"}
              <div style={underlineStyle}></div>
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              <li><Link href="/terms" style={linkStyle} onMouseEnter={(e) => setHover(e, "#fff")} onMouseLeave={(e) => setHover(e, "#94a3b8")}>{t("terms") || "الشروط"}</Link></li>
              <li><Link href="/privacy" style={linkStyle} onMouseEnter={(e) => setHover(e, "#fff")} onMouseLeave={(e) => setHover(e, "#94a3b8")}>{t("privacy") || "سياسة الخصوصية"}</Link></li>
              <li><Link href="/terms#refund-policy" style={linkStyle} onMouseEnter={(e) => setHover(e, "#fff")} onMouseLeave={(e) => setHover(e, "#94a3b8")}>{t("refundPolicy") || "سياسة الاسترجاع"}</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={sectionTitleStyle}>
              {t("contactUs") || "تواصل معنا"}
              <div style={underlineStyle}></div>
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
                <span dir="ltr">arabtechserver@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── PAYMENT METHODS ICONS SHOWCASE ── */}
        <div style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          paddingTop: "32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "18px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#e2e8f0", fontSize: "0.95rem", fontWeight: 700 }}>
            <span>💳</span>
            <span>طرق الدفع والشحن المعتمدة | Supported Payment Methods</span>
            <span style={{ color: "#10b981", fontSize: "0.8rem", background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "2px 8px", borderRadius: "6px", marginLeft: "6px" }}>
              🔒 آمن ومشفر 100%
            </span>
          </div>

          <div style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            maxWidth: "1100px"
          }}>
            {paymentMethodsList.map((pm, idx) => (
              <div
                key={idx}
                title={`${pm.name} (${pm.nameAr})`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "7px 14px",
                  borderRadius: "12px",
                  background: pm.bg,
                  border: `1px solid ${pm.border}`,
                  color: "#f8fafc",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  transition: "all 0.25s ease",
                  cursor: "default",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.borderColor = pm.color;
                  e.currentTarget.style.boxShadow = `0 6px 15px ${pm.bg}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = pm.border;
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.15)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {pm.icon}
                </div>
                <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
                  <span style={{ color: "#ffffff", fontSize: "0.86rem", fontWeight: 800 }}>{pm.name}</span>
                  <span style={{ color: "rgba(255, 255, 255, 0.65)", fontSize: "0.72rem", fontWeight: 500 }}>{pm.nameAr}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── COPYRIGHT ROW ── */}
        <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "25px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0, textAlign: "center" }}>
            {t("rightsReserved", { year: new Date().getFullYear(), site: siteName }) || `جميع الحقوق محفوظة © ${new Date().getFullYear()} - ${siteName}`}
          </p>
        </div>
      </div>
    </footer>
  );
}
