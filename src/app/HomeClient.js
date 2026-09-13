"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/config";
import {
  Users, CheckCircle, TrendingUp, Star,
  Smartphone, Server, Radio, Zap,
  Send, MessageCircle, Globe, Phone,
  Clock, Wallet, LogIn, UserPlus
} from "lucide-react";

const STATS = [
  {
    sub: "Top Rated by Developers",
    badge: "تقييم 4.9 ممتاز",
    badgeBgLight: "#f3e8ff",
    badgeColorLight: "#9333ea",
    badgeBgDark: "rgba(168, 85, 247, 0.15)",
    badgeColorDark: "#c084fc",
    value: "4.5 / 5.0",
    color: "#a855f7",
    icon: <Star size={24} color="#a855f7" />
  },
  {
    sub: "Unlimited every day",
    badge: "DAILY ORDERS",
    badgeBgLight: "#e0f2fe",
    badgeColorLight: "#0284c7",
    badgeBgDark: "rgba(2, 132, 199, 0.15)",
    badgeColorDark: "#38bdf8",
    value: "299+",
    color: "#0284c7",
    icon: <TrendingUp size={24} color="#0284c7" />
  },
  {
    sub: "Via Auto System",
    badge: "COMPLETED ORDERS",
    badgeBgLight: "#dcfce7",
    badgeColorLight: "#16a34a",
    badgeBgDark: "rgba(22, 163, 74, 0.15)",
    badgeColorDark: "#4ade80",
    value: "99,999+",
    color: "#16a34a",
    icon: <CheckCircle size={24} color="#16a34a" />
  },
  {
    sub: "Trusting Our platform daily",
    badge: "HAPPY CLIENTS",
    badgeBgLight: "#fef3c7",
    badgeColorLight: "#d97706",
    badgeBgDark: "rgba(217, 119, 6, 0.15)",
    badgeColorDark: "#fbbf24",
    value: "2,999+",
    color: "#d97706",
    icon: <Users size={24} color="#d97706" />
  },
];

const SERVICES_OVERVIEW = [
  {
    key: "imei",
    icon: Smartphone,
    colorLight: "#0284c7",
    colorDark: "#38bdf8",
    iconBgLight: "#e0f2fe",
    iconBgDark: "rgba(2, 132, 199, 0.18)",
    label: "IMEI Service",
    desc: "iCloud - Unlock - FRP - Check",
    href: "/resellerpricing/imei",
    btnBgLight: "#e0f2fe",
    btnBgDark: "rgba(2, 132, 199, 0.22)",
    btnColorLight: "#0284c7",
    btnColorDark: "#38bdf8"
  },
  {
    key: "server",
    icon: Server,
    colorLight: "#16a34a",
    colorDark: "#4ade80",
    iconBgLight: "#dcfce7",
    iconBgDark: "rgba(22, 163, 74, 0.18)",
    label: "Server Service",
    desc: "Activation - Credit - Call Card",
    href: "/resellerpricing/server",
    btnBgLight: "#dcfce7",
    btnBgDark: "rgba(22, 163, 74, 0.22)",
    btnColorLight: "#16a34a",
    btnColorDark: "#4ade80"
  },
  {
    key: "remote",
    icon: Radio,
    colorLight: "#9333ea",
    colorDark: "#c084fc",
    iconBgLight: "#f3e8ff",
    iconBgDark: "rgba(168, 85, 247, 0.18)",
    label: "Remote Service",
    desc: "FRP - Samsung - Huawei - Social",
    href: "/resellerpricing/remote",
    btnBgLight: "#a855f7",
    btnBgDark: "#9333ea",
    btnColorLight: "#ffffff",
    btnColorDark: "#ffffff"
  },
  {
    key: "all",
    icon: Zap,
    colorLight: "#d97706",
    colorDark: "#fbbf24",
    iconBgLight: "#fef9c3",
    iconBgDark: "rgba(217, 119, 6, 0.18)",
    label: "All Services",
    desc: "Browse the full catalog",
    href: "/resellerpricing",
    btnBgLight: "#fef3c7",
    btnBgDark: "rgba(217, 119, 6, 0.22)",
    btnColorLight: "#d97706",
    btnColorDark: "#fbbf24"
  },
];

