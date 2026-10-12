"use client";

import React, { useState, useEffect, useMemo, useDeferredValue } from "react";
import Link from "next/link";
import { Gamepad2, Gift, Store, Clapperboard, Smartphone, Grid2X2, Search, X, ArrowUpRight, ChevronDown, Clock3, Layers3, ShieldCheck, Wallet, SlidersHorizontal, LoaderCircle, Headphones } from "lucide-react";
import { cleanHtmlToText } from "@/utils/cleanHtml";
import styles from "./services.module.css";
import { getProviderServiceType } from "@/lib/provider-service-types";

interface ServiceItem {
  id: string;
  dhruId?: string;
  name: string;
  originalName?: string;
  groupName: string;
  categoryName?: string;
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
const CATEGORY_ICONS: Record<string, typeof Gamepad2> = { all: Grid2X2, topups: Gamepad2, gamecodes: Gift, appstores: Store, subscriptions: Clapperboard, esim: Smartphone };

export default function ServicesClient({
  lang,
  dict,
  initialServices,
  initialCategory = "all",
  initialSearchQuery = "",
}: {
  lang: string;
  dict: any;
  initialServices?: any[];
  initialCategory?: string;
  initialSearchQuery?: string;
}) {
  const isAr = lang === "ar";

  const [rawCategories, setRawCategories] = useState<any[]>(
    Array.isArray(initialServices) ? initialServices : []
  );
  const [loading, setLoading] = useState(
    !Array.isArray(initialServices) || initialServices.length === 0
  );

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const deferredSearch = useDeferredValue(searchQuery);

  const [sortOrder, setSortOrder] = useState("name");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [userSession, setUserSession] = useState<any>(null);
  const [currencyCode, setCurrencyCode] = useState<string>("USD");

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
    if (rawCategories.length > 0) return;
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
  }, [rawCategories.length]);

  const discountPercent = useMemo(() => {
    if (!userSession) return 0;
    return Math.max(
      userSession.effectiveDiscount || 0,
      userSession.membershipTier?.discountPercentage || 0,
      userSession.customDiscount || 0
    );
  }, [userSession]);

  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;

  const formatPrice = (usd: number = 0) => {
    const discounted = discountPercent > 0 ? usd * (1 - discountPercent / 100) : usd;
    const converted = discounted * currency.rate;
    const formatted = converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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
        if (["topups", "gamecodes", "appstores", "subscriptions", "esim"].includes(type)) {
          list.push({
            ...srv,
            categoryName: cat.name,
            apiServiceType: type,
          });
        }
      });
    });
    return list;
  }, [rawCategories]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: allDigitalServices.length,
      topups: 0,
      gamecodes: 0,
      appstores: 0,
      subscriptions: 0,
      esim: 0,
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
      const name = (service.name || "").toLowerCase();
      const rawGroup = groupName.toLowerCase();

      if (q && !name.includes(q) && !rawGroup.includes(q)) return;

      if (!map[groupName]) {
        map[groupName] = {
          groupName,
          categoryType: type,
          categoryName: service.categoryName || "",
          services: [],
          minPrice: Number.MAX_VALUE,
        };
      }

      map[groupName].services.push(service);
      const price = Number(service.finalPrice ?? service.price ?? service.credit ?? 0);
      if (price > 0 && price < map[groupName].minPrice) {
        map[groupName].minPrice = price;
      }
    });

    const result = Object.values(map);
    result.forEach((g) => {
      if (g.minPrice === Number.MAX_VALUE) g.minPrice = 0;
      g.services.sort((a, b) => {
        const pa = Number(a.finalPrice ?? a.price ?? 0);
        const pb = Number(b.finalPrice ?? b.price ?? 0);
        return pa - pb;
      });
    });

    return result.sort((a, b) => a.groupName.localeCompare(b.groupName, "en", { sensitivity: "base" }));
  }, [allDigitalServices, selectedCategory, deferredSearch, isAr]);

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
  const sortedGroups = useMemo(() => [...packageGroups].sort((a, b) => sortOrder === "price-low" ? a.minPrice - b.minPrice : sortOrder === "price-high" ? b.minPrice - a.minPrice : a.groupName.localeCompare(b.groupName, "en", { sensitivity: "base" })), [packageGroups, sortOrder]);
  const resultCount = packageGroups.reduce((count, group) => count + group.services.length, 0);
  const resetFilters = () => { setSearchQuery(""); setSelectedCategory("all"); };
  const selectCategory = (category: string) => { setSelectedCategory(category); setSearchQuery(""); };
  const selectBrand = (query: string) => { setSelectedCategory("all"); setSearchQuery(query); document.getElementById("gaming-catalog")?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  return (
    <div className={styles.page} dir={isAr ? "rtl" : "ltr"}>
      <section className={styles.hero + " bg-surface-container shadow-sm"} aria-labelledby="gaming-title">
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow + " text-blue-600 dark:text-blue-400"}><Gamepad2 size={17} />BORAI PLAY / DIGITAL STORE</span>
          <h1 id="gaming-title">{isAr ? "لعبتك المفضلة." : "Your favorite game."}<br /><span className="text-blue-600 dark:text-blue-400">{isAr ? "باقتك على مزاجك." : "Your next upgrade."}</span></h1>
          <p>{isAr ? "شدات، جواهر، بطاقات واشتراكات. اختار وجهتك، قارن الباقات، وكمّل طلبك في خطوات بسيطة." : "Top-ups, diamonds, gift cards and subscriptions. Find your destination, compare packages and place your order."}</p>
          <div className={styles.heroActions}><a href="#gaming-catalog" onClick={() => { setSelectedCategory("topups"); setSearchQuery(""); }} className={styles.primaryAction + " bg-blue-600 hover:bg-blue-700 text-white"}>{isAr ? "اكتشف باقات الألعاب" : "Explore game top-ups"}<ArrowUpRight size={18} /></a><Link href={"/" + lang + "/wallet"} className={styles.secondaryAction}><Wallet size={17} />{isAr ? "شحن المحفظة" : "Add wallet funds"}</Link></div>
          <div className={styles.heroMeta}><span><Layers3 size={16} />{loading ? "—" : allDigitalServices.length} {isAr ? "باقة رقمية" : "digital packages"}</span><span><ShieldCheck size={16} />{isAr ? "تابع طلبك من حسابك" : "Track orders from your account"}</span></div>
        </div>
        <div className={styles.heroArt}>
          <Gamepad2 className={styles.heroBackdrop} size={250} strokeWidth={.6} aria-hidden="true" />
          {availableBrands.filter(brand => ["pubg", "free fire"].includes(brand.query)).map((brand, index) => <button key={brand.query} type="button" className={styles.heroGame + " " + (index === 0 ? styles.heroGameFirst : styles.heroGameSecond)} onClick={() => selectBrand(brand.query)} aria-label={(isAr ? "تصفح باقات " : "Browse packages for ") + brand.label}><img src={"/images/zoalna/" + brand.image} alt="" width={220} height={220} fetchPriority={index === 0 ? "high" : "auto"} /><div><strong>{brand.label}</strong><span>{isAr ? brand.kindAr : brand.kindEn}<ArrowUpRight size={15} /></span></div></button>)}
          <span className={styles.artCaption}>LEVEL UP YOUR EVERYDAY</span>
        </div>
      </section>

      {availableBrands.length > 0 && <section className={styles.destinations} aria-labelledby="destinations-title">
        <div className={styles.sectionHeading}><div><span className={styles.eyebrow}>{isAr ? "اختار عالمك" : "PICK YOUR WORLD"}</span><h2 id="destinations-title">{isAr ? "وجهتك، بضغطة واحدة" : "Your destination, one click away"}</h2></div><span className={styles.muted}>{isAr ? "ألعاب وبطاقات وخدمات رقمية" : "Games, cards and digital services"}</span></div>
        <div className={styles.brandRail}>{availableBrands.map(brand => <button key={brand.query} type="button" onClick={() => selectBrand(brand.query)} aria-pressed={searchQuery.toLowerCase() === brand.query} className={styles.brand + " bg-surface-container"}>{brand.image ? <img src={"/images/zoalna/" + brand.image} alt="" width={72} height={72} loading="lazy" /> : <span className={styles.brandFallback + " text-blue-600 dark:text-blue-400"}>{brand.query === "netflix" || brand.query === "bein" ? <Clapperboard size={28} /> : brand.query === "google play" ? <Store size={28} /> : <Gamepad2 size={28} />}</span>}<strong>{brand.label}</strong><small>{brand.count} {isAr ? "باقة" : "packages"}</small></button>)}</div>
      </section>}

      <section id="gaming-catalog" className={styles.catalog} aria-labelledby="catalog-title">
        <div className={styles.sectionHeading}><div><span className={styles.eyebrow}>{isAr ? "كتالوج الخدمات" : "THE CATALOG"}</span><h2 id="catalog-title">{isAr ? "اكتشف الباقة المناسبة لك" : "Find the right package for you"}</h2></div>{discountPercent > 0 && <span className={styles.vip + " text-blue-600 dark:text-blue-400"}>VIP · {discountPercent}% {isAr ? "خصم" : "discount"}</span>}</div>
        <div className={styles.catalogShell}>
          <aside className={styles.sidebar + " bg-surface-container"}>
            <h3><SlidersHorizontal size={17} />{isAr ? "تصفح الأقسام" : "Browse categories"}</h3>
            <nav className={styles.categories} aria-label={isAr ? "أقسام الخدمات الرقمية" : "Digital service categories"}>{CATEGORIES_DEF.map(cat => { const Icon = CATEGORY_ICONS[cat.id] || Grid2X2; const active = selectedCategory === cat.id; return <button key={cat.id} type="button" aria-pressed={active} onClick={() => selectCategory(cat.id)} className={styles.category + " " + (active ? styles.categoryActive + " bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-300")}><Icon size={18} /><span>{isAr ? cat.labelAr : cat.labelEn}</span><small>{categoryCounts[cat.id] || 0}</small></button>; })}</nav>
            <div className={styles.sideNote}><ShieldCheck size={22} className="text-blue-600 dark:text-blue-400" /><strong>{isAr ? "اختار الباقة بدقة" : "Find your perfect match"}</strong><p>{isAr ? "راجع قيمة الباقة والمنطقة ووقت التنفيذ في تفاصيل الخدمة قبل الطلب." : "Check the package value, region and delivery time before ordering."}</p><Link href={"/" + lang + "/orders"}>{isAr ? "متابعة طلباتي" : "Track my orders"}<ArrowUpRight size={14} /></Link></div>
          </aside>
          <div className={styles.results}>
            <div className={styles.toolbar + " bg-surface-container"}>
              <label className={styles.search}><Search size={19} /><input type="search" aria-label={isAr ? "البحث في الألعاب والبطاقات" : "Search games and cards"} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={isAr ? "اسم اللعبة، البطاقة أو الباقة…" : "Game, card or package name…"} />{searchQuery && <button type="button" onClick={() => setSearchQuery("")} aria-label={isAr ? "مسح البحث" : "Clear search"}><X size={17} /></button>}</label>
              <label className={styles.sort}><span>{isAr ? "ترتيب" : "Sort"}</span><select aria-label={isAr ? "ترتيب الباقات" : "Sort packages"} value={sortOrder} onChange={e => setSortOrder(e.target.value)}><option value="name">{isAr ? "الاسم" : "Name"}</option><option value="price-low">{isAr ? "الأقل سعرًا" : "Lowest price"}</option><option value="price-high">{isAr ? "الأعلى سعرًا" : "Highest price"}</option></select></label>
            </div>
            <div className={styles.resultMeta} aria-live="polite"><span>{loading ? (isAr ? "جاري تجهيز الكتالوج…" : "Preparing the catalog…") : isAr ? resultCount + " باقة ضمن " + packageGroups.length + " مجموعة" : resultCount + " packages in " + packageGroups.length + " groups"}</span>{(searchQuery || selectedCategory !== "all") && <button type="button" onClick={resetFilters} className="text-blue-600 dark:text-blue-400"><X size={13} />{isAr ? "مسح التصفية" : "Clear filters"}</button>}</div>
            {loading ? <div className={styles.empty}><LoaderCircle size={32} className="animate-spin text-blue-600 dark:text-blue-400" /><strong>{isAr ? "جاري تحميل الألعاب والبطاقات…" : "Loading games and gift cards…"}</strong></div> : sortedGroups.length === 0 ? <div className={styles.empty + " bg-surface-container"}><Search size={34} /><h3>{isAr ? "ملقيناش باقات مطابقة" : "No matching packages"}</h3><p>{isAr ? "جرّب اسم لعبة مختلف، أو اعرض كل الأقسام." : "Try another game name or browse every category."}</p><button type="button" onClick={resetFilters} className={styles.primaryAction + " bg-blue-600 text-white"}>{isAr ? "عرض كل الباقات" : "View every package"}</button></div> : <div className={styles.productGrid}>{sortedGroups.map((group, index) => {
              const brand = BRAND_LIBRARY.find(item => [group.groupName, ...group.services.map(service => service.name)].join(" ").toLowerCase().includes(item.query));
              const badge = getCategoryBadgeInfo(group.categoryType); const Icon = CATEGORY_ICONS[group.categoryType] || Gamepad2;
              const expanded = Boolean(expandedGroups[group.groupName]); const detailsId = "package-group-" + index;
              return <article key={group.groupName} className={styles.product + " bg-surface-container shadow-sm"}>
                <div className={styles.productArt}><div className={styles.productArtCopy}><span className={styles.productType + " text-blue-600 dark:text-blue-400"}><Icon size={15} />{badge.label}</span><strong>{brand?.label || (isAr ? "خدمات رقمية" : "Digital services")}</strong><span className={styles.artLabel}>{brand ? (isAr ? brand.kindAr : brand.kindEn) : group.categoryName}</span></div>{brand?.image ? <img src={"/images/zoalna/" + brand.image} alt="" width={120} height={120} loading="lazy" /> : <Icon className={styles.genericArt + " text-blue-600 dark:text-blue-400"} size={90} strokeWidth={1} />}</div>
                <div className={styles.productBody}><h3 title={cleanHtmlToText(group.groupName)}>{cleanHtmlToText(group.groupName)}</h3><p className={styles.packageCount}><Layers3 size={14} />{group.services.length} {isAr ? "باقة متاحة" : "available packages"}</p><div className={styles.productFooter}><div><span>{isAr ? "يبدأ من" : "Starting at"}</span><strong className="text-blue-600 dark:text-blue-400">{formatPrice(group.minPrice)}</strong></div><button type="button" aria-expanded={expanded} aria-controls={detailsId} onClick={() => toggleGroup(group.groupName)} className={styles.packageButton + " bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"}>{expanded ? (isAr ? "إخفاء الباقات" : "Hide packages") : isAr ? "عرض الباقات" : "View packages"}<ChevronDown size={16} className={expanded ? styles.chevronOpen : ""} /></button></div></div>
                {expanded && <div id={detailsId} className={styles.packageList}>{group.services.map(service => { const price = Number(service.finalPrice ?? service.price ?? service.credit ?? 0); return <div key={service.id} className={styles.packageRow}><div><h4>{cleanHtmlToText(service.name)}</h4><span className={styles.delivery}><Clock3 size={12} />{service.time || (isAr ? "حسب تفاصيل الخدمة" : "See service details")}{service.supportsQty && <small>{isAr ? "يدعم الكميات" : "Quantity enabled"}</small>}</span></div><div className={styles.packagePrice}><strong className="text-blue-600 dark:text-blue-400">{formatPrice(price)}</strong><Link aria-label={(isAr ? "طلب " : "Order ") + cleanHtmlToText(service.name)} href={"/" + lang + "/purchase?serviceId=" + encodeURIComponent(service.id)} className="bg-blue-600 hover:bg-blue-700 text-white">{isAr ? "اختيار" : "Select"}<ArrowUpRight size={13} /></Link></div></div>; })}</div>}
              </article>;
            })}</div>}
          </div>
        </div>
      </section>
      <div className={styles.bottomStrip}><div><Headphones size={21} /><span>{isAr ? "الألعاب والبطاقات هنا. خدمات السيرفر في قسمها الخاص." : "Games and gift cards here. GSM services have their own catalog."}</span></div><Link href={"/" + lang + "/pricing"}>{isAr ? "تصفح خدمات السيرفر" : "Browse GSM services"}<ArrowUpRight size={16} /></Link></div>
    </div>
  );
}
