"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { API_BASE_URL } from "@/config";
import PasswordChangeModal from "./PasswordChangeModal";
import TransactionPasswordModal from "./TransactionPasswordModal";
import ProtectionModal from "./ProtectionModal";
import Footer from "./Footer";
import LanguageSwitcher from './LanguageSwitcher';
import ReferralModal from './ReferralModal';
import AiChatWidget from "./AiChatWidget";
import { FEATURES } from "@/features";
import { useI18n } from "@/lib/i18n";
import {
  Moon,
  Sun,
  X,
  Lock,
  Phone,
  Mail,
  Globe,
  ChevronDown,
  User,
  Wallet,
  ShoppingBag,
  LogOut,
  Key,
  HelpCircle,
  Send,
  Home as HomeIcon,
  Menu as MenuIcon,
  Shield,
  Headphones,
  MessageSquare,
  Video,
  Music,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function MainLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t, meta } = useI18n();

  const [theme, setTheme] = useState("light");
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const servicesMenuRef = useRef(null);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [settings, setSettings] = useState({
    site_name: "SK-unlocker",
    site_logo: "/logo.png",
    services_menu_placements: { desktop: true, mobile: true, footer: true }
  });
  const [logoFailed, setLogoFailed] = useState(false);
  const [txPasswordModalOpen, setTxPasswordModalOpen] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/settings?t=${Date.now()}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          const cleanName = data.site_name?.trim() || "SK-unlocker";
          let cleanLogo = data.site_logo && data.site_logo !== "default" ? data.site_logo : "/logo.png";

          setSettings({
            ...data,
            site_name: cleanName,
            site_logo: cleanLogo
          });
          setLogoFailed(false);
        }
      })
      .catch(err => console.error("Failed to fetch settings", err));
  }, []);

  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(false);
  const [customerUser, setCustomerUser] = useState(null);
  const [menuServices, setMenuServices] = useState([]);
  const [menuCategories, setMenuCategories] = useState([]);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [logoLang, setLogoLang] = useState("ar");

  useEffect(() => {
    const timer = setInterval(() => {
      setLogoLang(prev => prev === "ar" ? "en" : "ar");
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [selectedBalanceCurrency, setSelectedBalanceCurrency] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [showTxPassSuggestion, setShowTxPassSuggestion] = useState(false);
  const [resellerMenuOpen, setResellerMenuOpen] = useState(false);
  const resellerMenuRef = useRef(null);

// 5-Minute Security Suggestion Prompt for setting Transaction Password
useEffect(() => {
  if (!isCustomerLoggedIn) return;

  const isPromptDismissed = localStorage.getItem("tx_pass_prompt_dismissed") === "true";
  if (isPromptDismissed) return;

  const timer = setTimeout(() => {
    setShowTxPassSuggestion(true);
  }, 5 * 60 * 1000); // 5 minutes

  return () => clearTimeout(timer);
}, [isCustomerLoggedIn]);

useEffect(() => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) localStorage.setItem('ref_code', refCode);
  }
  setIsMounted(true);

  // Theme
  const savedTheme = (typeof window !== "undefined" && localStorage.getItem("theme")) || document.documentElement.getAttribute("data-theme") || "light";
  setTheme(savedTheme);
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", savedTheme);
  }

  // Auth
  setIsCustomerLoggedIn(Boolean(localStorage.getItem("customer_token") && localStorage.getItem("customer_user")));
  try {
    const userStr = localStorage.getItem("customer_user");
    setCustomerUser(userStr ? JSON.parse(userStr) : null);
  } catch { }

  // PWA banner is intentionally delayed so it never blocks a first purchase.
  setShowInstallBanner(false);

  // Font Scale
  const savedScale = localStorage.getItem("font_scale");
  const scaleVal = savedScale ? parseFloat(savedScale) : 1;
  setFontScale(Number.isFinite(scaleVal) ? scaleVal : 1);
}, []);

useEffect(() => {
  if (!servicesMenuOpen) return;

  const closeOnOutsidePress = (event) => {
    if (!servicesMenuRef.current?.contains(event.target)) {
      setServicesMenuOpen(false);
    }
  };

  document.addEventListener("pointerdown", closeOnOutsidePress);
  return () => document.removeEventListener("pointerdown", closeOnOutsidePress);
}, [servicesMenuOpen]);

useEffect(() => {
  fetch(`${API_BASE_URL}/api/services/menu`)
    .then(res => res.ok ? res.json() : [])
    .then(data => setMenuServices(Array.isArray(data) ? data : []))
    .catch(err => console.error("Error fetching menu services:", err));

  fetch(`${API_BASE_URL}/api/categories/menu`)
    .then(res => res.ok ? res.json() : [])
    .then(data => setMenuCategories(Array.isArray(data) ? data : []))
    .catch(err => console.error("Error fetching menu categories:", err));
}, []);

useEffect(() => {
  document.documentElement.style.setProperty('--font-scale', fontScale);
}, [fontScale]);

