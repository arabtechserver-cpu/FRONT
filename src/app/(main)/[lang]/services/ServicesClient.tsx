"use client";
import { useStoreNavigation } from "@/components/StoreNavigationProvider";
import { navigationPages } from "@/lib/store-pages";
import { getServicePrice } from '@/lib/service-price';

import React, { useState, useEffect, useMemo, useDeferredValue } from "react";
import Link from "next/link";
import { Gamepad2, Gift, Store, Clapperboard, Smartphone, Grid2X2, Search, X, ArrowUpRight, ChevronDown, Clock3, Layers3, ShieldCheck, Wallet, SlidersHorizontal, LoaderCircle } from "lucide-react";
import { cleanHtmlToText } from "@/utils/cleanHtml";
import styles from "./services.module.css";
import { getProviderServiceType } from "@/lib/provider-service-types";

interface ServiceItem {
  id: string;
  imageUrl?: string | null;
  groupImageUrl?: string | null;
  dhruId?: string;
  name: string;
  originalName?: string;
  groupName: string;
  categoryName?: string;
  categoryId?: string;
  apiServiceType?: string | null;
  price?: number;
  finalPrice?: number;
  credit?: number;
  margin?: number;
  time?: string;
  info?: string | null;
  isActive?: boolean;
  requiresCustom?: any;
  supportsQty?: boolean;
}

interface PackageGroup {
  key: string;
  imageUrl?: string | null;
  groupName: string;
  categoryType: string;
  categoryName: string;
  services: ServiceItem[];
  minPrice: number;
}

interface CurrencyInfo {
  code: string;
  symbolAr: string;
  symbolEn: string;
  rate: number;
}

const CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { code: "USD", symbolAr: "$", symbolEn: "$", rate: 1.0 },
  SDG: { code: "SDG", symbolAr: "ج.س", symbolEn: "SDG", rate: 600.0 },
  SAR: { code: "SAR", symbolAr: "ر.س", symbolEn: "SAR", rate: 3.75 },
  EGP: { code: "EGP", symbolAr: "ج.م", symbolEn: "EGP", rate: 50.0 },
  AED: { code: "AED", symbolAr: "د.إ", symbolEn: "AED", rate: 3.67 },
};

const CATEGORIES_DEF = [
  { id: "all", labelAr: "الكل", labelEn: "All", icon: "apps" },
  { id: "topups", labelAr: "شحن ألعاب", labelEn: "Game Top-Ups", icon: "sports_esports" },
  { id: "gamecodes", labelAr: "أكواد وبطاقات", labelEn: "Codes & Gift Cards", icon: "vpn_key" },
  { id: "appstores", labelAr: "متاجر وتطبيقات", labelEn: "Apps & Stores", icon: "store" },
  { id: "subscriptions", labelAr: "اشتراكات", labelEn: "Subscriptions", icon: "subscriptions" },
  { id: "esim", labelAr: "eSIM", labelEn: "eSIM", icon: "sim_card" },
];

