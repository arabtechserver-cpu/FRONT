"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Gamepad2,
  Check,
  ShieldCheck,
  Zap,
  Clock,
  ShoppingBag,
  CreditCard,
  Star,
  Users,
  ChevronRight,
  Home,
  Plus,
  Minus,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  Flame,
  Wallet
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { cleanHtmlToText } from "@/utils/cleanHtml";

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

// Customer testimonials exactly inspired by Zoalna
const CUSTOMER_REVIEWS = [
  { name: "أواب عماد", date: "منذ ساعتين", rating: 5, comment: "كفو والله.. أفضل وأسرع شحن ألعاب، شحنت في أقل من دقيقة واستلمت الجواهر فوراً." },
  { name: "علاء الدين عبد الحميد", date: "منذ 4 ساعات", rating: 5, comment: "أفضل متجر لشحن الألعاب في الشرق الأوسط والسودان، أمان وسرعة ودقة متناهية." },
  { name: "محمد الطيب", date: "أمس", rating: 5, comment: "أقسم بالله أفضل موقع شحن بتعامل معاه، سرعة رهيبة وضمان عالي جداً." },
  { name: "أحمد عبد الله", date: "منذ يومين", rating: 5, comment: "الموقع آمن وموثوق ومريح جداً، كل الشكر والتقدير للقائمين عليه." },
  { name: "خالد إبراهيم", date: "منذ 3 أيام", rating: 5, comment: "تسليم آلي وفوري حقيقي.. أدخلت الآيدي وجاتني رسالة الشحن في الحساب فوراً." },
  { name: "يوسف الصادق", date: "منذ 4 أيام", rating: 5, comment: "سرعة وضمان وأمان ممتاز.. أرخص أسعار مقارنة بباقي المتاجر." },
];

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPackageId = searchParams.get("package") || searchParams.get("serviceId");

  const { addToCart, setIsCartOpen, isLoggedIn } = useCart();

  const [rawServices, setRawServices] = useState<any[]>(initialServices);
  const [loading, setLoading] = useState<boolean>(initialServices.length === 0);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialPackageId || "");
  const [targetInput, setTargetInput] = useState<string>("");
  const [zoneId, setZoneId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [currencyCode, setCurrencyCode] = useState<string>("USD");
  const [userSession, setUserSession] = useState<any>(null);
  const [inputError, setInputError] = useState<string>("");
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isBuying, setIsBuying] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Resolved Game Config
  const matchedKey = Object.keys(GAME_DATABASE).find(
    (k) => k === slug || slug.toLowerCase().includes(k)
  ) || "free-fire";
  const gameConfig = GAME_DATABASE[matchedKey] || GAME_DATABASE["free-fire"];

  // Currency & Session
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
        if (fullName.includes(query)) {
          list.push({
            ...srv,
            categoryName: cat.name,
          });
        }
      });
    });

    // Sort by price ascending
    return list.sort((a, b) => {
      const pa = Number(a.finalPrice ?? a.price ?? a.credit ?? 0);
      const pb = Number(b.finalPrice ?? b.price ?? b.credit ?? 0);
      return pa - pb;
    });
  }, [rawServices, gameConfig.query]);

  // Select default package if none chosen
  useEffect(() => {
    if (gamePackages.length > 0 && !selectedServiceId) {
      if (initialPackageId && gamePackages.some((p) => p.id === initialPackageId)) {
        setSelectedServiceId(initialPackageId);
      } else {
        setSelectedServiceId(gamePackages[0].id);
      }
    }
  }, [gamePackages, selectedServiceId, initialPackageId]);

  const selectedService = useMemo(() => {
    return gamePackages.find((p) => p.id === selectedServiceId) || gamePackages[0];
  }, [gamePackages, selectedServiceId]);

  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;

  const unitPriceUsd = useMemo(() => {
    if (!selectedService) return 0;
    return Number(selectedService.finalPrice ?? selectedService.price ?? selectedService.credit ?? 0);
  }, [selectedService]);

  const formatPrice = (usd: number = 0) => {
    const converted = usd * currency.rate;
    const formatted = converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return isAr ? `${formatted} ${currency.symbolAr}` : `${currency.symbolEn} ${formatted}`;
  };

  const validateInput = (): boolean => {
    if (!targetInput.trim()) {
      setInputError(
        isAr
          ? `يرجى إدخال ${gameConfig.idLabelAr} بدقة للمتابعة`
          : `Please enter your ${gameConfig.idLabelEn} to proceed`
      );
      return false;
    }
    if (gameConfig.hasZoneId && !zoneId.trim()) {
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

    const customFieldsObj: Record<string, string> = {};
    if (gameConfig.hasZoneId && zoneId.trim()) {
      customFieldsObj["Zone ID"] = zoneId.trim();
    }

    try {
      const ok = await addToCart({
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        groupName: selectedService.groupName,
        targetInput: targetInput.trim(),
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
      }
    } catch {
      setInputError(isAr ? "فشل إضافة الباقة للسلة" : "Failed to add package to cart");
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!validateInput()) return;
    if (!selectedService) return;

    setIsBuying(true);

    const customFieldsObj: Record<string, string> = {};
    if (gameConfig.hasZoneId && zoneId.trim()) {
      customFieldsObj["Zone ID"] = zoneId.trim();
    }

    // Add to cart and immediately open checkout / cart
    await addToCart({
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      groupName: selectedService.groupName,
      targetInput: targetInput.trim(),
      customFields: Object.keys(customFieldsObj).length > 0 ? customFieldsObj : undefined,
      quantity,
      price: unitPriceUsd,
    });

    setIsBuying(false);
    // Navigate directly to cart page for instant order review & checkout
    router.push(`/${lang}/cart`);
  };

  const BackIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <div className="w-full max-w-6xl mx-auto py-3 sm:py-6 space-y-8" dir={isAr ? "rtl" : "ltr"}>
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link href={`/${lang}`} className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1">
          <Home size={14} />
          <span>{isAr ? "الرئيسية" : "Home"}</span>
        </Link>
        <ChevronRight size={14} className={isAr ? "rotate-180" : ""} />
        <Link href={`/${lang}/services`} className="hover:text-blue-600 dark:hover:text-blue-400">
          {isAr ? "شحن الألعاب والبطاقات" : "Gaming & Top-Ups"}
        </Link>
        <ChevronRight size={14} className={isAr ? "rotate-180" : ""} />
        <span className="font-semibold text-slate-900 dark:text-white line-clamp-1">
          {isAr ? gameConfig.titleAr : gameConfig.titleEn}
        </span>
      </nav>

      {/* MAIN PRODUCT SHOWCASE CONTAINER (Zoalna Style) */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Game Visual Side (Desktop: 5 cols, Mobile: Top) */}
          <div className="lg:col-span-5 p-6 sm:p-8 bg-slate-50 dark:bg-slate-800/40 border-b lg:border-b-0 lg:border-e border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="relative aspect-square max-w-[340px] mx-auto rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 bg-slate-900">
                <img
                  src={`/images/zoalna/${gameConfig.image}`}
                  alt={isAr ? gameConfig.titleAr : gameConfig.titleEn}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/images/zoalna/service_default_brand.webp";
                  }}
                />
                <div className="absolute top-3 start-3 px-3 py-1 rounded-full bg-blue-600/90 text-white font-bold text-xs backdrop-blur-md flex items-center gap-1.5 shadow-md z-10">
                  <Zap size={14} className="animate-pulse" />
                  <span>{isAr ? "شحن فوري آلي 24/7" : "Instant 24/7 Delivery"}</span>
                </div>

                {/* Branded website & service identifier overlay for all services */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent p-3.5 pt-8 text-white flex flex-col justify-end z-10">
                  <div className="flex items-center justify-between text-[11px] font-bold text-blue-400 uppercase tracking-wider mb-0.5">
                    <span>{isAr ? "برعي ستور | BORAI STORE" : "BORAI STORE"}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300">
                      {isAr ? "شحن رسمي" : "Official Top-Up"}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-white line-clamp-1">
                    {isAr ? gameConfig.titleAr : gameConfig.titleEn}
                  </div>
                </div>
              </div>

              {/* Trust highlights */}
              <div className="space-y-2.5 pt-2">
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3 shadow-sm">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      {isAr ? "ضمان رسمي وأمان 100%" : "100% Safe & Official"}
                    </strong>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isAr ? "شحن نظامي معتمد مباشرة من سيرفر اللعبة" : "Official top-up directly from game servers"}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3 shadow-sm">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      {isAr ? "تسليم آلي دون انتظار" : "Zero Wait Time"}
                    </strong>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isAr ? "تصلك الشحنة في حسابك خلال ثوانٍ معدودة" : "Credits arrive in your account within seconds"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300 flex items-center gap-2">
              <Sparkles size={16} className="text-blue-600 shrink-0" />
              <span>
                {isAr
                  ? "متجر برعي يضمن لك الحماية الكاملة لبياناتك وسرعة التنفيذ الفوري."
                  : "BORAI STORE guarantees full security and instant execution."}
              </span>
            </div>
          </div>

          {/* Interactive Purchase Form (Desktop: 7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[11px]">
                  {isAr ? "الشحن بالـ ID" : "Direct ID Top-Up"}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[11px] flex items-center gap-1">
                  <Flame size={12} />
                  <span>{isAr ? "الأكثر طلباً" : "Popular"}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {isAr ? gameConfig.titleAr : gameConfig.titleEn}
              </h1>

              {/* Price display banner */}
              <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">
                    {isAr ? "السعر للباقة المختارة:" : "Price for selected package:"}
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 font-mono">
                    {formatPrice(unitPriceUsd * quantity)}
                  </div>
                </div>

                <div className="text-end">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    {isAr ? "العملة المعروضة:" : "Active currency:"}
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                    {currency.code} ({isAr ? currency.symbolAr : currency.symbolEn})
                  </span>
                </div>
              </div>
            </div>

            {/* Error / Alert feedback */}
            {inputError && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{inputError}</span>
              </div>
            )}

            {actionSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 text-xs font-semibold flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                  <span>{actionSuccess}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(true)}
                  className="underline text-xs font-bold text-emerald-800 dark:text-emerald-200"
                >
                  {isAr ? "فتح السلة" : "Open Cart"}
                </button>
              </div>
            )}

            {/* STEP 1: Enter Player ID */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">
                  1
                </span>
                <span>{isAr ? gameConfig.idLabelAr : gameConfig.idLabelEn}</span>
                <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <input
                  type="text"
                  dir="ltr"
                  value={targetInput}
                  onChange={(e) => {
                    setTargetInput(e.target.value);
                    if (inputError) setInputError("");
                  }}
                  placeholder={isAr ? gameConfig.idPlaceholderAr : gameConfig.idPlaceholderEn}
                  className="w-full px-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-sm focus:border-blue-600 focus:outline-none transition-colors shadow-sm"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isAr
                  ? "تأكد من كتابة الآيدي بدقة لضمان وصول الشحن إلى حسابك الصحيح دون أي تأخير."
                  : "Make sure to enter your Player ID correctly for immediate top-up delivery."}
              </p>
            </div>

            {/* Optional Zone ID for MLBB */}
            {gameConfig.hasZoneId && (
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">
                    *
                  </span>
                  <span>{isAr ? gameConfig.zoneLabelAr : gameConfig.zoneLabelEn}</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                  placeholder="Zone ID (e.g. 2024)..."
                  className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-sm focus:border-blue-600 focus:outline-none transition-colors shadow-sm"
                />
              </div>
            )}

            {/* STEP 2: Choose Package / Offer Swatches */}
            <div className="space-y-3">
              <label className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">
                  2
                </span>
                <span>{isAr ? "اختر أحد العروض والباقات:" : "Select a Package Offer:"}</span>
              </label>

              {loading ? (
                <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <LoaderCircle size={18} className="animate-spin text-blue-600" />
                  <span>{isAr ? "جاري تحميل الباقات المتاحة..." : "Loading available packages..."}</span>
                </div>
              ) : gamePackages.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 text-center">
                  {isAr ? "لا توجد باقات متاحة حالياً لهذه اللعبة" : "No packages currently available"}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto p-1">
                  {gamePackages.map((pkg) => {
                    const isSelected = pkg.id === selectedServiceId;
                    const pkgPrice = Number(pkg.finalPrice ?? pkg.price ?? pkg.credit ?? 0);

                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedServiceId(pkg.id)}
                        className={`relative p-3 rounded-2xl text-start border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[75px] ${
                          isSelected
                            ? "bg-blue-50/80 dark:bg-blue-950/50 border-blue-600 dark:border-blue-500 shadow-md scale-[1.02]"
                            : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 end-2 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
                            <Check size={11} strokeWidth={3} />
                          </div>
                        )}

                        <span className="font-bold text-slate-900 dark:text-white text-xs line-clamp-2 pe-4">
                          {cleanHtmlToText(pkg.name)}
                        </span>

                        <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400 mt-2 block">
                          {formatPrice(pkgPrice)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* STEP 3: Quantity & Action Buttons */}
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {isAr ? "الكمية المطلوبة:" : "Quantity:"}
                </span>

                <div className="inline-flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="w-10 text-center text-sm font-bold font-mono text-slate-900 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>

              {/* Two Prominent Action Buttons (Zoalna Style) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAdding || isBuying}
                  className="w-full py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-sm border-2 border-slate-300 dark:border-slate-700 transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-sm disabled:opacity-50"
                >
                  {isAdding ? (
                    <LoaderCircle size={18} className="animate-spin text-blue-600" />
                  ) : (
                    <ShoppingBag size={18} className="text-blue-600 dark:text-blue-400" />
                  )}
                  <span>{isAr ? "إضافة إلى السلة" : "Add to Cart"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={isAdding || isBuying}
                  className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isBuying ? (
                    <LoaderCircle size={18} className="animate-spin text-white" />
                  ) : (
                    <Zap size={18} />
                  )}
                  <span>{isAr ? "شراء الآن واستلام فوري" : "Buy Now (Instant)"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW TO TOP UP SECTION (4 Steps - exactly like Zoalna) */}
      <section className="bg-slate-50 dark:bg-slate-900/60 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wide uppercase">
            {isAr ? "خطوات بسيطة وسريعة" : "Simple 4-Step Process"}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {isAr
              ? `كيفية ${gameConfig.titleAr} عبر متجر برعي؟`
              : `How to Top-Up on BORAI STORE?`}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isAr
              ? "الشحن سهل وبسيط في 4 خطوات فورية دون تعقيد:"
              : "Top up your account easily in 4 simple steps:"}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center">
              1
            </div>
            <strong className="text-sm font-bold text-slate-900 dark:text-white block">
              {isAr ? "اشحن محفظتك أو ادفع" : "Fund Wallet / Pay"}
            </strong>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isAr
                ? "أضف رصيد لمحفظتك بسهولة عبر بنكك، كاشي، انستاباي، فودافون كاش، باي بال، أو البطاقات."
                : "Top up your balance using Bankak, Cashi, Instapay, Vodafone Cash, PayPal, or cards."}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center">
              2
            </div>
            <strong className="text-sm font-bold text-slate-900 dark:text-white block">
              {isAr ? "اكتب معرّف الحساب" : "Enter Player ID"}
            </strong>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isAr
                ? "أدخل ID حسابك في اللعبة بدقة لضمان وصول الشحن بشكل فوري لحسابك الصحيح."
                : "Enter your Player ID accurately to ensure direct delivery to your account."}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center">
              3
            </div>
            <strong className="text-sm font-bold text-slate-900 dark:text-white block">
              {isAr ? "اختر العرض وأضفه للسلة" : "Select Offer & Add"}
            </strong>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isAr
                ? "اختر الكمية المناسبة من الباقات وأضف المنتج لسلة المشتريات أو اضغط شراء الآن."
                : "Choose the package you want and add to cart or hit Buy Now."}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center">
              4
            </div>
            <strong className="text-sm font-bold text-slate-900 dark:text-white block">
              {isAr ? "استلم شحنتك فوراً" : "Instant Delivery"}
            </strong>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isAr
                ? "بعد تأكيد الطلب، يتم إرسال الجواهر والشدات مباشرة إلى حسابك في ثوانٍ معدودة!"
                : "After confirmation, diamonds or UC arrive instantly in your account!"}
            </p>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US (Zoalna Style) */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="text-blue-600" size={22} />
          <span>{isAr ? "لماذا تختار متجر برعي؟" : "Why Choose BORAI STORE?"}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
            <strong className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap size={16} className="text-amber-500 shrink-0" />
              <span>{isAr ? "شحن فوري وتلقائي" : "Instant Automated Top-Up"}</span>
            </strong>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAr ? "وصول الشحنة لحسابك خلال ثوانٍ معدودة دون انتظار." : "Credits reach your account in seconds."}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
            <strong className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard size={16} className="text-blue-500 shrink-0" />
              <span>{isAr ? "طرق دفع متعددة وسهلة" : "Easy Payment Options"}</span>
            </strong>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAr ? "ندعم بنكك، كاشي، انستاباي، فودافون كاش، باي بال، وبطاقات الدفع." : "Support for Bankak, Cashi, Instapay, PayPal and cards."}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
            <strong className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
              <span>{isAr ? "أمان وضمان 100%" : "100% Secure & Guaranteed"}</span>
            </strong>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAr ? "جميع معاملات الشحن رسمية ومحمية بالكامل." : "All transactions are fully encrypted and safe."}
            </p>
          </div>
        </div>
      </section>

      {/* CUSTOMER REVIEWS (Zoalna Style) */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="text-blue-600" size={22} />
              <span>{isAr ? "آراء وتقييمات العملاء" : "Customer Reviews & Ratings"}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isAr ? "تقييمات حقيقية من لاعبين يشحنون حساباتهم يومياً" : "Verified ratings from gamers top-ups everyday"}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono">4.9</span>
            <div className="flex items-center gap-0.5 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="currentColor" />
              ))}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              (1,480+ {isAr ? "تقييم" : "reviews"})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {CUSTOMER_REVIEWS.map((rev, index) => (
            <div
              key={index}
              className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 space-y-2.5 transition-all hover:border-slate-300 dark:hover:border-slate-600"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center">
                    {rev.name.charAt(0)}
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                      {rev.name}
                    </strong>
                    <span className="text-[10px] text-slate-400 block">{rev.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={12} fill="currentColor" />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                "{rev.comment}"
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* RELATED GAMES & PRODUCTS */}
      <section className="bg-slate-50 dark:bg-slate-900/60 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Gamepad2 className="text-blue-600" size={20} />
            <span>{isAr ? "ألعاب وخدمات ذات صلة" : "Related Games & Top-Ups"}</span>
          </h2>
          <Link
            href={`/${lang}/services`}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>{isAr ? "عرض كل الألعاب" : "View all games"}</span>
            <BackIcon size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {Object.entries(GAME_DATABASE)
            .filter(([k]) => k !== slug && k !== "free-fire-id" && k !== "pubg-id")
            .slice(0, 6)
            .map(([k, item]) => (
              <Link
                key={k}
                href={`/${lang}/product/${item.slug}`}
                className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all text-center group flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-sm bg-slate-100 dark:bg-slate-700">
                  <img
                    src={`/images/zoalna/${item.image}`}
                    alt={isAr ? item.titleAr : item.titleEn}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <strong className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                  {item.query.toUpperCase()}
                </strong>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-0.5">
                  {isAr ? "شحن الآن" : "Top Up"}
                  <ArrowUpRight size={11} />
                </span>
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
