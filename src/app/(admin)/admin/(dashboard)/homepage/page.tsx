"use client";

import { SITE_CONTACTS } from "@/lib/site-contacts";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { uploadStoreImage } from "@/lib/upload-store-image";
import "./homepage-manager.css";

interface SlideItem {
  id: number | string;
  image: string;
  link: string;
  alt: string;
}

interface SideMenuItem {
  icon: string;
  text: string;
  link: string;
}

interface ItemCard {
  title: string;
  image: string;
  href: string;
  query: string;
}

interface BannerItem {
  image: string;
  alt: string;
  link: string;
}

interface HomepageConfig {
  announcementBar: {
    enabled: boolean;
    title: string;
    linkText: string;
    linkUrl: string;
  };
  heroSlider: SlideItem[];
  sideMenu: SideMenuItem[];
  searchPlaceholder: string;
  banner1: BannerItem;
  gamesGroup1: ItemCard[];
  banner2: BannerItem;
  gamesGroup2: ItemCard[];
  banner3: BannerItem;
  digitalCards: ItemCard[];
  subscriptionsCard: {
    image: string;
    title: string;
    description: string;
    buttonText: string;
    buttonUrl: string;
  };
  floatingWhatsapp: {
    enabled: boolean;
    phone: string;
    label: string;
  };
  appModal: {
    enabled: boolean;
    title: string;
    description: string;
    buttonText: string;
    downloadUrl: string;
  };
}

const DEFAULT_CONFIG: HomepageConfig = {
  announcementBar: {
    enabled: true,
    title: "تطبيق BORAI STORE:",
    linkText: "لتحميل تطبيقنا اضغط هنا",
    linkUrl: "#"
  },
  heroSlider: [
    { id: 1, image: "/images/zoalna/slide_1.png", link: "/services", alt: "شريحة 1" },
    { id: 2, image: "/images/zoalna/slide_2.png", link: "/services?cat=imei", alt: "شريحة 2" },
    { id: 3, image: "/images/zoalna/slide_3.png", link: "/services?cat=server", alt: "شريحة 3" }
  ],
  sideMenu: [
    { icon: "account", text: "الحساب", link: "/profile" },
    { icon: "wallet", text: "المحفظة", link: "/wallet" },
    { icon: "orders", text: "الطلبات", link: "/orders" }
  ],
  searchPlaceholder: "ابحث عن لعبتك أو بطاقتك المفضلة (فري فاير، ببجي، ايتونز، ستيم...)",
  banner1: {
    image: "/images/zoalna/banner_hero_1.webp",
    alt: "شحن الألعاب الفوري",
    link: ""
  },
  gamesGroup1: [
    { title: "فري فاير", image: "/images/zoalna/game_freefire.webp", href: "/services?search=Free%20Fire", query: "فري فاير free fire" },
    { title: "ببجي موبايل", image: "/images/zoalna/game_pubg.webp", href: "/services?search=PUBG", query: "ببجي pubg mobile" },
    { title: "موبايل ليجند", image: "/images/zoalna/game_mobilelegends.webp", href: "/services?search=Mobile%20Legends", query: "موبايل ليجند mobile legends" },
    { title: "جنشن امباكت", image: "/images/zoalna/game_genshin.webp", href: "/services?search=Genshin", query: "جنشن genshin impact" },
    { title: "يلا ليدو", image: "/images/zoalna/game_yallaludo.webp", href: "/services?search=Yalla%20Ludo", query: "يلا ليدو yalla ludo" },
    { title: "جواكر", image: "/images/zoalna/game_jawaker.webp", href: "/services?search=Jawaker", query: "جواكر jawaker" },
    { title: "لوردس موبايل", image: "/images/zoalna/game_lordsmobile.webp", href: "/services?search=Lords%20Mobile", query: "لوردس lords mobile" },
    { title: "بلود استريك", image: "/images/zoalna/game_bloodstrike.webp", href: "/services?search=Blood%20Strike", query: "بلود استريك blood strike" },
    { title: "فيزا", image: "/images/zoalna/game_redotpay.webp", href: "/services?search=Visa", query: "فيزا redotpay visa" }
  ],
  banner2: {
    image: "/images/zoalna/banner_hero_2.webp",
    alt: "عروض وتحديثات الألعاب",
    link: ""
  },
  gamesGroup2: [
    { title: "كلاش اوف كلانس", image: "/images/zoalna/game_clashofclans.webp", href: "/services?search=Clash%20of%20Clans", query: "كلاش اوف كلانس clash of clans" },
    { title: "كلاش رويال", image: "/images/zoalna/game_clashroyale.webp", href: "/services?search=Clash%20Royale", query: "كلاش رويال clash royale" },
    { title: "فيفا موبايل", image: "/images/zoalna/game_fifa.webp", href: "/services?search=FC%20Mobile", query: "فيفا fifa ea fc mobile" },
    { title: "بيس موبايل", image: "/images/zoalna/game_pes.webp", href: "/services?search=eFootball", query: "بيس pes efootball mobile" },
    { title: "براول ستارز", image: "/images/zoalna/game_brawlstars.webp", href: "/services?search=Brawl%20Stars", query: "براول ستارز brawl stars" },
    { title: "تيك توك", image: "/images/zoalna/game_tiktok.webp", href: "/services?search=TikTok", query: "تيك توك tiktok coins" },
    { title: "تجديد استارلينك", image: "/images/zoalna/game_starlink.webp", href: "/services?search=Starlink", query: "استارلينك starlink internet" }
  ],
  banner3: {
    image: "/images/zoalna/banner_hero_3.webp",
    alt: "كروت الألعاب والاشتراكات",
    link: ""
  },
  digitalCards: [
    { title: "كروت ايتونز", image: "/images/zoalna/card_itunes.webp", href: "/services?search=iTunes", query: "ايتونز itunes apple" },
    { title: "ريزر جولد", image: "/images/zoalna/card_razergold.webp", href: "/services?search=Razer%20Gold", query: "ريزر جولد razer gold" },
    { title: "كروت استيم", image: "/images/zoalna/card_steam.webp", href: "/services?search=Steam", query: "استيم steam wallet" },
    { title: "كروت بلايستيشن", image: "/images/zoalna/card_playstation.webp", href: "/services?search=PlayStation", query: "بلايستيشن playstation psn" },
    { title: "كروت اكس بوكس", image: "/images/zoalna/card_xbox.webp", href: "/services?search=Xbox", query: "اكس بوكس xbox live" }
  ],
  subscriptionsCard: {
    image: "/images/zoalna/card_subscriptions.webp",
    title: "الاشتراكات الرقمية",
    description: "خدمات بث، موسيقى، ترفيه وألعاب… معالجة سريعة ودعم فني.",
    buttonText: "تصفح الآن",
    buttonUrl: "/services?cat=store"
  },
  floatingWhatsapp: {
    enabled: true,
    phone: SITE_CONTACTS.phone,
    label: "واتساب"
  },
  appModal: {
    enabled: true,
    title: "جرّب تطبيق BORAI STORE الجديد!",
    description: "تم إطلاق التحديث الجديد لتجربة شحن أسرع، متابعة لحظية لطلباتك، وإشعارات مباشرة بمحفظتك.",
    buttonText: "تنزيل التطبيق الآن",
    downloadUrl: "#"
  }
};

