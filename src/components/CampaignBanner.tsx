"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Flame,
  Clock,
  ShieldCheck,
  Zap,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  Pause,
  Play,
  Grid
} from "lucide-react";

export interface CampaignItem {
  id?: string;
  tagEn?: string;
  tagAr?: string;
  titleEn?: string;
  titleAr?: string;
  descEn?: string;
  descAr?: string;
  badgeEn?: string;
  badgeAr?: string;
  turnaroundEn?: string;
  turnaroundAr?: string;
  guaranteeEn?: string;
  guaranteeAr?: string;
  connectionEn?: string;
  connectionAr?: string;
  theme?: "cyan" | "purple" | "blue" | "emerald" | "amber";
  image?: string;
  url?: string;
  buttonTextEn?: string;
  buttonTextAr?: string;
}

const DEFAULT_CAMPAIGNS: CampaignItem[] = [
  {
    id: "samsung_frp",
    tagEn: "Limited Time Offer",
    tagAr: "عرض حصري لفترة محدودة",
    titleEn: "Samsung FRP Remove",
    titleAr: "حذف حساب سامسونج FRP الفوري",
    descEn: "Instant removal for all Samsung models via direct official server API.",
    descAr: "فك فوري وتلقائي لجميع طرازات سامسونج عبر السيرفر الرسمي بأعلى سرعة وأمان.",
    badgeEn: "Direct API Link",
    badgeAr: "ربط سيرفر مباشر",
    turnaroundEn: "1 - 5 Mins",
    turnaroundAr: "1 - 5 دقائق",
    guaranteeEn: "100% REFUND",
    guaranteeAr: "ضمان مالي 100%",
    connectionEn: "DIRECT API",
    connectionAr: "ربط فوري API",
    theme: "blue",
    image: "/images/promo_samsung_clean.png",
    url: "/purchase?serviceId=6f9e3d09-9629-4b03-ac16-b064ab02cd9f",
    buttonTextEn: "Order & Activate Now",
    buttonTextAr: "اطلب الآن وابدأ التفعيل"
  },
  {
    id: "reseller_bundles",
    tagEn: "Official Reseller",
    tagAr: "موزع رسمي معتمد",
    titleEn: "Official Reseller Campaigns",
    titleAr: "عروض وحملات الموزعين الرسمية",
    descEn: "Best wholesale rates, instant activations, and full warranty on tools.",
    descAr: "أفضل أسعار الجملة المعتمدة، إصدارات جديدة، وتفعيل فوري مع ضمان كامل.",
    badgeEn: "Full Warranty",
    badgeAr: "ضمان معتمد كامل",
    turnaroundEn: "Instant Delivery",
    turnaroundAr: "تسليم فوري 24/7",
    guaranteeEn: "100% Guaranteed",
    guaranteeAr: "ضمان رسمي كامل",
    connectionEn: "AUTO SERVER",
    connectionAr: "سيرفر مؤتمت",
    theme: "cyan",
    image: "/images/promo_gift_box_clean.png",
    url: "/pricing",
    buttonTextEn: "View All Offers",
    buttonTextAr: "عرض جميع العروض"
  },
  {
    id: "chimera_tool",
    tagEn: "Best Seller Tool",
    tagAr: "الأداة الأكثر طلباً",
    titleEn: "Chimera Tool Pro",
    titleAr: "أداة شيميرا (Chimera Tool)",
    descEn: "All Brands and Samsung activations with instant server token generation.",
    descAr: "تراخيص سنوية وتعبئة أرصدة شيميرا بأسعار منافسة وتسليم فوري خلال دقيقة.",
    badgeEn: "Instant License",
    badgeAr: "ترخيص فوري مباشر",
    turnaroundEn: "Under 1 Min",
    turnaroundAr: "أقل من دقيقة",
    guaranteeEn: "100% REFUND",
    guaranteeAr: "ضمان استرجاع 100%",
    connectionEn: "GSM SERVER",
    connectionAr: "سيرفر رسمي",
    theme: "blue",
    image: "/images/promo_chimera.png",
    url: "/purchase?serviceId=52edf5bd-1bc7-4bdb-a3c9-e48082f29cff",
    buttonTextEn: "Get Chimera License",
    buttonTextAr: "احصل على ترخيص شيميرا"
  },
  {
    id: "borneo_schematics",
    tagEn: "Hardware Diagnostics",
    tagAr: "مخططات الهاردوير",
    titleEn: "Borneo Schematics",
    titleAr: "مخططات بورنيو (Borneo)",
    descEn: "Official activation codes for 1-PC and 2-PC with instant daily updates.",
    descAr: "تفعيل رسمي لمخططات بورنيو مع تحديثات يومية ودعم لجميع اللوحات الإلكترونية.",
    badgeEn: "Daily Updates",
    badgeAr: "تحديثات يومية متواصلة",
    turnaroundEn: "Instant 24/7",
    turnaroundAr: "فوري على مدار الساعة",
    guaranteeEn: "Official Code",
    guaranteeAr: "كود تفعيل أصلي",
    connectionEn: "OFFICIAL DB",
    connectionAr: "قاعدة بيانات رسمية",
    theme: "emerald",
    image: "/images/promo_borneo.png",
    url: "/purchase?serviceId=1fcef2a5-734c-433d-8af8-2a0ddaa4d196",
    buttonTextEn: "Activate Borneo",
    buttonTextAr: "تفعيل باقة بورنيو"
  }
];