const GATEWAYS = [
  {
    name: "فودافون كاش",
    subName: "Vodafone Cash",
    tag: "EGYPT REGION",
    tagColor: "#dc2626",
    icon: (
      <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="16" fill="#e60000" />
        <path d="M16 8c-4.4 0-8 3.6-8 8 0 2.2.9 4.2 2.4 5.7l1.4-1.4C10.6 19 10 17.6 10 16c0-3.3 2.7-6 6-6s6 2.7 6 6c0 1.6-.6 3-1.8 4.3l1.4 1.4C23.1 20.2 24 18.2 24 16c0-4.4-3.6-8-8-8z" fill="#fff" />
        <circle cx="16" cy="16" r="3" fill="#fff" />
      </svg>
    )
  },
  {
    name: "سودان",
    subName: "Zain",
    tag: "SUDAN REGION",
    tagColor: "#9333ea",
    icon: (
      <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#9333ea", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "10px", fontWeight: 900 }}>
        Z
      </div>
    )
  },
  {
    name: "تيزون - USDT",
    subName: "الدفع بالعملات الرقمية",
    tag: "CRYPTO ASSETS",
    tagColor: "#16a34a",
    icon: (
      <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="16" fill="#26A17B" />
        <path d="M17.9 14.5c-.1 0-1 .1-1.9.1-1 0-1.7-.1-1.9-.1v-2.3h7.8V9.4h-19v2.8h7.4v2.3c-.3 0-1.1.1-2 .1-.9 0-1.8-.1-1.9-.1-4.4-.2-7.7-1.1-7.7-2.1 0-1.1 3.3-1.9 7.7-2.1v3.3c.3 0 1.2.1 2 .1.9 0 1.7-.1 2-.1V10.4c4.4.2 7.7 1.1 7.7 2.1-.1 1.1-3.4 1.9-7.8 2.1zm0 1c4.3-.2 7.5-1 7.5-2 0-.2-.1-.4-.4-.6-1.1 1-4 1.8-7.1 1.9v7.9h-3.8v-7.9c-3.1-.1-6-.9-7.1-1.9-.3.2-.4.4-.4.6 0 1 3.2 1.8 7.5 2v7.9h3.8v-7.9z" fill="#fff" />
      </svg>
    )
  },
  {
    name: "البنك - البنكي",
    subName: "قبول كارت",
    tag: "GCC REGION",
    tagColor: "#d97706",
    icon: (
      <div style={{ width: 22, height: 22, borderRadius: "6px", background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontSize: "10px", fontWeight: 900 }}>
        GCC
      </div>
    )
  }
];

const DEFAULT_ORDERS = [
  "User ***429 successfully activated CHIMERA TOOL PRO (1 Year)",
  "User ***812 unlocked iPhone 13 Pro Max - Network Unlock",
  "User ***156 activated OCTOPLUS BOX 1 Year Credit",
  "User ***334 removed iCloud iPhone 15 - Bypass Signal",
  "User ***777 activated SAM TOOL PRO annual subscription",
  "User ***902 successfully completed FRP Samsung A54",
];