// Smart Inactivity Lock (30 minutes) & Silent Token Refresh
useEffect(() => {
  if (!isCustomerLoggedIn) return;

  let lastActivityTime = Date.now();

  let throttleTimer;
  const handleUserActivity = () => {
    if (throttleTimer) return;
    throttleTimer = setTimeout(() => {
      lastActivityTime = Date.now();
      throttleTimer = null;
    }, 5000); // only register activity every 5 seconds
  };

  const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
  activityEvents.forEach(evt => window.addEventListener(evt, handleUserActivity, { passive: true }));

  // Check inactivity every 1 minute
  const inactivityInterval = setInterval(() => {
    const inactiveMinutes = (Date.now() - lastActivityTime) / (1000 * 60);
    if (inactiveMinutes >= 30) {
      // Auto-lock session due to inactivity for security
      localStorage.removeItem("customer_token");
      localStorage.removeItem("customer_user");
      setIsCustomerLoggedIn(false);
      setCustomerUser(null);
      alert("تم إقفال الجلسة وتأمين حسابك تلقائياً بسبب عدم النشاط لمدة 30 دقيقة.");
      router.push("/login");
    }
  }, 60000);

  // Silent token refresh every 15 minutes if active
  const refreshInterval = setInterval(() => {
    const token = localStorage.getItem("customer_token");
    if (!token) return;

    fetch(`${API_BASE_URL}/api/customer/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.token) {
          localStorage.setItem("customer_token", data.token);
          if (data.customer) {
            localStorage.setItem("customer_user", JSON.stringify(data.customer));
            setCustomerUser(data.customer);
          }
        }
      })
      .catch(err => console.warn("Silent token refresh skipped:", err.message));
  }, 15 * 60 * 1000);

  return () => {
    activityEvents.forEach(evt => window.removeEventListener(evt, handleUserActivity));
    clearInterval(inactivityInterval);
    clearInterval(refreshInterval);
    if (throttleTimer) clearTimeout(throttleTimer);
  };
}, [isCustomerLoggedIn, router]);

const adjustFontScale = (delta) => {
  let nextScale = parseFloat((fontScale + delta).toFixed(2));
  if (nextScale < 0.75) nextScale = 0.75;
  if (nextScale > 1.35) nextScale = 1.35;
  setFontScale(nextScale);
  document.documentElement.style.setProperty('--font-scale', nextScale);
  localStorage.setItem("font_scale", nextScale);
};

const resetFontScale = () => {
  setFontScale(1);
  document.documentElement.style.setProperty('--font-scale', 1);
  localStorage.setItem("font_scale", 1);
};

const handleCustomerLogout = () => {
  localStorage.removeItem("customer_token");
  localStorage.removeItem("customer_user");
  setIsCustomerLoggedIn(false);
  setCustomerUser(null);
  router.push("/login");
};

// Fetch customer profile
const fetchProfile = () => {
  const token = localStorage.getItem("customer_token");
  const userStr = localStorage.getItem("customer_user");

  if (token && userStr) {
    fetch(`${API_BASE_URL}/api/customer/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403 || res.status === 404) {
          handleCustomerLogout();
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then((profile) => {
        if (profile) {
          setCustomerUser(profile);
          localStorage.setItem("customer_user", JSON.stringify(profile));
        }
      })
      .catch(() => { });
  }
};

// Sync profile on mount and on route changes
useEffect(() => {
  fetchProfile();
}, [pathname]);

// Sync theme and setup PWA prompt
useEffect(() => {
  let revealTimer;
  if (typeof window !== "undefined") {
    // Check if already running in standalone PWA mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone
      || document.referrer.includes('android-app://');

    const isDismissed = localStorage.getItem("pwa_dismissed") === "true";
    if (pathname === "/" && !isStandalone && !isDismissed) {
      revealTimer = setTimeout(() => setShowInstallBanner(true), 45000);
    } else {
      setShowInstallBanner(false);
    }
  }

  const handleBeforeInstallPrompt = (e) => {
    e.preventDefault();
    setDeferredPrompt(e);
  };

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

  return () => {
    if (revealTimer) clearTimeout(revealTimer);
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  };
}, [pathname]);

const toggleTheme = () => {
  const nextTheme = theme === "dark" ? "light" : "dark";
  setTheme(nextTheme);
  document.documentElement.setAttribute("data-theme", nextTheme);
  localStorage.setItem("theme", nextTheme);
};

// Removed overflow: hidden to prevent mobile flickering
useEffect(() => {
  // Menu state changes handled here without breaking mobile scroll/layout
}, [menuOpen]);

const renderBalanceDropdownAndValue = (user) => {
  if (!user) return null;
  const baseCurr = "USD";
  const userBalances = user.balances ? (typeof user.balances === 'string' ? JSON.parse(user.balances) : user.balances) : {};

  const availableCurrencies = settings.supported_currencies && settings.supported_currencies.length > 0
    ? settings.supported_currencies
    : [baseCurr];

  const activeCurrency = (selectedBalanceCurrency && availableCurrencies.includes(selectedBalanceCurrency))
    ? selectedBalanceCurrency
    : baseCurr;

  let balanceVal = 0;
  if (activeCurrency === baseCurr) {
    balanceVal = Number(user.balance || 0);
  } else {
    const rate = Number(settings.exchange_rates?.[activeCurrency] || (activeCurrency === "EGP" ? 50 : 600));
    const hasSpecificBalance = userBalances[activeCurrency] !== undefined && Number(userBalances[activeCurrency]) > 0;
    if (hasSpecificBalance) {
      balanceVal = Number(userBalances[activeCurrency]);
    } else if (rate > 0) {
      // Multiply USD balance by foreign rate to get target currency amount
      balanceVal = Number(user.balance || 0) * rate;
    } else {
      balanceVal = 0;
    }
  }

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "4px" }} onClick={(e) => e.stopPropagation()}>
      <span>{t("balance")}:</span>
      <span style={{ fontWeight: 900, color: "var(--primary-color)" }}>
        {(activeCurrency === "USD" || activeCurrency === "USDT") ? `${balanceVal.toFixed(2)} ${activeCurrency}` : `${balanceVal.toFixed(2)}`}
      </span>
      <select
        value={activeCurrency}
        onChange={(e) => setSelectedBalanceCurrency(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "6px",
          color: "var(--primary-color)",
          fontWeight: "bold",
          padding: "2px 4px",
          fontSize: "0.78rem",
          outline: "none",
          cursor: "pointer"
        }}
      >
        {availableCurrencies.map(curr => (
          <option key={curr} value={curr} style={{ background: "var(--bg-main)", color: "#ffffff" }}>
            {curr}
          </option>
        ))}
      </select>
    </div>
  );
};