const BRAND_LIBRARY = [
  { label: "PUBG Mobile", query: "pubg", image: "game_pubg.webp", kindAr: "شدات وباقات", kindEn: "UC & packages" },
  { label: "Free Fire", query: "free fire", image: "game_freefire.webp", kindAr: "جواهر وبطاقات", kindEn: "Diamonds & cards" },
  { label: "TikTok", query: "tiktok", image: "game_tiktok.webp", kindAr: "خدمات تيك توك", kindEn: "TikTok services" },
  { label: "PlayStation", query: "playstation", image: "card_playstation.webp", kindAr: "بطاقات رقمية", kindEn: "Digital gift cards" },
  { label: "Steam", query: "steam", image: "card_steam.webp", kindAr: "بطاقات ستيم", kindEn: "Steam wallet cards" },
  { label: "Apple & iTunes", query: "itunes", image: "card_itunes.webp", kindAr: "بطاقات المتجر", kindEn: "Store gift cards" },
  { label: "eFootball", query: "efootball", image: "game_pes.webp", kindAr: "كوينز وباقات", kindEn: "Coins & packages" },
  { label: "Mobile Legends", query: "mobile legends", image: "game_mobilelegends.webp", kindAr: "جواهر وباقات", kindEn: "Diamonds & packages" },
  { label: "Xbox", query: "xbox", image: "card_xbox.webp", kindAr: "بطاقات إكس بوكس", kindEn: "Xbox gift cards" },
  { label: "Razer Gold", query: "razer", image: "card_razergold.webp", kindAr: "بطاقات ريزر", kindEn: "Razer gift cards" },
  { label: "Clash of Clans", query: "clash of clans", image: "game_clashofclans.webp", kindAr: "باقات اللعبة", kindEn: "Game packages" },
  { label: "Google Play", query: "google play", image: "", kindAr: "بطاقات جوجل بلاي", kindEn: "Google Play cards" },
  { label: "Netflix", query: "netflix", image: "", kindAr: "اشتراكات رقمية", kindEn: "Digital subscriptions" },
  { label: "beIN SPORTS", query: "bein", image: "", kindAr: "اشتراكات رياضية", kindEn: "Sports subscriptions" },
  { label: "Roblox", query: "roblox", image: "", kindAr: "باقات وبطاقات", kindEn: "Packages & cards" },
];
const CATEGORY_ICONS: Record<string, typeof Gamepad2> = { all: Grid2X2, topups: Gamepad2, gamecodes: Gift, appstores: Store, subscriptions: Clapperboard, esim: Smartphone, imei: Smartphone, server: Store, remote: Grid2X2 };

