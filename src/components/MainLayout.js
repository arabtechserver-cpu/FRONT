"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { API_BASE_URL } from "@/config";
import PasswordChangeModal from "./PasswordChangeModal";
import TransactionPasswordModal from "./TransactionPasswordModal";
import ProtectionModal from "./ProtectionModal";
import Footer from "./Footer";
import { FEATURES } from "@/features";


export default function MainLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [theme, setTheme] = useState("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [settings, setSettings] = useState({ site_name: "عرب تك سيرفر", site_logo: "/logo.jpg" });
  const [logoFailed, setLogoFailed] = useState(false);
  const [txPasswordModalOpen, setTxPasswordModalOpen] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/settings?t=${Date.now()}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setSettings(data);
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
  const [pwaInstallable, setPwaInstallable] = useState(false);
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
    setIsMounted(true);

    // Theme
    const savedTheme = document.documentElement.getAttribute("data-theme") || localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);

    // Auth
    setIsCustomerLoggedIn(Boolean(localStorage.getItem("customer_token") && localStorage.getItem("customer_user")));
    try {
      const userStr = localStorage.getItem("customer_user");
      setCustomerUser(userStr ? JSON.parse(userStr) : null);
    } catch { }

    // PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone
      || document.referrer.includes('android-app://');
    const isDismissed = localStorage.getItem("pwa_dismissed") === "true";
    setShowInstallBanner(!isStandalone && !isDismissed);

    // Font Scale
    const savedScale = localStorage.getItem("font_scale");
    const scaleVal = savedScale ? parseFloat(savedScale) : 1;
    setFontScale(Number.isFinite(scaleVal) ? scaleVal : 1);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/services/menu`)
      .then(res => res.json())
      .then(data => setMenuServices(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching menu services:", err));
      
    fetch(`${API_BASE_URL}/api/categories/menu`)
      .then(res => res.json())
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
        alert("🔒 تم إقفال الجلسة وتأمين حسابك تلقائياً بسبب عدم النشاط لمدة 30 دقيقة.");
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
    if (typeof window !== "undefined") {
      // Check if already running in standalone PWA mode
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
        || window.navigator.standalone
        || document.referrer.includes('android-app://');

      const isDismissed = localStorage.getItem("pwa_dismissed") === "true";
      setShowInstallBanner(!isStandalone && !isDismissed);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const isDismissed = localStorage.getItem("pwa_dismissed") === "true";
      if (!isDismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

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
        <span>الرصيد:</span>
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
              {curr} {curr === "USD" ? "🇺🇸" : curr === "EGP" ? "🇪🇬" : "🇸🇩"}
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
      alert("لتثبيت التطبيق على جهازك:\n\n- للأندرويد: اضغط على القائمة المكونة من 3 نقاط (︙) في متصفح كروم ثم اختر 'تثبيت التطبيق' (Install app).\n\n- للأيفون: اضغط على زر مشاركة (📤) في متصفح Safari ثم اختر 'إضافة إلى الشاشة الرئيسية' (Add to Home Screen).");
    }
  };

  const navLinks = [
    { href: "/", label: "الرئيسية", icon: "🏠" },
    { href: "/services", label: "الخدمات", icon: "🛒" },
    { href: "/orders", label: "طلباتي", icon: "📦" },
    { href: "/wallet", label: "المحفظة", icon: "💳" },
    { href: "/terms", label: "الشروط والاسترجاع", icon: "⚖️" }
  ];

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const getPageTitle = () => {
    if (pathname === "/" || pathname === "/Home") return "الرئيسية";
    if (pathname.startsWith("/orders")) return "طلباتي";
    if (pathname.startsWith("/wallet")) return "المحفظة";
    if (pathname.startsWith("/membership")) return "العضوية";
    if (pathname.startsWith("/category")) return "القسم";
    if (pathname.startsWith("/service")) return "الخدمة";
    if (pathname.startsWith("/login")) return "تسجيل الدخول";
    return "Home";
  };



  if (pathname && pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <div className="app-layout">
      {/* Background (Video removed for performance) */}
      <div className="video-background-container" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -3,
        overflow: 'hidden',
        background: 'var(--bg-color)'
      }}>
      </div>

      {/* Abstract Animated Shapes — 4 colorful orbs */}
      <div className="animated-shape shape-1"></div>
      <div className="animated-shape shape-2"></div>
      <div className="animated-shape shape-3"></div>
      <div className="animated-shape shape-4"></div>


      {/* Mobile Drawer Overlay */}
      {menuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMenuOpen(false)} />
      )}

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMenuOpen(false)} />
      )}
      <div className={`mobile-drawer ${menuOpen ? "open" : "closed"}`}>
        <div className="mobile-drawer-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '16px', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {settings.site_logo && settings.site_logo !== 'default' && !logoFailed ? (
              <img src={settings.site_logo.startsWith('http') || settings.site_logo.startsWith('data:') ? settings.site_logo : (settings.site_logo.includes('uploads') ? `${API_BASE_URL}${settings.site_logo.startsWith('/') ? '' : '/'}${settings.site_logo}` : settings.site_logo)} alt={settings.site_name} onError={() => setLogoFailed(true)} loading="lazy" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 2px 5px rgba(234,179,8,0.2))' }} />
            ) : (
              <img src="/logo.jpg" alt={settings.site_name || "Logo"} loading="lazy" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 2px 5px rgba(234,179,8,0.2))' }} />
            )}
            <div>
              <div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>{settings.site_name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--primary-color)', fontWeight: 700, marginTop: '1px' }}>خدمات آمنة وفورية ⚡</div>
            </div>
          </div>
          <button className="mobile-drawer-close" onClick={() => setMenuOpen(false)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', width: '36px', height: '36px', borderRadius: '10px', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'all 0.2s' }}>✕</button>
        </div>

        {isCustomerLoggedIn && customerUser ? (
          <div className="mobile-drawer-user-card" style={{ marginBottom: "15px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px", padding: "16px", background: "linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(202, 138, 4, 0.05))", borderRadius: "16px", border: "1px solid rgba(234, 179, 8, 0.2)" }}>
            <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-main)" }}>مرحباً، {customerUser.username} 👋</div>
            <div style={{ fontSize: "0.9rem", color: "#eab308", fontWeight: 900, background: "rgba(255,255,255,0.05)", padding: "6px 12px", borderRadius: "8px", display: "inline-block", border: "1px solid rgba(234, 179, 8, 0.15)" }}>
              {renderBalanceDropdownAndValue(customerUser)}
            </div>
          </div>
        ) : (
          <Link href="/login" className="mobile-drawer-link" onClick={() => setMenuOpen(false)} style={{ background: "rgba(234, 179, 8, 0.1)", color: "#eab308", fontWeight: 700, justifyContent: "center", borderRadius: "10px", padding: "10px", border: "1px solid rgba(234, 179, 8, 0.3)", boxShadow: "0 4px 20px rgba(234, 179, 8, 0.1)", fontSize: "0.85rem", gap: "8px" }}>
            <span style={{ fontSize: "1.1rem", display: "flex", alignItems: "center" }}>👤</span>
            <span style={{ color: "#eab308" }}>تسجيل الدخول / حساب جديد</span>
          </Link>
        )}

        <div className="mobile-drawer-divider" style={{ margin: "12px 0" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Link href="/" className="mobile-drawer-link" onClick={() => setMenuOpen(false)}>
            <span style={{ fontSize: "1.2rem" }}>🏠</span> الرئيسية
          </Link>
          
          <div className="mobile-drawer-dropdown-container" style={{ position: "relative" }}>
            <div 
              className="mobile-drawer-link" 
              style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", background: categoriesExpanded ? "rgba(255,255,255,0.05)" : "transparent" }} 
              onClick={() => setCategoriesExpanded(!categoriesExpanded)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "1.2rem" }}>🛒</span> الأقسام والخدمات
              </div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", transform: categoriesExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }}>▼</span>
            </div>
            <div 
              className="mobile-drawer-dropdown-list" 
              style={{ 
                display: categoriesExpanded ? "flex" : "none", 
                flexDirection: "column", 
                background: "rgba(0,0,0,0.1)", 
                borderRadius: "8px", 
                margin: "4px 10px", 
                padding: "4px 0" 
              }}
            >
              <Link href="/services" className="mobile-drawer-link" style={{ padding: "8px 16px", fontSize: "0.95rem" }} onClick={() => setMenuOpen(false)}>
                ⭐ كل الخدمات
              </Link>
              {menuCategories.map(cat => (
                <Link key={cat.id} href={`/category/${cat.id}`} className="mobile-drawer-link" style={{ padding: "8px 16px", fontSize: "0.95rem" }} onClick={() => setMenuOpen(false)}>
                  🔹 {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <Link href="/orders" className="mobile-drawer-link" onClick={() => setMenuOpen(false)}>
            <span style={{ fontSize: "1.2rem" }}>📦</span> تتبع الطلبات
          </Link>
          

          {isCustomerLoggedIn && (
            <Link href="/wallet" className="mobile-drawer-link" onClick={() => setMenuOpen(false)}>
              <span style={{ fontSize: "1.2rem" }}>💳</span> شحن رصيدي
            </Link>
          )}
          {FEATURES.showApiDocs && (
            <Link href="/api-docs" className="mobile-drawer-link" onClick={() => setMenuOpen(false)}>
              <span style={{ fontSize: "1.2rem" }}>🔌</span> الربط عبر الـ API
            </Link>
          )}
          <Link href="/terms" className="mobile-drawer-link" onClick={() => setMenuOpen(false)}>
            <span style={{ fontSize: "1.2rem" }}>⚖️</span> الشروط وسياسة الاسترجاع
          </Link>
          <button
            type="button"
            onClick={() => { setSupportModalOpen(true); setMenuOpen(false); }}
            className="mobile-drawer-link"
            style={{ width: "100%", textAlign: "right", border: "none", display: "flex", alignItems: "center", background: "transparent", padding: "14px 16px" }}
          >
            <span style={{ fontSize: "1.2rem" }}>💬</span> الدعم الفني
          </button>
        </div>

        <div className="mobile-drawer-divider" style={{ margin: "16px 0" }} />

        {/* Premium Font Scale Toggle */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)", margin: "4px 0" }}>
          <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.2rem" }}>📝</span>
            حجم الخط
          </span>
          <div style={{ display: "flex", gap: "6px", alignItems: "center", background: "rgba(0,0,0,0.2)", padding: "4px", borderRadius: "10px" }}>
            <button
              onClick={() => adjustFontScale(-0.05)}
              style={{ background: "transparent", border: "none", color: "var(--text-main)", width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer", fontSize: "0.9rem", fontWeight: "bold", transition: "0.2s" }}
              title="تصغير الخط"
              type="button"
            >A-</button>
            <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.1)" }}></div>
            <button
              onClick={resetFontScale}
              style={{ background: "transparent", border: "none", color: "var(--text-main)", width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer", fontSize: "1rem", fontWeight: "900", transition: "0.2s" }}
              title="حجم افتراضي"
              type="button"
            >A</button>
            <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.1)" }}></div>
            <button
              onClick={() => adjustFontScale(0.05)}
              style={{ background: "transparent", border: "none", color: "var(--text-main)", width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer", fontSize: "1.1rem", fontWeight: "bold", transition: "0.2s" }}
              title="تكبير الخط"
              type="button"
            >A+</button>
          </div>
        </div>

        {/* Premium Theme Toggle */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)", margin: "4px 0" }}>
          <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.2rem" }}>{theme === 'dark' ? '🌙' : '☀️'}</span>
            المظهر الليلي
          </span>
          <button
            onClick={toggleTheme}
            style={{
              background: theme === 'dark' ? 'var(--primary-color)' : 'rgba(0, 0, 0, 0.15)',
              border: "none",
              borderRadius: "20px",
              width: "56px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              padding: "4px",
              cursor: "pointer",
              transition: "background-color 0.4s ease",
              position: "relative",
              outline: "none"
            }}
            type="button"
          >
            <div style={{
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: "#ffffff",
              boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
              transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
              transform: theme === 'dark' ? 'translateX(-26px)' : 'translateX(0)'
            }} />
          </button>
        </div>

        {isCustomerLoggedIn && (
          <>
            <div className="mobile-drawer-divider" style={{ margin: "12px 0" }} />
            <button className="mobile-drawer-link danger" onClick={() => { handleCustomerLogout(); setMenuOpen(false); }} style={{ justifyContent: "center", padding: "14px", borderRadius: "12px", fontWeight: 900 }}>
              🚪 تسجيل الخروج
            </button>
          </>
        )}
      </div>

      {/* Main Content Area (LHS on Desktop) */}
      <div className="main-content">
        {/* PWA Install Banner */}
        {showInstallBanner && (
          <div className="pwa-install-banner">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.5rem" }}>📱</span>
              <div>
                <strong style={{ display: "block", fontSize: "0.9rem", color: "var(--text-main)", textAlign: "right" }}>ثبّت تطبيق {settings.site_name}</strong>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", textAlign: "right" }}>تصفح أسرع وتجربة استخدام أفضل بدون متصفح!</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button
                onClick={handleInstallClick}
                className="glass-btn glass-btn-primary"
                style={{ padding: "6px 14px", borderRadius: "8px", fontSize: "0.82rem" }}
              >
                تثبيت الآن
              </button>
              <button
                onClick={() => {
                  setShowInstallBanner(false);
                  localStorage.setItem("pwa_dismissed", "true");
                }}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "0 5px", fontSize: "1.1rem" }}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Top Navbar */}
        <header className="custom-navbar" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 20px',
          height: '70px',
          background: theme === 'dark' ? 'rgba(10, 15, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}>
          <div className="custom-navbar-glow"></div>
          
          {/* Right Section (Logo & Mobile Menu) */}
          <div className="flex items-center gap-3" style={{ minWidth: 0 }}>
            <button className="header-btn w-9 h-9" type="button" aria-label="القائمة" onClick={() => setMenuOpen(!menuOpen)} style={{ flexShrink: 0 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu w-5 h-5">
                <line x1="4" x2="20" y1="12" y2="12"></line>
                <line x1="4" x2="20" y1="6" y2="6"></line>
                <line x1="4" x2="20" y1="18" y2="18"></line>
              </svg>
            </button>
            <Link className="flex items-center gap-2" style={{ textDecoration: 'none', minWidth: 0 }} href="/">
              {settings.site_logo && settings.site_logo !== 'default' && !logoFailed ? (
                <img src={settings.site_logo.startsWith('http') || settings.site_logo.startsWith('data:') ? settings.site_logo : (settings.site_logo.includes('uploads') ? `${API_BASE_URL}${settings.site_logo.startsWith('/') ? '' : '/'}${settings.site_logo}` : settings.site_logo)} alt={settings.site_name} onError={() => setLogoFailed(true)} fetchpriority="high" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 2px 5px rgba(234,179,8,0.2))' }} />
              ) : (
                <img src="/logo.jpg" alt={settings.site_name || "Logo"} fetchpriority="high" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 2px 5px rgba(234,179,8,0.2))' }} />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', height: '24px', overflowY: 'hidden', minWidth: '180px' }}>
                <span className={`font-black absolute transition-all duration-700 ease-in-out ${logoLang === 'ar' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`} style={{ color: '#eab308', whiteSpace: 'nowrap', fontSize: 'clamp(0.9rem, 3vw, 1.15rem)', letterSpacing: '0.5px', textShadow: '0 2px 10px rgba(234, 179, 8, 0.4)' }}>
                  عرب تك سيرفر online
                </span>
                <span translate="no" className={`font-black absolute transition-all duration-700 ease-in-out ${logoLang === 'en' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}`} style={{ color: '#eab308', whiteSpace: 'nowrap', fontSize: 'clamp(0.85rem, 2.5vw, 1rem)', letterSpacing: '0.5px', textShadow: '0 2px 10px rgba(234, 179, 8, 0.4)' }}>
                  Arab Tech Server
                </span>
              </div>
            </Link>
          </div>


          {/* Left Section (Auth & Theme & Home link) */}
          <div className="flex items-center gap-3" style={{ position: 'relative' }}>
            <Link href="/" className={`desktop-link hidden lg-block ${pathname === '/' ? 'active' : ''}`} style={{ fontWeight: 'bold' }}>الرئيسية</Link>
            <Link href="/services" className={`desktop-link hidden lg-block ${pathname.startsWith('/services') ? 'active' : ''}`} style={{ fontWeight: 'bold' }}>الخدمات</Link>
            <Link href="/orders" className={`desktop-link hidden lg-block ${pathname.startsWith('/orders') ? 'active' : ''}`} style={{ fontWeight: 'bold' }}>الطلبات</Link>
            <button onClick={toggleTheme} className="theme-toggle-btn header-btn hidden lg-block" aria-label="تبديل المظهر" style={{ padding: '6px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', cursor: 'pointer' }}>
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
            
            <div className="hidden lg:block">
              {isCustomerLoggedIn && customerUser ? (
                <div style={{ position: 'relative' }}>
                  <button className="header-user-btn" type="button" onClick={() => setProfileMenuOpen(!profileMenuOpen)} title="الملف الشخصي" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.2)', borderRadius: '8px', cursor: 'pointer' }}>
                    <div className="font-black text-sm" style={{ color: 'rgb(79, 70, 229)' }}>
                      {customerUser.username ? customerUser.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{customerUser.username}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}><path d="m6 9 6 6 6-6"></path></svg>
                  </button>

                  {/* Dropdown */}
                  {profileMenuOpen && (
                    <div className="header-profile-dropdown" style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', width: '220px', background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '12px', padding: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 1000 }}>
                      <div style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '4px' }}>
                        <div style={{ color: 'var(--primary-color)', fontWeight: 800, fontSize: '0.85rem', marginTop: '2px' }}>
                          {renderBalanceDropdownAndValue(customerUser)}
                        </div>
                      </div>
                      <Link href="/orders" className="header-dropdown-item" onClick={() => setProfileMenuOpen(false)}>📦 طلباتي</Link>
                      <Link href="/wallet" className="header-dropdown-item" onClick={() => setProfileMenuOpen(false)}>💳 شحن المحفظة</Link>
                      {FEATURES.showApiDocs && (
                        <Link href="/api-docs" className="header-dropdown-item" onClick={() => setProfileMenuOpen(false)}>🔌 الربط عبر الـ API</Link>
                      )}
                      <button onClick={() => { setProfileMenuOpen(false); window.dispatchEvent(new CustomEvent('openPasswordChangeModal')); }} className="header-dropdown-item" type="button">🔐 تغيير كلمة المرور</button>
                      <button onClick={() => { handleCustomerLogout(); setProfileMenuOpen(false); }} className="header-dropdown-item" style={{ color: 'var(--danger-color)', width: '100%', textAlign: 'right' }} type="button">🚪 تسجيل الخروج</button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link href="/login" style={{ textDecoration: 'none', padding: '6px 16px', background: 'var(--primary-color)', color: '#fff', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>تسجيل</Link>
                  <Link href="/login" style={{ textDecoration: 'none', padding: '6px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>دخول</Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Global Notice Bar (Sticky Marquee) */}
        <div className="notice-bar-container notice-slim" style={{ position: 'sticky', top: '70px', zIndex: 998, padding: '0', background: 'transparent' }}>
          <div className="container">
            <div className="notice-row" aria-label="Announcements">
              <div className="notice-track" role="presentation">
                <div className="notice-set" role="presentation">
                  <div className="notice-set-item">
                    <span className="notice-pill notice-pill-gold">✨ مرحبا بكم هنا سيرفر عرب تك متاح جميع الخدمات بفضل الله واسعار مناسبه للجميع</span>
                    <span className="notice-pill notice-pill-gold">✨ Welcome to Arab Tech Server, all services are available and prices are suitable for everyone</span>
                    <a href="https://wa.me/249123667227" target="_blank" rel="noopener noreferrer" className="notice-pill notice-pill-link">
                      <span className="notice-pill-label">💬 واتساب 1:</span>
                      <bdi dir="ltr" className="notice-pill-bdi">+249&nbsp;12&nbsp;366&nbsp;7227</bdi>
                    </a>
                    <a href="https://wa.me/16728972935" target="_blank" rel="noopener noreferrer" className="notice-pill notice-pill-link">
                      <span className="notice-pill-label">💬 واتساب 2:</span>
                      <bdi dir="ltr" className="notice-pill-bdi">+1&nbsp;(672)&nbsp;897-2935</bdi>
                    </a>
                  </div>
                </div>
                <div className="notice-set" aria-hidden="true" role="presentation">
                  <div className="notice-set-item">
                    <span className="notice-pill notice-pill-gold">✨ مرحبا بكم هنا سيرفر عرب تك متاح جميع الخدمات بفضل الله واسعار مناسبه للجميع</span>
                    <span className="notice-pill notice-pill-gold">✨ Welcome to Arab Tech Server, all services are available and prices are suitable for everyone</span>
                    <a href="https://wa.me/249123667227" target="_blank" rel="noopener noreferrer" className="notice-pill notice-pill-link">
                      <span className="notice-pill-label">💬 واتساب 1:</span>
                      <bdi dir="ltr" className="notice-pill-bdi">+249&nbsp;12&nbsp;366&nbsp;7227</bdi>
                    </a>
                    <a href="https://wa.me/16728972935" target="_blank" rel="noopener noreferrer" className="notice-pill notice-pill-link">
                      <span className="notice-pill-label">💬 واتساب 2:</span>
                      <bdi dir="ltr" className="notice-pill-bdi">+1&nbsp;(672)&nbsp;897-2935</bdi>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Child Pages Content */}
        <main className="main-content-inner">
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
                <div style={{ fontSize: "2.8rem", marginBottom: "10px" }}>🛡️</div>
                <h3 style={{ fontSize: "1.3rem", fontWeight: "900", color: "#fbbf24", marginBottom: "10px" }}>
                  نصيحة أمان لحسابك 🔒
                </h3>
                <p style={{ fontSize: "0.92rem", color: "#cbd5e1", lineHeight: "1.6", marginBottom: "22px" }}>
                  لحماية محفظتك وحسابك تلقائياً عند الخمول، يُنصح بتعيين <strong>كلمة مرور المعاملات والقفل</strong> الآن.
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
                    تعيين الآن 🔒
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
                    لاحقاً ✕
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
        <Footer siteName={settings.site_name} siteLogo={settings.site_logo} />
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="bottom-nav">
        <Link href="/" className={`bottom-nav-item ${pathname === "/" ? "active" : ""}`}>
          <span className="bottom-nav-icon">🏠</span>
          <span className="bottom-nav-label">الرئيسية</span>
        </Link>
        <Link href="/orders" className={`bottom-nav-item ${pathname.startsWith("/orders") ? "active" : ""}`}>
          <span className="bottom-nav-icon">📦</span>
          <span className="bottom-nav-label">طلباتي</span>
        </Link>
        <Link href="/wallet" className={`bottom-nav-item ${pathname.startsWith("/wallet") ? "active" : ""}`}>
          <span className="bottom-nav-icon">💳</span>
          <span className="bottom-nav-label">محفظتي</span>
        </Link>
        <Link href="/login" className={`bottom-nav-item ${pathname.startsWith("/login") ? "active" : ""}`}>
          <span className="bottom-nav-icon">👤</span>
          <span className="bottom-nav-label">حسابي</span>
        </Link>
      </nav>

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
              direction: "rtl"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 900, color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>💬</span> الدعم الفني وتواصل الإدارة
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
              اختر أحد قنوات الدعم الفني الرسمية للتواصل معنا أو الانضمام إلى مجتمعنا:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* WhatsApp Support 1 */}
              <a
                href="https://wa.me/249123667227"
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
                  <span style={{ fontSize: "1.2rem" }}>🟢</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>واتساب الإدارة 1</span>
                    <span dir="ltr" style={{ direction: "ltr", unicodeBidi: "isolate" }}>(+249 12 366 7227)</span>
                  </div>
                </div>
                <span style={{ color: "#10b981" }}>←</span>
              </a>

              {/* WhatsApp Support 2 */}
              <a
                href="https://wa.me/16728972935"
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
                  <span style={{ fontSize: "1.2rem" }}>🟢</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>واتساب الإدارة 2</span>
                    <span dir="ltr" style={{ direction: "ltr", unicodeBidi: "isolate" }}>(+1 672-897-2935)</span>
                  </div>
                </div>
                <span style={{ color: "#22d3ee" }}>←</span>
              </a>

              {/* WhatsApp Community */}
              <a
                href="https://chat.whatsapp.com/DINRDwU2lVjFcGRowxT3m5"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  background: "rgba(52, 211, 153, 0.08)",
                  border: "1px solid rgba(52, 211, 153, 0.15)",
                  borderRadius: "14px",
                  color: "#34d399",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "0.92rem",
                  transition: "transform 0.2s"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "1.2rem" }}>💬</span>
                  <span>مجتمع واتساب عرب تك</span>
                </div>
                <span style={{ color: "#34d399" }}>←</span>
              </a>

              {/* Facebook Page */}
              <a
                href="https://www.facebook.com/ARABTECHSERVEROnline"
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
                  <span style={{ fontSize: "1.2rem" }}>📘</span>
                  <span>صفحة فيسبوك عرب تك</span>
                </div>
                <span style={{ color: "#478bfb" }}>←</span>
              </a>

              {/* TikTok Account */}
              <a
                href="https://tiktok.com/@arabtechsuppurt"
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
                  <span style={{ fontSize: "1.2rem" }}>🎵</span>
                  <span>حساب تيك توك عرب تك</span>
                </div>
                <span style={{ color: "#fe2c55" }}>←</span>
              </a>

              {/* Telegram Channel */}
              <a
                href="https://t.me/arabtechserveronline"
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
                  <span style={{ fontSize: "1.2rem" }}>✈️</span>
                  <span>قناة تيليجرام عرب تك</span>
                </div>
                <span style={{ color: "#0088cc" }}>←</span>
              </a>

              {/* YouTube Channel */}
              <a
                href="https://youtube.com/@arab-tech-server?si=1L5yUgv_jlCk3Vez"
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
                  <span style={{ fontSize: "1.2rem" }}>🔴</span>
                  <span>قناة يوتيوب عرب تك</span>
                </div>
                <span style={{ color: "#ff4d4d" }}>←</span>
              </a>

              {/* Email Support */}
              <a
                href="mailto:arabtechserver@gmail.com"
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
                  <span style={{ fontSize: "1.2rem" }}>✉️</span>
                  <span>البريد الإلكتروني (arabtechserver@gmail.com)</span>
                </div>
                <span style={{ color: "#ef4444" }}>←</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


