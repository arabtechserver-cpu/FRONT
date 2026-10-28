"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShoppingBag, Wallet, LoaderCircle, AlertCircle, CheckCircle2, ChevronDown, Gamepad2 } from "lucide-react";
import { getServicePrice } from "@/lib/service-price";
import styles from "./product.module.css";
import { useCart } from "@/context/CartContext";
import { cleanHtmlToText } from "@/utils/cleanHtml";
import { getPurchaseFieldDefinitions, getPurchaseTargetValue } from "@/lib/purchase-service-fields";

interface ServiceItem {
  productSlug?: string | null;
  imageUrl?: string | null;
  groupImageUrl?: string | null;
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

// Brand configuration matching Zoalna library
const GAME_DATABASE: Record<string, {
  slug: string;
  titleAr: string;
  titleEn: string;
  image: string;
  idLabelAr: string;
  idLabelEn: string;
  idPlaceholderAr: string;
  idPlaceholderEn: string;
  query: string;
  hasZoneId?: boolean;
  zoneLabelAr?: string;
  zoneLabelEn?: string;
}> = {
  "free-fire": {
    slug: "free-fire",
    titleAr: "شحن فري فاير عن طريق ال ID",
    titleEn: "Free Fire Diamonds Top-Up by ID",
    image: "game_freefire.webp",
    idLabelAr: "معرّف حساب فري فاير (Player ID)",
    idLabelEn: "Free Fire Player ID",
    idPlaceholderAr: "أدخل معرّف حسابك (Player ID) هنا بدقة...",
    idPlaceholderEn: "Enter your Free Fire Player ID accurately...",
    query: "free fire",
  },
  "free-fire-id": {
    slug: "free-fire-id",
    titleAr: "شحن فري فاير عن طريق ال ID",
    titleEn: "Free Fire Diamonds Top-Up by ID",
    image: "game_freefire.webp",
    idLabelAr: "معرّف حساب فري فاير (Player ID)",
    idLabelEn: "Free Fire Player ID",
    idPlaceholderAr: "أدخل معرّف حسابك (Player ID) هنا بدقة...",
    idPlaceholderEn: "Enter your Free Fire Player ID accurately...",
    query: "free fire",
  },
  "pubg": {
    slug: "pubg",
    titleAr: "شحن شدات ببجي موبايل بالآيدي (PUBG Mobile UC)",
    titleEn: "PUBG Mobile UC Top-Up by ID",
    image: "game_pubg.webp",
    idLabelAr: "معرّف حساب ببجي (Player ID)",
    idLabelEn: "PUBG Player ID",
    idPlaceholderAr: "أدخل معرّف حسابك (Player ID) هنا...",
    idPlaceholderEn: "Enter your PUBG Player ID...",
    query: "pubg",
  },
  "pubg-id": {
    slug: "pubg-id",
    titleAr: "شحن شدات ببجي موبايل بالآيدي (PUBG Mobile UC)",
    titleEn: "PUBG Mobile UC Top-Up by ID",
    image: "game_pubg.webp",
    idLabelAr: "معرّف حساب ببجي (Player ID)",
    idLabelEn: "PUBG Player ID",
    idPlaceholderAr: "أدخل معرّف حسابك (Player ID) هنا...",
    idPlaceholderEn: "Enter your PUBG Player ID...",
    query: "pubg",
  },
  "mobile-legends": {
    slug: "mobile-legends",
    titleAr: "شحن جواهر موبايل ليجند (Mobile Legends)",
    titleEn: "Mobile Legends Diamonds Top-Up",
    image: "game_mobilelegends.webp",
    idLabelAr: "معرّف المستخدم (User ID)",
    idLabelEn: "Mobile Legends User ID",
    idPlaceholderAr: "أدخل User ID...",
    idPlaceholderEn: "Enter User ID...",
    hasZoneId: true,
    zoneLabelAr: "معرّف السيرفر (Zone ID)",
    zoneLabelEn: "Zone ID",
    query: "mobile legends",
  },
  "blood-strike": {
    slug: "blood-strike",
    titleAr: "شحن بلود استريك بالآيدي (Blood Strike Gold)",
    titleEn: "Blood Strike Gold Top-Up by ID",
    image: "game_bloodstrike.webp",
    idLabelAr: "معرّف حساب اللعبة (Player ID)",
    idLabelEn: "Player ID",
    idPlaceholderAr: "أدخل معرّف الحساب في اللعبة...",
    idPlaceholderEn: "Enter Player ID...",
    query: "blood strike",
  },
  "tiktok": {
    slug: "tiktok",
    titleAr: "شحن عملات تيك توك المباشر (TikTok Coins)",
    titleEn: "TikTok Coins Direct Top-Up",
    image: "game_tiktok.webp",
    idLabelAr: "اسم مستخدم تيك توك (@Username)",
    idLabelEn: "TikTok @Username",
    idPlaceholderAr: "اكتب اسم المستخدم بدون مسافات (مثال: @username)...",
    idPlaceholderEn: "Enter your TikTok username without spaces...",
    query: "tiktok",
  },
  "jawaker": {
    slug: "jawaker",
    titleAr: "شحن توكنز جواكر (Jawaker Tokens)",
    titleEn: "Jawaker Tokens Top-Up",
    image: "game_jawaker.webp",
    idLabelAr: "رقم حساب جواكر (Player ID)",
    idLabelEn: "Jawaker Player ID",
    idPlaceholderAr: "أدخل رقم الحساب في جواكر...",
    idPlaceholderEn: "Enter Jawaker ID...",
    query: "jawaker",
  },
  "yalla-ludo": {
    slug: "yalla-ludo",
    titleAr: "شحن يلا لودو المباشر (Yalla Ludo Diamonds)",
    titleEn: "Yalla Ludo Diamonds & Gold",
    image: "game_yallaludo.webp",
    idLabelAr: "معرّف حساب يلا لودو (User ID)",
    idLabelEn: "Yalla Ludo User ID",
    idPlaceholderAr: "أدخل معرّف الحساب في يلا لودو...",
    idPlaceholderEn: "Enter Yalla Ludo User ID...",
    query: "yalla ludo",
  },
  "roblox": {
    slug: "roblox",
    titleAr: "شحن روبلكس (Roblox Robux)",
    titleEn: "Roblox Robux Top-Up",
    image: "hero-test-1920x670.png",
    idLabelAr: "اسم مستخدم روبلوكس (Roblox Username)",
    idLabelEn: "Roblox Username",
    idPlaceholderAr: "أدخل اسم المستخدم في روبلوكس بدقة...",
    idPlaceholderEn: "Enter Roblox Username...",
    query: "roblox",
  },
};

export default function ProductClient({
  lang,
  slug,
  initialServices = [],
}: {
  lang: string;
  slug: string;
  initialServices?: any[];
}) {
  const isAr = lang === "ar";
  const searchParams = useSearchParams();
  const initialPackageId = searchParams.get("package") || searchParams.get("serviceId");

  const { addToCart, setIsCartOpen } = useCart();

  const [rawServices, setRawServices] = useState<any[]>(initialServices);
  const [loading, setLoading] = useState<boolean>(initialServices.length === 0);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialPackageId || "");
  const [targetInput, setTargetInput] = useState<string>("");
  const [zoneId, setZoneId] = useState<string>("");
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState<number>(1);
  const [currencyCode, setCurrencyCode] = useState<string>("USD");
  const [inputError, setInputError] = useState<string>("");
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [activePanel, setActivePanel] = useState<"description" | "reviews" | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Resolved Game Config
  const matchedKey = GAME_DATABASE[slug] ? slug : Object.keys(GAME_DATABASE).find(k => slug.toLowerCase().includes(k));
  const otherGames: Record<string, { image: string; queries: string[] }> = {
    "genshin-impact": { image: "game_genshin.webp", queries: ["genshin"] },
    "lords-mobile": { image: "game_lordsmobile.webp", queries: ["lords mobile"] },
    redotpay: { image: "game_redotpay.webp", queries: ["redotpay"] },
    "clash-of-clans": { image: "game_clashofclans.webp", queries: ["clash of clans"] },
    "clash-royale": { image: "game_clashroyale.webp", queries: ["clash royale"] },
    "fc-mobile": { image: "game_fifa.webp", queries: ["fc mobile", "fifa"] },
    efootball: { image: "game_pes.webp", queries: ["efootball", "pes mobile"] },
    "brawl-stars": { image: "game_brawlstars.webp", queries: ["brawl stars"] },
    starlink: { image: "game_starlink.webp", queries: ["starlink"] },
    "8-ball-pool": { image: "game_8ballpool.webp", queries: ["8 ball pool"] },
  };
  const otherGame = otherGames[slug];
  const gameConfig = matchedKey ? GAME_DATABASE[matchedKey] : {
    slug, titleAr: slug.replace(/-/g, " "), titleEn: slug.replace(/-/g, " "),
    image: otherGame?.image || "service_default_brand.webp", query: otherGame?.queries[0] || slug.replace(/-/g, " "),
    idLabelAr: "معرّف الحساب", idLabelEn: "Account ID",
    idPlaceholderAr: "أدخل معرّف حسابك", idPlaceholderEn: "Enter your account ID",
    hasZoneId: false, zoneLabelAr: "معرّف السيرفر", zoneLabelEn: "Zone ID",
  };