export default function ServicesClient({
  lang,
  dict,
  initialServices,
  initialCategory = "all",
  initialSearchQuery = "",
  pageContext,
}: {
  lang: string;
  dict: any;
  initialServices?: any[];
  initialCategory?: string;
  initialSearchQuery?: string;
  pageContext?: { id?: string; slug?: string; title: string; description: string };
}) {
  const isAr = lang === "ar";
  const storePages = navigationPages(useStoreNavigation(), "catalog");

  const [rawCategories, setRawCategories] = useState<any[]>(
    Array.isArray(initialServices) ? initialServices : []
  );
  const [loading, setLoading] = useState(
    !pageContext && (!Array.isArray(initialServices) || initialServices.length === 0)
  );

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const deferredSearch = useDeferredValue(searchQuery);

  const [sortOrder, setSortOrder] = useState("name");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [userSession, setUserSession] = useState<any>(null);
  const [currencyCode, setCurrencyCode] = useState<string>("USD");
  const [pageRates, setPageRates] = useState<Record<string, number>>({ USD: 1 });
  useEffect(() => {
    if (!pageContext) return;
    const controller = new AbortController();
    fetch('/api/currencies', { signal: controller.signal }).then(response => response.ok ? response.json() : null).then(data => {
      if (data?.config) setPageRates({ USD: 1, SDG: Number(data.config.usdToSdg), EGP: Number(data.config.usdToEgp), SAR: Number(data.config.usdToSar), AED: Number(data.config.usdToAed) });
    }).catch(() => {});
    return () => controller.abort();
  }, [pageContext]);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user_session");
      if (savedUser) setUserSession(JSON.parse(savedUser));
      const savedCur = localStorage.getItem("app_currency");
      if (savedCur && CURRENCIES[savedCur]) setCurrencyCode(savedCur);
    } catch {}

    const handleCurChange = () => {
      const saved = localStorage.getItem("app_currency");
      if (saved && CURRENCIES[saved]) setCurrencyCode(saved);
    };
    window.addEventListener("currency_change", handleCurChange);
    return () => window.removeEventListener("currency_change", handleCurChange);
  }, []);

  useEffect(() => {
    if (pageContext || rawCategories.length > 0) return;
    async function load() {
      try {
        const res = await fetch("/api/dhru/services?view=pricing");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setRawCategories(data);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [rawCategories.length, pageContext]);

  const discountPercent = useMemo(() => {
    if (!userSession) return 0;
    return Math.min(100, Math.max(
      userSession.effectiveDiscount || 0,
      userSession.membershipTier?.discountPercentage || 0,
      userSession.customDiscount || 0
    ));
  }, [userSession]);

  const baseCurrency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const currency = pageContext ? (Number.isFinite(pageRates[baseCurrency.code]) && pageRates[baseCurrency.code] > 0 ? { ...baseCurrency, rate: pageRates[baseCurrency.code] } : CURRENCIES.USD) : baseCurrency;

  const formatPrice = (usd: number = 0) => {
    if (!Number.isFinite(usd) || usd <= 0) return isAr ? 'السعر غير متاح' : 'Price unavailable';
    const discounted = discountPercent > 0 ? usd * (1 - discountPercent / 100) : usd;
    const converted = discounted * currency.rate;
    const formatted = converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: converted > 0 && converted < 0.01 ? 6 : 2,
    });
    return isAr
      ? `${formatted} ${currency.symbolAr}`
      : `${currency.symbolEn} ${formatted}`;
  };

  const allDigitalServices = useMemo(() => {
    const list: ServiceItem[] = [];
    rawCategories.forEach((cat: any) => {
      (cat.services || []).forEach((srv: any) => {
        const type = getProviderServiceType({
          ...srv,
          category_name: cat.name,
          categoryName: cat.name,
        });
        if (srv.isActive !== false) {
          list.push({
            ...srv,
            categoryName: cat.name,
            categoryId: cat.id,
            apiServiceType: type,
          });
        }
      });
    });
    return list;
  }, [rawCategories, pageContext]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: allDigitalServices.length,
      topups: 0,
      gamecodes: 0,
      appstores: 0,
      subscriptions: 0,
      esim: 0,
      imei: 0,
      server: 0,
      remote: 0,
    };
    allDigitalServices.forEach((s) => {
      const t = s.apiServiceType || "topups";
      if (t in counts) counts[t]++;
    });
    return counts;
  }, [allDigitalServices]);

  const packageGroups = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    const map: Record<string, PackageGroup> = {};

    allDigitalServices.forEach((service) => {
      const type = service.apiServiceType || "topups";
      if (selectedCategory !== "all" && type !== selectedCategory) return;

      const groupName = service.groupName || (isAr ? "خدمات وباقات رقمية" : "Digital Packages");
      const groupKey = JSON.stringify([service.categoryId, groupName]);
      const name = (service.name || "").toLowerCase();
      const rawGroup = groupName.toLowerCase();

      if (q && !name.includes(q) && !rawGroup.includes(q)) return;

      if (!map[groupKey]) {
        map[groupKey] = {
          key: groupKey,
          groupName,
          categoryType: type,
          categoryName: service.categoryName || "",
          services: [],
          minPrice: Number.MAX_VALUE,
        };
      }

      map[groupKey].services.push(service);
      const price = getServicePrice(service);
      if (price > 0 && price < map[groupKey].minPrice) {
        map[groupKey].minPrice = price;
      }
    });

    const result = Object.values(map);
    result.forEach((g) => {
      if (g.minPrice === Number.MAX_VALUE) g.minPrice = 0;
      g.services.sort((a, b) => {
        const pa = getServicePrice(a);
        const pb = getServicePrice(b);
        return pa - pb;
      });
    });

    return result.sort((a, b) => a.groupName.localeCompare(b.groupName, "en", { sensitivity: "base" }));
  }, [allDigitalServices, selectedCategory, deferredSearch, isAr, pageContext]);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const getCategoryBadgeInfo = (type: string) => {
    switch (type) {
      case "topups":
        return {
          label: isAr ? "شحن ألعاب" : "Game Top-Up",
          color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
          icon: "sports_esports",
        };
      case "gamecodes":
        return {
          label: isAr ? "أكواد وبطاقات" : "Gift Card",
          color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
          icon: "vpn_key",
        };
      case "appstores":
        return {
          label: isAr ? "متاجر وتطبيقات" : "App Store",
          color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
          icon: "store",
        };
      case "subscriptions":
        return {
          label: isAr ? "اشتراك رقمي" : "Subscription",
          color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
          icon: "subscriptions",
        };
      case "esim":
        return {
          label: isAr ? "شريحة eSIM" : "eSIM",
          color: "bg-sky-500/10 text-sky-600 border-sky-500/20",
          icon: "sim_card",
        };
      case 'imei': return { label: isAr ? 'خدمات الأجهزة' : 'Device services', color: 'text-blue-600', icon: 'smartphone' };
      case 'server': return { label: isAr ? 'خدمات السيرفر' : 'Server services', color: 'text-blue-600', icon: 'dns' };
      case 'remote': return { label: isAr ? 'خدمات عن بُعد' : 'Remote services', color: 'text-blue-600', icon: 'desktop_windows' };
      default:
        return {
          label: isAr ? "خدمة رقمية" : "Digital Service",
          color: "bg-slate-500/10 text-slate-600 border-slate-500/20",
          icon: "category",
        };
    }
  };

  const availableBrands = useMemo(() => BRAND_LIBRARY.map(brand => ({
    ...brand,
    count: allDigitalServices.filter(service => [service.name, service.groupName].join(" ").toLowerCase().includes(brand.query)).length
  })).filter(brand => brand.count > 0), [allDigitalServices]);
  const pageDestinations = useMemo(() => {
    const groups = new Map<string, { key: string; query: string; label: string; image: string; kindAr: string; kindEn: string; count: number }>();
    for (const service of allDigitalServices) {
      const name = service.groupName || service.categoryName || (isAr ? 'خدمات رقمية' : 'Digital services');
      const key = JSON.stringify([service.categoryId, name]);
      const brand = BRAND_LIBRARY.find(item => `${name} ${service.name}`.toLowerCase().includes(item.query));
      const image = service.groupImageUrl || service.imageUrl || (brand?.image ? '/images/zoalna/' + brand.image : '');
      if (!groups.has(key)) groups.set(key, { key, query: name.toLowerCase(), label: cleanHtmlToText(name), image, kindAr: getCategoryBadgeInfo(service.apiServiceType || '').label, kindEn: getCategoryBadgeInfo(service.apiServiceType || '').label, count: 0 });
      const group = groups.get(key)!; group.count++; if (!group.image && image) group.image = image;
    }
    return [...groups.values()];
  }, [allDigitalServices, isAr]);
  const destinations = pageContext ? pageDestinations : availableBrands.map(brand => ({ ...brand, key: brand.query, image: brand.image ? '/images/zoalna/' + brand.image : '' }));
  const heroDestinations = pageContext ? destinations.slice(0, 2) : destinations.filter(brand => ['pubg', 'free fire'].includes(brand.query));
  const catalogCategories = pageContext ? [...CATEGORIES_DEF, { id: 'imei', labelAr: 'خدمات الأجهزة', labelEn: 'Device services' }, { id: 'server', labelAr: 'خدمات السيرفر', labelEn: 'Server services' }, { id: 'remote', labelAr: 'خدمات عن بُعد', labelEn: 'Remote services' }].filter(category => category.id === 'all' || categoryCounts[category.id] > 0) : CATEGORIES_DEF;
  const sortedGroups = useMemo(() => [...packageGroups].sort((a, b) => sortOrder === "price-low" ? a.minPrice - b.minPrice : sortOrder === "price-high" ? b.minPrice - a.minPrice : a.groupName.localeCompare(b.groupName, "en", { sensitivity: "base" })), [packageGroups, sortOrder]);
  const resultCount = packageGroups.reduce((count, group) => count + group.services.length, 0);
  const resetFilters = () => { setSearchQuery(""); setSelectedCategory("all"); };
  const selectCategory = (category: string) => { setSelectedCategory(category); setSearchQuery(""); };
  const selectBrand = (query: string) => { setSelectedCategory("all"); setSearchQuery(query); document.getElementById("gaming-catalog")?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  const getGameSlug = (groupName: string, serviceName: string = "") => {
    const text = [groupName, serviceName].join(" ").toLowerCase();
    if (text.includes("free fire")) return "free-fire-id";
    if (text.includes("pubg")) return "pubg-id";
    if (text.includes("mobile legends")) return "mobile-legends";
    if (text.includes("blood strike")) return "blood-strike";
    if (text.includes("tiktok")) return "tiktok";
    if (text.includes("jawaker")) return "jawaker";
    if (text.includes("yalla ludo")) return "yalla-ludo";
    if (text.includes("roblox")) return "roblox";
    return groupName.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "service";
  };

  return (
    <div className={styles.page} dir={isAr ? "rtl" : "ltr"}>
      <section className={styles.hero + " bg-surface-container shadow-sm"} aria-labelledby="gaming-title">
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow + " text-blue-600 dark:text-blue-400"}><Gamepad2 size={17} />BORAI PLAY / DIGITAL STORE</span>
          <h1 id="gaming-title">{pageContext?.title || (isAr ? "لعبتك المفضلة." : "Your favorite game.")}<br /><span className="text-blue-600 dark:text-blue-400">{pageContext ? (isAr ? 'اختار باقتك بسهولة.' : 'Find your perfect package.') : (isAr ? "باقتك على مزاجك." : "Your next upgrade.")}</span></h1>
          <p>{pageContext ? pageContext.description || (isAr ? 'استعرض الباقات المتاحة، قارن الأسعار، واختار الخدمة المناسبة ليك. تابع طلبك بسهولة من حسابك.' : 'Explore available packages, compare prices and find your service. Track every order from your account.') : (isAr ? "شدات، جواهر، بطاقات واشتراكات. اختار وجهتك، قارن الباقات، وكمّل طلبك في خطوات بسيطة." : "Top-ups, diamonds, gift cards and subscriptions. Find your destination, compare packages and place your order.")}</p>
          <div className={styles.heroActions}><a href="#gaming-catalog" onClick={() => { setSelectedCategory(pageContext ? 'all' : "topups"); setSearchQuery(""); }} className={styles.primaryAction + " bg-blue-600 hover:bg-blue-700 text-white"}>{pageContext ? (isAr ? 'اكتشف الباقات' : 'Explore packages') : (isAr ? "اكتشف باقات الألعاب" : "Explore game top-ups")}<ArrowUpRight size={18} /></a><Link href={"/" + lang + "/wallet"} className={styles.secondaryAction}><Wallet size={17} />{isAr ? "شحن المحفظة" : "Add wallet funds"}</Link></div>
          <div className={styles.heroMeta}><span><Layers3 size={16} />{loading ? "—" : allDigitalServices.length} {isAr ? "باقة رقمية" : "digital packages"}</span><span><ShieldCheck size={16} />{isAr ? "تابع طلبك من حسابك" : "Track orders from your account"}</span></div>
        </div>
        <div className={styles.heroArt}>
          <Gamepad2 className={styles.heroBackdrop} size={250} strokeWidth={.6} aria-hidden="true" />
          {heroDestinations.map((brand, index) => <button key={brand.key} type="button" className={styles.heroGame + " " + (index === 0 ? styles.heroGameFirst : styles.heroGameSecond)} onClick={() => selectBrand(brand.query)} aria-label={(isAr ? "تصفح باقات " : "Browse packages for ") + brand.label}>{brand.image ? <img src={brand.image} alt="" width={220} height={220} fetchPriority={index === 0 ? "high" : "auto"} /> : <span className={styles.heroPlaceholder}><Layers3 size={78} strokeWidth={1.1} /></span>}<div><strong>{brand.label}</strong><span>{isAr ? brand.kindAr : brand.kindEn}<ArrowUpRight size={15} /></span></div></button>)}
          {heroDestinations.length === 0 && pageContext && <div className={styles.heroBrandEmpty}><img src="/images/borai-logo.png" alt="" width={260} height={90} /><span>BORAI STORE</span></div>}
          <span className={styles.artCaption}>LEVEL UP YOUR EVERYDAY</span>
        </div>
      </section>

      {destinations.length > 0 && <section className={styles.destinations} aria-labelledby="destinations-title">
        <div className={styles.sectionHeading}><div><span className={styles.eyebrow}>{isAr ? "اختار عالمك" : "PICK YOUR WORLD"}</span><h2 id="destinations-title">{isAr ? "وجهتك، بضغطة واحدة" : "Your destination, one click away"}</h2></div><span className={styles.muted}>{isAr ? "ألعاب وبطاقات وخدمات رقمية" : "Games, cards and digital services"}</span></div>
        <div className={styles.brandRail}>{destinations.map(brand => <button key={brand.key} type="button" onClick={() => selectBrand(brand.query)} aria-pressed={searchQuery.toLowerCase() === brand.query} className={styles.brand + " bg-surface-container"}>{brand.image ? <img src={brand.image} alt="" width={72} height={72} loading="lazy" /> : <span className={styles.brandFallback + " text-blue-600 dark:text-blue-400"}>{brand.query === "netflix" || brand.query === "bein" ? <Clapperboard size={28} /> : brand.query === "google play" ? <Store size={28} /> : <Gamepad2 size={28} />}</span>}<strong>{brand.label}</strong><small>{brand.count} {isAr ? "باقة" : "packages"}</small></button>)}</div>
      </section>}

      <section id="gaming-catalog" className={styles.catalog} aria-labelledby="catalog-title">
        <div className={styles.sectionHeading}><div><span className={styles.eyebrow}>{isAr ? "كتالوج الخدمات" : "THE CATALOG"}</span><h2 id="catalog-title">{isAr ? "اكتشف الباقة المناسبة لك" : "Find the right package for you"}</h2></div>{discountPercent > 0 && <span className={styles.vip + " text-blue-600 dark:text-blue-400"}>VIP · {discountPercent}% {isAr ? "خصم" : "discount"}</span>}</div>
        <div className={styles.catalogShell}>
          <aside className={styles.sidebar + " bg-surface-container"}>
            <h3><SlidersHorizontal size={17} />{isAr ? "تصفح الأقسام" : "Browse categories"}</h3>
            <nav className={styles.categories + " " + styles.pageLinks} aria-label={isAr ? "صفحات المتجر" : "Store pages"}>
              {pageContext ? <Link href={`/${lang}/services#gaming-catalog`} className={styles.category + " text-slate-600 dark:text-slate-300"}><Grid2X2 size={18} /><span>{isAr ? "كل خدمات المتجر" : "All store services"}</span></Link> : <button type="button" aria-pressed={selectedCategory === 'all'} onClick={resetFilters} className={styles.category + " " + (selectedCategory === 'all' ? styles.categoryActive + " bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-300")}><Grid2X2 size={18} /><span>{isAr ? "الكل" : "All"}</span><small>{loading ? '—' : categoryCounts.all}</small></button>}
              {storePages.map(page => { const active = page.id === pageContext?.id; return <Link key={page.id} href={`/${lang}/pages/${page.slug}#gaming-catalog`} aria-current={active ? 'page' : undefined} className={styles.category + " " + (active ? styles.categoryActive + " bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-300")}><Layers3 size={18} /><span>{!isAr && page.titleEn ? page.titleEn : page.title}</span><small>{page.serviceCount ?? (active ? categoryCounts.all : '—')}</small></Link>; })}
            </nav>
            {pageContext && <><h3 className={styles.filterHeading}>{isAr ? "أنواع الخدمات في هذه الصفحة" : "Service types on this page"}</h3><nav className={styles.categories} aria-label={isAr ? "تصفية خدمات الصفحة" : "Filter page services"}>{catalogCategories.map(cat => { const Icon = CATEGORY_ICONS[cat.id] || Grid2X2; const active = selectedCategory === cat.id; return <button key={cat.id} type="button" aria-pressed={active} onClick={() => selectCategory(cat.id)} className={styles.category + " " + (active ? styles.categoryActive + " bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-300")}><Icon size={18} /><span>{isAr ? cat.labelAr : cat.labelEn}</span><small>{categoryCounts[cat.id] || 0}</small></button>; })}</nav></>}
            <div className={styles.sideNote}><ShieldCheck size={22} className="text-blue-600 dark:text-blue-400" /><strong>{isAr ? "اختار الباقة بدقة" : "Find your perfect match"}</strong><p>{isAr ? "راجع قيمة الباقة والمنطقة ووقت التنفيذ في تفاصيل الخدمة قبل الطلب." : "Check the package value, region and delivery time before ordering."}</p><Link href={"/" + lang + "/orders"}>{isAr ? "متابعة طلباتي" : "Track my orders"}<ArrowUpRight size={14} /></Link></div>
          </aside>
          <div className={styles.results}>
            <div className={styles.toolbar + " bg-surface-container"}>
              <label className={styles.search}><Search size={19} /><input type="search" aria-label={pageContext ? (isAr ? "البحث في خدمات الصفحة" : "Search page services") : (isAr ? "البحث في الألعاب والبطاقات" : "Search games and cards")} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={pageContext ? (isAr ? "ابحث عن الخدمة أو الباقة…" : "Service or package name…") : (isAr ? "اسم اللعبة، البطاقة أو الباقة…" : "Game, card or package name…")} />{searchQuery && <button type="button" onClick={() => setSearchQuery("")} aria-label={isAr ? "مسح البحث" : "Clear search"}><X size={17} /></button>}</label>
              <label className={styles.sort}><span>{isAr ? "ترتيب" : "Sort"}</span><select aria-label={isAr ? "ترتيب الباقات" : "Sort packages"} value={sortOrder} onChange={e => setSortOrder(e.target.value)}><option value="name">{isAr ? "الاسم" : "Name"}</option><option value="price-low">{isAr ? "الأقل سعرًا" : "Lowest price"}</option><option value="price-high">{isAr ? "الأعلى سعرًا" : "Highest price"}</option></select></label>
            </div>
            <div className={styles.resultMeta} aria-live="polite"><span>{loading ? (isAr ? "جاري تجهيز الكتالوج…" : "Preparing the catalog…") : isAr ? resultCount + " باقة ضمن " + packageGroups.length + " مجموعة" : resultCount + " packages in " + packageGroups.length + " groups"}</span>{(searchQuery || selectedCategory !== "all") && <button type="button" onClick={resetFilters} className="text-blue-600 dark:text-blue-400"><X size={13} />{isAr ? "مسح التصفية" : "Clear filters"}</button>}</div>
            {loading ? <div className={styles.empty}><LoaderCircle size={32} className="animate-spin text-blue-600 dark:text-blue-400" /><strong>{isAr ? "جاري تحميل الألعاب والبطاقات…" : "Loading games and gift cards…"}</strong></div> : sortedGroups.length === 0 ? <div className={styles.empty + " bg-surface-container"}><Search size={34} /><h3>{isAr ? "ملقيناش باقات مطابقة" : "No matching packages"}</h3><p>{isAr ? "جرّب اسم لعبة مختلف، أو اعرض كل الأقسام." : "Try another game name or browse every category."}</p><button type="button" onClick={resetFilters} className={styles.primaryAction + " bg-blue-600 text-white"}>{isAr ? "عرض كل الباقات" : "View every package"}</button></div> : <div className={styles.productGrid}>{sortedGroups.map((group, index) => {
              const directOrdering = Boolean(pageContext) || ["imei", "server", "remote"].includes(group.categoryType);
              const customGroupImage = group.services.find(service => service.groupImageUrl)?.groupImageUrl || group.services.find(service => service.imageUrl)?.imageUrl;
              const brand = BRAND_LIBRARY.find(item => [group.groupName, ...group.services.map(service => service.name)].join(" ").toLowerCase().includes(item.query));
              const badge = getCategoryBadgeInfo(group.categoryType); const Icon = CATEGORY_ICONS[group.categoryType] || Gamepad2;
              const expanded = Boolean(expandedGroups[group.key]); const detailsId = "package-group-" + index;
              return <article key={group.key} className={styles.product + " bg-surface-container shadow-sm"}>
                <div className={styles.productArt}><div className={styles.productArtCopy}><span className={styles.productType + " text-blue-600 dark:text-blue-400"}><Icon size={15} />{badge.label}</span><strong>{brand?.label || (directOrdering ? cleanHtmlToText(group.groupName) : isAr ? "خدمات رقمية" : "Digital services")}</strong><span className={styles.artLabel}>{brand ? (isAr ? brand.kindAr : brand.kindEn) : group.categoryName}</span></div>{customGroupImage || brand?.image ? <img src={customGroupImage || ("/images/zoalna/" + brand?.image)} alt="" width={120} height={120} loading="lazy" /> : <Icon className={styles.genericArt + " text-blue-600 dark:text-blue-400"} size={90} strokeWidth={1} />}</div>
                <div className={styles.productBody}>
                  <h3 title={cleanHtmlToText(group.groupName)}>{directOrdering ? <button type="button" onClick={() => toggleGroup(group.key)} className={styles.groupTitleButton}>{cleanHtmlToText(group.groupName)}</button> : <Link href={"/" + lang + "/product/" + getGameSlug(group.groupName)} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{cleanHtmlToText(group.groupName)}</Link>}</h3>
                  <p className={styles.packageCount}><Layers3 size={14} />{group.services.length} {isAr ? "باقة متاحة" : "available packages"}</p>
                  <div className={styles.productFooter}><div><span>{isAr ? "يبدأ من" : "Starting at"}</span><strong className="text-blue-600 dark:text-blue-400">{formatPrice(group.minPrice)}</strong></div><div className="flex items-center gap-2">
                    {!directOrdering && <Link href={"/" + lang + "/product/" + getGameSlug(group.groupName)} className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm"><span>{isAr ? "شحن اللعبة" : "Top Up"}</span><ArrowUpRight size={13} /></Link>}
                    <button type="button" aria-expanded={expanded} aria-controls={detailsId} onClick={() => toggleGroup(group.key)} className={styles.packageButton + (directOrdering ? " bg-blue-600 hover:bg-blue-700 text-white" : " bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400")}>{expanded ? (isAr ? "إخفاء" : "Hide") : directOrdering ? (isAr ? "عرض الباقات" : "View packages") : (isAr ? "عرض" : "View")}<ChevronDown size={16} className={expanded ? styles.chevronOpen : ""} /></button>
                  </div></div>
                </div>
                {expanded && <div id={detailsId} className={styles.packageList}>{group.services.map(service => {
                  const price = getServicePrice(service);
                  const href = directOrdering ? `/${lang}/purchase?serviceId=${encodeURIComponent(service.id)}` : "/" + lang + "/product/" + getGameSlug(group.groupName, service.name) + "?package=" + encodeURIComponent(service.id);
                  return <div key={service.id} className={styles.packageRow}>{service.imageUrl && <img src={service.imageUrl} alt="" width={48} height={48} loading="lazy" decoding="async" className="w-12 h-12 object-cover rounded-lg shrink-0" />}<div><h4>{cleanHtmlToText(service.name)}</h4><span className={styles.delivery}><Clock3 size={12} />{service.time || (isAr ? "حسب تفاصيل الخدمة" : "See service details")}{service.supportsQty && <small>{isAr ? "يدعم الكميات" : "Quantity enabled"}</small>}</span></div><div className={styles.packagePrice}><strong className="text-blue-600 dark:text-blue-400">{formatPrice(price)}</strong><Link aria-label={(isAr ? "طلب " : "Order ") + cleanHtmlToText(service.name)} href={href} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">{directOrdering ? (isAr ? 'طلب الخدمة' : 'Order service') : (isAr ? "شحن الآن" : "Top Up")}<ArrowUpRight size={13} /></Link></div></div>;
                })}</div>}
              </article>;
            })}</div>}
          </div>
        </div>
      </section>
    </div>
  );
}