export default function HomeClient({ siteName = "SK-unlocker", settings = {} }) {
  const [customer, setCustomer] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [liveOrders, setLiveOrders] = useState(DEFAULT_ORDERS);
  const [liveIdx, setLiveIdx] = useState(0);
  const [flashTimer, setFlashTimer] = useState({ h: "00", m: "45", s: "29" });
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const updateTheme = () => {
      const active = (typeof window !== "undefined" && localStorage.getItem("theme"))
        || (typeof document !== "undefined" && document.documentElement.getAttribute("data-theme"))
        || "light";
      setTheme(active);
    };

    updateTheme();

    if (typeof document !== "undefined") {
      const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.attributeName === "data-theme") {
            updateTheme();
          }
        }
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      window.addEventListener("storage", updateTheme);
      return () => {
        observer.disconnect();
        window.removeEventListener("storage", updateTheme);
      };
    }
  }, []);

  const isDark = theme === "dark";

  useEffect(() => {
    try {
      const token = localStorage.getItem("customer_token");
      if (token) {
        fetch(`${API_BASE_URL}/api/customer/me`, { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.ok ? r.json() : null)
          .then(d => { if (d) setCustomer(d); setAuthChecked(true); })
          .catch(() => setAuthChecked(true));
      } else setAuthChecked(true);
    } catch { setAuthChecked(true); }
  }, []);

  useEffect(() => {
    const tick = () => {
      setFlashTimer(prev => {
        let s = parseInt(prev.s) - 1;
        let m = parseInt(prev.m);
        let h = parseInt(prev.h);
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; m = 59; s = 59; }
        return {
          h: String(h).padStart(2, "0"),
          m: String(m).padStart(2, "0"),
          s: String(s).padStart(2, "0")
        };
      });
    };
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const FAKE_ORDERS = [
      "User ***429 successfully activated CHIMERA TOOL PRO (1 Year)",
      "User ***812 unlocked iPhone 13 Pro Max - Network Unlock",
      "User ***156 activated OCTOPLUS BOX 1 Year Credit",
      "User ***334 removed iCloud iPhone 15 - Bypass Signal",
      "User ***777 activated SAM TOOL PRO annual subscription",
      "User ***902 successfully completed FRP Samsung A54",
    ];
    setLiveOrders(FAKE_ORDERS);
    const id = setInterval(() => setLiveIdx(p => (p + 1) % FAKE_ORDERS.length), 4000);
    return () => clearInterval(id);
  }, []);

  const displayName = settings.site_name?.trim() || siteName;

  const tColor = {
    pageBg: isDark ? "#0b1329" : "#f8fafc",
    textMain: isDark ? "#f8fafc" : "#0f172a",
    textMuted: isDark ? "#94a3b8" : "#64748b",
    textSub: isDark ? "#cbd5e1" : "#334155",
    cardBg: isDark ? "#131f37" : "#ffffff",
    cardBgAlt: isDark ? "#162238" : "#ffffff",
    cardBorder: isDark ? "rgba(56, 189, 248, 0.18)" : "#e2e8f0",
    cardShadow: isDark ? "0 8px 25px rgba(0, 0, 0, 0.35)" : "0 4px 20px rgba(0, 0, 0, 0.04)",
    accent: isDark ? "#38bdf8" : "#0284c7",
    heroBg: isDark
      ? "radial-gradient(120% 120% at 50% 0%, #172554 0%, #0f172a 45%, #0b1329 100%)"
      : "radial-gradient(120% 120% at 50% 0%, #cbe5fe 0%, #e0f2fe 35%, #f0f9ff 70%, #ffffff 100%)",
    heroBorder: isDark ? "rgba(56, 189, 248, 0.18)" : "#e2e8f0",
    flashBg: isDark ? "#101a30" : "#eff6ff",
    flashBorder: isDark ? "rgba(56, 189, 248, 0.18)" : "#dbeafe",
    flashTimerBoxBg: isDark ? "#162238" : "#ffffff",
    flashTimerBoxBorder: isDark ? "rgba(56, 189, 248, 0.3)" : "#bfdbfe",
    flashTimerColor: isDark ? "#38bdf8" : "#0284c7",
    flashTitleColor: isDark ? "#60a5fa" : "#1d4ed8",
    secondaryBtnBg: isDark ? "#162238" : "#ffffff",
    secondaryBtnBorder: isDark ? "rgba(56, 189, 248, 0.3)" : "#bfdbfe",
    secondaryBtnText: isDark ? "#f8fafc" : "#0f172a",
    badgeBg: isDark ? "rgba(56, 189, 248, 0.12)" : "#e0f2fe",
    badgeBorder: isDark ? "rgba(56, 189, 248, 0.3)" : "#bae6fd",
    badgeText: isDark ? "#38bdf8" : "#0284c7",
    tickerBg: isDark ? "#062c22" : "#f0fdf4",
    tickerBorder: isDark ? "rgba(5, 150, 105, 0.4)" : "#bbf7d0",
    tickerText: isDark ? "#a7f3d0" : "#334155",
    tickerBadgeBg: isDark ? "rgba(16, 185, 129, 0.2)" : "#dcfce7",
    tickerBadgeBorder: isDark ? "rgba(52, 211, 153, 0.4)" : "#86efac",
    tickerBadgeText: isDark ? "#34d399" : "#16a34a",
    noticeBg: isDark ? "#101a30" : "#eff6ff",
    noticeBorder: isDark ? "rgba(56, 189, 248, 0.25)" : "#bfdbfe",
    noticeText: isDark ? "#38bdf8" : "#0369a1",
    hubInnerBg: isDark ? "#162238" : "#f0f7ff",
    hubInnerBorder: isDark ? "rgba(56, 189, 248, 0.25)" : "#bfdbfe",
    hubInnerLeftBorder: isDark ? "#38bdf8" : "#0284c7",
    sectionServicesBg: isDark ? "#0e172e" : "#ffffff",
    communityBg: isDark ? "#0b1329" : "#ffffff",
    communityBorder: isDark ? "rgba(56, 189, 248, 0.18)" : "#e2e8f0"
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, overflowX: "hidden", background: tColor.pageBg, color: tColor.textMain, transition: "background 0.25s ease, color 0.25s ease" }}>

      {/* Flash Offer Bar */}
      <div style={{
        background: tColor.flashBg,
        borderBottom: `1px solid ${tColor.flashBorder}`,
        padding: "10px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: tColor.flashTimerBoxBg,
          border: `1px solid ${tColor.flashTimerBoxBorder}`,
          borderRadius: 8,
          padding: "6px 14px",
          boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.03)"
        }}>
          <Clock size={16} color={tColor.flashTimerColor} />
          <span style={{ fontFamily: "monospace", fontSize: "1.05rem", fontWeight: 900, color: tColor.flashTimerColor, letterSpacing: "0.06em" }}>
            ENDS IN {flashTimer.h}:{flashTimer.m}:{flashTimer.s}
          </span>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "0.86rem", fontWeight: 900, color: tColor.flashTitleColor, letterSpacing: "0.05em", marginBottom: 2 }}>
            TODAY FLASH OFFER
          </div>
          <div style={{ fontSize: "0.78rem", color: tColor.textMuted }}>
            Massive Discounts On All Server Services! Register your accounts now and check today's dynamic dashboard deals
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section style={{
        position: "relative",
        background: tColor.heroBg,
        borderBottom: `1px solid ${tColor.heroBorder}`,
        padding: "54px 24px 64px",
        textAlign: "center",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: isDark
            ? "radial-gradient(circle at 50% 30%, rgba(56, 189, 248, 0.08) 0%, transparent 60%)"
            : "radial-gradient(circle at 50% 30%, rgba(2, 132, 199, 0.08) 0%, transparent 60%)",
          pointerEvents: "none"
        }} />

        {/* Top Badges */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 24, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 16px",
            borderRadius: 30,
            fontSize: "0.78rem",
            fontWeight: 800,
            background: isDark ? "rgba(22, 163, 74, 0.15)" : "#dcfce7",
            border: isDark ? "1px solid rgba(34, 197, 94, 0.35)" : "1px solid #bbf7d0",
            color: isDark ? "#4ade80" : "#16a34a",
            letterSpacing: "0.06em"
          }}>
            <span style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: isDark ? "#4ade80" : "#16a34a",
              boxShadow: isDark ? "0 0 8px #4ade80" : "0 0 6px #16a34a",
              display: "inline-block"
            }} />
            ONLINE 24/7
          </span>

          <span style={{
            padding: "5px 18px",
            borderRadius: 30,
            fontSize: "0.78rem",
            fontWeight: 800,
            background: tColor.badgeBg,
            border: `1px solid ${tColor.badgeBorder}`,
            color: tColor.badgeText,
            letterSpacing: "0.06em"
          }}>
            SK-unlocker
          </span>
        </div>

        {/* Main Headline */}
        <h1 style={{
          fontSize: "clamp(1.9rem, 4.5vw, 3.2rem)",
          fontWeight: 900,
          color: tColor.textMain,
          marginBottom: 14,
          lineHeight: 1.2,
          position: "relative",
          zIndex: 1
        }}>
          WELCOME TO{" "}
          <span style={{ color: tColor.accent }}>
            SK-unlocker
          </span>
        </h1>

        {/* Subtitles */}
        <p style={{
          color: tColor.textSub,
          fontSize: "1.05rem",
          fontWeight: 700,
          maxWidth: 680,
          margin: "0 auto 10px",
          lineHeight: 1.8,
          position: "relative",
          zIndex: 1
        }}>
          أهلاً بك في المنصة المتكاملة لخدمات سيرفرات الهواتف، وتفعيل البوكسات، ودفع الأكواد، وكل ما تحتاجه لبناء عملك بكل سهولة
        </p>
        <p style={{
          color: tColor.textMuted,
          fontSize: "0.88rem",
          maxWidth: 620,
          margin: "0 auto 34px",
          lineHeight: 1.6,
          position: "relative",
          zIndex: 1
        }}>
          Welcome to the premium direct source for worldwide mobile unlocking services and box activations. Please login or register your account now to start your business.
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          alignItems: "center",
          maxWidth: 480,
          margin: "0 auto 28px",
          position: "relative",
          zIndex: 1
        }}>
          {customer ? (
            <>
              <Link href="/resellerpricing" style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                width: "100%",
                padding: "15px 24px",
                borderRadius: 10,
                fontWeight: 900,
                fontSize: "0.98rem",
                textDecoration: "none",
                background: "#f59e0b",
                color: "#000000",
                boxShadow: "0 4px 18px rgba(245, 158, 11, 0.35)",
                transition: "all 0.2s ease"
              }}>
                <UserPlus size={18} />
                تصفح الخدمات / Browse Services
              </Link>
              <Link href="/wallet" style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                width: "100%",
                padding: "13px 24px",
                borderRadius: 10,
                fontWeight: 800,
                fontSize: "0.92rem",
                textDecoration: "none",
                background: tColor.secondaryBtnBg,
                border: `1.5px solid ${tColor.secondaryBtnBorder}`,
                color: tColor.secondaryBtnText,
                boxShadow: isDark ? "0 4px 14px rgba(0,0,0,0.35)" : "0 2px 8px rgba(0,0,0,0.03)"
              }}>
                <Wallet size={17} color={tColor.accent} />
                رصيدك: ${Number(customer.balance || 0).toFixed(2)} USD - شحن المحفظة
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" id="hero-register-btn" style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                width: "100%",
                padding: "15px 24px",
                borderRadius: 10,
                fontWeight: 900,
                fontSize: "0.98rem",
                textDecoration: "none",
                background: "#f59e0b",
                color: "#000000",
                boxShadow: "0 4px 18px rgba(245, 158, 11, 0.35)",
                transition: "all 0.2s ease"
              }}>
                <UserPlus size={18} />
                REGISTER NEW ACCOUNT / إنشاء حساب جديد
              </Link>
              <Link href="/login" id="hero-login-btn" style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                width: "100%",
                padding: "13px 24px",
                borderRadius: 10,
                fontWeight: 800,
                fontSize: "0.92rem",
                textDecoration: "none",
                background: tColor.secondaryBtnBg,
                border: `1.5px solid ${tColor.secondaryBtnBorder}`,
                color: tColor.secondaryBtnText,
                boxShadow: isDark ? "0 4px 14px rgba(0,0,0,0.35)" : "0 2px 8px rgba(0,0,0,0.03)"
              }}>
                <LogIn size={17} color={tColor.accent} />
                LOGIN TO ACCOUNT / تسجيل الدخول
              </Link>
            </>
          )}
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: "0.82rem",
          color: tColor.accent,
          letterSpacing: "0.14em",
          fontWeight: 800,
          position: "relative",
          zIndex: 1
        }}>
          AUTOMATED SYSTEM • FAST DELIVERY • 24/7 SUPPORT
        </div>
      </section>

      {/* Blue Announcement Strip */}
      <div style={{
        background: isDark ? "#1d4ed8" : "#2563eb",
        padding: "14px 0",
        overflow: "hidden",
        width: "100%",
        boxShadow: isDark ? "0 4px 20px rgba(29, 78, 216, 0.35)" : "0 4px 15px rgba(37, 99, 235, 0.25)"
      }}>
        <div style={{
          display: "inline-flex",
          animation: "marquee-slide 30s linear infinite",
          whiteSpace: "nowrap"
        }}>
          {[0, 1].map(idx => (
            <span key={idx} style={{
              fontSize: "0.92rem",
              fontWeight: 900,
              color: "#ffffff",
              letterSpacing: "0.06em",
              paddingRight: 60
            }}>
              SPECIAL ANNOUNCEMENT SK-unlocker - 70% TO 10 خصومات حصرية على جميع الخدمات SK-UNLOCKER OFFERS &amp; DISCOUNTS OF 10 TO 70% SK-unlocker - SPECIAL ANNOUNCEMENT
            </span>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <section style={{ padding: "48px 24px 20px", textAlign: "center", background: tColor.pageBg }}>
        <div style={{
          display: "inline-flex",
          padding: "5px 16px",
          borderRadius: 30,
          fontSize: "0.78rem",
          fontWeight: 800,
          background: tColor.badgeBg,
          border: `1px solid ${tColor.badgeBorder}`,
          color: tColor.badgeText,
          letterSpacing: "0.06em",
          marginBottom: 14
        }}>
          PREMIUM SERVICES &amp; DISCOUNTS
        </div>
        <h2 style={{
          fontSize: "clamp(1.6rem, 3.2vw, 2.2rem)",
          fontWeight: 900,
          color: isDark ? "#60a5fa" : "#2563eb",
          marginBottom: 8
        }}>
          SK-unlocker
        </h2>
        <p style={{ color: tColor.textMuted, fontSize: "0.92rem", maxWidth: 650, margin: "0 auto 36px" }}>
          Your Premium and Direct Source for Worldwide Mobile Unlocking Services, providing speed, reliability, and security.
        </p>

        {/* 4 Stat Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
          maxWidth: 1200,
          margin: "0 auto"
        }}>
          {STATS.map((stat, i) => (
            <div key={i} style={{
              background: tColor.cardBg,
              borderRadius: 16,
              padding: "24px 20px",
              textAlign: "center",
              border: `1px solid ${tColor.cardBorder}`,
              boxShadow: tColor.cardShadow,
              position: "relative"
            }}>
              <div style={{ fontSize: "0.82rem", color: tColor.textMuted, marginBottom: 12 }}>
                {stat.sub}
              </div>
              <div style={{
                display: "inline-block",
                padding: "3px 12px",
                borderRadius: 20,
                fontSize: "0.75rem",
                fontWeight: 800,
                background: isDark ? stat.badgeBgDark : stat.badgeBgLight,
                color: isDark ? stat.badgeColorDark : stat.badgeColorLight,
                marginBottom: 16
              }}>
                {stat.badge}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <span style={{ fontSize: "1.7rem", fontWeight: 900, color: tColor.textMain }}>
                  {stat.value}
                </span>
                {stat.icon}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Select Service Type */}
      <section style={{ padding: "48px 24px 50px", background: tColor.sectionServicesBg }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            display: "inline-flex",
            padding: "5px 16px",
            borderRadius: 30,
            fontSize: "0.78rem",
            fontWeight: 800,
            background: tColor.badgeBg,
            border: `1px solid ${tColor.badgeBorder}`,
            color: tColor.badgeText,
            letterSpacing: "0.06em",
            marginBottom: 14
          }}>
            OUR SERVICES &amp; SUPPORT
          </div>
          <h3 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 900, color: tColor.textMain, marginBottom: 8 }}>
            Select Service Type / اختر نوع الخدمة
          </h3>
          <p style={{ color: tColor.textMuted, fontSize: "0.92rem" }}>
            Browse our premium categorized service catalog with live instant pricing
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: 20,
          maxWidth: 1200,
          margin: "0 auto"
        }}>
          {SERVICES_OVERVIEW.map((svc) => {
            const SvcIcon = svc.icon;
            const iconColor = isDark ? svc.colorDark : svc.colorLight;
            const iconBg = isDark ? svc.iconBgDark : svc.iconBgLight;
            const btnBg = isDark ? svc.btnBgDark : svc.btnBgLight;
            const btnColor = isDark ? svc.btnColorDark : svc.btnColorLight;

            return (
              <Link key={svc.key} href={svc.href} style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "34px 20px",
                background: tColor.cardBg,
                borderRadius: 18,
                textDecoration: "none",
                transition: "all 0.25s ease",
                border: `1px solid ${tColor.cardBorder}`,
                boxShadow: tColor.cardShadow,
                position: "relative"
              }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 18
                }}>
                  <SvcIcon size={22} color={iconColor} />
                </div>
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <div style={{ fontSize: "1.15rem", fontWeight: 900, color: tColor.textMain, marginBottom: 6 }}>
                    {svc.label}
                  </div>
                  <div style={{ fontSize: "0.82rem", color: tColor.textMuted }}>
                    {svc.desc}
                  </div>
                </div>
                <div style={{
                  marginTop: "auto",
                  padding: "6px 18px",
                  borderRadius: 20,
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  background: btnBg,
                  color: btnColor,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4
                }}>
                  Explore Service &gt;
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Live Activations Ticker */}
      {liveOrders.length > 0 && (
        <div style={{
          padding: "12px 24px",
          background: tColor.tickerBg,
          borderTop: `1px solid ${tColor.tickerBorder}`,
          borderBottom: `1px solid ${tColor.tickerBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12
        }}>
          <div style={{
            fontSize: "0.86rem",
            color: tColor.tickerText,
            fontWeight: 600,
            overflow: "hidden"
          }}>
            {liveOrders[liveIdx]}
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: tColor.tickerBadgeBg,
            border: `1px solid ${tColor.tickerBadgeBorder}`,
            borderRadius: 20,
            padding: "4px 12px",
            flexShrink: 0
          }}>
            <span style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: tColor.tickerBadgeText,
              display: "inline-block"
            }} />
            <span style={{ fontSize: "0.72rem", fontWeight: 900, color: tColor.tickerBadgeText, letterSpacing: "0.08em" }}>
              LIVE ACTIVATIONS
            </span>
          </div>
        </div>
      )}

      {/* Gateways & Professional Hub */}
      <section style={{ padding: "48px 24px", background: tColor.pageBg }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 24,
          maxWidth: 1200,
          margin: "0 auto"
        }}>

          {/* Left Column: Global & Local Gateways */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 14px",
                borderRadius: 20,
                fontSize: "0.75rem",
                fontWeight: 800,
                background: isDark ? "rgba(22, 163, 74, 0.15)" : "#dcfce7",
                border: isDark ? "1px solid rgba(34, 197, 94, 0.35)" : "1px solid #86efac",
                color: isDark ? "#4ade80" : "#16a34a",
                letterSpacing: "0.08em",
                marginBottom: 10
              }}>
                SECURE PAYMENTS
              </div>
              <h3 style={{ fontSize: "1.35rem", fontWeight: 900, color: tColor.textMain, marginBottom: 4 }}>
                Global &amp; Local Gateways
              </h3>
              <p style={{ color: tColor.textMuted, fontSize: "0.84rem", margin: 0 }}>
                Top-up your wallet instantly through our supported safe networks.
              </p>
            </div>

            {/* 2x2 Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 14
            }}>
              {GATEWAYS.map((gw, idx) => (
                <div key={idx} style={{
                  background: tColor.cardBg,
                  border: `1px solid ${tColor.cardBorder}`,
                  borderRadius: 14,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: tColor.cardShadow
                }}>
                  <div>
                    <div style={{ fontSize: "0.84rem", fontWeight: 800, color: tColor.textMain }}>
                      {gw.name}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: tColor.textMuted }}>
                      {gw.subName}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    {gw.icon}
                    <span style={{
                      fontSize: "0.65rem",
                      fontWeight: 900,
                      color: gw.tagColor,
                      letterSpacing: "0.05em"
                    }}>
                      {gw.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Notice Callout Box */}
            <div style={{
              background: tColor.noticeBg,
              border: `1px solid ${tColor.noticeBorder}`,
              borderRadius: 10,
              padding: "10px 14px",
              textAlign: "center",
              fontSize: "0.78rem",
              color: tColor.noticeText,
              fontStyle: "italic"
            }}>
              To exchange your account wallet via local bank, please open a ticket or contact support directly
            </div>
          </div>

          {/* Right Column: The Ultimate Hub for Professionals */}
          <div style={{
            background: tColor.cardBg,
            border: `1px solid ${tColor.cardBorder}`,
            borderRadius: 18,
            padding: "32px 28px",
            boxShadow: tColor.cardShadow,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            <div>
              <div style={{
                display: "inline-flex",
                padding: "4px 14px",
                borderRadius: 20,
                fontSize: "0.75rem",
                fontWeight: 800,
                background: tColor.badgeBg,
                border: `1px solid ${tColor.badgeBorder}`,
                color: tColor.badgeText,
                marginBottom: 12
              }}>
                SK-unlocker
              </div>
              <h3 style={{ fontSize: "1.45rem", fontWeight: 900, color: tColor.textMain, marginBottom: 12 }}>
                The Ultimate Hub for <span style={{ color: tColor.accent }}>Professionals</span>
              </h3>
              <p style={{ color: tColor.textSub, fontSize: "0.88rem", lineHeight: 1.7, marginBottom: 20 }}>
                We are the direct source for security solutions, software unlocking, and box activations. Experience zero middlemen, instant delivery, robust API integration, and unbeatable wholesale pricing.
              </p>
            </div>

            <div style={{
              background: tColor.hubInnerBg,
              border: `1px solid ${tColor.hubInnerBorder}`,
              borderLeft: `4px solid ${tColor.hubInnerLeftBorder}`,
              borderRadius: 10,
              padding: "16px 18px"
            }}>
              <div style={{
                fontSize: "0.78rem",
                fontWeight: 900,
                color: tColor.accent,
                letterSpacing: "0.08em",
                marginBottom: 6
              }}>
                ATTENTION API USERS &amp; BULK BUYERS
              </div>
              <p style={{ color: tColor.textMuted, fontSize: "0.82rem", margin: 0, lineHeight: 1.6 }}>
                Connect your platform to our Auto-API and enjoy tier-based discounts. Our system processes thousands of requests daily with 98.9% uptime.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Join Our Community */}
      <section style={{
        padding: "48px 24px 60px",
        background: tColor.communityBg,
        borderTop: `1px solid ${tColor.communityBorder}`,
        textAlign: "center"
      }}>
        <h3 style={{ fontSize: "1.4rem", fontWeight: 900, color: tColor.textMain, marginBottom: 8, letterSpacing: "0.05em" }}>
          JOIN OUR COMMUNITY
        </h3>
        <p style={{ color: tColor.textMuted, fontSize: "0.88rem", marginBottom: 28 }}>
          Stay updated with the latest services, prices, and exclusive offers.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 }}>
          {[
            { label: "WHATSAPP", href: "https://wa.me/249118100809", bg: "#0f766e", icon: <Phone size={15} /> },
            { label: "SUPPORT BOT", href: "https://t.me/loaiunlocker", bg: "#0e7490", icon: <MessageCircle size={15} /> },
            { label: "TELEGRAM CHANNEL", href: "https://t.me/loaiunlocker", bg: "#1e40af", icon: <Send size={15} /> },
            { label: "OFFICIAL WEBSITE", href: "/", bg: "#1e3a8a", icon: <Globe size={15} /> },
          ].map((btn, i) => (
            <a key={i} href={btn.href} target={btn.href.startsWith("http") ? "_blank" : "_self"}
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 26px",
                borderRadius: 10,
                textDecoration: "none",
                background: btn.bg,
                color: "#ffffff",
                fontSize: "0.84rem",
                fontWeight: 800,
                letterSpacing: "0.05em",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              {btn.label} {btn.icon}
            </a>
          ))}
        </div>
      </section>

      <style>{`
        @keyframes marquee-slide {
          from { transform: translateX(0%); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
