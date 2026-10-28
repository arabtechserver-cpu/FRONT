"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Home, ShoppingBag, WalletCards, UserRound, UserRoundPlus, Layers3 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Locale } from "@/i18n/config";
import { useAppInstall } from "@/components/InstallAppProvider";
import { useTheme } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";
import { getUserAuthToken } from '@/lib/client-auth-token';
import { navigationPages } from '@/lib/store-pages';
import { useStoreNavigation } from '@/components/StoreNavigationProvider';
import '@/styles/store-pages.css';

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
  const { installed, announcementEnabled, announcementTitle, announcementButtonText, openApp } = useAppInstall();
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);

  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>("USD");
  const { theme, toggleTheme } = useTheme();
  const { cartCount, setIsCartOpen } = useCart();
  const [mounted, setMounted] = useState(false);
  const storePages = useStoreNavigation();
  const pathname = usePathname();
  const router = useRouter();

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);

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
            const token = getUserAuthToken(localStorage);
            const queryParam = parsed.id
              ? `userId=${encodeURIComponent(parsed.id)}`
              : `email=${encodeURIComponent(parsed.email)}`;
            const headers: Record<string, string> = {};
            if (token && token !== "null" && token !== "undefined") {
              headers["Authorization"] = `Bearer ${token}`;
            }
            const res = await fetch(`/api/users/profile?${queryParam}`, {
              headers,
              credentials: "include",
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

  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMobileMenuOpen(false); };
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", closeOnEscape); };
  }, [mobileMenuOpen]);

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

  const storeLinks = [
    { href: `/${lang}`, ar: "الرئيسية", en: "Home", icon: Home },
    { href: `/${lang}/services`, ar: "المتجر", en: "Store", icon: ShoppingBag },
  ];
  const managedLinks = (location: 'navbar' | 'menu') => navigationPages(storePages, location).map(page => ({ href: `/${lang}/pages/${page.slug}`, ar: page.title, en: page.titleEn || page.title, icon: Layers3 }));

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
      {announcementVisible && announcementEnabled && !installed && <div className="ann-bar" role="region" aria-label={isAr ? "تحميل تطبيق برعي" : "Install BORAI app"}>
        <img className="pwa-bar-logo" src="/borai-favicon-192.png" alt="BORAI STORE" width={26} height={26} />
        <span>{announcementTitle} <button type="button" className="pwa-bar-button" onClick={openApp}>{announcementButtonText}</button></span>
        <button type="button" className="ann-close" aria-label={isAr ? "إغلاق الإعلان" : "Close announcement"} onClick={() => setAnnouncementVisible(false)}>×</button>
      </div>}
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
              {[...storeLinks, ...managedLinks('navbar')].map(item => <Link key={item.href} href={item.href} className={`hx-nav-link ${pathname === item.href ? "active" : ""}`}><span>{isAr ? item.ar : item.en}</span></Link>)}
            </nav>
          </div>

          {/* Left Section: Currency, Language, User Dropdown / Login, Cart */}
          <div className="hx-left">
            {/* Currency Selector Pill (Hidden on narrow mobile <400px to avoid header overflow, available in mobile drawer) */}
            <div className="relative hidden min-[420px]:block hx-currency-control" ref={currencyDropdownRef} style={{ position: "relative" }}>
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
              className="hx-icon-btn hx-theme-control"
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
              className="hx-icon-btn hx-language-control"
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
                aria-expanded={mobileMenuOpen}
                aria-controls="store-mobile-menu"
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
      <aside id="store-mobile-menu" inert={!mobileMenuOpen} className={`mobile-menu ${mobileMenuOpen ? "active" : ""}`} role="navigation" aria-label={isAr ? "القائمة الجانبية" : "Side Menu"}>
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

          {[...storeLinks, ...managedLinks('menu')].map(item => { const Icon = item.icon; return <Link key={item.href} href={item.href} className="mn-item" onClick={() => setMobileMenuOpen(false)}><div className="mn-ico"><Icon size={21} strokeWidth={1.6} /></div><span>{isAr ? item.ar : item.en}</span></Link>; })}
          {userSession ? <>
            <Link href={`/${lang}/profile`} className="mn-item" onClick={() => setMobileMenuOpen(false)}><div className="mn-ico"><UserRound size={21} /></div><span>{isAr ? "حسابي" : "My account"}</span></Link>
            <Link href={`/${lang}/orders`} className="mn-item" onClick={() => setMobileMenuOpen(false)}><div className="mn-ico"><ShoppingBag size={21} /></div><span>{isAr ? "طلباتي" : "My orders"}</span></Link>
            <Link href={`/${lang}/wallet`} className="mn-item" onClick={() => setMobileMenuOpen(false)}><div className="mn-ico"><WalletCards size={21} /></div><span>{isAr ? "محفظتي" : "My wallet"}</span></Link>
            <button type="button" className="mn-item" onClick={() => { setMobileMenuOpen(false); handleLogout(); }}>{isAr ? "تسجيل الخروج" : "Sign out"}</button>
          </> : <>
            <Link href={`/${lang}/login`} className="mn-item" onClick={() => setMobileMenuOpen(false)}><div className="mn-ico"><UserRound size={21} strokeWidth={1.6} /></div><span>{isAr ? "تسجيل الدخول" : "Sign in"}</span></Link>
            <Link href={`/${lang}/register`} className="mn-item" onClick={() => setMobileMenuOpen(false)}><div className="mn-ico"><UserRoundPlus size={21} strokeWidth={1.6} /></div><span>{isAr ? "إنشاء حساب" : "Create account"}</span></Link>
          </>}
          <details className="mn-settings"><summary>{isAr ? "اللغة والمظهر والعملة" : "Language, appearance & currency"}</summary>
            <Link className="mn-item" href={switchLanguage()} onClick={() => setMobileMenuOpen(false)}>{isAr ? "English" : "العربية"}</Link>
            <button type="button" className="mn-item" onClick={toggleTheme}>{isAr ? (theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن") : (theme === "dark" ? "Light mode" : "Dark mode")}</button>
            <label className="mn-currency">{isAr ? "العملة" : "Currency"}<select value={selectedCurrencyCode} onChange={e => handleCurrencyChange(e.target.value)}>{CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} — {isAr ? c.nameAr : c.nameEn}</option>)}</select></label>
            <button type="button" className="mn-item" onClick={() => { setMobileMenuOpen(false); window.dispatchEvent(new CustomEvent("toggle-ai-chat")); }}>{isAr ? "المساعد الذكي" : "AI assistant"}</button>
          </details>
        </div>
      </aside>

      {/* Mobile Menu Backdrop Overlay */}
      <div
        className={`cart-overlay mobile-menu-overlay ${mobileMenuOpen ? "active" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
      />
    </>
  );
}
