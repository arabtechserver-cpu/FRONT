"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Locale } from "@/i18n/config";
import { useTheme } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";

interface NavbarProps {
  lang: Locale;
  dict: any;
  initialAnnouncementBar?: {
    enabled?: boolean;
    title?: string;
    linkText?: string;
    linkUrl?: string;
  };
}

interface UserSession {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  country?: string;
  balance?: number;
  role?: string;
  membershipTier?: {
    id: string;
    name: string;
    nameAr?: string;
    discountPercentage: number;
    badgeColor?: string;
  } | null;
  effectiveDiscount?: number;
}

interface CurrencyInfo {
  code: string;
  nameAr: string;
  nameEn: string;
  symbolAr: string;
  symbolEn: string;
  rate: number;
}

const CURRENCIES: CurrencyInfo[] = [
  { code: "USD", nameAr: "دولار أمريكي", nameEn: "US Dollar", symbolAr: "$", symbolEn: "$", rate: 1.0 },
  { code: "SDG", nameAr: "جنيه سوداني", nameEn: "Sudanese Pound", symbolAr: "ج.س", symbolEn: "SDG", rate: 600.0 },
  { code: "SAR", nameAr: "ريال سعودي", nameEn: "Saudi Riyal", symbolAr: "ر.س", symbolEn: "SAR", rate: 3.75 },
  { code: "EGP", nameAr: "جنيه مصري", nameEn: "Egyptian Pound", symbolAr: "ج.م", symbolEn: "EGP", rate: 50.0 },
  { code: "AED", nameAr: "درهم إماراتي", nameEn: "UAE Dirham", symbolAr: "د.إ", symbolEn: "AED", rate: 3.67 },
];