interface ThemeStyle {
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  auraBg: string;
  pillBg: string;
  progressGradient: string;
  buttonGradient: string;
}

const THEME_STYLES: Record<string, ThemeStyle> = {
  purple: {
    cardBg: "bg-gradient-to-br from-slate-50 via-white to-blue-50/50 dark:from-[#060e22] dark:via-[#0b1b42] dark:to-[#040916]",
    cardBorder: "border-blue-200/90 hover:border-blue-300 dark:border-blue-500/35 dark:hover:border-blue-400/50",
    cardShadow: "shadow-xl shadow-blue-950/5 dark:shadow-2xl dark:shadow-blue-950/60",
    auraBg: "bg-blue-400/15 dark:bg-blue-600/25",
    pillBg: "bg-blue-100/80 border-blue-300 text-blue-900 dark:bg-blue-950/90 dark:border-blue-500/40 dark:text-blue-300",
    progressGradient: "from-blue-600 via-indigo-600 to-sky-500",
    buttonGradient: "from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/25"
  },
  cyan: {
    cardBg: "bg-gradient-to-br from-cyan-50/40 via-white to-sky-50/40 dark:from-[#031322] dark:via-[#062038] dark:to-[#020b14]",
    cardBorder: "border-cyan-200/90 hover:border-cyan-300 dark:border-cyan-500/35 dark:hover:border-cyan-400/50",
    cardShadow: "shadow-xl shadow-cyan-950/5 dark:shadow-2xl dark:shadow-cyan-950/60",
    auraBg: "bg-cyan-400/15 dark:bg-cyan-500/25",
    pillBg: "bg-cyan-100/80 border-cyan-300 text-cyan-900 dark:bg-cyan-950/90 dark:border-cyan-500/40 dark:text-cyan-300",
    progressGradient: "from-cyan-500 via-sky-400 to-blue-500",
    buttonGradient: "from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 hover:to-sky-500 text-white shadow-md shadow-cyan-600/25"
  },
  blue: {
    cardBg: "bg-gradient-to-br from-blue-50/40 via-white to-slate-50 dark:from-[#051026] dark:via-[#091b40] dark:to-[#030a18]",
    cardBorder: "border-blue-200/90 hover:border-blue-300 dark:border-blue-500/35 dark:hover:border-blue-400/50",
    cardShadow: "shadow-xl shadow-blue-950/5 dark:shadow-2xl dark:shadow-blue-950/60",
    auraBg: "bg-blue-400/15 dark:bg-blue-500/25",
    pillBg: "bg-blue-100/80 border-blue-300 text-blue-900 dark:bg-blue-950/90 dark:border-blue-500/40 dark:text-sky-300",
    progressGradient: "from-blue-600 via-indigo-500 to-sky-400",
    buttonGradient: "from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/25"
  },
  emerald: {
    cardBg: "bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/40 dark:from-[#031510] dark:via-[#06241b] dark:to-[#020c09]",
    cardBorder: "border-emerald-200/90 hover:border-emerald-300 dark:border-emerald-500/35 dark:hover:border-emerald-400/50",
    cardShadow: "shadow-xl shadow-emerald-950/5 dark:shadow-2xl dark:shadow-emerald-950/60",
    auraBg: "bg-emerald-400/15 dark:bg-emerald-500/25",
    pillBg: "bg-emerald-100/80 border-emerald-300 text-emerald-900 dark:bg-emerald-950/90 dark:border-emerald-500/40 dark:text-emerald-300",
    progressGradient: "from-emerald-500 via-teal-400 to-green-500",
    buttonGradient: "from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/25"
  },
  amber: {
    cardBg: "bg-gradient-to-br from-amber-50/40 via-white to-orange-50/40 dark:from-[#160f03] dark:via-[#261a05] dark:to-[#0c0801]",
    cardBorder: "border-amber-200/90 hover:border-amber-300 dark:border-amber-500/35 dark:hover:border-amber-400/50",
    cardShadow: "shadow-xl shadow-amber-950/5 dark:shadow-2xl dark:shadow-amber-950/60",
    auraBg: "bg-amber-400/15 dark:bg-amber-500/25",
    pillBg: "bg-amber-100/80 border-amber-300 text-amber-900 dark:bg-amber-950/90 dark:border-amber-500/40 dark:text-amber-300",
    progressGradient: "from-amber-500 via-orange-400 to-amber-600",
    buttonGradient: "from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white shadow-md shadow-amber-600/25"
  }
};

