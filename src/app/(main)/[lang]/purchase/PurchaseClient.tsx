"use client";
import { getServicePrice } from '@/lib/service-price';

import React, { useState, useEffect, useMemo, Suspense } from "react";
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
  Wallet,
  Mail,
  Lock,
  Key,
  Hash,
  Smartphone,
  Server,
  Radio,
  Satellite,
  Layers3,
  Search,
  CheckCircle
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { cleanHtmlToText, stripEmojis } from "@/utils/cleanHtml";

function formatText(txt: string = ""): string {
  return stripEmojis(cleanHtmlToText(txt || ""));
}

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
  time?: string;
  info?: string | null;
  isActive?: boolean;
  requiresCustom?: any;
  supportsQty?: boolean;
  minQty?: number;
  maxQty?: number;
}

interface CustomFieldDef {
  id?: string;
  field_id?: string;
  name?: string;
  label?: string;
  type?: string;
  fieldtype?: string;
  required?: boolean;
  description?: string;
  placeholder?: string;
  options?: any[];
  fieldoptions?: any[];
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

function getServiceImage(groupName: string = "", serviceName: string = ""): string {
  const text = [groupName, serviceName].join(" ").toLowerCase();
  if (text.includes("8 ball") || text.includes("pool")) return "game_8ballpool.webp";
  if (text.includes("starlink")) return "game_starlink.webp";
  if (text.includes("free fire")) return "game_freefire.webp";
  if (text.includes("pubg")) return "game_pubg.webp";
  if (text.includes("blood strike")) return "game_bloodstrike.webp";
  if (text.includes("mobile legends")) return "game_mobilelegends.webp";
  if (text.includes("tiktok")) return "game_tiktok.webp";
  if (text.includes("redotpay")) return "game_redotpay.webp";
  if (text.includes("jawaker")) return "game_jawaker.webp";
  if (text.includes("yalla ludo")) return "game_yallaludo.webp";
  if (text.includes("efootball") || text.includes("pes")) return "game_pes.webp";
  if (text.includes("clash of clans")) return "game_clashofclans.webp";
  if (text.includes("clash royale")) return "game_clashroyale.webp";
  if (text.includes("brawl stars")) return "game_brawlstars.webp";
  if (text.includes("genshin")) return "game_genshin.webp";
  if (text.includes("fifa")) return "game_fifa.webp";
  if (text.includes("lords mobile")) return "game_lordsmobile.webp";
  if (text.includes("playstation")) return "card_playstation.webp";
  if (text.includes("steam")) return "card_steam.webp";
  if (text.includes("xbox")) return "card_xbox.webp";
  if (text.includes("itunes") || text.includes("apple")) return "card_itunes.webp";
  if (text.includes("razer")) return "card_razergold.webp";
  return "service_default_brand.webp";
}

function parseCustomFields(rawRequiresCustom: any): CustomFieldDef[] {
  if (!rawRequiresCustom) return [];
  try {
    const parsed = typeof rawRequiresCustom === "string" ? JSON.parse(rawRequiresCustom) : rawRequiresCustom;
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (f) => f && f.synthetic_quantity !== true && f.field_id !== "custom_QNT" && f.name !== "QNT"
      );
    }
  } catch {
    // Return empty on parse error
  }
  return [];
}

const CUSTOMER_REVIEWS = [
  { name: "علاء الدين عبد الحميد", date: "منذ ساعتين", rating: 5, comment: "شحن واشتراك فوري بدون أي تأخير، متجر ممتاز ومعتمد وسعره منافس جداً." },
  { name: "محمد الطيب", date: "منذ 4 ساعات", rating: 5, comment: "أفضل خدمة شحن وتفعيل في الشرق الأوسط والسودان، سرعة ودقة متناهية." },
  { name: "أحمد عبد الله", date: "أمس", rating: 5, comment: "الخدمة اشتغلت فوراً والحساب اتفعل في ثواني، شكراً على المصداقية العالية." },
  { name: "خالد إبراهيم", date: "منذ يومين", rating: 5, comment: "تسليم آلي حقيقي، أدخلت البيانات وتم التنفيذ في أقل من دقيقة." },
  { name: "يوسف الصادق", date: "منذ 3 أيام", rating: 5, comment: "دعم فني سريع ومحترم وأسعار ممتازة مقارنة بباقي المواقع." },
];

