"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

const paymentMethodsList = [
  {
    name: "Binance Pay",
    nameAr: "بايننس باي",
    badge: "Instant",
    color: "#F3BA2F",
    bg: "rgba(243, 186, 47, 0.12)",
    border: "rgba(243, 186, 47, 0.35)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="16" fill="#181A20"/>
        <path d="M16 6.5l3.2 3.2-3.2 3.2-3.2-3.2L16 6.5zm-6.3 6.3l3.2 3.2-3.2 3.2-3.2-3.2 3.2-3.2zm12.6 0l3.2 3.2-3.2 3.2-3.2-3.2 3.2-3.2zM16 19.1l3.2 3.2-3.2 3.2-3.2-3.2 3.2-3.2zm0-4.3l2.1 2.1-2.1 2.1-2.1-2.1 2.1-2.1z" fill="#F3BA2F"/>
      </svg>
    )
  },
  {
    name: "USDT TRC20 / BEP20",
    nameAr: "USDT (Tether)",
    badge: "Crypto",
    color: "#26A17B",
    bg: "rgba(38, 161, 123, 0.12)",
    border: "rgba(38, 161, 123, 0.35)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="16" fill="#26A17B"/>
        <path d="M17.9 14.5c-.1 0-1 .1-1.9.1-1 0-1.7-.1-1.9-.1v-2.3h7.8V9.4h-19v2.8h7.4v2.3c-.3 0-1.1.1-2 .1-.9 0-1.8-.1-1.9-.1-4.4-.2-7.7-1.1-7.7-2.1 0-1.1 3.3-1.9 7.7-2.1v3.3c.3 0 1.2.1 2 .1.9 0 1.7-.1 2-.1V10.4c4.4.2 7.7 1.1 7.7 2.1-.1 1.1-3.4 1.9-7.8 2.1zm0 1c4.3-.2 7.5-1 7.5-2 0-.2-.1-.4-.4-.6-1.1 1-4 1.8-7.1 1.9v7.9h-3.8v-7.9c-3.1-.1-6-.9-7.1-1.9-.3.2-.4.4-.4.6 0 1 3.2 1.8 7.5 2v7.9h3.8v-7.9z" fill="#fff"/>
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
      <svg width="26" height="24" viewBox="0 0 36 24" fill="none">
        <rect width="36" height="24" rx="4" fill="#0D1B2A"/>
        <path d="M14.2 16.5l1.9-11.8h2.9l-1.9 11.8h-2.9zm11.3-11.5c-.6-.2-1.5-.4-2.7-.4-3 0-5.1 1.6-5.1 3.8 0 1.7 1.5 2.6 2.6 3.1 1.2.6 1.6.9 1.6 1.5 0 .8-1 1.2-1.9 1.2-1.3 0-2-.2-3-.6l-.4-.2-.4 2.6c.7.3 2 .6 3.4.6 3.2 0 5.3-1.6 5.3-4 0-1.3-.8-2.4-2.6-3.2-1.1-.5-1.7-.9-1.7-1.4 0-.5.6-1 1.8-1 1 0 1.8.2 2.4.5l.3.1.4-2.6zm7.2 0h-2.3c-.7 0-1.3.2-1.6 1l-4.5 10.8h3.1l.6-1.7h3.8l.4 1.7h2.7l-2.2-11.8zm-3.9 7.7l1.6-4.3.9 4.3h-2.5zM11.6 4.7l-2.8 8-0.3-1.5c-.5-1.7-2.1-3.6-3.9-4.5l2.6 9.8h3.1l4.6-11.8h-3.3z" fill="#F7B600"/>
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
      <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "linear-gradient(135deg, #00833E, #004d24)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "900", fontSize: "11px", border: "1px solid rgba(255,255,255,0.4)" }}>
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
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
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
      <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "linear-gradient(135deg, #6C1D5F, #A855F7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "900", fontSize: "10px" }}>
        IP
      </div>
    )
  }
];

export default function Footer({ siteName = "Al-Wefaq Server", showServices = false }) {
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
              <a href="https://wa.me/249118100809" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "10px", color: "#34d399", fontSize: "0.95rem", textDecoration: "none", transition: "opacity 0.2s" }}>
                <span style={{ background: "rgba(34, 197, 94, 0.15)", padding: "6px 10px", borderRadius: "8px" }}>💬</span>
                <bdi dir="ltr" style={{ fontWeight: "bold" }}>+249 11 810 0809</bdi>
              </a>
              <a href="https://wa.me/249927922237" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "10px", color: "#34d399", fontSize: "0.95rem", textDecoration: "none", transition: "opacity 0.2s" }}>
                <span style={{ background: "rgba(34, 197, 94, 0.15)", padding: "6px 10px", borderRadius: "8px" }}>💬</span>
                <bdi dir="ltr" style={{ fontWeight: "bold" }}>+249 92 792 2237</bdi>
              </a>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#94a3b8", fontSize: "0.95rem", marginTop: "4px" }}>
                <span style={{ background: "rgba(255,255,255,0.05)", padding: "6px 10px", borderRadius: "8px" }}>✉️</span>
                <span dir="ltr">Al-Wefaq Server@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── PAYMENT METHODS ICONS SHOWCASE (ONLY THE 6 SELECTED METHODS) ── */}
        <div style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          paddingTop: "32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "18px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#e2e8f0", fontSize: "0.95rem", fontWeight: 700, flexWrap: "wrap", justifyContent: "center" }}>
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
            gap: "12px",
            maxWidth: "1000px"
          }}>
            {paymentMethodsList.map((pm, idx) => (
              <div
                key={idx}
                title={`${pm.name} (${pm.nameAr})`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 18px",
                  borderRadius: "14px",
                  background: pm.bg,
                  border: `1px solid ${pm.border}`,
                  color: "#f8fafc",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  transition: "all 0.25s ease",
                  cursor: "default",
                  boxShadow: "0 3px 10px rgba(0, 0, 0, 0.18)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.borderColor = pm.color;
                  e.currentTarget.style.boxShadow = `0 8px 20px ${pm.bg}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = pm.border;
                  e.currentTarget.style.boxShadow = "0 3px 10px rgba(0, 0, 0, 0.18)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {pm.icon}
                </div>
                <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.25 }}>
                  <span style={{ color: "#ffffff", fontSize: "0.92rem", fontWeight: 800 }}>{pm.name}</span>
                  <span style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.76rem", fontWeight: 600 }}>{pm.nameAr}</span>
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