type ActiveTab =
  | "announcement"
  | "hero"
  | "search_banner1"
  | "games1"
  | "banner2_games2"
  | "banner3_cards"
  | "subscriptions_whatsapp";

function normalizeHomepageLinks(value: any): any {
  if (Array.isArray(value)) return value.map(normalizeHomepageLinks);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => {
    if (["link", "href", "buttonUrl"].includes(key) && typeof entry === "string" && /^\/(?:ar\/|en\/)?pricing(?:[/?#]|$)/.test(entry)) {
      const query = new URL(entry, "http://local").searchParams.get("search");
      return [key, query && /pubg/i.test(query) ? "/product/pubg-id" : query && /free.?fire/i.test(query) ? "/product/free-fire-id" : query ? `/services?search=${encodeURIComponent(query)}` : "/services"];
    }
    return [key, normalizeHomepageLinks(entry)];
  }));
}

export default function AdminHomepageManager() {
  const [config, setConfig] = useState<HomepageConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [itemSearch, setItemSearch] = useState("");
  const [savedConfig, setSavedConfig] = useState("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("hero");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingUploadCallback = useRef<((url: string) => void) | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getAuthToken = () => {
    if (typeof window === "undefined") return null;
    let token =
      localStorage.getItem("admin_token") ||
      localStorage.getItem("user_token") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("admin_token");
    if (!token && document.cookie) {
      const match = document.cookie.match(/(?:^|;\s*)admin_token=([^;]+)/);
      if (match) token = decodeURIComponent(match[1]);
    }
    return token;
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/homepage");
        if (!res.ok) throw new Error("Unable to load homepage configuration");
        if (res.ok) {
          const data = normalizeHomepageLinks(await res.json());
          setConfig({
            announcementBar: { ...DEFAULT_CONFIG.announcementBar, ...data.announcementBar },
            heroSlider: Array.isArray(data.heroSlider) && data.heroSlider.length > 0 ? data.heroSlider : DEFAULT_CONFIG.heroSlider,
            sideMenu: Array.isArray(data.sideMenu) && data.sideMenu.length > 0 ? data.sideMenu : DEFAULT_CONFIG.sideMenu,
            searchPlaceholder: data.searchPlaceholder || DEFAULT_CONFIG.searchPlaceholder,
            banner1: { ...DEFAULT_CONFIG.banner1, ...data.banner1 },
            gamesGroup1: Array.isArray(data.gamesGroup1) && data.gamesGroup1.length > 0 ? data.gamesGroup1 : DEFAULT_CONFIG.gamesGroup1,
            banner2: { ...DEFAULT_CONFIG.banner2, ...data.banner2 },
            gamesGroup2: Array.isArray(data.gamesGroup2) && data.gamesGroup2.length > 0 ? data.gamesGroup2 : DEFAULT_CONFIG.gamesGroup2,
            banner3: { ...DEFAULT_CONFIG.banner3, ...data.banner3 },
            digitalCards: Array.isArray(data.digitalCards) && data.digitalCards.length > 0 ? data.digitalCards : DEFAULT_CONFIG.digitalCards,
            subscriptionsCard: { ...DEFAULT_CONFIG.subscriptionsCard, ...data.subscriptionsCard },
            floatingWhatsapp: { ...DEFAULT_CONFIG.floatingWhatsapp, ...data.floatingWhatsapp },
            appModal: { ...DEFAULT_CONFIG.appModal, ...data.appModal },
          });
        }
      } catch (err) {
        setLoadError(true);
        showToast("تعذر تحميل الإعدادات. أعد تحميل الصفحة قبل التعديل.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = getAuthToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        headers["x-admin-token"] = token;
      }

      const res = await fetch("/api/homepage", {
        method: "POST",
        headers,
        body: JSON.stringify(config),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success !== false) {
        setSavedConfig(JSON.stringify(config));
        showToast("تم حفظ التغييرات ونشرها على الصفحة الرئيسية");
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("homepage_config_updated"));
        }
      } else {
        const errMsg = data?.error || data?.message || "فشل حفظ التغييرات";
        showToast(errMsg, "error");
      }
    } catch (err) {
      showToast("حدث خطأ أثناء الاتصال بالخادم لحفظ الإعدادات", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm("هل أنت متأكد من رغبتك في استعادة جميع الإعدادات الافتراضية للمتجر؟")) {
      setConfig(DEFAULT_CONFIG);
      showToast("تمت استعادة الإعدادات الافتراضية، يرجى الضغط على حفظ لتأكيد التغيير");
    }
  };

  const triggerUpload = (fieldIdentifier: string, onUploaded: (url: string) => void) => {
    setUploadingField(fieldIdentifier);
    pendingUploadCallback.current = onUploaded;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const callback = pendingUploadCallback.current;
    if (!file) { setUploadingField(null); return; }
    try {
      const result = await uploadStoreImage(file, false);
      callback?.(result.url);
      showToast(`تم رفع الصورة وضغطها • ${Math.ceil(result.size / 1024)} كيلوبايت. اضغط حفظ التغييرات لاعتمادها.`);
    } catch (error) { showToast(error instanceof Error ? error.message : "تعذر رفع الصورة", "error"); }
    finally { setUploadingField(null); if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  const sections: { id: ActiveTab; title: string; description: string; image?: string; count?: number }[] = [
    { id: "hero", title: "البانر الرئيسي والاختصارات", description: "أول جزء بيظهر للعميل أعلى الصفحة", image: config.heroSlider[0]?.image, count: config.heroSlider.length },
    { id: "games1", title: "الألعاب في الصف الأول", description: "صور الألعاب وأسماؤها وروابط الشحن", image: config.gamesGroup1[0]?.image, count: config.gamesGroup1.length },
    { id: "search_banner1", title: "بانر العروض الأول والبحث", description: "الصورة العريضة قبل صف الألعاب", image: config.banner1.image },
    { id: "banner2_games2", title: "العروض وباقي الألعاب", description: "البانر الثاني والصف الثاني من الألعاب", image: config.banner2.image, count: config.gamesGroup2.length },
    { id: "banner3_cards", title: "البطاقات الرقمية", description: "بانر البطاقات وصور كروت المتاجر", image: config.banner3.image, count: config.digitalCards.length },
    { id: "subscriptions_whatsapp", title: "الاشتراكات والتواصل", description: "بطاقة الاشتراكات وإعدادات التواصل", image: config.subscriptionsCard.image },
    { id: "announcement", title: "تحميل تطبيق برعي", description: "شريط التثبيت وتنبيه التحميل للزائر" },
  ];
  const currentSection = sections.find(section => section.id === activeTab)!;
  const hasChanges = Boolean(savedConfig) && savedConfig !== JSON.stringify(config);

  useEffect(() => { if (!loading && !savedConfig) setSavedConfig(JSON.stringify(config)); }, [loading, savedConfig, config]);
  useEffect(() => {
    if (!hasChanges) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasChanges]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-400">جاري تحميل إعدادات الصفحة الرئيسية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage-manager space-y-6 pb-20">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {loadError && <p role="alert" className="p-4 rounded-xl border border-red-500/30 text-red-300">تعذر تحميل الإعدادات الحالية. أعد تحميل الصفحة قبل التعديل والحفظ.</p>}
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 left-6 z-50 px-5 py-3 rounded-xl shadow-2xl border text-sm font-bold transition-all flex items-center gap-3 ${
            toastType === "success"
              ? "bg-emerald-950/90 text-emerald-200 border-emerald-800"
              : "bg-rose-950/90 text-rose-200 border-rose-800"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="homepage-save-bar bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white">رتّب الصفحة الرئيسية</h1>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {hasChanges ? "فيه تغييرات لسه متحفظتش" : "التغييرات محفوظة"}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            اختار الجزء من القائمة، عدّل الصورة أو النص، وبعدها اضغط حفظ التغييرات.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link
            href="/ar"
            target="_blank"
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all text-center flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
            </svg>
            معاينة المتجر
          </Link>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-all"
          >
            إرجاع التصميم الافتراضي
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loadError || !hasChanges || Boolean(uploadingField)}
            className="flex-1 md:flex-initial px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                حفظ التغييرات
              </>
            )}
          </button>
        </div>
      </div>

      <div className="homepage-editor-layout">
        <nav className="homepage-section-nav" aria-label="أجزاء الصفحة الرئيسية">
          <p className="text-sm font-bold text-white mb-2">اختار الجزء اللي هتعدّله</p>
          {sections.map((section, index) => <button type="button" key={section.id} onClick={() => { setActiveTab(section.id); setItemSearch(""); }} aria-current={activeTab === section.id ? "step" : undefined} className={`homepage-section-button ${activeTab === section.id ? "is-active" : ""}`}>
            <span className="homepage-section-number">{index + 1}</span><span className="flex-1"><strong>{section.title}</strong><small>{section.description}</small>{section.count !== undefined && <small>{section.count} عنصر</small>}</span>
            {section.image && <img src={section.image} alt="" width={44} height={44} loading="lazy" />}
          </button>)}
          <p className="text-xs text-slate-400 leading-6 mt-4">التعديلات لا تظهر للعميل إلا بعد الضغط على «حفظ التغييرات».</p>
        </nav>
        <div className="homepage-editor-content">
          <div className="homepage-section-guide"><div><span className="text-xs text-blue-400 font-bold">أنت تعدّل الآن</span><h2>{currentSection.title}</h2><p>{currentSection.description}</p></div><ol>{activeTab === "announcement" ? <><li>اختار إظهار شريط التحميل والتنبيه.</li><li>عدّل نص الشريط وزر التثبيت.</li></> : <><li>ارفع الصورة من جهازك.</li><li>عدّل الاسم أو رابط الصفحة التي تفتح عند الضغط.</li></>}<li>احفظ، ثم افتح معاينة المتجر.</li></ol></div>
          {["games1", "banner2_games2", "banner3_cards"].includes(activeTab) && <label className="block rounded-xl border border-slate-700 bg-slate-900 p-4 text-xs text-slate-300">ابحث عن اللعبة أو البطاقة التي تريد تعديلها<input type="search" aria-label="ابحث في عناصر الصفحة الرئيسية" value={itemSearch} onChange={event => setItemSearch(event.target.value)} placeholder="مثلاً: فري فاير أو ببجي" className="block w-full mt-2 p-3 rounded-lg border border-slate-700 bg-slate-950 text-white" /></label>}
      {/* TAB 1: Hero Slider & Side Menu */}
      {activeTab === "hero" && (
        <div className="space-y-6">
          {/* Hero Slider Management */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-white">صور البانر الرئيسي المتحرك</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  الصور الكبيرة في أعلى المتجر. استخدم الأسهم لتغيير ترتيبها.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newId = Date.now();
                  setConfig({
                    ...config,
                    heroSlider: [
                      ...config.heroSlider,
                      { id: newId, image: "/images/zoalna/slide_1.png", link: "/services", alt: `شريحة ${config.heroSlider.length + 1}` },
                    ],
                  });
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
                إضافة شريحة جديدة
              </button>
            </div>

            <div className="space-y-4">
              {config.heroSlider.map((slide, idx) => (
                <div
                  key={slide.id || idx}
                  className="homepage-item-editor bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4"
                >
                  <div className="relative w-full md:w-44 h-24 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 shrink-0">
                    <img src={slide.image} alt={slide.alt} className="w-full h-full object-cover" />
                    <span className="absolute top-1.5 right-1.5 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                  </div>

                  <div className="flex-1 grid grid-cols-1 gap-4 w-full">
                    <div><label className="block text-xs font-bold text-slate-300 mb-2">صورة البانر</label>
                      <button type="button" disabled={Boolean(uploadingField)} className="px-4 py-2.5 rounded-lg bg-blue-600 text-white font-bold text-xs disabled:opacity-40" onClick={() => triggerUpload(`slide_${idx}`, url => { const updated = [...config.heroSlider]; updated[idx] = { ...updated[idx], image: url }; setConfig({ ...config, heroSlider: updated }); })}>{uploadingField === `slide_${idx}` ? "جاري ضغط الصورة ورفعها…" : "اختيار صورة من جهازي"}</button>
                      <details className="mt-2 text-xs text-slate-400"><summary className="cursor-pointer">أو استخدام رابط صورة جاهزة</summary><input type="text" aria-label={`رابط صورة البانر ${idx + 1}`} value={slide.image} onChange={event => { const updated = [...config.heroSlider]; updated[idx] = { ...updated[idx], image: event.target.value }; setConfig({ ...config, heroSlider: updated }); }} className="w-full mt-2 p-2 bg-slate-900 border border-slate-700 rounded-lg" /></details>
                    </div>
                    <div><label className="block text-xs font-bold text-slate-300 mb-2">عند الضغط على البانر، يفتح:</label>
                      <select aria-label={`وجهة البانر ${idx + 1}`} value={slide.link} onChange={event => { const updated = [...config.heroSlider]; updated[idx] = { ...updated[idx], link: event.target.value }; setConfig({ ...config, heroSlider: updated }); }} className="w-full p-2.5 rounded-lg border border-slate-700 bg-slate-900 text-xs text-white">
                        {!["/services", "/product/free-fire-id", "/product/pubg-id", "/services?cat=gamecodes", "/services?cat=subscriptions", "/wallet"].includes(slide.link) && <option value={slide.link}>الوجهة الحالية: {slide.link || "بدون رابط"}</option>}
                        <option value="/services">المتجر — كل الخدمات</option><option value="/product/free-fire-id">صفحة شحن فري فاير</option><option value="/product/pubg-id">صفحة شحن ببجي</option><option value="/services?cat=gamecodes">كروت الألعاب</option><option value="/services?cat=subscriptions">الاشتراكات الرقمية</option><option value="/wallet">المحفظة والشحن</option>
                      </select>
                      <details className="mt-2 text-xs text-slate-400"><summary className="cursor-pointer">إدخال رابط آخر</summary><input type="text" aria-label={`رابط مخصص للبانر ${idx + 1}`} value={slide.link} onChange={event => { const updated = [...config.heroSlider]; updated[idx] = { ...updated[idx], link: event.target.value }; setConfig({ ...config, heroSlider: updated }); }} className="w-full mt-2 p-2 bg-slate-900 border border-slate-700 rounded-lg" /></details>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 self-end md:self-center shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => {
                        const updated = [...config.heroSlider];
                        const temp = updated[idx - 1];
                        updated[idx - 1] = updated[idx];
                        updated[idx] = temp;
                        setConfig({ ...config, heroSlider: updated });
                      }}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30"
                      title="تحريك لأعلى"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      disabled={idx === config.heroSlider.length - 1}
                      onClick={() => {
                        const updated = [...config.heroSlider];
                        const temp = updated[idx + 1];
                        updated[idx + 1] = updated[idx];
                        updated[idx] = temp;
                        setConfig({ ...config, heroSlider: updated });
                      }}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30"
                      title="تحريك لأسفل"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (config.heroSlider.length <= 1) {
                          showToast("يجب أن يحتوي السلايدر على شريحة واحدة على الأقل", "error");
                          return;
                        }
                        const updated = config.heroSlider.filter((_, i) => i !== idx);
                        setConfig({ ...config, heroSlider: updated });
                      }}
                      className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40"
                      title="حذف الشريحة"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side Menu Cards */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <h2 className="text-base font-black text-white">البطاقات الجانبية للسلايدر (Side Menu)</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                البطاقات السريعة الثلاث المجاورة للسلايدر: الحساب، المحفظة، والطلبات.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {config.sideMenu.map((card, idx) => (
                <div key={idx} className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-400">بطاقة #{idx + 1}</span>
                    <select
                      value={card.icon}
                      onChange={(e) => {
                        const updated = [...config.sideMenu];
                        updated[idx].icon = e.target.value;
                        setConfig({ ...config, sideMenu: updated });
                      }}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300"
                    >
                      <option value="account">أيقونة الحساب</option>
                      <option value="wallet">أيقونة المحفظة</option>
                      <option value="orders">أيقونة الطلبات</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">النص الظاهر</label>
                    <input
                      type="text"
                      value={card.text}
                      onChange={(e) => {
                        const updated = [...config.sideMenu];
                        updated[idx].text = e.target.value;
                        setConfig({ ...config, sideMenu: updated });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">رابط التوجيه</label>
                    <input
                      type="text"
                      value={card.link}
                      onChange={(e) => {
                        const updated = [...config.sideMenu];
                        updated[idx].link = e.target.value;
                        setConfig({ ...config, sideMenu: updated });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Announcement Bar & App Download Modal */}
      {activeTab === "announcement" && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5">
            <h2 className="text-lg font-bold text-white">شريط تحميل تطبيق برعي</h2>
            <p className="text-xs leading-7 text-slate-400">الشريط أعلى المتجر مسؤول عن تثبيت التطبيق على جهاز العميل. زر التثبيت يفتح طلب المتصفح الحقيقي عند جاهزيته. في المتصفح غير الداعم تظهر رسالة توضح عدم إتاحة التثبيت المباشر.</p>
            <label className="flex items-center gap-3 text-sm text-white"><input type="checkbox" checked={config.announcementBar.enabled} onChange={event => setConfig({ ...config, announcementBar: { ...config.announcementBar, enabled: event.target.checked } })} />إظهار شريط تحميل التطبيق</label>
            <label className="block text-xs text-slate-300">النص الظاهر في الشريط<input type="text" value={config.announcementBar.title} onChange={event => setConfig({ ...config, announcementBar: { ...config.announcementBar, title: event.target.value } })} className="block w-full mt-2 bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" /></label>
            <label className="block text-xs text-slate-300">نص زر التحميل<input type="text" value={config.announcementBar.linkText} onChange={event => setConfig({ ...config, announcementBar: { ...config.announcementBar, linkText: event.target.value } })} className="block w-full mt-2 bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" /></label>
            <p className="rounded-xl bg-blue-600/10 p-4 text-xs leading-7 text-blue-200">التثبيت مرتبط بالموقع تلقائياً، ويستخدم شعار برعي كأيقونة للتطبيق. لا تحتاج لإضافة رابط تحميل خارجي.</p>
          </section>
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">تنبيه تحميل التطبيق للزوار</h2>
            <label className="flex items-center gap-3 text-sm text-white"><input type="checkbox" checked={config.appModal.enabled} onChange={event => setConfig({ ...config, appModal: { ...config.appModal, enabled: event.target.checked } })} />إظهار تنبيه «حمّل تطبيق برعي» تلقائياً</label>
            <p className="text-xs text-slate-400 leading-7">تظهر نافذة باسم وشعار برعي وزر «تثبيت التطبيق الآن» بعد ٨ ثوانٍ من جاهزية التثبيت الحقيقي. إذا أغلقها العميل لا تتكرر لمدة أسبوع، وتختفي عند فتح التطبيق المثبّت.</p>
          </section>
        </div>
      )}

      {/* TAB 3: Search Bar & Banner 1 */}
      {activeTab === "search_banner1" && (
        <div className="space-y-6">
          {/* Search Placeholder */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
            <h2 className="text-base font-black text-white">نص شريط البحث الرئيسي</h2>
            <p className="text-xs text-slate-400">
              النص التوضيحي الذي يظهر داخل خانة البحث المباشرة في الصفحة الرئيسية.
            </p>
            <input
              type="text"
              value={config.searchPlaceholder}
              onChange={(e) => setConfig({ ...config, searchPlaceholder: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white"
            />
          </div>

          {/* Banner 1 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <h2 className="text-base font-black text-white">البانر الإعلاني الأول (Banner 1)</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                البانر الفاصل الظاهر أسفل شريط البحث وفوق المجموعة الأولى من الألعاب.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-5 items-start">
              <div className="relative w-full md:w-80 h-36 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shrink-0">
                <img src={config.banner1.image} alt={config.banner1.alt} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 space-y-3 w-full">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">مسار صورة البانر</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={config.banner1.image}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          banner1: { ...config.banner1, image: e.target.value },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        triggerUpload("banner1", (url) => {
                          setConfig({ ...config, banner1: { ...config.banner1, image: url } });
                        })
                      }
                      disabled={uploadingField === "banner1"}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold shrink-0 transition-all"
                    >
                      {uploadingField === "banner1" ? "جاري الرفع..." : "رفع صورة"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">النص البديل (Alt)</label>
                    <input
                      type="text"
                      value={config.banner1.alt}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          banner1: { ...config.banner1, alt: e.target.value },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">رابط النقر الاختياري</label>
                    <input
                      type="text"
                      value={config.banner1.link}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          banner1: { ...config.banner1, link: e.target.value },
                        })
                      }
                      placeholder="/services"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Games Group 1 */}
      {activeTab === "games1" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-white">شبكة الألعاب - المجموعة الأولى</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                تضم الألعاب الأكثر شهرة (فري فاير، ببجي، موبايل ليجند، جنشن، يلا ليدو، جواكر، لوردس، بلود استريك، فيزا).
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setConfig({
                  ...config,
                  gamesGroup1: [
                    ...config.gamesGroup1,
                    {
                      title: "لعبة جديدة",
                      image: "/images/zoalna/game_freefire.webp",
                      href: "/services",
                      query: "لعبة new game",
                    },
                  ],
                });
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
              إضافة عنصر جديد
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {config.gamesGroup1.map((item, idx) => ({ item, idx })).filter(({ item }) => !itemSearch || item.title.toLowerCase().includes(itemSearch.toLowerCase())).map(({ item, idx }) => (
              <div
                key={idx}
                className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-3 relative group"
              >
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                  <span className="text-[11px] font-bold text-slate-400">عنصر #{idx + 1}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => {
                        const updated = [...config.gamesGroup1];
                        const temp = updated[idx - 1];
                        updated[idx - 1] = updated[idx];
                        updated[idx] = temp;
                        setConfig({ ...config, gamesGroup1: updated });
                      }}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                      title="تحريك للأمام"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                        <path d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      disabled={idx === config.gamesGroup1.length - 1}
                      onClick={() => {
                        const updated = [...config.gamesGroup1];
                        const temp = updated[idx + 1];
                        updated[idx + 1] = updated[idx];
                        updated[idx] = temp;
                        setConfig({ ...config, gamesGroup1: updated });
                      }}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                      title="تحريك للخلف"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = config.gamesGroup1.filter((_, i) => i !== idx);
                        setConfig({ ...config, gamesGroup1: updated });
                      }}
                      className="p-1 text-rose-400 hover:text-rose-300"
                      title="حذف"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                        <path d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shrink-0">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-400 mb-0.5">اسم اللعبة / العنصر</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const updated = [...config.gamesGroup1];
                        updated[idx].title = e.target.value;
                        setConfig({ ...config, gamesGroup1: updated });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-0.5">رابط الصورة</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={item.image}
                      onChange={(e) => {
                        const updated = [...config.gamesGroup1];
                        updated[idx].image = e.target.value;
                        setConfig({ ...config, gamesGroup1: updated });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-white"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        triggerUpload(`g1_${idx}`, (url) => {
                          const updated = [...config.gamesGroup1];
                          updated[idx].image = url;
                          setConfig({ ...config, gamesGroup1: updated });
                        })
                      }
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg border border-slate-700 shrink-0"
                    >
                      رفع
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-0.5">رابط التوجيه (Href)</label>
                  <input
                    type="text"
                    value={item.href}
                    onChange={(e) => {
                      const updated = [...config.gamesGroup1];
                      updated[idx].href = e.target.value;
                      setConfig({ ...config, gamesGroup1: updated });
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-0.5">كلمات البحث للفلترة (Query)</label>
                  <input
                    type="text"
                    value={item.query}
                    onChange={(e) => {
                      const updated = [...config.gamesGroup1];
                      updated[idx].query = e.target.value;
                      setConfig({ ...config, gamesGroup1: updated });
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Banner 2 & Games Group 2 */}
      {activeTab === "banner2_games2" && (
        <div className="space-y-6">
          {/* Banner 2 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <h2 className="text-base font-black text-white">البانر الإعلاني الثاني (Banner 2)</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                البانر الفاصل بين المجموعة الأولى والمجموعة الثانية من الألعاب.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-5 items-start">
              <div className="relative w-full md:w-80 h-36 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shrink-0">
                <img src={config.banner2.image} alt={config.banner2.alt} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 space-y-3 w-full">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">مسار صورة البانر</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={config.banner2.image}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          banner2: { ...config.banner2, image: e.target.value },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        triggerUpload("banner2", (url) => {
                          setConfig({ ...config, banner2: { ...config.banner2, image: url } });
                        })
                      }
                      disabled={uploadingField === "banner2"}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold shrink-0 transition-all"
                    >
                      {uploadingField === "banner2" ? "جاري الرفع..." : "رفع صورة"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">النص البديل (Alt)</label>
                    <input
                      type="text"
                      value={config.banner2.alt}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          banner2: { ...config.banner2, alt: e.target.value },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">رابط النقر الاختياري</label>
                    <input
                      type="text"
                      value={config.banner2.link}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          banner2: { ...config.banner2, link: e.target.value },
                        })
                      }
                      placeholder="/services"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Games Group 2 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-white">شبكة الألعاب - المجموعة الثانية</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  تضم ألعاب وتطبيقات: كلاش اوف كلانس، كلاش رويال، فيفا موبايل، بيس، براول ستارز، تيك توك، وتجديد استارلينك.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setConfig({
                    ...config,
                    gamesGroup2: [
                      ...config.gamesGroup2,
                      {
                        title: "لعبة جديدة",
                        image: "/images/zoalna/game_clashofclans.webp",
                        href: "/services",
                        query: "لعبة new game",
                      },
                    ],
                  });
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
                إضافة عنصر جديد
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {config.gamesGroup2.map((item, idx) => ({ item, idx })).filter(({ item }) => !itemSearch || item.title.toLowerCase().includes(itemSearch.toLowerCase())).map(({ item, idx }) => (
                <div
                  key={idx}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                    <span className="text-[11px] font-bold text-slate-400">عنصر #{idx + 1}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => {
                          const updated = [...config.gamesGroup2];
                          const temp = updated[idx - 1];
                          updated[idx - 1] = updated[idx];
                          updated[idx] = temp;
                          setConfig({ ...config, gamesGroup2: updated });
                        }}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                        title="تحريك للأمام"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                          <path d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        disabled={idx === config.gamesGroup2.length - 1}
                        onClick={() => {
                          const updated = [...config.gamesGroup2];
                          const temp = updated[idx + 1];
                          updated[idx + 1] = updated[idx];
                          updated[idx] = temp;
                          setConfig({ ...config, gamesGroup2: updated });
                        }}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                        title="تحريك للخلف"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                          <path d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = config.gamesGroup2.filter((_, i) => i !== idx);
                          setConfig({ ...config, gamesGroup2: updated });
                        }}
                        className="p-1 text-rose-400 hover:text-rose-300"
                        title="حذف"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                          <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shrink-0">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 mb-0.5">اسم اللعبة / العنصر</label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const updated = [...config.gamesGroup2];
                          updated[idx].title = e.target.value;
                          setConfig({ ...config, gamesGroup2: updated });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-0.5">رابط الصورة</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={item.image}
                        onChange={(e) => {
                          const updated = [...config.gamesGroup2];
                          updated[idx].image = e.target.value;
                          setConfig({ ...config, gamesGroup2: updated });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-white"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          triggerUpload(`g2_${idx}`, (url) => {
                            const updated = [...config.gamesGroup2];
                            updated[idx].image = url;
                            setConfig({ ...config, gamesGroup2: updated });
                          })
                        }
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg border border-slate-700 shrink-0"
                      >
                        رفع
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-0.5">رابط التوجيه (Href)</label>
                    <input
                      type="text"
                      value={item.href}
                      onChange={(e) => {
                        const updated = [...config.gamesGroup2];
                        updated[idx].href = e.target.value;
                        setConfig({ ...config, gamesGroup2: updated });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-0.5">كلمات البحث للفلترة (Query)</label>
                    <input
                      type="text"
                      value={item.query}
                      onChange={(e) => {
                        const updated = [...config.gamesGroup2];
                        updated[idx].query = e.target.value;
                        setConfig({ ...config, gamesGroup2: updated });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Banner 3 & Digital Cards */}
      {activeTab === "banner3_cards" && (
        <div className="space-y-6">
          {/* Banner 3 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <h2 className="text-base font-black text-white">البانر الإعلاني الثالث (Banner 3)</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                البانر الفاصل بين الألعاب والبطاقات الرقمية الترفيهية.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-5 items-start">
              <div className="relative w-full md:w-80 h-36 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shrink-0">
                <img src={config.banner3.image} alt={config.banner3.alt} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 space-y-3 w-full">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">مسار صورة البانر</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={config.banner3.image}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          banner3: { ...config.banner3, image: e.target.value },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        triggerUpload("banner3", (url) => {
                          setConfig({ ...config, banner3: { ...config.banner3, image: url } });
                        })
                      }
                      disabled={uploadingField === "banner3"}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold shrink-0 transition-all"
                    >
                      {uploadingField === "banner3" ? "جاري الرفع..." : "رفع صورة"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">النص البديل (Alt)</label>
                    <input
                      type="text"
                      value={config.banner3.alt}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          banner3: { ...config.banner3, alt: e.target.value },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">رابط النقر الاختياري</label>
                    <input
                      type="text"
                      value={config.banner3.link}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          banner3: { ...config.banner3, link: e.target.value },
                        })
                      }
                      placeholder="/services"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Digital Cards */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-white">شبكة البطاقات الرقمية (Digital Cards)</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  بطاقات الهدايا والشحن الإلكتروني: ايتونز، ريزر جولد، ستيم، بلايستيشن، واكس بوكس.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setConfig({
                    ...config,
                    digitalCards: [
                      ...config.digitalCards,
                      {
                        title: "بطاقة جديدة",
                        image: "/images/zoalna/card_itunes.webp",
                        href: "/services",
                        query: "بطاقة new card",
                      },
                    ],
                  });
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
                إضافة بطاقة جديدة
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {config.digitalCards.map((item, idx) => ({ item, idx })).filter(({ item }) => !itemSearch || item.title.toLowerCase().includes(itemSearch.toLowerCase())).map(({ item, idx }) => (
                <div
                  key={idx}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                    <span className="text-[11px] font-bold text-slate-400">بطاقة #{idx + 1}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => {
                          const updated = [...config.digitalCards];
                          const temp = updated[idx - 1];
                          updated[idx - 1] = updated[idx];
                          updated[idx] = temp;
                          setConfig({ ...config, digitalCards: updated });
                        }}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                        title="تحريك للأمام"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                          <path d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        disabled={idx === config.digitalCards.length - 1}
                        onClick={() => {
                          const updated = [...config.digitalCards];
                          const temp = updated[idx + 1];
                          updated[idx + 1] = updated[idx];
                          updated[idx] = temp;
                          setConfig({ ...config, digitalCards: updated });
                        }}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                        title="تحريك للخلف"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                          <path d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = config.digitalCards.filter((_, i) => i !== idx);
                          setConfig({ ...config, digitalCards: updated });
                        }}
                        className="p-1 text-rose-400 hover:text-rose-300"
                        title="حذف"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                          <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shrink-0">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 mb-0.5">اسم البطاقة</label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const updated = [...config.digitalCards];
                          updated[idx].title = e.target.value;
                          setConfig({ ...config, digitalCards: updated });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-0.5">رابط الصورة</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={item.image}
                        onChange={(e) => {
                          const updated = [...config.digitalCards];
                          updated[idx].image = e.target.value;
                          setConfig({ ...config, digitalCards: updated });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-white"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          triggerUpload(`card_${idx}`, (url) => {
                            const updated = [...config.digitalCards];
                            updated[idx].image = url;
                            setConfig({ ...config, digitalCards: updated });
                          })
                        }
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg border border-slate-700 shrink-0"
                      >
                        رفع
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-0.5">رابط التوجيه (Href)</label>
                    <input
                      type="text"
                      value={item.href}
                      onChange={(e) => {
                        const updated = [...config.digitalCards];
                        updated[idx].href = e.target.value;
                        setConfig({ ...config, digitalCards: updated });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-0.5">كلمات البحث للفلترة (Query)</label>
                    <input
                      type="text"
                      value={item.query}
                      onChange={(e) => {
                        const updated = [...config.digitalCards];
                        updated[idx].query = e.target.value;
                        setConfig({ ...config, digitalCards: updated });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: Subscriptions Promo & Floating WhatsApp */}
      {activeTab === "subscriptions_whatsapp" && (
        <div className="space-y-6">
          {/* Subscriptions Mini Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <h2 className="text-base font-black text-white">بطاقة ترويج الاشتراكات الرقمية (Subscriptions Card)</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                البطاقة الأفقية المميزة الظاهرة أسفل البطاقات الرقمية.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-5 items-start">
              <div className="relative w-full md:w-56 h-36 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shrink-0">
                <img
                  src={config.subscriptionsCard.image}
                  alt={config.subscriptionsCard.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-3 w-full">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">مسار صورة البطاقة</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={config.subscriptionsCard.image}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          subscriptionsCard: { ...config.subscriptionsCard, image: e.target.value },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        triggerUpload("subscriptions", (url) => {
                          setConfig({
                            ...config,
                            subscriptionsCard: { ...config.subscriptionsCard, image: url },
                          });
                        })
                      }
                      disabled={uploadingField === "subscriptions"}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold shrink-0 transition-all"
                    >
                      {uploadingField === "subscriptions" ? "جاري الرفع..." : "رفع صورة"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">عنوان البطاقة</label>
                    <input
                      type="text"
                      value={config.subscriptionsCard.title}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          subscriptionsCard: { ...config.subscriptionsCard, title: e.target.value },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">نص الزر</label>
                    <input
                      type="text"
                      value={config.subscriptionsCard.buttonText}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          subscriptionsCard: { ...config.subscriptionsCard, buttonText: e.target.value },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">النص الوصفي</label>
                    <input
                      type="text"
                      value={config.subscriptionsCard.description}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          subscriptionsCard: { ...config.subscriptionsCard, description: e.target.value },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">رابط الزر (Button URL)</label>
                    <input
                      type="text"
                      value={config.subscriptionsCard.buttonUrl}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          subscriptionsCard: { ...config.subscriptionsCard, buttonUrl: e.target.value },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating WhatsApp Widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-white">زر واتساب العائم (Floating WhatsApp)</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  الزر العائم في أسفل الشاشة للتواصل المباشر مع الدعم الفني.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.floatingWhatsapp.enabled}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      floatingWhatsapp: { ...config.floatingWhatsapp, enabled: e.target.checked },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="mr-3 text-xs font-bold text-slate-300">
                  {config.floatingWhatsapp.enabled ? "مفعل" : "معطل"}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">رقم هاتف واتساب بالصيغة الدولية</label>
                <input
                  type="text"
                  value={config.floatingWhatsapp.phone}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      floatingWhatsapp: { ...config.floatingWhatsapp, phone: e.target.value },
                    })
                  }
                  placeholder={SITE_CONTACTS.phone}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">النص الظاهر بجانب الأيقونة</label>
                <input
                  type="text"
                  value={config.floatingWhatsapp.label}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      floatingWhatsapp: { ...config.floatingWhatsapp, label: e.target.value },
                    })
                  }
                  placeholder="واتساب"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