function PurchaseClientContent({
  lang,
  dict,
  initialService,
  initialServiceId,
}: {
  lang: string;
  dict?: any;
  initialService?: any;
  initialServiceId?: string;
}) {
  const isAr = lang === "ar";
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedServiceId = searchParams.get("serviceId") || initialServiceId || "";

  const { addToCart, setIsCartOpen, isLoggedIn } = useCart();

  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(!initialService);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(requestedServiceId);
  const [currentServiceDirect, setCurrentServiceDirect] = useState<any | null>(initialService || null);

  const [targetInput, setTargetInput] = useState<string>("");
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState<number>(1);
  const [currencyCode, setCurrencyCode] = useState<string>("USD");
  const [userSession, setUserSession] = useState<any>(null);

  const [inputError, setInputError] = useState<string>("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isBuying, setIsBuying] = useState<boolean>(false);
  const [isDirectOrdering, setIsDirectOrdering] = useState<boolean>(false);

  const [successOrderModal, setSuccessOrderModal] = useState<{
    orderId: string;
    serviceName: string;
    target: string;
    amount: number;
    newBalance: number;
  } | null>(null);

  // Sync currency & user session
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

    const handleSessionChange = () => {
      try {
        const savedUser = localStorage.getItem("user_session");
        if (savedUser) setUserSession(JSON.parse(savedUser));
      } catch {}
    };

    window.addEventListener("currency_change", handleCurChange);
    window.addEventListener("user_session_change", handleSessionChange);

    return () => {
      window.removeEventListener("currency_change", handleCurChange);
      window.removeEventListener("user_session_change", handleSessionChange);
    };
  }, []);

  // Fetch all services catalog
  useEffect(() => {
    let active = true;
    async function loadCatalog() {
      try {
        const res = await fetch("/api/dhru/services?view=pricing");
        if (res.ok) {
          const data = await res.json();
          if (active && Array.isArray(data)) {
            setAllCategories(data);
          }
        }
      } catch {
      } finally {
        if (active) setLoading(false);
      }
    }
    loadCatalog();
    return () => {
      active = false;
    };
  }, []);

  // Fetch requested service directly if not found immediately
  useEffect(() => {
    if (!requestedServiceId) return;
    let active = true;
    async function fetchDirect() {
      try {
        const res = await fetch(`/api/dhru/services/${encodeURIComponent(requestedServiceId)}`);
        if (res.ok) {
          const s = await res.json();
          if (active && s && s.id) {
            setCurrentServiceDirect(s);
            setSelectedServiceId(s.id);
          }
        }
      } catch {}
    }
    fetchDirect();
    return () => {
      active = false;
    };
  }, [requestedServiceId]);

  // Flatten all services for fast lookup
  const allServicesList = useMemo(() => {
    const list: ServiceItem[] = [];
    allCategories.forEach((cat: any) => {
      (cat.services || []).forEach((s: any) => {
        list.push({
          ...s,
          categoryName: cat.name,
        });
      });
    });
    return list;
  }, [allCategories]);

  // Resolve currently active service
  const selectedService: ServiceItem | null = useMemo(() => {
    if (selectedServiceId) {
      const found = allServicesList.find(
        (s) => s.id === selectedServiceId || s.dhruId === selectedServiceId
      );
      if (found) return found;
    }
    if (currentServiceDirect) {
      return {
        ...currentServiceDirect,
        categoryName: currentServiceDirect.dhruCategory?.name || currentServiceDirect.categoryName || "",
      };
    }
    return allServicesList[0] || null;
  }, [selectedServiceId, allServicesList, currentServiceDirect]);

  // Resolve active group packages (swatches)
  const activeGroupServices: ServiceItem[] = useMemo(() => {
    if (!selectedService) return [];
    const group = (selectedService.groupName || "").trim().toLowerCase();
    if (!group) return [selectedService];

    const siblings = allServicesList.filter((s) => {
      const g = (s.groupName || "").trim().toLowerCase();
      return g === group;
    });

    if (siblings.length === 0) return [selectedService];

    // Sort by price ascending
    return siblings.sort((a, b) => {
      const pa = getServicePrice(a);
      const pb = getServicePrice(b);
      return pa - pb;
    });
  }, [selectedService, allServicesList]);

  // Custom fields configuration
  const customFields: CustomFieldDef[] = useMemo(() => {
    if (!selectedService) return [];
    return parseCustomFields(selectedService.requiresCustom);
  }, [selectedService]);

  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;

  const unitPriceUsd = useMemo(() => {
    if (!selectedService) return 0;
    return getServicePrice(selectedService);
  }, [selectedService]);

  const formatPrice = (usd: number = 0) => {
    if (!Number.isFinite(usd) || usd <= 0) return isAr ? 'السعر غير متاح' : 'Price unavailable';
    const converted = usd * currency.rate;
    const formatted = converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: converted > 0 && converted < 0.01 ? 6 : 2,
    });
    return isAr ? `${formatted} ${currency.symbolAr}` : `${currency.symbolEn} ${formatted}`;
  };

  const handleSelectPackage = (packageItem: ServiceItem) => {
    setSelectedServiceId(packageItem.id);
    setInputError("");
    // Update URL query param smoothly
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("serviceId", packageItem.id);
      window.history.replaceState({}, "", url.toString());
    } catch {}
  };

  const handleCustomFieldChange = (key: string, val: string) => {
    setCustomFieldValues((prev) => ({
      ...prev,
      [key]: val,
    }));
    if (inputError) setInputError("");
  };

  const validateInputs = (): boolean => {
    if (unitPriceUsd <= 0) {
      setInputError(isAr ? 'سعر الخدمة غير متاح حالياً؛ يرجى التواصل مع الإدارة.' : 'This service price is unavailable. Please contact support.');
      return false;
    }
    if (customFields.length > 0) {
      for (const f of customFields) {
        const key = f.field_id || f.id || f.name || "";
        const label = f.label || f.name || key;
        const val = (customFieldValues[key] || "").trim();
        if (f.required !== false && !val) {
          setInputError(
            isAr
              ? `يرجى إدخال ${label} المطلوب بدقة للمتابعة`
              : `Please enter the required ${label} to proceed`
          );
          return false;
        }
      }
    } else {
      if (!targetInput.trim()) {
        const isImei =
          selectedService?.apiServiceType === "imei" ||
          (selectedService?.categoryName || "").toLowerCase().includes("imei");
        setInputError(
          isAr
            ? isImei
              ? "يرجى إدخال رقم IMEI الخاص بالجهاز (15 رقم)"
              : "يرجى إدخال معرف الحساب أو الرقم المطلوب بدقة"
            : isImei
            ? "Please enter the device 15-digit IMEI number"
            : "Please enter the required account ID or identifier"
        );
        return false;
      }
    }
    setInputError("");
    return true;
  };

  const resolveTargetDisplay = (): string => {
    if (customFields.length > 0) {
      const firstKey = customFields[0].field_id || customFields[0].id || customFields[0].name || "";
      return customFieldValues[firstKey] || Object.values(customFieldValues)[0] || "N/A";
    }
    return targetInput.trim() || "N/A";
  };

  const handleAddToCart = async () => {
    if (!validateInputs()) return;
    if (!selectedService) return;

    setIsAdding(true);
    setActionSuccess(null);

    try {
      const ok = await addToCart({
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        groupName: selectedService.groupName,
        targetInput: resolveTargetDisplay(),
        customFields: Object.keys(customFieldValues).length > 0 ? customFieldValues : undefined,
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
    if (!validateInputs()) return;
    if (!selectedService) return;

    setIsBuying(true);

    try {
      await addToCart({
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        groupName: selectedService.groupName,
        targetInput: resolveTargetDisplay(),
        customFields: Object.keys(customFieldValues).length > 0 ? customFieldValues : undefined,
        quantity,
        price: unitPriceUsd,
      });

      router.push(`/${lang}/cart`);
    } catch {
      setInputError(isAr ? "حدث خطأ أثناء التوجه للدفع" : "Error proceeding to checkout");
      setIsBuying(false);
    }
  };

  const handleDirectWalletCheckout = async () => {
    if (!validateInputs()) return;
    if (!selectedService) return;
    if (!isLoggedIn || !userSession) {
      router.push(`/${lang}/login?redirect=purchase?serviceId=${selectedService.id}`);
      return;
    }

    const totalCost = unitPriceUsd * quantity;
    const balance = Number(userSession.balance || 0);

    if (balance < totalCost) {
      setInputError(
        isAr
          ? `رصيد المحفظة ($${balance.toFixed(2)}) غير كافٍ. المطلوب: $${totalCost.toFixed(2)}. يرجى شحن المحفظة أولاً.`
          : `Insufficient balance ($${balance.toFixed(2)}). Required: $${totalCost.toFixed(2)}. Please recharge wallet.`
      );
      return;
    }

    setIsDirectOrdering(true);
    setInputError("");

    try {
      const token = localStorage.getItem("user_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/orders", {
        method: "POST",
        headers,
        body: JSON.stringify({
          userId: userSession.id,
          email: userSession.email,
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          targetInput: resolveTargetDisplay(),
          quantity,
          price: unitPriceUsd,
          customFields: Object.keys(customFieldValues).length > 0 ? customFieldValues : null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const newBal = data.newBalance !== undefined ? data.newBalance : Math.max(0, balance - totalCost);
        const updated = { ...userSession, balance: newBal };
        localStorage.setItem("user_session", JSON.stringify(updated));
        setUserSession(updated);
        window.dispatchEvent(new Event("user_session_change"));

        setSuccessOrderModal({
          orderId: data.order?.id ? data.order.id.slice(-6).toUpperCase() : "NEW",
          serviceName: selectedService.name,
          target: resolveTargetDisplay(),
          amount: totalCost,
          newBalance: newBal,
        });
      } else {
        setInputError(data.error || (isAr ? "فشل تنفيذ الطلب" : "Order processing failed"));
      }
    } catch {
      setInputError(isAr ? "تعذر الاتصال بالسيرفر لإتمام الطلب" : "Server connection failed");
    } finally {
      setIsDirectOrdering(false);
    }
  };

  const serviceImageName = getServiceImage(
    selectedService?.groupName || "",
    selectedService?.name || ""
  );

  return (
    <div className="w-full max-w-6xl mx-auto py-3 sm:py-6 space-y-8" dir={isAr ? "rtl" : "ltr"}>
      {/* SUCCESS CONFIRMATION MODAL */}
      {successOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle size={42} />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {isAr ? "تم استلام وتأكيد طلبك بنجاح!" : "Order Confirmed Successfully!"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr
                  ? "تم خصم القيمة من رصيد محفظتك، وجاري تنفيذ طلبك فوراً عبر السيرفر."
                  : "Amount deducted from wallet. Your order is now being processed automatically."}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-2.5 text-start font-sans">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 font-bold">
                  {isAr ? "رقم الطلب:" : "Order ID:"}
                </span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                  #{successOrderModal.orderId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 font-bold">
                  {isAr ? "الخدمة / الباقة:" : "Service / Package:"}
                </span>
                <span className="font-bold text-slate-900 dark:text-white truncate max-w-[220px]">
                  {successOrderModal.serviceName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 font-bold">
                  {isAr ? "بيانات الحساب:" : "Target:"}
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate max-w-[220px]">
                  {successOrderModal.target}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 font-bold">
                  {isAr ? "المبلغ المخصوم:" : "Deducted Amount:"}
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatPrice(successOrderModal.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 font-bold">
                  {isAr ? "رصيد المحفظة الجديد:" : "New Balance:"}
                </span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                  ${successOrderModal.newBalance.toFixed(2)} USD
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href={`/${lang}/orders`}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>{isAr ? "الانتقال لسجل طلباتي" : "View My Orders"}</span>
                <ArrowUpRight size={14} />
              </Link>
              <button
                type="button"
                onClick={() => setSuccessOrderModal(null)}
                className="px-6 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 py-3.5 rounded-2xl font-bold text-xs border border-slate-300 dark:border-slate-700 transition-all"
              >
                {isAr ? "طلب خدمة أخرى" : "Order Another"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link href={`/${lang}`} className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1">
          <Home size={14} />
          <span>{isAr ? "الرئيسية" : "Home"}</span>
        </Link>
        <ChevronRight size={14} className={isAr ? "rotate-180" : ""} />
        <Link href={`/${lang}/services`} className="hover:text-blue-600 dark:hover:text-blue-400">
          {isAr ? "الخدمات والباقات الرقمية" : "Services & Top-Ups"}
        </Link>
        {selectedService && (
          <>
            <ChevronRight size={14} className={isAr ? "rotate-180" : ""} />
            <span className="font-semibold text-slate-900 dark:text-white line-clamp-1">
              {formatText(selectedService.groupName || selectedService.name)}
            </span>
          </>
        )}
      </nav>

      {/* MAIN PRODUCT SHOWCASE CONTAINER (Zoalna Style) */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Visual Showcase Side (Desktop: 5 cols, Mobile: Top) */}
          <div className="lg:col-span-5 p-6 sm:p-8 bg-slate-50 dark:bg-slate-800/40 border-b lg:border-b-0 lg:border-e border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="relative aspect-square max-w-[340px] mx-auto rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-900 via-[#0a1224] to-slate-950 flex items-center justify-center p-4 group">
                {serviceImageName === "service_default_brand.webp" ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-center pb-8">
                    {/* Ambient Glow */}
                    <div className="absolute w-44 h-44 rounded-full bg-blue-500/15 blur-2xl pointer-events-none" />
                    <img
                      src="/images/borai-logo.png?v=2"
                      alt="BORAI SERVER"
                      className="w-[88%] max-h-[140px] object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.85)] filter transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <img
                    src={`/images/zoalna/${serviceImageName}`}
                    alt={selectedService?.name || "Service"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to branded cover if not found
                      (e.currentTarget as HTMLImageElement).src = "/images/zoalna/service_default_brand.webp";
                    }}
                  />
                )}

                <div className="absolute top-3 start-3 px-3 py-1 rounded-full bg-blue-600/90 text-white font-bold text-xs backdrop-blur-md flex items-center gap-1.5 shadow-md z-10">
                  <Zap size={14} className="animate-pulse text-amber-300" />
                  <span>{isAr ? "تسليم فوري وآلي 24/7" : "Instant 24/7 Delivery"}</span>
                </div>

                {/* Branded website & service identifier overlay for all services */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent p-3.5 pt-8 text-white flex flex-col justify-end z-10">
                  <div className="flex items-center justify-between text-[11px] font-bold text-blue-400 uppercase tracking-wider mb-0.5">
                    <span>{isAr ? "برعي ستور | BORAI STORE" : "BORAI STORE"}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300">
                      {isAr ? "خدمة معتمدة" : "Verified Service"}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-white line-clamp-1">
                    {formatText(selectedService?.groupName || selectedService?.name || "")}
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
                      {isAr ? "ضمان رسمي وأمان 100%" : "100% Official Guarantee"}
                    </strong>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isAr ? "تنفيذ معتمد رسمياً ومحمي بالكامل" : "Fully verified and encrypted processing"}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3 shadow-sm">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      {isAr ? "تنفيذ آلي دون انتظار" : "Zero Wait Time"}
                    </strong>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isAr
                        ? selectedService?.time || "تنفيذ فوري خلال ثوانٍ معدودة"
                        : selectedService?.time || "Instant processing in seconds"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300 flex items-center gap-2">
              <Sparkles size={16} className="text-blue-600 shrink-0" />
              <span>
                {isAr
                  ? "متجر برعي يضمن لك أفضل الأسعار مع حماية كاملة لحسابك ومعاملاتك."
                  : "BORAI STORE guarantees competitive rates and complete transaction protection."}
              </span>
            </div>
          </div>

          {/* Form & Package Selector Side (Desktop: 7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[11px]">
                  {formatText(selectedService?.groupName || "STARLINK")}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[11px] flex items-center gap-1">
                  <Flame size={12} />
                  <span>{isAr ? "الأكثر طلباً" : "Popular"}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {formatText(selectedService?.name || (isAr ? "طلب الخدمة" : "Order Service"))}
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

            {/* STEP 1: INPUT REQUIRED FIELDS (Zoalna Style) */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isAr ? "أدخل بيانات الحساب والشحن المطلوبة" : "Enter required account / recharge details"}
                </h2>
              </div>

              {customFields.length > 0 ? (
                <div className="space-y-3">
                  {customFields.map((field, idx) => {
                    const key = field.field_id || field.id || field.name || `field_${idx}`;
                    const label = field.label || field.name || key;
                    const isEmail = key.toLowerCase().includes("email") || label.toLowerCase().includes("email");
                    const isPass = key.toLowerCase().includes("password") || label.toLowerCase().includes("password");
                    const isPhone = key.toLowerCase().includes("phone") || label.toLowerCase().includes("phone");
                    const placeholder = field.placeholder || (isAr ? `أدخل ${label}...` : `Enter ${label}...`);

                    return (
                      <div key={key} className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            {isEmail ? (
                              <Mail size={14} className="text-blue-500" />
                            ) : isPass ? (
                              <Lock size={14} className="text-amber-500" />
                            ) : isPhone ? (
                              <Smartphone size={14} className="text-emerald-500" />
                            ) : (
                              <Key size={14} className="text-slate-500" />
                            )}
                            <span>{label}</span>
                            {field.required !== false && <span className="text-red-500">*</span>}
                          </span>
                        </label>
                        <input
                          type={isPass ? "password" : isEmail ? "email" : "text"}
                          value={customFieldValues[key] || ""}
                          onChange={(e) => handleCustomFieldChange(key, e.target.value)}
                          placeholder={placeholder}
                          className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Hash size={14} className="text-blue-500" />
                      <span>{isAr ? "معرف الحساب / الرقم المطلوب (ID / IMEI)" : "Target ID / Account Identifier"}</span>
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    value={targetInput}
                    onChange={(e) => {
                      setTargetInput(e.target.value);
                      if (inputError) setInputError("");
                    }}
                    placeholder={
                      isAr
                        ? "أدخل معرّف الحساب أو رقم الآيدي بدقة هنا..."
                        : "Enter account ID or identifier accurately..."
                    }
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isAr
                      ? "تأكد من صحة البيانات المكتوبة؛ حيث يتم تنفيذ الشحن آلياً بمجرد تأكيد الطلب."
                      : "Make sure all details are accurate. Top-ups are dispatched automatically."}
                  </p>
                </div>
              )}
            </div>

            {/* STEP 2: SELECT PACKAGE SWATCHES (Zoalna Style) */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isAr ? "اختر الباقة المطلوبة" : "Choose the desired package"}
                  </h2>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {activeGroupServices.length} {isAr ? "باقة متاحة" : "available"}
                </span>
              </div>

              {loading ? (
                <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                  <LoaderCircle size={18} className="animate-spin text-blue-600" />
                  <span>{isAr ? "جاري تحميل الباقات..." : "Loading packages..."}</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  {activeGroupServices.map((pkg) => {
                    const isSelected = pkg.id === selectedService?.id;
                    const pkgPrice = getServicePrice(pkg);
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => handleSelectPackage(pkg)}
                        className={`p-3 rounded-2xl border text-start flex flex-col justify-between gap-2 transition-all relative overflow-hidden group ${
                          isSelected
                            ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 ring-2 ring-blue-500/20 shadow-sm"
                            : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-1.5 end-1.5 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}

                        <div>
                          <strong
                            className={`text-xs font-bold block line-clamp-2 leading-snug ${
                              isSelected
                                ? "text-blue-700 dark:text-blue-300"
                                : "text-slate-800 dark:text-slate-200"
                            }`}
                          >
                            {formatText(pkg.name)}
                          </strong>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                            <Clock size={10} className="inline me-1" />
                            {pkg.time || (isAr ? "فوري" : "Instant")}
                          </span>
                        </div>

                        <div className="pt-1 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                          <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                            {formatPrice(pkgPrice)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* STEP 3: QUANTITY SELECTION */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isAr ? "تحديد الكمية" : "Select quantity"}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white flex items-center justify-center transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <Minus size={16} />
                </button>
                <span className="w-14 text-center font-bold text-base text-slate-900 dark:text-white font-mono">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white flex items-center justify-center transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <Plus size={16} />
                </button>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {isAr ? "عدد الباقات المطلوب شحنها" : "Total packages to top up"}
                </span>
              </div>
            </div>

            {/* STEP 4: SUMMARY & DUAL ACTION BUTTONS (Zoalna Style) */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">
                    {isAr ? "المبلغ الإجمالي للدفع:" : "Total payable amount:"}
                  </span>
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                    {formatPrice(unitPriceUsd * quantity)}
                  </div>
                </div>

                {isLoggedIn && userSession && (
                  <div className="text-end">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      {isAr ? "رصيد محفظتك المتاح:" : "Wallet balance:"}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                      ${Number(userSession.balance || 0).toFixed(2)} USD
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons: Add to Cart + Buy Now */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAdding || isBuying}
                  className="w-full py-4 px-6 rounded-2xl border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isAdding ? (
                    <LoaderCircle size={18} className="animate-spin" />
                  ) : (
                    <ShoppingBag size={18} />
                  )}
                  <span>{isAr ? "أضف إلى السلة" : "Add to Cart"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={isAdding || isBuying}
                  className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isBuying ? (
                    <LoaderCircle size={18} className="animate-spin" />
                  ) : (
                    <Zap size={18} />
                  )}
                  <span>{isAr ? "اشترِ الآن (دفع فوري)" : "Buy Now (Fast Checkout)"}</span>
                </button>
              </div>

              {/* Instant Wallet Checkout Option if logged in */}
              {isLoggedIn && userSession && (
                <button
                  type="button"
                  onClick={handleDirectWalletCheckout}
                  disabled={isDirectOrdering}
                  className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  {isDirectOrdering ? (
                    <LoaderCircle size={15} className="animate-spin" />
                  ) : (
                    <Wallet size={15} className="text-emerald-500" />
                  )}
                  <span>{isAr ? "خصم فوري مباشر من رصيد المحفظة" : "Instant Deduction from Wallet Balance"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4-STEP HOW IT WORKS (Zoalna Style) */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="text-blue-600" size={22} />
            <span>{isAr ? "خطوات الطلب والتفعيل" : "How It Works"}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAr ? "خطوات بسيطة وسريعة لإتمام طلبك في أقل من دقيقة" : "Simple and fast steps to place your order"}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow">
              1
            </div>
            <strong className="text-sm font-bold text-slate-900 dark:text-white block">
              {isAr ? "أدخل البيانات المطلوبة" : "Enter Required Details"}
            </strong>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAr ? "اكتب بيانات الحساب أو الآيدي بدقة في الحقول المخصصة." : "Input your account credentials accurately."}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow">
              2
            </div>
            <strong className="text-sm font-bold text-slate-900 dark:text-white block">
              {isAr ? "اختر الباقة المناسبة" : "Select Your Package"}
            </strong>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAr ? "اختر الفئة أو القيمة التي تريد شحنها لحسابك." : "Pick the exact package or credit tier."}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow">
              3
            </div>
            <strong className="text-sm font-bold text-slate-900 dark:text-white block">
              {isAr ? "الدفع بأمان" : "Secure Payment"}
            </strong>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAr ? "ادفع عبر المحفظة أو بنكك أو كاشي أو باي بال أو البطاقات." : "Pay using Wallet, Bankak, PayPal or Cards."}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow">
              4
            </div>
            <strong className="text-sm font-bold text-slate-900 dark:text-white block">
              {isAr ? "التفعيل الفوري" : "Instant Activation"}
            </strong>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAr ? "يتم التنفيذ آلياً وتصلك الخدمة في حسابك دون تأخير." : "Top-up arrives in your account automatically."}
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
              {isAr ? "تنفيذ وتفعيل سريع لحسابك خلال ثوانٍ معدودة." : "Credits reach your account in seconds."}
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
              {isAr ? "جميع المعاملات رسمية ومحمية ومشفرة بالكامل." : "All transactions are fully encrypted and safe."}
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
              {isAr ? "تجارب حقيقية من عملائنا بعد شحن وتفعيل طلباتهم" : "Real feedback from verified purchasers"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill="currentColor" />
              ))}
            </div>
            <span className="text-lg font-black text-slate-900 dark:text-white">4.9 / 5.0</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CUSTOMER_REVIEWS.map((rev, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-white">{rev.name}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{rev.date}</span>
              </div>
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} size={13} fill="currentColor" />
                ))}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{rev.comment}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function PurchaseClient({
  lang,
  dict,
  initialService,
  initialServiceId,
}: {
  lang: string;
  dict?: any;
  initialService?: any;
  initialServiceId?: string;
}) {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-6xl mx-auto py-16 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
          <LoaderCircle size={24} className="animate-spin text-blue-600" />
          <span>جاري تحميل صفحة الشراء...</span>
        </div>
      }
    >
      <PurchaseClientContent
        lang={lang}
        dict={dict}
        initialService={initialService}
        initialServiceId={initialServiceId}
      />
    </Suspense>
  );
}
