"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

const WHATSAPP_SUPPORT_1 = "https://wa.me/16728972935";
const WHATSAPP_SUPPORT_2 = "https://wa.me/249123667227";

const WHATSAPP_COMMUNITY = "https://chat.whatsapp.com/DINRDwU2lVjFcGRowxT3m5";
const WHATSAPP_CHANNEL = "https://whatsapp.com/channel/0029VbD0n6C17En1xFJRPV0H";
const TELEGRAM_CHANNEL = "https://t.me/arabtechserveronline";
const FACEBOOK_PAGE = "https://www.facebook.com/ARABTECHSERVEROnline";
const TIKTOK_ACCOUNT = "https://tiktok.com/@arabtechsuppurt";
const YOUTUBE_CHANNEL = "https://youtube.com/@arab-tech-server?si=1L5yUgv_jlCk3Vez";

export default function ContactFloatingButton() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="contact-floating-btn-wrap" style={{ zIndex: 1100 }}>
      {open && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginBottom: "12px",
            alignItems: "stretch"
          }}
        >
          {/* WhatsApp Support 1 */}
          <a
            href={WHATSAPP_SUPPORT_1}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-btn glass-btn-primary"
            style={{ padding: "12px 16px", borderRadius: "14px", minWidth: "220px", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "0.85rem" }}
          >
            🟢 واتساب الإدارة 1
          </a>

          {/* WhatsApp Support 2 */}
          <a
            href={WHATSAPP_SUPPORT_2}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-btn glass-btn-primary"
            style={{ padding: "12px 16px", borderRadius: "14px", minWidth: "220px", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", borderColor: "rgba(16, 185, 129, 0.2)" }}
          >
            🟢 واتساب الإدارة 2
          </a>

          {/* WhatsApp Community */}
          <a
            href={WHATSAPP_COMMUNITY}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-btn"
            style={{ padding: "12px 16px", borderRadius: "14px", minWidth: "220px", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", background: "rgba(52, 211, 153, 0.1)", borderColor: "rgba(52, 211, 153, 0.2)", color: "#34d399" }}
          >
            💬 مجتمع واتساب عرب تك
          </a>

          {/* Facebook Page */}
          <a
            href={FACEBOOK_PAGE}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-btn"
            style={{ padding: "12px 16px", borderRadius: "14px", minWidth: "220px", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", background: "rgba(24, 119, 242, 0.1)", borderColor: "rgba(24, 119, 242, 0.2)", color: "#478bfb" }}
          >
            📘 صفحة فيسبوك عرب تك
          </a>

          {/* TikTok Account */}
          <a
            href={TIKTOK_ACCOUNT}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-btn"
            style={{ padding: "12px 16px", borderRadius: "14px", minWidth: "220px", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", background: "rgba(254, 44, 85, 0.1)", borderColor: "rgba(254, 44, 85, 0.2)", color: "#fe2c55" }}
          >
            🎵 حساب تيك توك عرب تك
          </a>

          {/* Telegram Channel */}
          <a
            href={TELEGRAM_CHANNEL}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-btn"
            style={{ padding: "12px 16px", borderRadius: "14px", minWidth: "220px", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", background: "rgba(0, 136, 204, 0.1)", borderColor: "rgba(0, 136, 204, 0.2)", color: "#0088cc" }}
          >
            ✈️ قناة تيليجرام عرب تك
          </a>

          {/* YouTube Channel */}
          <a
            href={YOUTUBE_CHANNEL}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-btn"
            style={{ padding: "12px 16px", borderRadius: "14px", minWidth: "220px", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", background: "rgba(255, 0, 0, 0.1)", borderColor: "rgba(255, 0, 0, 0.2)", color: "#ff4d4d" }}
          >
            🔴 قناة يوتيوب عرب تك
          </a>



          {/* Email Support 1 */}
          <a
            href="mailto:arab.tech.services2@gmail.com"
            className="glass-btn"
            style={{ padding: "12px 16px", borderRadius: "14px", minWidth: "220px", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", background: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.2)", color: "#f87171" }}
          >
            📧 البريد الإلكتروني
          </a>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="التواصل معنا"
        className="glass-btn glass-btn-primary"
        style={{
          width: "58px",
          height: "58px",
          borderRadius: "999px",
          padding: 0,
          fontSize: "1.3rem",
          boxShadow: "0 16px 30px rgba(0, 0, 0, 0.35)"
        }}
      >
        ☎
      </button>
    </div>
  );
}