interface CampaignBannerProps {
  lang?: string;
  campaigns?: CampaignItem[];
  isPreview?: boolean;
}

export default function CampaignBanner({
  lang = "ar",
  campaigns,
  isPreview = false
}: CampaignBannerProps) {
  const isAr = lang === "ar";
  const items = campaigns && campaigns.length > 0 ? campaigns : DEFAULT_CAMPAIGNS;
  const total = items.length;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showDrawer, setShowDrawer] = useState(false);

  const durationMs = 6500;
  const tickIntervalMs = 50;

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
    setProgress(0);
  }, [total]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
    setProgress(0);
  }, [total]);

  useEffect(() => {
    if (total <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (tickIntervalMs / durationMs) * 100;
        if (next >= 100) {
          handleNext();
          return 0;
        }
        return next;
      });
    }, tickIntervalMs);

    return () => clearInterval(timer);
  }, [total, isPaused, handleNext]);

  const current = items[activeIndex % total] || items[0];
  const themeKey = current.theme && THEME_STYLES[current.theme] ? current.theme : "blue";
  const theme = THEME_STYLES[themeKey];

  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const PrevIcon = isAr ? ChevronRight : ChevronLeft;
  const NextIcon = isAr ? ChevronLeft : ChevronRight;

  const formatTargetUrl = (rawUrl?: string) => {
    if (!rawUrl) return `/${lang}/pricing`;
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) return rawUrl;
    if (rawUrl.startsWith("/")) return `/${lang}${rawUrl}`;
    return `/${lang}/${rawUrl}`;
  };

  return (
    <section className="w-full mb-8 sm:mb-12">
      {/* 1. Top Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3.5 sm:mb-5">
        <div className="space-y-0.5 text-start">
          <div className="inline-flex items-center gap-2">
            <span className="h-[2px] w-5 sm:w-6 bg-blue-600 dark:bg-cyan-400 rounded-full" />
            <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {isAr ? "عروض وحملات الترويج الساخنة" : "Hot Promotional Campaigns"}
            </h2>
            <span className="h-[2px] w-5 sm:w-6 bg-blue-600 dark:bg-cyan-400 rounded-full" />
          </div>
          <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
            {isAr
              ? "باقات حصرية وأسعار جملة معتمدة مع تسليم فوري وتلقائي"
              : "Exclusive wholesale deals and certified tools with instant delivery"}
          </p>
        </div>

        {/* Live Deals Badge and Quick Controls */}
        <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] sm:text-[11px] font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>{isAr ? "عروض نشطة ومحدثة" : "Live Deals"}</span>
          </div>

          {total > 1 && (
            <div className="flex items-center gap-1 bg-white/80 dark:bg-white/10 p-0.5 rounded-xl border border-slate-200/90 dark:border-white/15 shadow-xs">
              <button
                type="button"
                onClick={handlePrev}
                aria-label={isAr ? "السابق" : "Previous"}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <PrevIcon className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                aria-label={isPaused ? "Play" : "Pause"}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                {isPaused ? <Play className="w-3 h-3 text-cyan-600 dark:text-cyan-400" /> : <Pause className="w-3 h-3 text-slate-500 dark:text-slate-400" />}
              </button>

              <button
                type="button"
                onClick={handleNext}
                aria-label={isAr ? "التالي" : "Next"}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <NextIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Flagship Modern Cockpit Card (Supports Both Light and Dark Modes with Zero Pink) */}
      <div
        className={`relative w-full rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 lg:p-9 ${theme.cardBg} border ${theme.cardBorder} backdrop-blur-2xl ${theme.cardShadow} overflow-hidden transition-all duration-500 group`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Top Progress Track */}
        {total > 1 && (
          <div className="absolute top-0 inset-x-0 h-[2.5px] bg-slate-200/80 dark:bg-white/10 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${theme.progressGradient} transition-all ease-linear`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Ambient Animated Cyber Sheen Gliding Across Card */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 dark:via-white/[0.08] to-transparent -skew-x-12 animate-banner-sheen" />
        </div>

        {/* Atmospheric Radial Aura Behind Graphic */}
        <div
          className={`absolute -bottom-16 end-4 sm:end-12 w-64 h-64 sm:w-80 sm:h-80 rounded-full ${theme.auraBg} blur-3xl pointer-events-none animate-banner-aura`}
        />

        {/* Card Content Grid */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-stretch">
          
          {/* Main Info Column (7 Cols on Desktop) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4 sm:space-y-5 text-start">
            
            {/* Top Badges Bar: Flame Tag + Sub Badge */}
            <div className="space-y-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold border shadow-xs ${theme.pillBg}`}
                >
                  <Flame className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 animate-pulse" />
                  <span>
                    {isAr
                      ? current.tagAr || current.tagEn || "عرض حصري"
                      : current.tagEn || current.tagAr || "Exclusive Deal"}
                  </span>
                </span>

                {(current.badgeAr || current.badgeEn) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100/90 dark:bg-white/10 border border-slate-300/80 dark:border-white/15 text-slate-800 dark:text-slate-200 text-[10px] sm:text-[11px] font-semibold">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      {isAr
                        ? current.badgeAr || current.badgeEn
                        : current.badgeEn || current.badgeAr}
                    </span>
                  </span>
                )}
              </div>

              {/* Headline and Description */}
              <div className="space-y-1.5 sm:space-y-2">
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                  {isAr
                    ? current.titleAr || current.titleEn || "خدمة معتمدة"
                    : current.titleEn || current.titleAr || "Certified Service"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-xl">
                  {isAr
                    ? current.descAr || current.descEn || "تفعيل فوري وأسعار حصرية مع ضمان استرجاع الرصيد بالكامل."
                    : current.descEn || current.descAr || "Instant automated fulfillment with full refund protection."}
                </p>
              </div>

              {/* 3 Operational Metric Proof Cards */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
                <div className="p-2 sm:p-2.5 rounded-xl bg-white/80 dark:bg-[#071224]/80 border border-slate-200/90 dark:border-white/10 text-center shadow-xs">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 dark:text-amber-400 mx-auto mb-0.5 sm:mb-1" />
                  <div className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                    {isAr ? "سرعة الإنجاز" : "Speed"}
                  </div>
                  <div className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white font-mono mt-0.5 truncate">
                    {isAr
                      ? current.turnaroundAr || current.turnaroundEn || "1 - 5 دقائق"
                      : current.turnaroundEn || current.turnaroundAr || "1 - 5 Mins"}
                  </div>
                </div>

                <div className="p-2 sm:p-2.5 rounded-xl bg-white/80 dark:bg-[#071224]/80 border border-slate-200/90 dark:border-white/10 text-center shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 dark:text-emerald-400 mx-auto mb-0.5 sm:mb-1" />
                  <div className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                    {isAr ? "الضمان المالي" : "Guarantee"}
                  </div>
                  <div className="text-[11px] sm:text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 truncate">
                    {isAr
                      ? current.guaranteeAr || current.guaranteeEn || "ضمان 100%"
                      : current.guaranteeEn || current.guaranteeAr || "100% REFUND"}
                  </div>
                </div>

                <div className="p-2 sm:p-2.5 rounded-xl bg-white/80 dark:bg-[#071224]/80 border border-slate-200/90 dark:border-white/10 text-center shadow-xs">
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-500 dark:text-sky-400 mx-auto mb-0.5 sm:mb-1" />
                  <div className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                    {isAr ? "نوع الربط" : "Gateway"}
                  </div>
                  <div className="text-[11px] sm:text-xs font-black text-sky-600 dark:text-cyan-400 font-mono mt-0.5 truncate">
                    {isAr
                      ? current.connectionAr || current.connectionEn || "ربط فوري API"
                      : current.connectionEn || current.connectionAr || "DIRECT API"}
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5 sm:gap-3">
              {isPreview ? (
                <button
                  type="button"
                  className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r ${theme.buttonGradient} text-white shadow-lg transition-all`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-white/90" />
                  <span>
                    {isAr
                      ? current.buttonTextAr || current.buttonTextEn || "اطلب الآن وابدأ التفعيل"
                      : current.buttonTextEn || current.buttonTextAr || "Order & Activate Now"}
                  </span>
                  <ArrowIcon className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Link
                  href={formatTargetUrl(current.url)}
                  className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r ${theme.buttonGradient} text-white shadow-lg hover:shadow-xl transition-all group/btn`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-white/90" />
                  <span>
                    {isAr
                      ? current.buttonTextAr || current.buttonTextEn || "اطلب الآن وابدأ التفعيل"
                      : current.buttonTextEn || current.buttonTextAr || "Order & Activate Now"}
                  </span>
                  <ArrowIcon className="w-3.5 h-3.5 transition-transform group-hover/btn:-translate-x-1 rtl:group-hover/btn:-translate-x-1 ltr:group-hover/btn:translate-x-1" />
                </Link>
              )}

              {isPreview ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15 text-slate-800 dark:text-white border border-slate-300/80 dark:border-white/20 transition-all shadow-xs"
                >
                  <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                  <span>{isAr ? "استعراض كافة الباقات" : "Browse All Rates"}</span>
                </button>
              ) : (
                <Link
                  href={`/${lang}/pricing`}
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15 text-slate-800 dark:text-white border border-slate-300/80 dark:border-white/20 transition-all shadow-xs"
                >
                  <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                  <span>{isAr ? "استعراض كافة الباقات" : "Browse All Rates"}</span>
                </Link>
              )}
            </div>
          </div>

          {/* Full-Bleed Product Image Showcase (5 Cols on Desktop - Image Fills Completely) */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="relative w-full h-[240px] sm:h-[280px] md:h-[320px] lg:h-full min-h-[240px] sm:min-h-[280px] lg:min-h-[340px] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 dark:border-white/15 shadow-md group/img bg-slate-900/5 dark:bg-[#071224]/80 flex flex-col justify-end">
              
              {/* Blurred Ambient Fill Layer for Background Bleed */}
              {current.image && (
                <div className="absolute inset-0 scale-125 blur-2xl opacity-40 dark:opacity-30 pointer-events-none">
                  <Image
                    src={current.image}
                    alt="Background blur"
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover"
                  />
                </div>
              )}

              {/* Main Full-Bleed Foreground Image */}
              <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-3">
                {current.image ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={current.image}
                      alt={current.titleEn || current.titleAr || "Offer"}
                      fill
                      sizes="(max-width: 1024px) 100vw, 45vw"
                      className="object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.35)] dark:drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)] transition-transform duration-700 group-hover/img:scale-105"
                      priority
                    />
                  </div>
                ) : (
                  <div className="w-full h-full rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 border border-slate-200/80 dark:border-white/20 flex flex-col items-center justify-center p-4 text-center">
                    <Sparkles className="w-12 h-12 text-blue-600 dark:text-cyan-400 mb-2" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {isAr ? current.titleAr : current.titleEn}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Scrim & Status Pill */}
              <div className="relative z-10 p-2.5 sm:p-3 bg-gradient-to-t from-slate-950/70 via-slate-950/30 to-transparent">
                <div className="w-full p-2 sm:p-2.5 rounded-xl bg-white/90 dark:bg-[#071120]/90 backdrop-blur-md border border-slate-200/90 dark:border-white/15 flex items-center justify-between shadow-lg text-[11px] sm:text-xs">
                  <span className="font-bold text-slate-800 dark:text-white truncate max-w-[150px] sm:max-w-[190px]">
                    {isAr ? current.titleAr : current.titleEn}
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0 ms-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    AUTO 24/7
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 3. Executive Compact Navigation Deck (Light & Dark Compatible, Zero Clutter) */}
        {total > 1 && (
          <div className="mt-5 pt-3.5 border-t border-slate-200/80 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Left: Monospace Slide Counter & Active Title */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/90 dark:bg-white/[0.08] border border-slate-200/90 dark:border-white/10 font-mono text-[11px] text-slate-800 dark:text-white font-bold">
                <span className="text-blue-600 dark:text-cyan-400">{String(activeIndex + 1).padStart(2, "0")}</span>
                <span className="text-slate-400 dark:text-slate-500">/</span>
                <span className="text-slate-600 dark:text-slate-400">{String(total).padStart(2, "0")}</span>
              </div>
              <span className="hidden sm:inline-block text-[11px] text-slate-600 dark:text-slate-300 font-medium truncate max-w-[220px]">
                {isAr ? current.titleAr || current.titleEn : current.titleEn || current.titleAr}
              </span>
            </div>

            {/* Center: Dynamic Sliding Pagination Indicators */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: Math.min(total, 7) }).map((_, i) => {
                const targetIdx = total <= 7 ? i : (activeIndex - 3 + i + total) % total;
                const isActive = targetIdx === activeIndex;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setActiveIndex(targetIdx);
                      setProgress(0);
                    }}
                    aria-label={`Slide ${targetIdx + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isActive
                        ? "w-7 bg-blue-600 dark:bg-cyan-400 shadow-sm"
                        : "w-2 bg-slate-300 dark:bg-white/20 hover:bg-slate-400 dark:hover:bg-white/40"
                    }`}
                  />
                );
              })}
            </div>

            {/* Right: Quick Jump Drawer Toggle + Glass Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowDrawer(!showDrawer)}
                className="px-2.5 py-1 rounded-lg bg-slate-100/90 hover:bg-slate-200/90 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] border border-slate-200/90 dark:border-white/10 text-slate-700 dark:text-slate-200 text-[11px] font-medium transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Grid className="w-3 h-3 text-blue-600 dark:text-cyan-400" />
                <span>{isAr ? `كافة العروض (${total})` : `All Offers (${total})`}</span>
              </button>

              <div className="flex items-center gap-1 bg-slate-100/90 dark:bg-white/[0.08] p-0.5 rounded-lg border border-slate-200/90 dark:border-white/10 shadow-xs">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label={isAr ? "السابق" : "Previous"}
                  className="w-6 h-6 rounded flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                >
                  <PrevIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  aria-label={isPaused ? "Play" : "Pause"}
                  className="w-6 h-6 rounded flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                >
                  {isPaused ? <Play className="w-2.5 h-2.5 text-blue-600 dark:text-cyan-400" /> : <Pause className="w-2.5 h-2.5 text-slate-500 dark:text-slate-400" />}
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label={isAr ? "التالي" : "Next"}
                  className="w-6 h-6 rounded flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                >
                  <NextIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. Instant Access Multi-Item Drawer Grid */}
        {showDrawer && total > 1 && (
          <div className="mt-3 p-3.5 rounded-2xl bg-white/95 dark:bg-[#040a16]/95 border border-slate-300/90 dark:border-cyan-500/30 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between mb-2.5 px-1 text-[11px] font-bold text-slate-800 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-blue-600 dark:text-cyan-400" />
                <span>{isAr ? "اختر العرض المطلوب للانتقال الفوري:" : "Jump directly to campaign:"}</span>
              </span>
              <button
                type="button"
                onClick={() => setShowDrawer(false)}
                className="w-5 h-5 rounded-md flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 text-xs"
              >
                ✕
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 p-1 scrollbar-thin">
              {items.map((it, idx) => {
                const isSel = idx === activeIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveIndex(idx);
                      setProgress(0);
                      setShowDrawer(false);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-start text-[11px] font-medium truncate border transition-all flex items-center gap-1.5 ${
                      isSel
                        ? "bg-blue-600 text-white dark:bg-cyan-500 dark:text-slate-950 font-bold border-blue-600 dark:border-cyan-400 shadow-sm"
                        : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-white/[0.04] dark:text-slate-300 dark:border-white/10 dark:hover:bg-white/10 dark:hover:text-white"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSel ? "bg-white dark:bg-slate-950" : "bg-blue-500 dark:bg-cyan-400"}`} />
                    <span className="truncate">{isAr ? it.titleAr || it.titleEn : it.titleEn || it.titleAr}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
