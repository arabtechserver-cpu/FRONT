"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "40px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <img src="/logo.jpg" alt={siteName} style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 2px 5px rgba(234,179,8,0.2))" }} />
              <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 900, background: "linear-gradient(135deg, #fff 0%, #a8b2d1 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {siteName}
              </h3>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: "1.7", margin: 0 }}>
              {t("footerAbout")}
            </p>
          </div>

          <div>
            <h4 style={sectionTitleStyle}>
              {t("quickLinks")}
              <div style={underlineStyle}></div>
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              <li><Link href="/" style={linkStyle} onMouseEnter={(e) => setHover(e, "#fff")} onMouseLeave={(e) => setHover(e, "#94a3b8")}>{t("home")}</Link></li>
              {showServices && (
                <li><Link href="/services" style={linkStyle} onMouseEnter={(e) => setHover(e, "#fff")} onMouseLeave={(e) => setHover(e, "#94a3b8")}>{t("services")}</Link></li>
              )}
              <li><Link href="/wallet" style={linkStyle} onMouseEnter={(e) => setHover(e, "#fff")} onMouseLeave={(e) => setHover(e, "#94a3b8")}>{t("chargeBalance")}</Link></li>
              <li><Link href="/tickets/new" style={linkStyle} onMouseEnter={(e) => setHover(e, "#fff")} onMouseLeave={(e) => setHover(e, "#94a3b8")}>تذاكر الدعم الفني 🤖</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={sectionTitleStyle}>
              {t("policiesTerms")}
              <div style={underlineStyle}></div>
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              <li><Link href="/terms" style={linkStyle} onMouseEnter={(e) => setHover(e, "#fff")} onMouseLeave={(e) => setHover(e, "#94a3b8")}>{t("terms")}</Link></li>
              <li><Link href="/privacy" style={linkStyle} onMouseEnter={(e) => setHover(e, "#fff")} onMouseLeave={(e) => setHover(e, "#94a3b8")}>{t("privacy")}</Link></li>
              <li><Link href="/terms#refund-policy" style={linkStyle} onMouseEnter={(e) => setHover(e, "#fff")} onMouseLeave={(e) => setHover(e, "#94a3b8")}>{t("refundPolicy")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={sectionTitleStyle}>
              {t("contactUs")}
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

        <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "30px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0, textAlign: "center" }}>
            {t("rightsReserved", { year: new Date().getFullYear(), site: siteName })}
          </p>
        </div>
      </div>
    </footer>
  );
}
