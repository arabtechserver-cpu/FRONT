"use client";

import { useState, useEffect, useMemo, useCallback, useLayoutEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/config";
import HeroSlider from "@/components/HeroSlider";
import { useI18n } from "@/lib/i18n";
import { trackConversion } from "@/lib/analytics";

export default function ServicesClient({ initialCategories = [], initialServices = [], isHome = false, homeHeroTitle, homeHeroSubtitle }) {
  const { t, meta } = useI18n();
  const [services, setServices] = useState(initialServices);
  const [categories, setCategories] = useState(initialCategories);
  const [customer, setCustomer] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setAuthChecked(true);
      return;
    }
    try {
      const token = localStorage.getItem("customer_token");
      if (token) {
        fetch(`${API_BASE_URL}/api/customer/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) setCustomer(data);
          setAuthChecked(true);
        })
        .catch(() => setAuthChecked(true));
      } else {
        setAuthChecked(true);
      }
    } catch(e) {
      setAuthChecked(true);
    }
  }, [isHome]);
  const [loading, setLoading] = useState(initialServices.length === 0);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceSort, setPriceSort] = useState("default"); // "default", "asc", "desc"
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [visibleCategories, setVisibleCategories] = useState(5);
  const [settings, setSettings] = useState({ announcement_text: "🟢 واتساب الإدارة 1: +1 (672) 897-2935 | 🟢 واتساب الإدارة 2: +249 12 366 7227" });
  
  // Isomorphic layout effect to avoid hydration mismatch while restoring state synchronously before paint
  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    try {
      const savedSearch = sessionStorage.getItem("arabtech_services_search");
      if (savedSearch) setSearchTerm(savedSearch);
      const savedLimit = sessionStorage.getItem("arabtech_services_limit");
      if (savedLimit) setVisibleCategories(parseInt(savedLimit));
    } catch(e) {}
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem("arabtech_services_search", searchTerm);
      sessionStorage.setItem("arabtech_services_limit", visibleCategories.toString());
    } catch(e) {}
  }, [searchTerm, visibleCategories]);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeFilter = searchParams.get("type"); // e.g., 'imei', 'server', 'remote'

  useEffect(() => {
    trackConversion("catalog_view", { typeFilter: typeFilter || "all" });
  }, [typeFilter]);

  const getWhatsappLink = (text) => {
    if (!text) return "https://wa.me/16728972935";
    const digits = text.replace(/\D/g, "");
    if (digits.length >= 8) {
      return `https://wa.me/${digits}`;
    }
    return "https://wa.me/16728972935";
  };

  useEffect(() => {
    // 1. Instant 0ms load from localStorage cache
    try {
      const cachedCats = localStorage.getItem("arabtech_cached_categories");
      const cachedSvcs = localStorage.getItem("arabtech_cached_services");
      const cachedSettings = localStorage.getItem("arabtech_cached_settings");
      if (cachedCats) setCategories(JSON.parse(cachedCats));
      if (cachedSettings) setSettings(JSON.parse(cachedSettings));
      if (cachedSvcs) {
        setServices(JSON.parse(cachedSvcs));
        setLoading(false);
      }
    } catch(e) {}

    // 2. Fetch fresh data in background (Stale-While-Revalidate)
    fetch(`${API_BASE_URL}/api/settings`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setSettings(data);
          try { localStorage.setItem("arabtech_cached_settings", JSON.stringify(data)); } catch(e) {}
        }
      })
      .catch(() => { });

    // Fetch categories
    fetch(`${API_BASE_URL}/api/categories`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name, 'en'));
        setCategories(sorted);
        try { localStorage.setItem("arabtech_cached_categories", JSON.stringify(sorted)); } catch(e) {}
      })
      .catch(() => {
        // Handled silently to avoid overriding the cache with errors
      });

    // Fetch services with optional customer token for discounts
    const token = typeof window !== 'undefined' ? localStorage.getItem("customer_token") : null;
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    fetch(`${API_BASE_URL}/api/services`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setServices(data);
        setLoading(false);
        try { localStorage.setItem("arabtech_cached_services", JSON.stringify(data)); } catch(e) {}
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const getFallbackEmoji = (name = "", image = "") => {
    const lowerName = (name || "").toLowerCase();
    const lowerImg = (image || "").toLowerCase();

    if (lowerImg.includes("pubg") || lowerName.includes("pubg") || lowerName.includes("ببجي")) return "🔫";
    if (lowerImg.includes("freefire") || lowerImg.includes("free fire") || lowerName.includes("فري فاير") || lowerName.includes("free fire") || lowerName.includes("freefire")) return "🔥";
    if (lowerImg.includes("bigo") || lowerName.includes("بيجو")) return "💬";
    if (lowerImg.includes("vodafone") || lowerName.includes("فودافون")) return "📱";
    if (lowerImg.includes("usdt") || lowerName.includes("usdt") || lowerName.includes("عملة") || lowerName.includes("أرصدة")) return "🪙";
    if (lowerImg.includes("canva") || lowerName.includes("كانفا")) return "🎨";
    if (lowerImg.includes("netflix") || lowerName.includes("نتفليكس")) return "🎬";
    if (lowerName.includes("ايفون") || lowerName.includes("iphone") || lowerName.includes("ipad") || lowerName.includes("ايباد") || lowerName.includes("bypass") || lowerName.includes("تخطي") || lowerName.includes("icloud") || lowerName.includes("ايكلاود") || lowerName.includes("hello") || lowerName.includes("removal") || lowerName.includes("hfz") || lowerName.includes("smd") || lowerName.includes("otix")) return "📱";

    return "⚡";
  };

  const getServiceIcon = (image, name = "") => {
    if (!image) return getFallbackEmoji(name, image);
    if (image.startsWith("data:image") || image.startsWith("http") || image.includes("uploads")) {
      const src = image.startsWith("http") || image.startsWith("data:")
        ? image
        : (image.startsWith("/") ? `${API_BASE_URL}${image}` : `${API_BASE_URL}/${image}`);
      return <img
        src={src}
        alt="Service Icon"
        onError={(e) => {
          e.target.style.display = 'none';
          const parent = e.target.parentElement;
          if (parent) {
            parent.innerText = getFallbackEmoji(name, image);
          }
        }}
        style={{ width: "45px", height: "45px", objectFit: "contain", borderRadius: "8px" }}
      />;
    }
    if (image.includes("pubg")) return "🔫";
    if (image.includes("freefire")) return "🔥";
    if (image.includes("bigo")) return "💬";
    if (image.includes("vodafone")) return "📱";

    if (image.includes("usdt")) return "🪙";
    if (image.includes("canva")) return "🎨";
    if (image.includes("netflix")) return "🎬";
    return "⚡";
  };

  const serviceMatchesType = useCallback((service) => {
    if (!typeFilter) return true;
    const normalizeType = (value) => String(value || "").trim().toLowerCase();
    const targetType = normalizeType(typeFilter);
    const serviceTypes = [normalizeType(service.api_service_type)];
    if (Array.isArray(service.packages)) {
      service.packages.forEach((pkg) => {
        const packageType = normalizeType(pkg?.api_service_type);
        if (packageType) serviceTypes.push(packageType);
      });
    }
    return serviceTypes.includes(targetType);
  }, [typeFilter]);

  const typeFilteredServices = useMemo(
    () => services.filter(serviceMatchesType),
    [services, serviceMatchesType]
  );

  const catalogCategories = useMemo(() => {
    let cats = categories;
    if (selectedCategory && selectedCategory !== "all") {
      cats = cats.filter(cat => Number(cat.id) === Number(selectedCategory));
    }
    if (!typeFilter) return cats;
    return cats.filter(cat => {
      const catServices = typeFilteredServices.filter(s => Number(s.category_id) === Number(cat.id));
      const assignedType = String(cat.menu_service_type || "").trim().toLowerCase();
      return assignedType === typeFilter.toLowerCase() ||
        catServices.length > 0;
    });
  }, [categories, typeFilteredServices, typeFilter, selectedCategory]);

  const catalogServices = typeFilteredServices;

  const filteredServices = catalogServices.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getMinServicePrice = (service) => {
    if (Array.isArray(service.packages) && service.packages.length > 0) {
      const prices = service.packages.map(p => Number(p.price || 0)).filter(p => p > 0);
      if (prices.length > 0) return Math.min(...prices);
    }
    return Number(service.price || 0);
  };

  const uncategorizedServices = filteredServices
    .filter((s) => !catalogCategories.some((c) => Number(c.id) === Number(s.category_id)))
    .sort((a, b) => {
      if (priceSort === "asc") return getMinServicePrice(a) - getMinServicePrice(b);
      if (priceSort === "desc") return getMinServicePrice(b) - getMinServicePrice(a);
      return a.name.localeCompare(b.name, 'en');
    });

  return (
    <>
      {isHome && <HeroSlider />}

      {/* Filter and Search Bar (Single Row) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
        
        {/* Search */}
        <div style={{ flex: '1 1 250px', position: 'relative' }}>
          <input
            type="text"
            className="search-input-center"
            placeholder={t("searchServices") || "ابحث عن خدمة، تفعيلات، أدوات..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            dir={meta?.dir || "rtl"}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            data-lpignore="true"
            style={{ width: '100%', padding: meta?.dir === 'ltr' ? '12px 40px 12px 38px' : '12px 38px 12px 40px', borderRadius: '12px', background: 'var(--bg-glass-deep)', border: '1px solid var(--border-glass)', color: 'var(--text-main)' }}
          />
          <span style={{ position: 'absolute', right: meta?.dir === 'ltr' ? 'auto' : '15px', left: meta?.dir === 'ltr' ? '15px' : 'auto', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              title="مسح"
              style={{
                position: 'absolute',
                left: meta?.dir === 'ltr' ? 'auto' : '12px',
                right: meta?.dir === 'ltr' ? '12px' : 'auto',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.18)',
                border: 'none',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-main)',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                padding: 0
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort/Filter Dropdowns */}
        <div style={{ display: 'flex', gap: '10px', flex: '0 0 auto', flexWrap: 'wrap' }}>
          {/* Price Dropdown */}
          <div className="glass-panel" style={{ padding: '6px 12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-glass-deep)', border: '1px solid var(--border-glass)' }}>
            <span style={{ fontSize: '0.85rem' }}>💰</span>
            <select
              value={priceSort}
              onChange={(e) => setPriceSort(e.target.value)}
              aria-label="ترتيب حسب السعر"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                fontWeight: '600',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="default" style={{ background: 'var(--bg-color)', color: 'var(--text-main)' }}>السعر: الافتراضي 🔽</option>
              <option value="asc" style={{ background: 'var(--bg-color)', color: 'var(--text-main)' }}>السعر: من الأقل للأعلى 📈</option>
              <option value="desc" style={{ background: 'var(--bg-color)', color: 'var(--text-main)' }}>السعر: من الأعلى للأقل 📉</option>
            </select>
          </div>

          {/* Category Dropdown */}
          <div className="glass-panel" style={{ padding: '6px 12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-glass-deep)', border: '1px solid var(--border-glass)' }}>
            <span style={{ fontSize: '0.85rem' }}>📁</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="تصفية حسب القسم"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                fontWeight: '600',
                outline: 'none',
                cursor: 'pointer',
                maxWidth: '170px'
              }}
            >
              <option value="all" style={{ background: 'var(--bg-color)', color: 'var(--text-main)' }}>جميع الأقسام 🔽</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} style={{ background: 'var(--bg-color)', color: 'var(--text-main)' }}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <nav aria-label={t("filterServices", "تصفية الخدمات")} style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "25px" }}>
        {[
          { href: isHome ? "/" : "/services", value: null, label: t("allServices", "الكل"), icon: "🔗" },
          { href: (isHome ? "/" : "/services") + "?type=server", value: "server", label: t("serverServices", "سيرفر"), icon: "🖥️" },
          { href: (isHome ? "/" : "/services") + "?type=imei", value: "imei", label: t("imeiServices", "IMEI"), icon: "📱" },
          { href: (isHome ? "/" : "/services") + "?type=remote", value: "remote", label: t("remoteServices", "ريموت"), icon: "🎮" }
        ].map((item) => {
          const active = (typeFilter || null) === item.value;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={active ? "glass-btn glass-btn-primary" : "glass-btn"}
              style={{ padding: "8px 20px", borderRadius: "999px", textDecoration: "none", fontSize: "0.95rem", display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Wallet Balance Banner (Only if logged in theoretically, but we'll show it based on design) */}
      {isHome && authChecked && (
                  customer ? (
                    <div className="wallet-hero-card" style={{ display: "flex", flexWrap: "wrap-reverse", justifyContent: "space-between", alignItems: "center", padding: "20px", borderRadius: "16px", marginBottom: "30px", background: "var(--bg-glass-deep)", border: "1px solid var(--border-glass)" }}>
                      <Link className="glass-btn glass-btn-primary" href="/wallet" style={{ padding: "12px 25px", borderRadius: "12px", fontWeight: "bold", textDecoration: "none" }}>
                        اشحن محفظتك الآن
                      </Link>
                      <div style={{ display: "flex", alignItems: "center", gap: "15px", textAlign: "right" }}>
                        <div>
                          <div style={{ fontSize: "1.2rem", fontWeight: "900" }}>
                            رصيدك الحالي: <span style={{ color: "var(--primary-color)" }}>${Number(customer.balance || 0).toFixed(2)}</span>
                          </div>
                          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                            {t("chargeWalletNow", "أضف رصيدك الآن واستمتع بتنفيذ فوري بدون تأخير")}
                          </div>
                        </div>
                        <div style={{ width: "50px", height: "50px", background: "rgba(0, 180, 216, 0.1)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", color: "var(--primary-color)" }}>
                          👛
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="wallet-hero-card" style={{ display: "flex", flexWrap: "wrap-reverse", justifyContent: "space-between", alignItems: "center", padding: "20px", borderRadius: "16px", marginBottom: "30px", background: "var(--bg-glass-deep)", border: "1px solid var(--border-glass)" }}>
                      <Link className="glass-btn glass-btn-primary" href="/login" style={{ padding: "12px 25px", borderRadius: "12px", fontWeight: "bold", textDecoration: "none" }}>
                        تسجيل الدخول
                      </Link>
                      <div style={{ display: "flex", alignItems: "center", gap: "15px", textAlign: "right" }}>
                        <div>
                          <div style={{ fontSize: "1.2rem", fontWeight: "900" }}>
                            {t("heroWelcome", "أهلاً بك في خدماتنا!")}
                          </div>
                          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                            {t("heroLoginDesc", "سجل دخولك لتتمكن من شحن رصيدك وتنفيذ الطلبات فوراً")}
                          </div>
                        </div>
                        <div style={{ width: "50px", height: "50px", background: "rgba(0, 180, 216, 0.1)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", color: "var(--primary-color)" }}>
                          👋
                        </div>
                      </div>
                    </div>
                  )
      )}

      {/* Services List (scc-grid) */}
      {loading && services.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", fontSize: "1.2rem", fontWeight: 700 }}>
          {t("loadingServices")}
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: "40px" }}>
          <span style={{ fontSize: "3rem" }}>📭</span>
          <h3 style={{ margin: "15px 0 10px 0" }}>{t("noSearchResults")}</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>{t("tryOtherSearch")}</p>
          <Link href="/" className="glass-btn glass-btn-primary">{t("backHome")}</Link>
        </div>
      ) : (
        <div className="services-page-groups" style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
          {catalogCategories.filter(cat => {
            if (searchTerm.trim().length > 0) return true;
            return true;
          }).slice(0, searchTerm.trim().length > 0 ? catalogCategories.length : visibleCategories).map((cat) => {
            const catServices = filteredServices
              .filter(s => Number(s.category_id) === Number(cat.id))
              .sort((a, b) => {
                if (priceSort === "asc") return getMinServicePrice(a) - getMinServicePrice(b);
                if (priceSort === "desc") return getMinServicePrice(b) - getMinServicePrice(a);
                return a.name.localeCompare(b.name, 'en');
              });
            if (catServices.length === 0) return null;

            return (
              <div key={cat.id} className="services-page-group" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {/* Category Header */}
                <div className="services-page-group-header" style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  paddingBottom: "12px",
                  borderBottom: "2px solid var(--bg-glass)",
                  position: "relative",
                  flexWrap: "wrap"
                }}>
                  {cat.image && cat.image !== "default" && cat.image !== "null" && (
                    <div style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "var(--bg-glass)",
                      border: "1px solid var(--bg-glass)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden"
                    }}>
                      {(() => {
                        const cleanPath = cat.image.startsWith("/") ? cat.image : `/${cat.image}`;
                        const src = (cat.image.startsWith("http") || cat.image.startsWith("data:")) ? cat.image : `${API_BASE_URL}${cleanPath}`;
                        return <img
                          src={src}
                          alt={cat.name}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />;
                      })()}
                    </div>
                  )}
                  <h3 className="cat-section-header" style={{ flex: "1 1 auto", wordBreak: "break-word", lineHeight: "1.4" }}>{cat.name}</h3>
                  <span style={{
                    fontSize: "0.75rem",
                    color: "#a855f7",
                    background: "rgba(168, 85, 247, 0.12)",
                    border: "1px solid rgba(168, 85, 247, 0.15)",
                    padding: "2px 8px",
                    borderRadius: "10px",
                    fontWeight: "700"
                  }}>
                    {catServices.length} {catServices.length === 1 ? "خدمة" : catServices.length === 2 ? "خدمتين" : "خدمات"}
                  </span>
                </div>

                {/* Sub Services Grid */}
                <div className="scc-grid">
                  {catServices.map((service) => {
                    const isCustomImg = service.image && (service.image.startsWith("data:image") || service.image.startsWith("http") || service.image.includes("uploads"));

                    const categoryColors = {
                      1: '#6366f1', // games
                      2: '#eab308', // live apps
                      3: '#a855f7', // cards
                      4: '#06b6d4', // balances/currencies
                      5: '#ec4899', // social media
                      6: '#10b981', // server services
                      7: '#d946ef', // subscriptions
                      8: '#eab308', // AI
                      9: '#6366f1', // numbers
                      10: '#6366f1', // programming/design
                      11: '#eab308', // ready accounts
                      12: '#ec4899'  // ads
                    };
                    const catColor = categoryColors[service.category_id] || '#6366f1';

                    const hexToRgb = (hex) => {
                      const result = /^#?([a-fd]{2})([a-fd]{2})([a-fd]{2})$/i.exec(hex);
                      return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '99, 102, 241';
                    };
                    const catGlow = `rgba(${hexToRgb(catColor)}, 0.35)`;

                    const imgSrc = isCustomImg
                      ? (service.image.startsWith("http") || service.image.startsWith("data:")
                        ? service.image
                        : (service.image.startsWith("/") ? `${API_BASE_URL}${service.image}` : `${API_BASE_URL}/${service.image}`))
                      : null;

                    return (
                      <div className="scc-wrap" key={service.id}>
                        <Link
                          href={`/service/${service.id}`}
                          className="scc-card"
                          dir="ltr"
                          style={{ '--scc-ac': catColor, '--scc-gl': catGlow }}
                        >
                          <div className="scc-side-line"></div>
                          {imgSrc && (
                            <div className="scc-img-ring">
                              <div className="scc-img-inner">
                                <img
                                  src={imgSrc}
                                  alt={service.name}
                                  loading="lazy"
                                  className="scc-img"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    const ring = e.target.closest('.scc-img-ring');
                                    if (ring) {
                                      ring.style.display = 'none';
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          )}
                          <div className="scc-content">
                            <span className="scc-name">{service.name}</span>
                            <div className="scc-meta" style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center", marginTop: "4px", width: "100%", minWidth: 0 }}>
                              {service.packages && service.packages.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", marginTop: "10px", minWidth: 0 }}>
                                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "bold" }}>{t("availablePackages")}</span>
                                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "10px" }}>
                                    {service.packages.map((pkg, idx) => (
                                      <div key={idx} style={{ 
                                        display: "flex", 
                                        flexDirection: "column",
                                        justifyContent: "center", 
                                        alignItems: "center",
                                        textAlign: "center",
                                        gap: "10px",
                                        fontSize: "0.85rem", 
                                        background: "var(--bg-glass-deep)", 
                                        padding: "15px 12px", 
                                        borderRadius: "12px",
                                        border: "1px solid var(--border-glass)",
                                        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                        minWidth: 0,
                                        height: "100%",
                                        transition: "all 0.3s ease",
                                        cursor: "pointer",
                                        position: "relative",
                                        zIndex: 10
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-3px)";
                                        e.currentTarget.style.borderColor = "var(--primary-color)";
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.borderColor = "var(--border-glass)";
                                      }}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        router.push(`/service/${service.id}?pkg=${encodeURIComponent(pkg.name)}`);
                                      }}
                                      >
                                        <span style={{ color: "#fff", whiteSpace: "normal", wordBreak: "break-word", fontWeight: 600, lineHeight: "1.4" }} title={pkg.name}>{pkg.name}</span>
                                        <span style={{ color: "var(--primary-color)", fontWeight: "900", fontSize: "1rem", marginTop: "auto", background: "rgba(0, 180, 216, 0.1)", padding: "4px 12px", borderRadius: "8px" }}>${Number(pkg.price).toFixed(2)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : service.price > 0 ? (
                                <span style={{ color: "var(--primary-color)", fontWeight: 900, fontSize: "0.9rem" }}>
                                  $ {Number(service.price).toFixed(2)}
                                </span>
                              ) : (
                                <>
                                  <div className="scc-dot"></div>
                                  <span>{t("clickToView")}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="scc-arrow">
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left">
                              <path d="m15 18-6-6 6-6"></path>
                            </svg>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {uncategorizedServices.length > 0 && (
            <div className="services-page-group" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div className="services-page-group-header" style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                paddingBottom: "12px",
                borderBottom: "2px solid var(--bg-glass)",
                position: "relative",
                flexWrap: "wrap"
              }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "var(--bg-glass)",
                  border: "1px solid var(--bg-glass)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden"
                }}>
                  <span style={{ fontSize: "1.2rem" }}>⚡</span>
                </div>
                <h3 className="cat-section-header" style={{ flex: "1 1 auto", wordBreak: "break-word", lineHeight: "1.4" }}>خدمات أخرى</h3>
                <span style={{
                  fontSize: "0.75rem",
                  color: "#cbd5e1",
                  background: "var(--bg-glass)",
                  border: "1px solid var(--bg-glass)",
                  padding: "2px 8px",
                  borderRadius: "10px",
                  fontWeight: "700"
                }}>
                  {uncategorizedServices.length} خدمة
                </span>
              </div>

              <div className="scc-grid">
                {uncategorizedServices.map((service) => {
                  const isCustomImg = service.image && (service.image.startsWith("data:image") || service.image.startsWith("http") || service.image.includes("uploads"));
                  const catColor = '#6366f1';
                  const catGlow = 'rgba(99, 102, 241, 0.35)';
                  const imgSrc = isCustomImg
                    ? (service.image.startsWith("http") || service.image.startsWith("data:")
                      ? service.image
                      : (service.image.startsWith("/") ? `${API_BASE_URL}${service.image}` : `${API_BASE_URL}/${service.image}`))
                    : null;

                  return (
                    <div className="scc-wrap" key={service.id}>
                      <Link
                        href={`/service/${service.id}`}
                        className="scc-card"
                        dir="ltr"
                        style={{ '--scc-ac': catColor, '--scc-gl': catGlow }}
                      >
                        <div className="scc-side-line"></div>
                        {imgSrc && (
                          <div className="scc-img-ring">
                            <div className="scc-img-inner">
                              <img
                                src={imgSrc}
                                alt={service.name}
                                loading="lazy"
                                className="scc-img"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const ring = e.target.closest('.scc-img-ring');
                                  if (ring) {
                                    ring.style.display = 'none';
                                  }
                                }}
                              />
                            </div>
                          </div>
                        )}
                        <div className="scc-content">
                          <span className="scc-name">{service.name}</span>
                          <div className="scc-meta" style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center", marginTop: "4px", width: "100%", minWidth: 0 }}>
                            {service.packages && service.packages.length > 0 ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "100%", marginTop: "6px", minWidth: 0 }}>
                                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "bold" }}>{t("availablePackages")}</span>
                                {service.packages.slice(0, 3).map((pkg, idx) => (
                                  <div key={idx} style={{ 
                                    display: "flex", 
                                    justifyContent: "space-between", 
                                    alignItems: "center",
                                    gap: "8px",
                                    fontSize: "0.85rem", 
                                    background: "var(--bg-glass)", 
                                    padding: "8px 10px", 
                                    borderRadius: "6px",
                                    border: "1px solid var(--bg-glass)",
                                    width: "100%",
                                    boxSizing: "border-box",
                                    minWidth: 0
                                  }}>
                                    <span style={{ color: "#fff", whiteSpace: "normal", wordBreak: "break-word", flex: "1 1 auto", minWidth: 0 }} title={pkg.name}>{pkg.name}</span>
                                    <span style={{ color: "var(--primary-color)", fontWeight: "bold", flexShrink: 0 }}>${Number(pkg.price).toFixed(2)}</span>
                                  </div>
                                ))}
                                {service.packages.length > 3 && (
                                  <span style={{ fontSize: "0.78rem", color: "#fbbf24", background: "rgba(245, 158, 11, 0.14)", border: "1px solid rgba(245, 158, 11, 0.35)", padding: "3px 9px", borderRadius: "8px", fontWeight: "900", marginTop: "4px", display: "inline-block" }}>+ {t("viewMore")} ({service.packages.length - 3})</span>
                                )}
                              </div>
                            ) : service.price > 0 ? (
                              <span style={{ color: "var(--primary-color)", fontWeight: 900, fontSize: "0.9rem" }}>
                                $ {Number(service.price).toFixed(2)}
                              </span>
                            ) : (
                              <>
                                <div className="scc-dot"></div>
                                <span>{t("clickToView")}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="scc-arrow">
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left">
                            <path d="m15 18-6-6 6-6"></path>
                          </svg>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {searchTerm.trim().length === 0 && visibleCategories < catalogCategories.length && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: "20px", marginBottom: "10px" }}>
              <button
                type="button"
                className="glass-btn glass-btn-primary"
                onClick={() => setVisibleCategories((count) => count + 5)}
              >
                {t("viewMore")}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}