  // Currency & Session
  useEffect(() => {
    try {
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

  // Fetch Services if not passed
  useEffect(() => {
    if (rawServices.length > 0) return;
    async function load() {
      try {
        const res = await fetch("/api/dhru/services?view=pricing");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setRawServices(data);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [rawServices.length]);

  // Extract all matching package items for this game
  const gamePackages: ServiceItem[] = useMemo(() => {
    const list: ServiceItem[] = [];
    const query = gameConfig.query.toLowerCase();

    rawServices.forEach((cat: any) => {
      (cat.services || []).forEach((srv: any) => {
        const fullName = [srv.name, srv.groupName || "", cat.name || ""].join(" ").toLowerCase();
        const groupSlug = (srv.groupName || cat.name || "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
        const sourceAliases: Record<string, string> = { 'free-fire': 'free-fire-id', pubg: 'pubg-id', 'yalla-ludo': 'yalla-ludo-id', tiktok: 'tik-tok-offers', 'fc-mobile': '2023fifa-mobile', starlink: 'starlink-sub' };
        const isMatch = srv.productSlug ? srv.productSlug === (sourceAliases[slug] || slug) : otherGame ? otherGame.queries.some(term => fullName.includes(term)) : matchedKey ? fullName.includes(query) : groupSlug === slug || fullName.includes(query);
        const isCodeProduct = /redeem|\bpin\b|giving code|not by player|for reseller/i.test(fullName);
        if (srv.isActive !== false && isMatch && !(slug.endsWith("-id") && isCodeProduct)) {
          list.push({
            ...srv,
            categoryName: cat.name,
          });
        }
      });
    });

    // Sort by price ascending
    return list.sort((a, b) => {
      const pa = getServicePrice(a);
      const pb = getServicePrice(b);
      return pa - pb;
    });
  }, [rawServices, gameConfig.query, matchedKey, slug]);

  const selectedService = useMemo(() => gamePackages.find(p => p.id === selectedServiceId), [gamePackages, selectedServiceId]);
  const customFieldEntries = useMemo(() => getPurchaseFieldDefinitions(selectedService).map(field => [field.field_id, field]) as [string, any][], [selectedService]);
  const needsDefaultTarget = customFieldEntries.length === 0 && !selectedService?.productSlug;
  const productTitle = isAr ? gameConfig.titleAr : gameConfig.titleEn;
  const displayTitle = !matchedKey && gamePackages.length ? cleanHtmlToText(gamePackages[0].groupName || productTitle) : productTitle;

  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;

  const unitPriceUsd = useMemo(() => {
    if (!selectedService) return 0;
    return getServicePrice(selectedService);
  }, [selectedService]);

  const formatPrice = (usd: number = 0) => {
    if (usd <= 0) return isAr ? "بانتظار التسعير" : "Price pending";
    const converted = usd * currency.rate;
    const formatted = converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return isAr ? `${formatted} ${currency.symbolAr}` : `${currency.symbolEn} ${formatted}`;
  };

  const validateInput = (): boolean => {
    if (!selectedService) {
      setInputError(isAr ? "اختر أحد العروض أولاً" : "Choose a package first");
      return false;
    }
    if (unitPriceUsd <= 0) {
      setInputError(isAr ? "هذه الباقة بانتظار التسعير. تواصل مع الإدارة قبل الطلب." : "This package is awaiting pricing. Please contact support.");
      return false;
    }
    for (const [key, field] of customFieldEntries) {
      if ([true, 1, '1', 'true'].includes(field.required) && !customFieldValues[key]?.trim()) {
        setInputError((isAr ? "يرجى إدخال " : "Please enter ") + (field.label || key));
        return false;
      }
    }
    if (needsDefaultTarget && !targetInput.trim()) {
      setInputError(
        isAr
          ? `يرجى إدخال ${gameConfig.idLabelAr} بدقة للمتابعة`
          : `Please enter your ${gameConfig.idLabelEn} to proceed`
      );
      return false;
    }
    if (needsDefaultTarget && gameConfig.hasZoneId && !zoneId.trim()) {
      setInputError(
        isAr
          ? `يرجى إدخال ${gameConfig.zoneLabelAr} الخاص بحسابك`
          : `Please enter your ${gameConfig.zoneLabelEn}`
      );
      return false;
    }
    setInputError("");
    return true;
  };

  const handleAddToCart = async () => {
    if (!validateInput()) return;
    if (!selectedService) return;

    setIsAdding(true);
    setActionSuccess(null);

    const customFieldsObj: Record<string, string> = Object.fromEntries(customFieldEntries.map(([key]) => [key, (customFieldValues[key] || '').trim()]));
    if (needsDefaultTarget && gameConfig.hasZoneId && zoneId.trim()) {
      customFieldsObj["Zone ID"] = zoneId.trim();
    }

    try {
      const ok = await addToCart({
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        groupName: selectedService.groupName,
        targetInput: needsDefaultTarget ? targetInput.trim() : getPurchaseTargetValue(getPurchaseFieldDefinitions(selectedService), customFieldsObj),
        customFields: Object.keys(customFieldsObj).length > 0 ? customFieldsObj : undefined,
        quantity,
        price: unitPriceUsd,
      });

      if (ok) {
        setActionSuccess(
          isAr
            ? "تمت إضافة الباقة إلى سلة المشتريات بنجاح!"
            : "Package added to shopping cart successfully!"
        );
        setTimeout(() => setActionSuccess(null), 3500);
      } else {
        setInputError(isAr ? "تعذرت إضافة الباقة. حاول مرة أخرى." : "Could not add the package. Please try again.");
      }
    } catch {
      setInputError(isAr ? "فشل إضافة الباقة للسلة" : "Failed to add package to cart");
    } finally {
      setIsAdding(false);
    }
  };

  const pricedPackages = gamePackages.map(pkg => getServicePrice(pkg)).filter(price => price > 0);
  const lowestPrice = pricedPackages.length ? Math.min(...pricedPackages) : 0;
  const highestPrice = pricedPackages.length ? Math.max(...pricedPackages) : 0;
  const packageName = (name: string) => {
    const clean = cleanHtmlToText(name);
    if (gameConfig.query === "free fire") {
      if (/weekly/i.test(clean)) return isAr ? "عضوية أسبوعية" : "Weekly membership";
      if (/monthly/i.test(clean)) return isAr ? "عضوية شهرية" : "Monthly membership";
      if (/level up/i.test(clean)) return isAr ? "حزمة ترقية المستوى" : "Level up pass";
      const amount = clean.match(/(\d+)\s*diamonds?/i)?.[1];
      const alternate = clean.match(/OR\s*(\d+)\s*diamonds?/i)?.[1];
      const bonus = clean.match(/\((\d+\s*\+\s*\d+)\s*Bonus\)/i)?.[1];
      if (amount) return `${amount}${alternate ? (isAr ? " أو " : " or ") + alternate : ""}${bonus ? ` (${bonus})` : ""} 💎`;
    }
    return clean.replace(/free fire|pubg mobile|mobile legends/ig, "").replace(/^\s*[-–:|]+\s*/, "").trim() || clean;
  };

  return (
    <div className={styles.page} dir={isAr ? "rtl" : "ltr"}>
      <article className={styles.product}>
        <div className={styles.gallery}>
          <img src={selectedService?.imageUrl || selectedService?.groupImageUrl || gamePackages.find(service => service.groupImageUrl)?.groupImageUrl || `/images/zoalna/${gameConfig.image}`} alt={displayTitle} width={320} height={320}
            onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = "/images/zoalna/service_default_brand.webp"; }} />
        </div>
        <div className={styles.summary}>
          <nav className={styles.breadcrumb} aria-label={isAr ? "مسار الصفحة" : "Breadcrumb"}>
            <Link href={`/${lang}`}>{isAr ? "الرئيسية" : "Home"}</Link><span>/</span>
            <Link href={`/${lang}/services?search=${encodeURIComponent(gameConfig.query)}`}>{gameConfig.query}</Link><span>/</span><span>{displayTitle}</span>
          </nav>
          <h1>{displayTitle}</h1>
          <Link className={styles.tag} href={`/${lang}/services?search=${encodeURIComponent(gameConfig.query)}`}><Gamepad2 size={12} />{gameConfig.query}</Link>
          <p className={styles.price} aria-live="polite"><bdi>{loading ? (isAr ? "جاري تحميل الأسعار…" : "Loading prices…") : gamePackages.length ? selectedService ? formatPrice(unitPriceUsd) : lowestPrice === highestPrice ? formatPrice(lowestPrice) : `${formatPrice(lowestPrice)} – ${formatPrice(highestPrice)}` : (isAr ? "غير متاح حالياً" : "Currently unavailable")}</bdi></p>
          <div className={styles.intro}>{isAr ? `🔥 خطوات طلب ${displayTitle} من متجر برعي: اشحن محفظتك، اختر العرض المناسب، وأدخل بيانات حسابك بدقة ثم أضف طلبك للسلة. ⚡` : `Choose your ${gameConfig.query} package, enter your account details and add it to your cart. You can top up your wallet before checkout.`}</div>
          <form onSubmit={e => { e.preventDefault(); handleAddToCart(); }} className={styles.form}>
            <fieldset className={styles.offers}>
              <legend>{isAr ? "اختر أحد العروض :" : "Choose a package:"}</legend>
              {loading ? <p className={styles.loading}><LoaderCircle size={16} className="animate-spin" />{isAr ? "جاري تحميل الباقات…" : "Loading packages…"}</p> : gamePackages.length === 0 ? <p className={styles.empty}>{isAr ? "لا توجد باقات متاحة لهذه الخدمة حالياً." : "No packages are currently available for this service."}</p> : <div className={styles.chips}>
                {gamePackages.map(pkg => <label key={pkg.id} className={`${styles.chip} ${selectedServiceId === pkg.id ? styles.selected : ""}`} title={`${cleanHtmlToText(pkg.name)} — ${formatPrice(getServicePrice(pkg))}`}>
                  <input type="radio" name="package" value={pkg.id} checked={selectedServiceId === pkg.id} onChange={() => { setSelectedServiceId(pkg.id); setInputError(""); setActionSuccess(null); }} />
                  <span dir="auto" title={cleanHtmlToText(pkg.name)}>{packageName(pkg.name)}</span>
                </label>)}
              </div>}
              {selectedService && <button type="button" className={styles.clear} onClick={() => setSelectedServiceId("")}>{isAr ? "إزالة" : "Clear"}</button>}
            </fieldset>
            <div className={styles.fields}>
              {customFieldEntries.map(([key, field]) => {
                const rawOptions = field.options || field.fieldoptions || [];
                const options = Array.isArray(rawOptions) ? rawOptions : String(rawOptions).split(/[\r\n|]+/).filter(Boolean);
                const type = field.fieldtype || field.type || 'text';
                const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { setCustomFieldValues(values => ({ ...values, [key]: e.target.value })); setInputError(''); setActionSuccess(null); };
                const props = { id: `product-custom-${key}`, value: customFieldValues[key] || '', onChange, required: [true, 1, '1', 'true'].includes(field.required) };
                return <React.Fragment key={key}><label htmlFor={props.id}>{field.label || key}{props.required ? ' *' : ''}</label>{type === 'select' ? <select {...props}><option value="">{isAr ? 'اختر من القائمة' : 'Choose an option'}</option>{options.map((option: any, index: number) => <option key={index} value={typeof option === 'object' ? option.value : option}>{typeof option === 'object' ? option.label || option.value : option}</option>)}</select> : type === 'textarea' ? <textarea {...props} rows={3} /> : <input {...props} type={['email', 'password', 'number', 'tel', 'url'].includes(type) ? type : 'text'} autoComplete="off" placeholder={field.placeholder || ''} />}</React.Fragment>;
              })}
              {needsDefaultTarget && <><label htmlFor="product-player-id">{isAr ? "الآيدي :" : "Account ID:"}</label>
              <input id="product-player-id" type="text" autoComplete="off" value={targetInput} aria-invalid={Boolean(inputError)} aria-describedby={inputError ? "product-error" : undefined} onChange={e => { setTargetInput(e.target.value); setInputError(""); setActionSuccess(null); }} placeholder={isAr ? gameConfig.idPlaceholderAr : gameConfig.idPlaceholderEn} />
              {gameConfig.hasZoneId && <><label htmlFor="product-zone-id">{isAr ? gameConfig.zoneLabelAr : gameConfig.zoneLabelEn}</label><input id="product-zone-id" type="text" value={zoneId} onChange={e => setZoneId(e.target.value)} /></>}</>}
              {selectedService?.info && <p className={styles.serviceInfo}>{cleanHtmlToText(selectedService.info)}</p>}
              {inputError && <p id="product-error" role="alert" className={styles.error}><AlertCircle size={16} />{inputError}</p>}
              {actionSuccess && <p role="status" className={styles.success}><CheckCircle2 size={16} />{actionSuccess}<button type="button" onClick={() => setIsCartOpen(true)}>{isAr ? "عرض السلة" : "View cart"}</button></p>}
              <div className={styles.cartRow}>
                <label className={styles.quantity}>{isAr ? "الكمية" : "Quantity"}<input type="number" aria-label={isAr ? "الكمية" : "Quantity"} min="1" max="999" value={quantity} onChange={e => setQuantity(Math.min(999, Math.max(1, Math.floor(Number(e.target.value) || 1))))} /></label>
                <button type="submit" className={styles.addButton} disabled={loading || gamePackages.length === 0 || isAdding || Boolean(selectedService && unitPriceUsd <= 0)}>{isAdding ? <LoaderCircle size={17} className="animate-spin" /> : <ShoppingBag size={17} />}{selectedService && unitPriceUsd <= 0 ? (isAr ? 'بانتظار التسعير' : 'Price pending') : (isAr ? "إضافة إلى السلة" : "Add to cart")}</button>
              </div>
              {selectedService && <p className={styles.total}>{isAr ? "الإجمالي:" : "Total:"} <strong>{formatPrice(unitPriceUsd * quantity)}</strong></p>}
            </div>
          </form>
        </div>
        <div className={styles.panels}>
          <button type="button" className={styles.panelButton} aria-expanded={activePanel === "description"} aria-controls="product-description" onClick={() => setActivePanel(activePanel === "description" ? null : "description")}><span>{isAr ? "الوصف" : "Description"}</span><ChevronDown size={17} /></button>
          <section id="product-description" hidden={activePanel !== "description"} className={styles.panelContent}>
            <h2>{displayTitle}</h2><p>{isAr ? "اطلب الباقة المناسبة لحسابك من متجر برعي باتباع الخطوات التالية:" : "Order the right package for your account in a few steps:"}</p>
            <ol><li>{isAr ? "اشحن محفظتك باستخدام طرق الدفع المتاحة." : "Top up your wallet using an available payment method."} <Link href={`/${lang}/wallet`}><Wallet size={14} />{isAr ? "محفظتي" : "My wallet"}</Link></li><li>{isAr ? "اختر العرض وأدخل بيانات الحساب بدقة." : "Choose a package and enter your account details accurately."}</li><li>{isAr ? "أضف الباقة للسلة وراجع بياناتك قبل تأكيد الطلب." : "Add the package to your cart and review your details before confirming."}</li><li>{isAr ? "تابع حالة التنفيذ ووقت التسليم من صفحة طلباتي." : "Track delivery and order progress from My orders."}</li></ol>
          </section>
          <button type="button" className={styles.panelButton} aria-expanded={activePanel === "reviews"} aria-controls="product-reviews" onClick={() => setActivePanel(activePanel === "reviews" ? null : "reviews")}><span>{isAr ? "التعليقات" : "Reviews"}</span><ChevronDown size={17} /></button>
          <section id="product-reviews" hidden={activePanel !== "reviews"} className={styles.panelContent}><h2>{isAr ? "آراء وتقييمات العملاء" : "Customer reviews"}</h2><p>{isAr ? "لا توجد تقييمات منشورة لهذه الخدمة حالياً." : "There are no published reviews for this service yet."}</p></section>
        </div>
      </article>
      <section className={styles.related}>
        <h2>{isAr ? "منتجات ذات صلة" : "Related products"}</h2>
        <div className={styles.relatedGrid}>{Object.entries(GAME_DATABASE).filter(([key]) => key !== matchedKey && GAME_DATABASE[key].query !== gameConfig.query && key !== "free-fire" && key !== "pubg").slice(0,6).map(([key,game]) => <Link key={key} href={`/${lang}/product/${game.slug}`}><img src={`/images/zoalna/${game.image}`} alt="" loading="lazy" width={150} height={150} /><span>{isAr ? game.titleAr : game.titleEn}</span></Link>)}</div>
      </section>
    </div>
  );
}