const handleInstallClick = async () => {
  if (deferredPrompt) {
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA Installation choice: ${outcome}`);
    } catch (err) {
      console.warn("PWA prompt error:", err);
    }
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  } else {
    alert(t("installInstructions"));
  }
};

const navLinks = [
  { href: "/", label: t("home") },
  { href: "/services", label: t("services") },
  { href: "/orders", label: t("myOrders") },
  { href: "/wallet", label: t("wallet") },
  { href: "/terms", label: t("termsRefund") }
];

const isActive = (href) => {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
};

const getPageTitle = () => {
  if (pathname === "/" || pathname === "/Home") return t("home");
  if (pathname.startsWith("/orders")) return t("myOrders");
  if (pathname.startsWith("/wallet")) return t("wallet");
  if (pathname.startsWith("/membership")) return "Membership";
  if (pathname.startsWith("/category")) return t("categoriesServices");
  if (pathname.startsWith("/service")) return t("services");
  if (pathname.startsWith("/login")) return t("login");
  return t("home");
};



if (pathname && pathname.startsWith("/admin")) {
  return <>{children}</>;
}

const isFocusedConversionPage = pathname
  && (pathname.startsWith("/login") || pathname.startsWith("/wallet") || pathname.startsWith("/service"));
const isHomePage = pathname === "/";

return (
  <div className={`app-layout ${isHomePage ? "home-layout" : ""}`} dir={meta.dir}>
    {/* Background (Video removed for performance) */}
    <div className="video-background-container" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -3,
      overflow: 'hidden',
      background: 'var(--bg-color)'
    }}>
    </div>

    {/* Abstract animated shapes - 4 colorful accents */}
    <div className="animated-shape shape-1"></div>
    <div className="animated-shape shape-2"></div>
    <div className="animated-shape shape-3"></div>
    <div className="animated-shape shape-4"></div>


    {/* Mobile Drawer Menu (LOL-UNLOCKER Inspired Design) */}
    {menuOpen && (
      <div className="mobile-drawer-overlay" onClick={() => setMenuOpen(false)} />
    )}
    <div className={`mobile-drawer ${menuOpen ? "open" : "closed"}`} dir={meta.dir} data-i18n-skip>
      {/* Orange Top Header */}
      <div className="mobile-drawer-orange-header">
        <button
          type="button"
          aria-label={t("close") || "Close"}
          className="mobile-drawer-back-btn"
          onClick={() => setMenuOpen(false)}
        >
          <ArrowLeft size={24} color="#ffffff" strokeWidth={2.6} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo.png" alt="SK-unlocker" style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'contain', background: '#ffffff', padding: '2px' }} />
          <span className="mobile-drawer-brand-title">
            SK-UNLOCKER
          </span>
        </div>
      </div>

      {/* Orange Top Buttons Bar */}
      <div className="mobile-drawer-orange-buttons">
        {isCustomerLoggedIn && customerUser ? (
          <div className="mobile-drawer-user-info">
            <div className="mobile-drawer-user-row">
              <span className="mobile-drawer-user-name">
                {customerUser.username}
              </span>
              <div className="mobile-drawer-balance-badge">
                {renderBalanceDropdownAndValue(customerUser)}
              </div>
            </div>
            <div className="mobile-drawer-user-actions">
              <Link
                href="/login"
                className="mobile-drawer-btn-register"
                onClick={() => setMenuOpen(false)}
              >
                {t("account") || "حسابي"}
              </Link>
              <button
                type="button"
                className="mobile-drawer-btn-login"
                onClick={() => { handleCustomerLogout(); setMenuOpen(false); }}
              >
                {t("logout")}
              </button>
            </div>
          </div>
        ) : (
          <div className="mobile-drawer-auth-row">
            <Link
              href="/login?mode=register"
              className="mobile-drawer-btn-register"
              onClick={() => setMenuOpen(false)}
            >
              {meta.language === "ar" ? "تسجيل" : (t("register") || "Register")}
            </Link>
            <Link
              href="/login"
              className="mobile-drawer-btn-login"
              onClick={() => setMenuOpen(false)}
            >
              {meta.language === "ar" ? "تسجيل الدخول" : (t("login") || "Login")}
            </Link>
          </div>
        )}
      </div>

      {/* Menu List Items */}
      <div className="mobile-drawer-list">
        {/* 1. أسعار إعادة البيع */}
        <Link
          href="/resellerpricing"
          className="mobile-drawer-item mobile-drawer-item-heading"
          onClick={() => setMenuOpen(false)}
        >
          <span>{meta.language === "ar" ? "أسعار إعادة البيع" : "Reseller Pricing"}</span>
        </Link>

        {/* 2. خدمة IMEI / iCloud / فتح القفل / التحقق */}
        <Link
          href="/resellerpricing/imei"
          className="mobile-drawer-item"
          onClick={() => setMenuOpen(false)}
        >
          <span>
            {meta.language === "ar"
              ? "خدمة IMEI / iCloud / فتح القفل / التحقق"
              : "IMEI Service / iCloud / Unlock / Check"}
          </span>
          <span className="mobile-drawer-item-arrow">
            {meta.dir === "rtl" ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </span>
        </Link>

        {/* 3. خدمة الخادم / التفعيل / الرصيد / بطاقة الهدايا */}
        <Link
          href="/resellerpricing/server"
          className="mobile-drawer-item"
          onClick={() => setMenuOpen(false)}
        >
          <span>
            {meta.language === "ar"
              ? "خدمة الخادم / التفعيل / الرصيد / بطاقة الهدايا"
              : "Server Service / Activation / Credit / Gift Card"}
          </span>
          <span className="mobile-drawer-item-arrow">
            {meta.dir === "rtl" ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </span>
        </Link>

        {/* 4. خدمة عن بُعد / FRP / وسائل التواصل الاجتماعي */}
        <Link
          href="/resellerpricing/remote"
          className="mobile-drawer-item"
          onClick={() => setMenuOpen(false)}
        >
          <span>
            {meta.language === "ar"
              ? "خدمة عن بُعد / FRP / وسائل التواصل الاجتماعي"
              : "Remote Service / FRP / Social Media"}
          </span>
          <span className="mobile-drawer-item-arrow">
            {meta.dir === "rtl" ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </span>
        </Link>

        {/* 5. قناة التلجرام */}
        <a
          href={settings.telegram_channel || "https://t.me/Elmuizabbas"}
          target="_blank"
          rel="noopener noreferrer"
          className="mobile-drawer-item"
          onClick={() => setMenuOpen(false)}
        >
          <span>{meta.language === "ar" ? "قناة التلجرام" : "Telegram Channel"}</span>
          <span className="mobile-drawer-item-arrow">
            {meta.dir === "rtl" ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </span>
        </a>

        {/* 6. طلباتي */}
        <Link
          href="/orders"
          className="mobile-drawer-item"
          onClick={() => setMenuOpen(false)}
        >
          <span>{t("myOrders") || "طلباتي"}</span>
          <span className="mobile-drawer-item-arrow">
            {meta.dir === "rtl" ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </span>
        </Link>

        {/* 7. المحفظة / شحن الرصيد */}
        <Link
          href="/wallet"
          className="mobile-drawer-item"
          onClick={() => setMenuOpen(false)}
        >
          <span>{t("wallet") || "المحفظة"}</span>
          <span className="mobile-drawer-item-arrow">
            {meta.dir === "rtl" ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </span>
        </Link>

        {/* 8. الشروط وسياسة الاسترجاع */}
        <Link
          href="/terms"
          className="mobile-drawer-item"
          onClick={() => setMenuOpen(false)}
        >
          <span>{t("termsRefund") || "الشروط وسياسة الاسترجاع"}</span>
          <span className="mobile-drawer-item-arrow">
            {meta.dir === "rtl" ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </span>
        </Link>

        {/* 9. توثيق واجهة الربط API */}
        {FEATURES.showApiDocs && (
          <Link
            href="/api-docs"
            className="mobile-drawer-item"
            onClick={() => setMenuOpen(false)}
          >
            <span>{t("apiDocs") || "توثيق API"}</span>
            <span className="mobile-drawer-item-arrow">
              {meta.dir === "rtl" ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </span>
          </Link>
        )}
      </div>

      {/* Drawer Footer: Theme & Language */}
      <div className="mobile-drawer-footer">
        <div className="mobile-drawer-footer-row">
          <span className="mobile-drawer-footer-label">
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            <span>{t("darkMode")}</span>
          </span>
          <button
            onClick={toggleTheme}
            type="button"
            className="mobile-drawer-theme-toggle"
            aria-label="Toggle theme"
          >
            <div
              className={`mobile-drawer-theme-toggle-knob ${theme === 'dark' ? 'dark' : ''}`}
            />
          </button>
        </div>
        <div className="mobile-drawer-lang-row">
          <LanguageSwitcher compact />
        </div>
      </div>
    </div>

    {/* Main Content Area */}
    <div className="main-content">
      {/* PWA Install Banner */}
      {showInstallBanner && !isFocusedConversionPage && (
        <div className="pwa-install-banner">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Phone size={24} />
            <div>
              <strong style={{ display: "block", fontSize: "0.9rem", color: "var(--text-main)", textAlign: meta.dir === "rtl" ? "right" : "left" }}>{t("installApp", { site: settings.site_name })}</strong>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", textAlign: meta.dir === "rtl" ? "right" : "left" }}>{t("installAppDesc")}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              onClick={handleInstallClick}
              className="glass-btn glass-btn-primary"
              style={{ padding: "6px 14px", borderRadius: "8px", fontSize: "0.82rem" }}
            >
              {t("installNow")}
            </button>
            <button
              onClick={() => {
                setShowInstallBanner(false);
                localStorage.setItem("pwa_dismissed", "true");
              }}
              style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "0 5px", fontSize: "1.1rem" }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Top Cyber Stream Bar */}
      <div className="cyber-stream-container" dir="ltr" style={{
        background: theme === 'light' ? 'linear-gradient(90deg, #f0f7ff 0%, #e0f2fe 50%, #f0f7ff 100%)' : 'linear-gradient(270deg, #152238, #1d3557, #10172a, #1a3a60)',
        borderTop: theme === 'light' ? '1px solid #bae6fd' : '1px solid rgba(56, 189, 248, 0.3)',
        borderBottom: theme === 'light' ? '1px solid #bae6fd' : '1px solid rgba(56, 189, 248, 0.3)',
        display: 'flex',
        alignItems: 'center',
        padding: '6px 12px'
      }}>
        <Link href="/wallet" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          background: theme === 'light' ? '#ffffff' : 'rgba(255,255,255,0.08)',
          border: theme === 'light' ? '1px solid #bfdbfe' : '1px solid rgba(56,189,248,0.3)',
          borderRadius: '20px',
          fontSize: '0.78rem',
          fontWeight: 800,
          color: theme === 'light' ? '#0284c7' : '#38bdf8',
          textDecoration: 'none',
          marginLeft: '12px',
          flexShrink: 0,
          boxShadow: theme === 'light' ? '0 1px 4px rgba(0,0,0,0.05)' : 'none'
        }}>
          كوبون مجاني
        </Link>
        <div className="stream-bar" id="streamTopBar" style={{
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          padding: '0'
        }}>
          <div className="stream-marquee" style={{ gap: '16px', alignItems: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 12px', background: theme === 'light' ? '#e0f2fe' : 'rgba(56, 189, 248, 0.2)', border: theme === 'light' ? '1px solid #7dd3fc' : '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '20px', color: theme === 'light' ? '#0284c7' : '#38bdf8', fontSize: '13px', fontWeight: 800 }}>Welcome To {settings.site_name || "SK-unlocker"}</span>
            <span className="stream-text" style={{ color: theme === 'light' ? '#334155' : '#ffffff' }}>Activations And Box Tools</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 12px', background: theme === 'light' ? '#dcfce7' : 'rgba(74, 222, 128, 0.2)', border: theme === 'light' ? '1px solid #86efac' : '1px solid rgba(74, 222, 128, 0.4)', borderRadius: '20px', color: theme === 'light' ? '#16a34a' : '#4ade80', fontSize: '13px', fontWeight: 800 }}>Added Credit For All Box Tool</span>
            <span className="stream-text" style={{ color: theme === 'light' ? '#334155' : '#ffffff' }}>Gift Card Google Play and iTunes</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 12px', background: theme === 'light' ? '#f3e8ff' : 'rgba(192, 132, 252, 0.2)', border: theme === 'light' ? '1px solid #d8b4fe' : '1px solid rgba(192, 132, 252, 0.4)', borderRadius: '20px', color: theme === 'light' ? '#9333ea' : '#c084fc', fontSize: '13px', fontWeight: 800 }}>Added UC for PUBG Mobile and FreeFire</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 12px', background: theme === 'light' ? '#fee2e2' : 'rgba(239, 68, 68, 0.2)', border: theme === 'light' ? '1px solid #fca5a5' : '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '20px', color: theme === 'light' ? '#dc2626' : '#ef4444', fontSize: '13px', fontWeight: 800 }}>Remove Visa</span>
            <span className="stream-text" style={{ color: theme === 'light' ? '#334155' : '#ffffff' }}>Remove iCloud Slow</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 12px', background: theme === 'light' ? '#e0f2fe' : 'rgba(56, 189, 248, 0.2)', border: theme === 'light' ? '1px solid #7dd3fc' : '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '20px', color: theme === 'light' ? '#0284c7' : '#38bdf8', fontSize: '13px', fontWeight: 800 }}>Remove Samsung FRP by IMEI</span>
            {/* Seamless repetition for smooth loop */}
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 12px', background: theme === 'light' ? '#e0f2fe' : 'rgba(56, 189, 248, 0.2)', border: theme === 'light' ? '1px solid #7dd3fc' : '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '20px', color: theme === 'light' ? '#0284c7' : '#38bdf8', fontSize: '13px', fontWeight: 800 }}>Welcome To {settings.site_name || "SK-unlocker"}</span>
            <span className="stream-text" style={{ color: theme === 'light' ? '#334155' : '#ffffff' }}>Activations And Box Tools</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 12px', background: theme === 'light' ? '#dcfce7' : 'rgba(74, 222, 128, 0.2)', border: theme === 'light' ? '1px solid #86efac' : '1px solid rgba(74, 222, 128, 0.4)', borderRadius: '20px', color: theme === 'light' ? '#16a34a' : '#4ade80', fontSize: '13px', fontWeight: 800 }}>Added Credit For All Box Tool</span>
            <span className="stream-text" style={{ color: theme === 'light' ? '#334155' : '#ffffff' }}>Gift Card Google Play and iTunes</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 12px', background: theme === 'light' ? '#f3e8ff' : 'rgba(192, 132, 252, 0.2)', border: theme === 'light' ? '1px solid #d8b4fe' : '1px solid rgba(192, 132, 252, 0.4)', borderRadius: '20px', color: theme === 'light' ? '#9333ea' : '#c084fc', fontSize: '13px', fontWeight: 800 }}>Added UC for PUBG Mobile and FreeFire</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 12px', background: theme === 'light' ? '#fee2e2' : 'rgba(239, 68, 68, 0.2)', border: theme === 'light' ? '1px solid #fca5a5' : '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '20px', color: theme === 'light' ? '#dc2626' : '#ef4444', fontSize: '13px', fontWeight: 800 }}>Remove Visa</span>
            <span className="stream-text" style={{ color: theme === 'light' ? '#334155' : '#ffffff' }}>Remove iCloud Slow</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 12px', background: theme === 'light' ? '#e0f2fe' : 'rgba(56, 189, 248, 0.2)', border: theme === 'light' ? '1px solid #7dd3fc' : '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '20px', color: theme === 'light' ? '#0284c7' : '#38bdf8', fontSize: '13px', fontWeight: 800 }}>Remove Samsung FRP by IMEI</span>
          </div>
        </div>
      </div>

      {/* Top Header Contact Bar */}
      <div className="header-top" style={{
        background: theme === 'light' ? '#ffffff' : '#10172a',
        borderBottom: theme === 'light' ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.08)',
        padding: '6px 20px',
        fontSize: '0.84rem'
      }}>
        <div style={{ maxWidth: '1500px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', color: theme === 'light' ? '#475569' : '#94a3b8' }}>
            <a href="tel:+249118100809" style={{ color: theme === 'light' ? '#0284c7' : '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              <Phone size={13} color="#0284c7" />
              <bdi dir="ltr">+249 11 810 0809</bdi>
            </a>
            <a href="mailto:support@sk-unlocker.com" className="header-top-email" style={{ color: theme === 'light' ? '#0284c7' : '#94a3b8', textDecoration: 'none', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              <Mail size={13} color="#0284c7" />
              <span>support@sk-unlocker.com</span>
            </a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Master Navigation Header */}
      <header
        className="main-master-header"
        style={{
          background: theme === 'light' ? '#ffffff' : '#1C2533',
          borderBottom: theme === 'light' ? '1px solid #e2e8f0' : '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: theme === 'light' ? '0 2px 10px rgba(0, 0, 0, 0.03)' : '0 4px 20px rgba(0, 0, 0, 0.35)',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}
      >
        <div className="main-navbar-inner" style={{ maxWidth: '1500px', margin: '0 auto', padding: '0 16px', height: '68px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

          {/* Logo and Brand */}
          <div className="main-navbar-brand-wrap" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="header-btn header-menu-trigger main-navbar-menu-btn"
              type="button"
              aria-label={t("menu")}
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ width: '40px', height: '40px', background: theme === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.06)', borderRadius: '8px', border: theme === 'light' ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.1)' }}
            >
              <MenuIcon size={20} color="#0284c7" />
            </button>

            <Link href="/" className="main-navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
              <div className="main-navbar-logo" style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#ffffff', border: '1.5px solid #0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '2px', boxShadow: '0 4px 12px rgba(2,132,199,0.25)', flexShrink: 0 }}>
                <img
                  src="/logo.png"
                  alt={settings.site_name || "SK-unlocker"}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <span className="main-navbar-title" style={{ color: theme === 'light' ? '#0f172a' : '#ffffff', fontWeight: '900', fontSize: '1.15rem', letterSpacing: '0.3px', display: 'block' }}>
                  {settings.site_name || "SK-unlocker"}
                </span>
                <span className="main-navbar-subtitle" style={{ color: '#0284c7', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.3px', display: 'block' }}>
                  GSM - Mobile &amp; Server Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="main-desktop-nav" style={{ alignItems: 'center', gap: '24px' }}>
            <Link
              href="/"
              style={{
                color: pathname === '/' ? '#0284c7' : (theme === 'light' ? '#334155' : '#e2e8f0'),
                textDecoration: 'none',
                fontWeight: '800',
                fontSize: '0.92rem',
                transition: 'color 0.2s ease'
              }}
            >
              {t("home")}
            </Link>

            {/* Reseller Pricing Dropdown */}
            <div
              ref={resellerMenuRef}
              style={{ position: 'relative' }}
              onMouseEnter={() => setResellerMenuOpen(true)}
              onMouseLeave={() => setResellerMenuOpen(false)}
            >
              <Link
                href="/resellerpricing"
                style={{
                  color: (pathname.startsWith('/services') || pathname.startsWith('/resellerpricing')) ? '#0284c7' : (theme === 'light' ? '#334155' : '#e2e8f0'),
                  textDecoration: 'none',
                  fontWeight: '700',
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'color 0.2s ease'
                }}
              >
                <span>{meta.language === "ar" ? "أسعار إعادة البيع" : "Reseller Pricing"}</span>
                <ChevronDown size={14} />
              </Link>
              {resellerMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: meta.dir === 'rtl' ? '0' : 'auto',
                    left: meta.dir === 'rtl' ? 'auto' : '0',
                    background: theme === 'light' ? '#ffffff' : '#162232',
                    border: theme === 'light' ? '1px solid #e2e8f0' : '1px solid rgba(56, 189, 248, 0.25)',
                    borderRadius: '10px',
                    padding: '8px 0',
                    minWidth: '280px',
                    boxShadow: theme === 'light' ? '0 10px 30px rgba(0,0,0,0.08)' : '0 10px 30px rgba(0,0,0,0.5)',
                    zIndex: 1001
                  }}
                >
                  <Link
                    href="/resellerpricing/imei"
                    onClick={() => setResellerMenuOpen(false)}
                    style={{ display: 'block', padding: '10px 18px', color: theme === 'light' ? '#1e293b' : '#f8fafc', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '600', transition: 'background-color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = theme === 'light' ? '#f0f9ff' : 'rgba(56, 189, 248, 0.12)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {meta.language === "ar" ? "خدمة IMEI / iCloud / فتح القفل / التحقق" : "IMEI Service / iCloud / Unlock / Check"}
                  </Link>
                  <Link
                    href="/resellerpricing/server"
                    onClick={() => setResellerMenuOpen(false)}
                    style={{ display: 'block', padding: '10px 18px', color: theme === 'light' ? '#1e293b' : '#f8fafc', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '600', transition: 'background-color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = theme === 'light' ? '#f0f9ff' : 'rgba(56, 189, 248, 0.12)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {meta.language === "ar" ? "خدمة الخادم / التفعيل / الرصيد / بطاقة الهدايا" : "Server Service / Activation / Credit / Gift Card"}
                  </Link>
                  <Link
                    href="/resellerpricing/remote"
                    onClick={() => setResellerMenuOpen(false)}
                    style={{ display: 'block', padding: '10px 18px', color: theme === 'light' ? '#1e293b' : '#f8fafc', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '600', transition: 'background-color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = theme === 'light' ? '#f0f9ff' : 'rgba(56, 189, 248, 0.12)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {meta.language === "ar" ? "خدمة عن بُعد / FRP / وسائل التواصل الاجتماعي" : "Remote Service / FRP / Social Media"}
                  </Link>
                  <Link
                    href="/resellerpricing"
                    onClick={() => setResellerMenuOpen(false)}
                    style={{ display: 'block', padding: '10px 18px', color: theme === 'light' ? '#0284c7' : '#38bdf8', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '700', borderTop: theme === 'light' ? '1px solid #f1f5f9' : '1px solid rgba(255,255,255,0.06)', transition: 'background-color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = theme === 'light' ? '#f0f9ff' : 'rgba(56, 189, 248, 0.12)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {meta.language === "ar" ? "كافة الخدمات" : "All Services"}
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/login?mode=register"
              style={{
                color: theme === 'light' ? '#334155' : '#e2e8f0',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '0.92rem',
                transition: 'color 0.2s ease'
              }}
            >
              {meta.language === "ar" ? "تسجيل جديد" : "Registration"}
            </Link>

            <a
              href="https://t.me/loaiunlocker"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: theme === 'light' ? '#334155' : '#e2e8f0',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'color 0.2s ease'
              }}
            >
              <Send size={15} color="#0284c7" />
              <span>{meta.language === "ar" ? "قناة التيليجرام" : "Telegram Channel"}</span>
            </a>
          </nav>

          {/* Right Side Actions: Theme & Login / User Button */}
          <div className="main-navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={toggleTheme}
              aria-label={t("toggleTheme")}
              className="main-navbar-theme-btn"
              style={{
                padding: '7px',
                borderRadius: '8px',
                border: theme === 'light' ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.1)',
                background: theme === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.05)',
                cursor: 'pointer',
                color: theme === 'light' ? '#475569' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isCustomerLoggedIn && customerUser ? (
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 14px',
                    background: theme === 'light' ? '#e0f2fe' : 'rgba(56, 189, 248, 0.12)',
                    border: theme === 'light' ? '1px solid #bae6fd' : '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: theme === 'light' ? '#0284c7' : '#ffffff'
                  }}
                >
                  <User size={16} color="#0284c7" />
                  <span style={{ fontSize: '0.88rem', fontWeight: 'bold' }}>{customerUser.username}</span>
                  <ChevronDown size={14} color="#64748b" />
                </button>

                {profileMenuOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: meta.dir === 'rtl' ? '0' : 'auto',
                    left: meta.dir === 'rtl' ? 'auto' : '0',
                    marginTop: '8px',
                    width: '230px',
                    background: theme === 'light' ? '#ffffff' : '#162232',
                    border: theme === 'light' ? '1px solid #e2e8f0' : '1px solid rgba(56, 189, 248, 0.25)',
                    borderRadius: '12px',
                    padding: '8px',
                    boxShadow: theme === 'light' ? '0 10px 25px rgba(0,0,0,0.08)' : '0 10px 25px rgba(0,0,0,0.5)',
                    zIndex: 1000
                  }}>
                    <div style={{ padding: '8px', borderBottom: theme === 'light' ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.08)', marginBottom: '6px' }}>
                      <div style={{ color: '#d97706', fontWeight: 800, fontSize: '0.88rem' }}>
                        {renderBalanceDropdownAndValue(customerUser)}
                      </div>
                    </div>
                    <Link href="/orders" className="header-dropdown-item" onClick={() => setProfileMenuOpen(false)}>
                      <ShoppingBag size={14} /> {t("myOrders")}
                    </Link>
                    <Link href="/wallet" className="header-dropdown-item" onClick={() => setProfileMenuOpen(false)}>
                      <Wallet size={14} /> {t("chargeWallet")}
                    </Link>
                    <Link href="/referrals" className="header-dropdown-item" onClick={() => setProfileMenuOpen(false)}>
                      <User size={14} /> {meta.language === "ar" ? "الإحالات والمكافآت" : "Referrals & Rewards"}
                    </Link>
                    {FEATURES.showApiDocs && (
                      <Link href="/api-docs" className="header-dropdown-item" onClick={() => setProfileMenuOpen(false)}>
                        <Key size={14} /> {t("apiDocs")}
                      </Link>
                    )}
                    <button onClick={() => { setProfileMenuOpen(false); window.dispatchEvent(new CustomEvent('openPasswordChangeModal')); }} className="header-dropdown-item" type="button" style={{ width: '100%', textAlign: meta.dir === "rtl" ? 'right' : 'left' }}>
                      <Key size={14} /> {t("changePassword")}
                    </button>
                    <button onClick={() => { handleCustomerLogout(); setProfileMenuOpen(false); }} className="header-dropdown-item" style={{ color: '#ef4444', width: '100%', textAlign: meta.dir === "rtl" ? 'right' : 'left' }} type="button">
                      <LogOut size={14} /> {t("logout")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Link
                  href="/login"
                  className="main-navbar-login-btn"
                  style={{
                    textDecoration: 'none',
                    padding: '8px 20px',
                    background: '#f59e0b',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontWeight: '800',
                    fontSize: '0.88rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
                    transition: 'background-color 0.2s ease',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#d97706'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f59e0b'}
                >
                  <Key size={15} />
                  <span>{meta.language === "ar" ? "تسجيل الدخول" : (t("login") || "Login")}</span>
                </Link>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Child Pages Content */}
      <ReferralModal customerUser={customerUser} API_BASE_URL={API_BASE_URL} enabled={pathname !== "/referrals"} />
      <main className={`main-content-inner${(pathname === "/" || pathname?.startsWith("/resellerpricing") || pathname?.startsWith("/services")) ? " full-bleed home-page-inner" : ""}`}>
        {children}
        <PasswordChangeModal />
        <TransactionPasswordModal isOpen={txPasswordModalOpen} onClose={() => setTxPasswordModalOpen(false)} />
        <ProtectionModal />

        {/* 5-Minute Transaction Password Security Suggestion Modal */}
        {showTxPassSuggestion && (
          <div style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}>
            <div style={{
              background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)",
              border: "2px solid #f59e0b",
              borderRadius: "24px",
              padding: "28px",
              maxWidth: "420px",
              width: "100%",
              textAlign: "center",
              color: "#ffffff",
              boxShadow: "0 20px 40px rgba(245, 158, 11, 0.3)"
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: "10px" }}>
                <Shield size={44} color="#fbbf24" />
              </div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "900", color: "#fbbf24", marginBottom: "10px" }}>
                {t("securityTipTitle")}
              </h3>
              <p style={{ fontSize: "0.92rem", color: "#cbd5e1", lineHeight: "1.6", marginBottom: "22px" }}>
                {t("securityTipBody")}
              </p>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => {
                    setShowTxPassSuggestion(false);
                    localStorage.setItem("tx_pass_prompt_dismissed", "true");
                    router.push("/login");
                  }}
                  className="btn-show-more-gold"
                  style={{ flex: 1, padding: "10px", borderRadius: "12px", fontSize: "0.95rem" }}
                >
                  {t("setNow")}
                </button>
                <button
                  onClick={() => {
                    setShowTxPassSuggestion(false);
                    localStorage.setItem("tx_pass_prompt_dismissed", "true");
                  }}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "#cbd5e1",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
                >
                  {t("later")}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer
        siteName={settings.site_name}
        siteLogo={settings.site_logo}
        showServices={settings.services_menu_placements?.footer === true}
      />
    </div>

    {/* Mobile Bottom Navigation Bar */}
    {!isFocusedConversionPage && <nav className="bottom-nav">
      <Link href="/" className={`bottom-nav-item ${pathname === "/" ? "active" : ""}`}>
        <span className="bottom-nav-icon"><HomeIcon size={18} /></span>
        <span className="bottom-nav-label">{t("home")}</span>
      </Link>
      <Link href="/orders" className={`bottom-nav-item ${pathname.startsWith("/orders") ? "active" : ""}`}>
        <span className="bottom-nav-icon"><ShoppingBag size={18} /></span>
        <span className="bottom-nav-label">{t("myOrders")}</span>
      </Link>
      <Link href="/wallet" className={`bottom-nav-item ${pathname.startsWith("/wallet") ? "active" : ""}`}>
        <span className="bottom-nav-icon"><Wallet size={18} /></span>
        <span className="bottom-nav-label">{t("myWallet")}</span>
      </Link>
      <Link href="/login" className={`bottom-nav-item ${pathname.startsWith("/login") ? "active" : ""}`}>
        <span className="bottom-nav-icon"><User size={18} /></span>
        <span className="bottom-nav-label">{t("login")}</span>
      </Link>
    </nav>}

    {/* Support Channels Modal */}
    {supportModalOpen && (
      <div
        onClick={() => setSupportModalOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(4, 6, 14, 0.8)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          zIndex: 2000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          animation: "fadeIn 0.2s ease"
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "rgba(17, 22, 45, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "24px",
            padding: "25px",
            maxWidth: "480px",
            width: "100%",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
            direction: meta.dir
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 900, color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
              <MessageSquare size={20} color="#38bdf8" /> {t("supportTitle")}
            </h3>
            <button
              onClick={() => setSupportModalOpen(false)}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                color: "#cbd5e1",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.9rem"
              }}
            >
              ✕
            </button>
          </div>

          <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: 0, marginBottom: "20px", lineHeight: "1.5" }}>
            {t("supportIntro")}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* WhatsApp Support 1 */}
            <a
              href="https://wa.me/249118100809"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.15)",
                borderRadius: "14px",
                color: "#10b981",
                textDecoration: "none",
                fontWeight: "bold",
                fontSize: "0.92rem",
                transition: "transform 0.2s"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Phone size={18} color="#10b981" />
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>{t("whatsappAdmin1")}</span>
                  <span dir="ltr" style={{ direction: "ltr", unicodeBidi: "isolate" }}>(+249 11 810 0809)</span>
                </div>
              </div>
              <span style={{ color: "#10b981" }}>{meta.dir === "rtl" ? "←" : "→"}</span>
            </a>

            {/* WhatsApp Support 2 */}
            <a
              href="https://wa.me/249927922237"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                background: "rgba(34, 211, 238, 0.1)",
                border: "1px solid rgba(34, 211, 238, 0.15)",
                borderRadius: "14px",
                color: "#22d3ee",
                textDecoration: "none",
                fontWeight: "bold",
                fontSize: "0.92rem",
                transition: "transform 0.2s"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Phone size={18} color="#22d3ee" />
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>{t("whatsappAdmin2")}</span>
                  <span dir="ltr" style={{ direction: "ltr", unicodeBidi: "isolate" }}>(+249 92 792 2237)</span>
                </div>
              </div>
              <span style={{ color: "#22d3ee" }}>{meta.dir === "rtl" ? "←" : "→"}</span>
            </a>

            {/* Facebook Page */}
            <a
              href="https://www.facebook.com/profile.php?id=100029216807637"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                background: "rgba(24, 119, 242, 0.08)",
                border: "1px solid rgba(24, 119, 242, 0.15)",
                borderRadius: "14px",
                color: "#478bfb",
                textDecoration: "none",
                fontWeight: "bold",
                fontSize: "0.92rem",
                transition: "transform 0.2s"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Globe size={18} color="#478bfb" />
                <span>{t("facebookPage")}</span>
              </div>
              <span style={{ color: "#478bfb" }}>{meta.dir === "rtl" ? "←" : "→"}</span>
            </a>

            {/* TikTok Account */}
            <a
              href="https://tiktok.com/@249118100809elmuiz"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                background: "rgba(254, 44, 85, 0.08)",
                border: "1px solid rgba(254, 44, 85, 0.15)",
                borderRadius: "14px",
                color: "#fe2c55",
                textDecoration: "none",
                fontWeight: "bold",
                fontSize: "0.92rem",
                transition: "transform 0.2s"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Music size={18} color="#fe2c55" />
                <span>{t("tiktokAccount")}</span>
              </div>
              <span style={{ color: "#fe2c55" }}>{meta.dir === "rtl" ? "←" : "→"}</span>
            </a>

            {/* Telegram Channel */}
            <a
              href="https://t.me/Elmuizabbas"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                background: "rgba(0, 136, 204, 0.08)",
                border: "1px solid rgba(0, 136, 204, 0.15)",
                borderRadius: "14px",
                color: "#0088cc",
                textDecoration: "none",
                fontWeight: "bold",
                fontSize: "0.92rem",
                transition: "transform 0.2s"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Send size={18} color="#0088cc" />
                <span>{t("telegramChannel")}</span>
              </div>
              <span style={{ color: "#0088cc" }}>{meta.dir === "rtl" ? "←" : "→"}</span>
            </a>

            {/* YouTube Channel */}
            <a
              href="https://www.youtube.com/@elmuizabba24"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                background: "rgba(255, 0, 0, 0.08)",
                border: "1px solid rgba(255, 0, 0, 0.15)",
                borderRadius: "14px",
                color: "#ff4d4d",
                textDecoration: "none",
                fontWeight: "bold",
                fontSize: "0.92rem",
                transition: "transform 0.2s"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Video size={18} color="#ff4d4d" />
                <span>{t("youtubeChannel")}</span>
              </div>
              <span style={{ color: "#ff4d4d" }}>{meta.dir === "rtl" ? "←" : "→"}</span>
            </a>

            {/* Email Support */}
            <a
              href="mailto:support@sk-unlocker.com"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.15)",
                borderRadius: "14px",
                color: "#ef4444",
                textDecoration: "none",
                fontWeight: "bold",
                fontSize: "0.92rem",
                transition: "transform 0.2s"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Mail size={18} color="#ef4444" />
                <span>{t("emailSupport")} (support@sk-unlocker.com)</span>
              </div>
              <span style={{ color: "#ef4444" }}>{meta.dir === "rtl" ? "←" : "→"}</span>
            </a>
          </div>
        </div>
      </div>
    )}



    <AiChatWidget />
  </div>
);
}




