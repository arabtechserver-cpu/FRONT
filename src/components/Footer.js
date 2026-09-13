"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Phone, Mail, Globe, ShieldCheck } from "lucide-react";

const paymentMethodsList = [
  {
    name: "Vodafone Cash",
    nameAr: "فودافون كاش",
    bg: "#b91c1c",
    color: "#ffffff",
    icon: (
      <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="16" fill="#e60000" />
        <path d="M16 8c-4.4 0-8 3.6-8 8 0 2.2.9 4.2 2.4 5.7l1.4-1.4C10.6 19 10 17.6 10 16c0-3.3 2.7-6 6-6s6 2.7 6 6c0 1.6-.6 3-1.8 4.3l1.4 1.4C23.1 20.2 24 18.2 24 16c0-4.4-3.6-8-8-8z" fill="#fff" />
        <circle cx="16" cy="16" r="3" fill="#fff" />
      </svg>
    )
  },
  {
    name: "Bankak | BOK",
    nameAr: "بنك الخرطوم",
    bg: "#047857",
    color: "#ffffff",
    icon: (
      <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#065f46", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "900", fontSize: "9px", border: "1px solid rgba(255,255,255,0.4)" }}>
        BOK
      </div>
    )
  },
  {
    name: "Visa Card",
    nameAr: "فيزا كارت",
    bg: "#1d4ed8",
    color: "#ffffff",
    icon: (
      <svg width="22" height="18" viewBox="0 0 36 24" fill="none">
        <rect width="36" height="24" rx="4" fill="#0f172a" />
        <path d="M14.2 16.5l1.9-11.8h2.9l-1.9 11.8h-2.9zm11.3-11.5c-.6-.2-1.5-.4-2.7-.4-3 0-5.1 1.6-5.1 3.8 0 1.7 1.5 2.6 2.6 3.1 1.2.6 1.6.9 1.6 1.5 0 .8-1 1.2-1.9 1.2-1.3 0-2-.2-3-.6l-.4-.2-.4 2.6c.7.3 2 .6 3.4.6 3.2 0 5.3-1.6 5.3-4 0-1.3-.8-2.4-2.6-3.2-1.1-.5-1.7-.9-1.7-1.4 0-.5.6-1 1.8-1 1 0 1.8.2 2.4.5l.3.1.4-2.6zm7.2 0h-2.3c-.7 0-1.3.2-1.6 1l-4.5 10.8h3.1l.6-1.7h3.8l.4 1.7h2.7l-2.2-11.8zm-3.9 7.7l1.6-4.3.9 4.3h-2.5zM11.6 4.7l-2.8 8-0.3-1.5c-.5-1.7-2.1-3.6-3.9-4.5l2.6 9.8h3.1l4.6-11.8h-3.3z" fill="#f59e0b" />
      </svg>
    )
  },
  {
    name: "USDT TRC20 / BEP20",
    nameAr: "USDT (Tether)",
    bg: "#0f766e",
    color: "#ffffff",
    icon: (
      <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="16" fill="#26A17B" />
        <path d="M17.9 14.5c-.1 0-1 .1-1.9.1-1 0-1.7-.1-1.9-.1v-2.3h7.8V9.4h-19v2.8h7.4v2.3c-.3 0-1.1.1-2 .1-.9 0-1.8-.1-1.9-.1-4.4-.2-7.7-1.1-7.7-2.1 0-1.1 3.3-1.9 7.7-2.1v3.3c.3 0 1.2.1 2 .1.9 0 1.7-.1 2-.1V10.4c4.4.2 7.7 1.1 7.7 2.1-.1 1.1-3.4 1.9-7.8 2.1zm0 1c4.3-.2 7.5-1 7.5-2 0-.2-.1-.4-.4-.6-1.1 1-4 1.8-7.1 1.9v7.9h-3.8v-7.9c-3.1-.1-6-.9-7.1-1.9-.3.2-.4.4-.4.6 0 1 3.2 1.8 7.5 2v7.9h3.8v-7.9z" fill="#fff" />
      </svg>
    )
  },
  {
    name: "Binance Pay",
    nameAr: "بينانس باي",
    bg: "#1c1917",
    color: "#f59e0b",
    icon: (
      <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="16" fill="#181A20" />
        <path d="M16 6.5l3.2 3.2-3.2 3.2-3.2-3.2L16 6.5zm-6.3 6.3l3.2 3.2-3.2 3.2-3.2-3.2 3.2-3.2zm12.6 0l3.2 3.2-3.2 3.2-3.2-3.2 3.2-3.2zM16 19.1l3.2 3.2-3.2 3.2-3.2-3.2 3.2-3.2zm0-4.3l2.1 2.1-2.1 2.1-2.1-2.1 2.1-2.1z" fill="#F3BA2F" />
      </svg>
    )
  },
  {
    name: "Instapay",
    nameAr: "إنستاباي",
    bg: "#6b21a8",
    color: "#ffffff",
    icon: (
      <div style={{ width: "20px", height: "20px", borderRadius: "4px", background: "#581c87", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "900", fontSize: "9px" }}>
        IP
      </div>
    )
  }
];