export default function Navbar({ lang, dict, initialAnnouncementBar }: NavbarProps) {
  const isAr = lang === "ar";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [resellerDropdownOpen, setResellerDropdownOpen] = useState(false);

  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>("USD");
  const { theme, toggleTheme } = useTheme();
  const { cartCount, setIsCartOpen } = useCart();
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);
  const resellerDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const savedCurrency = localStorage.getItem("app_currency");
    if (savedCurrency && CURRENCIES.some((c) => c.code === savedCurrency)) {
      setSelectedCurrencyCode(savedCurrency);
    }

    const loadSession = async () => {
      const saved = localStorage.getItem("user_session");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setUserSession(parsed);

          if (parsed?.email || parsed?.id) {
            const token = localStorage.getItem("user_token");
            const queryParam = parsed.id
              ? `userId=${encodeURIComponent(parsed.id)}`
              : `email=${encodeURIComponent(parsed.email)}`;
            const headers: Record<string, string> = {};
            if (token && token !== "null" && token !== "undefined") {
              headers["Authorization"] = `Bearer ${token}`;
            }
            const res = await fetch(`/api/users/profile?${queryParam}`, {
              headers,
              credentials: "omit",
            });
            if (res.ok) {
              const data = await res.json().catch(() => null);
              if (data && data.success && data.user) {
                const freshUser = { ...parsed, ...data.user };
                localStorage.setItem("user_session", JSON.stringify(freshUser));
                setUserSession(freshUser);
              }
            }
          }
        } catch {
          setUserSession(null);
        }
      } else {
        setUserSession(null);
      }
    };

    loadSession();
    window.addEventListener("user_session_change", loadSession);
    window.addEventListener("storage", loadSession);

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (userDropdownRef.current && !userDropdownRef.current.contains(target)) {
        setUserDropdownOpen(false);
      }
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(target)) {
        setCurrencyDropdownOpen(false);
      }
      if (resellerDropdownRef.current && !resellerDropdownRef.current.contains(target)) {
        setResellerDropdownOpen(false);
      }

    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("user_session_change", loadSession);
      window.removeEventListener("storage", loadSession);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setCurrencyDropdownOpen(false);
    setResellerDropdownOpen(false);

  }, [pathname]);

  const handleCurrencyChange = (code: string) => {
    setSelectedCurrencyCode(code);
    localStorage.setItem("app_currency", code);
    setCurrencyDropdownOpen(false);
    window.dispatchEvent(new Event("currency_change"));
  };

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    localStorage.removeItem("user_token");
    setUserSession(null);
    setUserDropdownOpen(false);
    window.dispatchEvent(new Event("user_session_change"));
    router.refresh();
  };

  const switchLanguage = () => {
    const newLang = lang === "ar" ? "en" : "ar";
    if (!pathname) return `/${newLang}`;
    const segments = pathname.split("/");
    if (segments.length > 1) {
      segments[1] = newLang;
      return segments.join("/");
    }
    return `/${newLang}`;
  };

  const isActive = (path: string) => {
    if (!pathname) return false;
    const fullPath = `/${lang}${path === "/" ? "" : path}`;
    if (path === "/") {
      return pathname === `/${lang}` || pathname === `/${lang}/`;
    }
    return pathname.startsWith(fullPath);
  };

  const currentCurrency =
    CURRENCIES.find((c) => c.code === selectedCurrencyCode) || CURRENCIES[0];

  const formatBalance = (usdAmount: number = 0) => {
    const converted = usdAmount * currentCurrency.rate;
    const formatted = converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return isAr
      ? `${formatted} ${currentCurrency.symbolAr}`
      : `${currentCurrency.symbolEn} ${formatted}`;
  };

  return (
    <>
      {/* Sticky Header Bar */}
      <header className="hx-bar">
        <div className="hx-inner">
          {/* Logo — always first so it's on the right edge in RTL */}
          <div className="hx-logo">
            <Link href={`/${lang}`}>
              <img src="/images/borai-logo.png?v=2" alt="BORAI SERVER" />
            </Link>
          </div>

          {/* Center Section: Desktop Navigation Links */}
          <div className="hx-center">
            <nav className="hx-desktop-nav" aria-label={isAr ? "التنقل الرئيسي" : "Main Navigation"}>
              <Link
                href={`/${lang}`}
                className={`hx-nav-link ${isActive("/") ? "active" : ""}`}
              >
                <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
                  <path d="M3 9.5L12 3l9 6.5V21H16v-5h-4v5H3V9.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
                <span>{isAr ? "الرئيسية" : "Home"}</span>
              </Link>



              {/* Reseller Pricing Dropdown */}
              <div className="relative" ref={resellerDropdownRef} style={{ position: "relative" }}>
                <button
                  type="button"
                  aria-label={isAr ? "قائمة الأسعار" : "Price List"}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 ${isActive("/pricing") ? "text-primary" : ""}`}
                  onClick={() => setResellerDropdownOpen(!resellerDropdownOpen)}
                >
                  <span>{isAr ? "قائمة الأسعار" : "Price List"}</span>
                  <span
                    className="material-symbols-outlined text-base transition-transform duration-300"
                    style={{ transform: resellerDropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  >
                    expand_more
                  </span>
                </button>

                {resellerDropdownOpen && (
                  <div
                    className="account-dropdown-menu open"
                    style={{ minWidth: "190px", top: "calc(100% + 6px)", left: isAr ? "auto" : "0", right: isAr ? "0" : "auto" }}
                  >
                    <Link
                      href={`/${lang}/pricing?cat=imei`}
                      className="acdd-item"
                      onClick={() => setResellerDropdownOpen(false)}
                    >
                      <div className="acdd-ico">
                        <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
                          <rect x="5" y="2" width="14" height="20" rx="3" stroke="currentColor" strokeWidth="1.6" />
                          <circle cx="12" cy="18" r="1" fill="currentColor" />
                        </svg>
                      </div>
                      <span>{isAr ? "خدمات IMEI" : "IMEI Services"}</span>
                    </Link>

                    <Link
                      href={`/${lang}/pricing?cat=server`}
                      className="acdd-item"
                      onClick={() => setResellerDropdownOpen(false)}
                    >
                      <div className="acdd-ico">
                        <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
                          <rect x="2" y="3" width="20" height="7" rx="2" stroke="currentColor" strokeWidth="1.6" />
                          <rect x="2" y="14" width="20" height="7" rx="2" stroke="currentColor" strokeWidth="1.6" />
                        </svg>
                      </div>
                      <span>{isAr ? "خدمات السيرفر" : "Server Services"}</span>
                    </Link>

                    <Link
                      href={`/${lang}/pricing?cat=remote`}
                      className="acdd-item"
                      onClick={() => setResellerDropdownOpen(false)}
                    >
                      <div className="acdd-ico">
                        <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
                          <rect x="2" y="4" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
                          <line x1="8" y1="20" x2="16" y2="20" stroke="currentColor" strokeWidth="1.6" />
                        </svg>
                      </div>
                      <span>{isAr ? "الخدمات عن بعد" : "Remote Services"}</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Gaming & Social Media Services */}
              <Link
                href={`/${lang}/services`}
                className={`hx-nav-link ${isActive("/services") || isActive("/gaming") ? "active" : ""}`}
              >
                <span className="material-symbols-outlined text-[17px]">sports_esports</span>
                <span>{isAr ? "خدمات الألعاب والسوشيال ميديا" : "Gaming & Digital"}</span>
              </Link>

              {/* Orders */}
              <Link
                href={`/${lang}/orders`}
                suppressHydrationWarning
                className={`hx-nav-link ${isActive("/orders") ? "active" : ""}`}
              >
                <span>{isAr ? "الطلبات" : "Orders"}</span>
              </Link>

              {/* Wallet */}
              <Link
                href={`/${lang}/wallet`}
                suppressHydrationWarning
                className={`hx-nav-link ${isActive("/wallet") ? "active" : ""}`}
              >
                <span>{isAr ? "المحفظة والشحن" : "Wallet & Top-up"}</span>
              </Link>
            </nav>
          </div>

          {/* Left Section: Currency, Language, User Dropdown / Login, Cart */}
          <div className="hx-left">
            {/* Currency Selector Pill (Hidden on narrow mobile <400px to avoid header overflow, available in mobile drawer) */}
            <div className="relative hidden min-[420px]:block" ref={currencyDropdownRef} style={{ position: "relative" }}>
              <button
                type="button"
                className="hx-icon-btn"
                aria-label={isAr ? "اختيار العملة" : "Select Currency"}
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                style={{ width: "auto", padding: "0 8px", gap: "3px", fontSize: "11px", fontWeight: 700 }}
              >
                <span>{selectedCurrencyCode}</span>
                <span style={{ color: "var(--user-link, #2563eb)" }}>{isAr ? currentCurrency.symbolAr : currentCurrency.symbolEn}</span>
              </button>

              {currencyDropdownOpen && (
                <div
                  className="account-dropdown-menu open"
                  style={{ minWidth: "160px", top: "calc(100% + 6px)", left: "0", right: "auto" }}
                >
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      className={`acdd-item ${selectedCurrencyCode === c.code ? "active" : ""}`}
                      onClick={() => handleCurrencyChange(c.code)}
                      style={{
                        background: selectedCurrencyCode === c.code ? "var(--z-accent-l)" : "transparent",
                        color: selectedCurrencyCode === c.code ? "var(--user-link, #2563eb)" : "inherit",
                      }}
                    >
                      <div className="acdd-ico">
                        <span style={{ fontSize: "11px", fontWeight: 700 }}>{isAr ? c.symbolAr : c.symbolEn}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", textAlign: isAr ? "right" : "left" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700 }}>{c.code}</span>
                        <span style={{ fontSize: "10px", color: "var(--z-g500)" }}>{isAr ? c.nameAr : c.nameEn}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle Button (Light/Dark Mode) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="hx-icon-btn"
              aria-label={isAr ? (theme === "dark" ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن") : (theme === "dark" ? "Switch to light mode" : "Switch to dark mode")}
              title={isAr ? (theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن") : (theme === "dark" ? "Light Mode" : "Dark Mode")}
              style={{ width: "36px", height: "36px", color: "inherit" }}
            >
              {mounted && theme === "dark" ? (
                <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <line x1="12" y1="2" x2="12" y2="4" />
                  <line x1="12" y1="20" x2="12" y2="22" />
                  <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
                  <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
                  <line x1="2" y1="12" x2="4" y2="12" />
                  <line x1="20" y1="12" x2="22" y2="12" />
                  <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
                  <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>


            {/* Language Switcher Pill (Always visible across mobile & desktop) */}
            <Link
              href={switchLanguage()}
              suppressHydrationWarning
              className="hx-icon-btn"
              aria-label={isAr ? "English" : "العربية"}
              style={{
                width: "auto",
                padding: "0 9px",
                gap: "4px",
                fontSize: "11px",
                fontWeight: 700,
                textDecoration: "none",
                height: "36px",
              }}
            >
              <span>{isAr ? "EN" : "AR"}</span>
              <svg viewBox="0 0 24 24" fill="none" width="13" height="13" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </Link>

            {/* Shopping Cart Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="hx-icon-btn"
              aria-label={isAr ? "سلة المشتريات" : "Shopping Cart"}
              title={isAr ? `سلة المشتريات (${cartCount})` : `Shopping Cart (${cartCount})`}
              style={{
                width: "36px",
                height: "36px",
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "inherit",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-3px",
                    right: isAr ? "auto" : "-3px",
                    left: isAr ? "-3px" : "auto",
                    background: "var(--user-link, #2563eb)",
                    color: "#ffffff",
                    borderRadius: "999px",
                    fontSize: "10px",
                    fontWeight: 800,
                    minWidth: "17px",
                    height: "17px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 3px",
                    lineHeight: 1,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  }}
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            {/* User Account Dropdown */}
            <div className="account-dropdown-wrap" ref={userDropdownRef}>
              <button
                className="account-dropdown-trigger"
                aria-label={isAr ? "حسابي" : "My Account"}
                aria-expanded={userDropdownOpen}
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              >
                <span className="acdd-icon-wrap">
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M5 21c0-4 3.1-7 7-7s7 3 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
                <span>
                  {userSession
                    ? userSession.fullName?.split(" ")[0] || userSession.username
                    : (isAr ? "حسابي" : "Account")}
                </span>
                <svg className="acdd-chevron" viewBox="0 0 24 24" fill="none" width="13" height="13">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div className={`account-dropdown-menu ${userDropdownOpen ? "open" : ""}`}>
                {userSession ? (
                  <>
                    <div className="acdd-user">
                      <div
                        className="acdd-avatar"
                        style={{
                          background: "var(--z-accent-l)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          color: "var(--user-link, #2563eb)",
                        }}
                      >
                        {userSession.fullName?.charAt(0) || "U"}
                      </div>
                      <div className="acdd-user-info">
                        <span className="acdd-name">{userSession.fullName || userSession.username}</span>
                        <span className="acdd-email">{userSession.email}</span>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--user-link, #2563eb)", marginTop: "2px" }}>
                          {isAr ? "الرصيد:" : "Balance:"} {formatBalance(userSession.balance)}
                        </span>
                      </div>
                    </div>
                    <div className="acdd-divider" />

                    <Link
                      href={`/${lang}/profile`}
                      className="acdd-item"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="acdd-ico">
                        <svg viewBox="0 0 24 24" fill="none" width="15" height="15"><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.6"/><path d="M5 21c0-4 3.1-7 7-7s7 3 7 7" stroke="currentColor" strokeWidth="1.6"/></svg>
                      </div>
                      <span>{isAr ? "الملف الشخصي والحساب" : "Profile & Account"}</span>
                    </Link>

                    <Link
                      href={`/${lang}/wallet`}
                      className="acdd-item"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="acdd-ico">
                        <svg viewBox="0 0 24 24" fill="none" width="15" height="15"><rect x="1" y="6" width="22" height="15" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M1 11h22" stroke="currentColor" strokeWidth="1.4"/><circle cx="17" cy="16" r="2" stroke="currentColor" strokeWidth="1.4"/></svg>
                      </div>
                      <span>{isAr ? "المحفظة والشحن" : "Wallet & Top-up"}</span>
                    </Link>

                    <Link
                      href={`/${lang}/orders`}
                      className="acdd-item"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="acdd-ico">
                        <svg viewBox="0 0 24 24" fill="none" width="15" height="15"><path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.6"/></svg>
                      </div>
                      <span>{isAr ? "طلباتي السابقة" : "Order History"}</span>
                    </Link>

                    <div className="acdd-divider" />

                    <button
                      type="button"
                      className="acdd-item danger"
                      onClick={handleLogout}
                    >
                      <div className="acdd-ico">
                        <svg viewBox="0 0 24 24" fill="none" width="15" height="15"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <span>{isAr ? "تسجيل الخروج" : "Logout"}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="acdd-guest">
                      <div className="acdd-guest-ico">
                        <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.4" />
                          <path d="M5 21c0-4 3.1-7 7-7s7 3 7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                      </div>
                      <p>{isAr ? "سجّل دخولك للوصول لحسابك" : "Sign in to access your account"}</p>
                    </div>

                    <Link
                      href={`/${lang}/login`}
                      className="acdd-btn acdd-btn-primary"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      {isAr ? "تسجيل الدخول" : "Sign In"}
                    </Link>

                    <Link
                      href={`/${lang}/register`}
                      className="acdd-btn acdd-btn-secondary"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      {isAr ? "إنشاء حساب جديد" : "Create Account"}
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Hamburger — mobile only, placed inside hx-left at the far end */}
            <div className="hx-right">
              <button
                type="button"
                className="hx-icon-btn menu-toggle"
                aria-label={isAr ? "القائمة" : "Menu"}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMobileMenuOpen(true);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                  <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Mobile Slideout Menu (Zoalna style) */}
      <aside className={`mobile-menu ${mobileMenuOpen ? "active" : ""}`} role="navigation" aria-label={isAr ? "القائمة الجانبية" : "Side Menu"}>
        <div className="mn-top">
          <img src="/images/borai-logo.png?v=2" alt="BORAI SERVER" />
          <button className="close-mobile-menu" aria-label={isAr ? "إغلاق" : "Close"} onClick={() => setMobileMenuOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" width="14" height="14">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mn-body">
          <div className="mn-label">{isAr ? "التصفح" : "Navigation"}</div>

          <Link href={`/${lang}`} className={`mn-item ${isActive("/") ? "active" : ""}`} onClick={() => setMobileMenuOpen(false)}>
            <div className="mn-ico">
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                <path d="M3 9.5L12 3l9 6.5V21H16v-5h-4v5H3V9.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
            </div>
            <span>{isAr ? "الرئيسية" : "Home"}</span>
          </Link>



          <Link href={`/${lang}/pricing`} className={`mn-item ${isActive("/pricing") ? "active" : ""}`} onClick={() => setMobileMenuOpen(false)}>
            <div className="mn-ico">
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
                <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <span>{isAr ? "قائمة الأسعار" : "Price List"}</span>
          </Link>

          <Link href={`/${lang}/services`} className={`mn-item ${isActive("/services") || isActive("/gaming") ? "active" : ""}`} onClick={() => setMobileMenuOpen(false)}>
            <div className="mn-ico">
              <span className="material-symbols-outlined text-[19px]">sports_esports</span>
            </div>
            <span>{isAr ? "خدمات الألعاب والسوشيال ميديا" : "Gaming & Digital Services"}</span>
          </Link>

          <Link href={`/${lang}/orders`} suppressHydrationWarning className={`mn-item ${isActive("/orders") ? "active" : ""}`} onClick={() => setMobileMenuOpen(false)}>
            <div className="mn-ico">
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </div>
            <span>{isAr ? "الطلبات" : "Orders"}</span>
          </Link>

          <Link href={`/${lang}/wallet`} suppressHydrationWarning className={`mn-item ${isActive("/wallet") ? "active" : ""}`} onClick={() => setMobileMenuOpen(false)}>
            <div className="mn-ico">
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                <rect x="1" y="6" width="22" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
                <path d="M1 11h22" stroke="currentColor" strokeWidth="1.4" />
                <circle cx="17" cy="16" r="2" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </div>
            <span>{isAr ? "المحفظة والشحن" : "Wallet & Top-up"}</span>
          </Link>

          <div className="mn-hr" />

          <div className="mn-label">{isAr ? "اللغة" : "Language"}</div>

          {/* Mobile Language Switcher */}
          <Link
            href={switchLanguage()}
            suppressHydrationWarning
            className="mn-item"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="mn-ico">
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <span>{isAr ? "تغيير إلى English" : "Switch to العربية"}</span>
          </Link>

          {/* Mobile Drawer Theme Toggle */}
          <button
            type="button"
            className="mn-item"
            onClick={toggleTheme}
            style={{ width: "100%", background: "transparent", border: "none", textAlign: isAr ? "right" : "left" }}
          >
            <div className="mn-ico">
              {mounted && theme === "dark" ? (
                <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <line x1="12" y1="2" x2="12" y2="4" />
                  <line x1="12" y1="20" x2="12" y2="22" />
                  <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
                  <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
                  <line x1="2" y1="12" x2="4" y2="12" />
                  <line x1="20" y1="12" x2="22" y2="12" />
                  <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
                  <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </div>
            <span>
              {isAr
                ? (theme === "dark" ? "الوضع الفاتح (النهاري)" : "الوضع الداكن (الليلي)")
                : (theme === "dark" ? "Light Mode" : "Dark Mode")}
            </span>
          </button>



          {userSession ? (
            <>
              <Link href={`/${lang}/profile`} className="mn-item" onClick={() => setMobileMenuOpen(false)}>
                <div className="mn-ico">
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M5 21c0-4 3.1-7 7-7s7 3 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </div>
                <span>{isAr ? `حسابي (${userSession.fullName?.split(" ")[0] || "المستخدم"})` : `Account (${userSession.fullName?.split(" ")[0] || "User"})`}</span>
              </Link>
              <button
                type="button"
                className="mn-item danger"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                style={{ width: "100%", background: "transparent", border: "none", textAlign: isAr ? "right" : "left" }}
              >
                <div className="mn-ico">
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span>{isAr ? "تسجيل الخروج" : "Logout"}</span>
              </button>
            </>
          ) : (
            <>
              <Link href={`/${lang}/login`} className="mn-item" onClick={() => setMobileMenuOpen(false)}>
                <div className="mn-ico">
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M5 21c0-4 3.1-7 7-7s7 3 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </div>
                <span>{isAr ? "تسجيل الدخول" : "Sign In"}</span>
              </Link>
              <Link href={`/${lang}/register`} className="mn-item" onClick={() => setMobileMenuOpen(false)}>
                <div className="mn-ico">
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                    <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M4 20c0-3.5 3.2-6 8-6s8 2.5 8 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    <path d="M19 6v4M17 8h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </div>
                <span>{isAr ? "إنشاء حساب جديد" : "Create Account"}</span>
              </Link>
            </>
          )}
        </div>
      </aside>

      {/* Mobile Menu Backdrop Overlay */}
      <div
        className={`cart-overlay ${mobileMenuOpen ? "active" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
      />
    </>
  );
}