export default function Footer({ siteName = "SK-unlocker", showServices = false }) {
  const { t, meta } = useI18n();

  const linkStyle = {
    color: "#475569",
    textDecoration: "none",
    fontSize: "0.88rem",
    fontWeight: 600,
    transition: "color 0.2s"
  };

  const sectionTitleStyle = {
    color: "#0f172a",
    fontSize: "1rem",
    fontWeight: 800,
    marginBottom: "16px"
  };

  return (
    <footer
      dir={meta.dir}
      data-i18n-skip
      style={{
        background: "#ffffff",
        borderTop: "1px solid #e2e8f0",
        padding: "50px 20px 24px",
        marginTop: "auto",
        position: "relative",
        zIndex: 10
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "36px" }}>

        {/* Top 4 Columns */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "32px",
          alignItems: "flex-start"
        }}>
          {/* Column 1: Brand Info */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: "10px",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                padding: "2px",
                boxShadow: "0 3px 10px rgba(2, 132, 199, 0.15)"
              }}>
                <img src="/logo.png" alt="SK-unlocker" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
              <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 900, color: "#0f172a" }}>
                SK-unlocker
              </h3>
            </div>
            <p style={{ color: "#64748b", fontSize: "0.86rem", lineHeight: "1.7", margin: 0 }}>
              أقوى منصة للشرق الأوسط لخدمات السيرفرات، الدعم والعميل، مع أفضل الأسعار والدعم الفني المباشر، نقدم الحلول المتكاملة بجودة وأمان للعملاء.
            </p>
          </div>

          {/* Column 2: خدماتنا */}
          <div>
            <h4 style={sectionTitleStyle}>
              خدماتنا
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              <li><Link href="/" style={linkStyle}>الرئيسية</Link></li>
              <li><Link href="/services" style={linkStyle}>الخدمات</Link></li>
              <li><Link href="/resellerpricing/server" style={linkStyle}>حساب التخفيض</Link></li>
              <li><Link href="/tickets/new" style={linkStyle}>مركز الدعم الفني</Link></li>
            </ul>
          </div>

          {/* Column 3: روابط سريعة */}
          <div>
            <h4 style={sectionTitleStyle}>
              روابط سريعة
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              <li><Link href="/terms" style={linkStyle}>الشروط</Link></li>
              <li><Link href="/privacy" style={linkStyle}>سياسة الخصوصية</Link></li>
              <li><Link href="/terms#refund-policy" style={linkStyle}>سياسة الاسترجاع</Link></li>
            </ul>
          </div>

          {/* Column 4: تواصل معنا */}
          <div>
            <h4 style={sectionTitleStyle}>
              تواصل معنا
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <a href="https://wa.me/249118100889" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "8px", color: "#16a34a", fontSize: "0.88rem", textDecoration: "none" }}>
                <span style={{ background: "#dcfce7", padding: "4px 8px", borderRadius: "6px", display: "inline-flex", alignItems: "center" }}>
                  <Phone size={13} color="#16a34a" />
                </span>
                <bdi dir="ltr" style={{ fontWeight: 700 }}>+249 11 810 0889</bdi>
              </a>
              <a href="https://wa.me/249927922237" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "8px", color: "#16a34a", fontSize: "0.88rem", textDecoration: "none" }}>
                <span style={{ background: "#dcfce7", padding: "4px 8px", borderRadius: "6px", display: "inline-flex", alignItems: "center" }}>
                  <Phone size={13} color="#16a34a" />
                </span>
                <bdi dir="ltr" style={{ fontWeight: 700 }}>+249 92 792 2237</bdi>
              </a>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b", fontSize: "0.86rem", marginTop: "2px" }}>
                <span style={{ background: "#f1f5f9", padding: "4px 8px", borderRadius: "6px", display: "inline-flex", alignItems: "center" }}>
                  <Mail size={13} color="#64748b" />
                </span>
                <span dir="ltr">support@sk-unlocker.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods Bar */}
        <div style={{
          borderTop: "1px solid #e2e8f0",
          paddingTop: "24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#0f172a", fontSize: "0.9rem", fontWeight: 800, flexWrap: "wrap", justifyContent: "center" }}>
            <span>Supported Payment Methods | طرق الدفع التي ندعمها</span>
            <span style={{ color: "#16a34a", fontSize: "0.76rem", background: "#dcfce7", border: "1px solid #86efac", padding: "2px 8px", borderRadius: "6px", marginRight: "6px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <ShieldCheck size={12} color="#16a34a" />
              <span>أون لاين 100%</span>
            </span>
          </div>

          <div style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            maxWidth: "1000px"
          }}>
            {paymentMethodsList.map((pm, idx) => (
              <div
                key={idx}
                title={`${pm.name} (${pm.nameAr})`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "7px 16px",
                  borderRadius: "20px",
                  background: pm.bg,
                  color: pm.color,
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.12)"
                }}
              >
                {pm.icon}
                <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 800 }}>{pm.name}</span>
                  <span style={{ fontSize: "0.68rem", opacity: 0.9 }}>{pm.nameAr}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "18px", textAlign: "center" }}>
          <p style={{ color: "#64748b", fontSize: "0.82rem", margin: 0 }}>
            جميع الحقوق محفوظة © 2025 SK-unlocker
          </p>
        </div>
      </div>
    </footer>
  );
}
