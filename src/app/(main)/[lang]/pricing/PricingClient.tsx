"use client";

import { useState, useEffect, useMemo, useRef, useDeferredValue } from "react";
import { categoryMatchesFilter, createInitialCollapsedGroups, sortDisplayGroups } from "../../../../lib/pricing-groups";
import { getProviderServiceType } from "@/lib/provider-service-types";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { stripEmojis } from "@/utils/cleanHtml";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, LoaderCircle, ArrowUpRight } from "lucide-react";

function getServicePriceInfo(service: any) {
  const credit = typeof service.credit === 'number' ? service.credit : parseFloat(service.credit) || 0;
  const margin = typeof service.margin === 'number' ? service.margin : parseFloat(service.margin) || 0;
  const finalPrice = service.finalPrice ?? service.price ?? (credit + margin);
  const priceNum = typeof finalPrice === 'number' ? finalPrice : parseFloat(finalPrice) || 0;
  
  const nameLower = (service.name || '').toLowerCase();
  const isFree = priceNum === 0 && (nameLower.includes('free') || service.name?.includes('مجاني') || service.name?.includes('مجانا'));
  const isZeroCost = priceNum === 0 && !isFree;

  return { priceNum, isFree, isZeroCost };
}

function RenderPriceBadge({ service, lang, discountPercent = 0 }: { service: any; lang: string; discountPercent?: number }) {
  const { priceNum, isFree, isZeroCost } = getServicePriceInfo(service);

  if (priceNum > 0) {
    if (discountPercent > 0) {
      const discountedPrice = Number((priceNum * (1 - discountPercent / 100)).toFixed(2));
      return (
        <div className="flex flex-col items-start sm:items-end">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 dark:text-slate-500 line-through font-mono">
              ${priceNum.toFixed(2)}
            </span>
            <span className="font-mono text-blue-600 dark:text-blue-400 font-bold text-base">
              ${discountedPrice.toFixed(2)}
            </span>
          </div>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold font-mono">
            {lang === 'ar' ? `-${discountPercent}% خصم VIP` : `-${discountPercent}% VIP`}
          </span>
        </div>
      );
    }

    return (
      <span className="font-mono text-blue-600 dark:text-blue-400 font-bold text-base mt-0.5">
        ${priceNum.toFixed(2)}
      </span>
    );
  }

  if (isFree) {
    return (
      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 font-bold text-xs inline-flex items-center gap-1">
        <span>{lang === 'ar' ? 'مجاناً' : 'Free'}</span>
      </span>
    );
  }

  return (
    <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 font-bold text-xs inline-flex items-center gap-1">
      <span>{lang === 'ar' ? 'سعر خاص' : 'On Request'}</span>
    </span>
  );
}

function ServicesListRenderer({ servicesList, lang, dict, discountPercent = 0 }: { servicesList: any[], lang: string, dict: any, discountPercent?: number }) {
  const [limit, setLimit] = useState(40);
  const displayedServices = servicesList.length > 50 ? servicesList.slice(0, limit) : servicesList;
  const hasMore = servicesList.length > displayedServices.length;

  const { addToCart, setIsCartOpen } = useCart();
  const [isAddingId, setIsAddingId] = useState<string | null>(null);

  const handleAddServiceToCart = async (service: any) => {
    const { priceNum } = getServicePriceInfo(service);
    const discounted = discountPercent > 0 ? Number((priceNum * (1 - discountPercent / 100)).toFixed(2)) : priceNum;

    setIsAddingId(service.id);
    try {
      await addToCart({
        serviceId: service.id,
        serviceName: stripEmojis(service.name),
        groupName: stripEmojis(service.groupName || ""),
        targetInput: "",
        quantity: 1,
        price: discounted,
      });
      setIsCartOpen(true);
    } finally {
      setIsAddingId(null);
    }
  };

  return (
    <div className="w-full">

      {/* Mobile View: Clean stacked cards with ZERO horizontal scrolling */}
      <div className="divide-y divide-slate-100 dark:divide-white/5 sm:hidden">
        {displayedServices.map((service: any) => (
          <div key={service.id} className="p-4 flex flex-col gap-3 hover:bg-slate-50/70 dark:hover:bg-surface-container-high/70 dark:hover:bg-surface-container-high/40 transition-colors">
            <div className="font-semibold dark:text-white text-sm sm:text-base leading-snug">
              {stripEmojis(service.name)}
            </div>
            <div className="flex items-center justify-between gap-2 pt-2 border-t dark:border-white/5">
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs text-blue-600 dark:text-blue-400">schedule</span>
                  {service.time || "1-24 Hours"}
                </span>
                <RenderPriceBadge service={service} lang={lang} discountPercent={discountPercent} />
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAddServiceToCart(service)}
                  disabled={isAddingId === service.id}
                  className="py-2 px-3 text-xs rounded-xl border border-blue-600/40 hover:border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-50 dark:hover:bg-blue-900/40 font-bold inline-flex items-center gap-1 transition-all active:scale-95 disabled:opacity-50"
                  title={lang === 'ar' ? 'إضافة إلى السلة' : 'Add to Cart'}
                >
                  {isAddingId === service.id ? (
                    <LoaderCircle size={14} className="animate-spin" />
                  ) : (
                    <ShoppingBag size={14} />
                  )}
                  <span>{lang === 'ar' ? 'السلة' : 'Cart'}</span>
                </button>
                <Link 
                  href={`/${lang}/purchase?serviceId=${service.id}`}
                  className="btn-primary py-2 px-3.5 text-xs rounded-xl inline-flex items-center gap-1 shadow-sm hover:scale-[1.02] transition-transform font-bold"
                >
                  <span>{dict.pricing?.order || "اطلب"}</span>
                  <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop / Tablet View: Wide Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="dark:bg-background border-b dark:border-white/10">
              <th className={`py-3.5 px-6 font-semibold text-xs text-slate-600 dark:text-slate-300 uppercase ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{dict.pricing?.serviceName || "اسم الخدمة"}</th>
              <th className={`py-3.5 px-6 font-semibold text-xs text-slate-600 dark:text-slate-300 uppercase ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{dict.pricing?.deliveryTime || "وقت التسليم"}</th>
              <th className={`py-3.5 px-6 font-semibold text-xs text-slate-600 dark:text-slate-300 uppercase ${lang === 'ar' ? 'text-left' : 'text-right'}`}>{dict.pricing?.price || "السعر"}</th>
              <th className="py-3.5 px-6 font-semibold text-xs text-slate-600 dark:text-slate-300 uppercase text-center">{dict.pricing?.action || "إجراء"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {displayedServices.map((service: any) => (
              <tr key={service.id} className="hover:bg-slate-50/70 dark:hover:bg-surface-container-high/70 dark:hover:bg-surface-container-high/40 transition-colors group">
                <td className="py-3.5 px-6">
                  <span className="dark:text-white font-semibold flex items-center gap-2 text-sm sm:text-base">
                    {stripEmojis(service.name)}
                  </span>
                </td>
                <td className="py-3.5 px-6 text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap">{service.time || "1-24 Hours"}</td>
                <td className={`py-3.5 px-6 ${lang === 'ar' ? 'text-left' : 'text-right'}`}>
                  <RenderPriceBadge service={service} lang={lang} discountPercent={discountPercent} />
                </td>
                <td className="py-3.5 px-6 text-center">
                  <div className="flex items-center gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => handleAddServiceToCart(service)}
                      disabled={isAddingId === service.id}
                      className="py-2 px-3 text-xs rounded-xl border border-blue-600/40 hover:border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-50 dark:hover:bg-blue-900/40 font-bold inline-flex items-center gap-1.5 transition-all shadow-xs active:scale-95 disabled:opacity-50"
                      title={lang === 'ar' ? 'إضافة إلى السلة' : 'Add to Cart'}
                    >
                      {isAddingId === service.id ? (
                        <LoaderCircle size={14} className="animate-spin" />
                      ) : (
                        <ShoppingBag size={14} />
                      )}
                      <span>{lang === 'ar' ? 'أضف للسلة' : 'Add to Cart'}</span>
                    </button>
                    <Link 
                      href={`/${lang}/purchase?serviceId=${service.id}`} 
                      className="btn-primary py-2 px-4 text-xs sm:text-sm rounded-xl inline-flex items-center gap-1 shadow-sm hover:scale-[1.02] transition-transform font-bold"
                    >
                      <span>{dict.pricing?.order || "اطلب"}</span>
                      <ArrowUpRight size={13} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Show more inside huge group if needed */}
      {hasMore && (
        <div className="p-4 dark:bg-background border-t dark:border-white/10 flex justify-center">
          <button
            onClick={() => setLimit(prev => prev + 50)}
            className="dark:bg-surface-container  dark:hover:bg-surface-container-high text-blue-600 dark:text-blue-400 border dark:border-white/10 px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span>{lang === 'ar' ? `عرض بقية الخدمات في هذا القسم (+${servicesList.length - displayedServices.length})` : `Show remaining services in this group (+${servicesList.length - displayedServices.length})`}</span>
            <span className="material-symbols-outlined text-sm">expand_more</span>
          </button>
        </div>
      )}
    </div>
  );
}

interface DisplayGroup {
  categoryName: string;
  groupName: string;
  services: any[];
}

export default function PricingClient({
  lang,
  dict,
  initialServices
}: {
  lang: string;
  dict: any;
  initialServices?: any[];
}) {
  const hasInitialData = Array.isArray(initialServices) && initialServices.length > 0;
  const [services, setServices] = useState<any>(hasInitialData ? initialServices : null);
  const [loading, setLoading] = useState(!hasInitialData);
  const [error, setError] = useState<string | null>(null);
  const [userSession, setUserSession] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [copiedGroup, setCopiedGroup] = useState<string | null>(null);

  // Lazy / Infinite scroll state for groups:
  const [visibleGroupCount, setVisibleGroupCount] = useState(15);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Load user session from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("user_session");
      if (saved) {
        setUserSession(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const discountPercent = useMemo(() => {
    if (!userSession) return 0;
    return Math.max(
      userSession.effectiveDiscount || 0,
      userSession.membershipTier?.discountPercentage || 0,
      userSession.customDiscount || 0
    );
  }, [userSession]);

  // Read initial ?section= / ?group= / ?search= / ?category= from URL
  useEffect(() => {
    const rawCat = searchParams.get("cat")?.toLowerCase() || "";
    const isCatFilter = ["all", "imei", "server", "remote"].includes(rawCat);

    const catParam = searchParams.get("category") || searchParams.get("type") || (isCatFilter ? rawCat : null);
    if (catParam && ["all", "imei", "server", "remote"].includes(catParam.toLowerCase())) {
      setSelectedCategory(catParam.toLowerCase());
    }
    const sectionParam = searchParams.get("section") || searchParams.get("group") || (!isCatFilter ? searchParams.get("cat") : null) || searchParams.get("search");
    if (sectionParam) {
      setActiveSection(sectionParam);
    } else {
      setActiveSection(null);
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch("/api/dhru/services?view=pricing");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setServices(data);
      } catch (err: any) {
        if (!hasInitialData) setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (!hasInitialData) {
      fetchServices();
    }
  }, [hasInitialData]);

  // Reset visibleGroupCount whenever filters change
  useEffect(() => {
    setVisibleGroupCount(15);
  }, [deferredSearch, selectedCategory]);

  const openSingleSection = (groupName: string) => {
    setActiveSection(groupName);
    const newUrl = `${pathname}?section=${encodeURIComponent(groupName)}`;
    window.history.pushState({}, "", newUrl);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeSingleSection = () => {
    setActiveSection(null);
    window.history.pushState({}, "", pathname);
  };

  const toggleGroupCollapse = (groupName: string, currentCollapsed: boolean) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupName]: !currentCollapsed
    }));
  };

  const copyGroupLink = (e: React.MouseEvent, groupName: string) => {
    e.stopPropagation();
    const fullUrl = `${window.location.origin}${pathname}?section=${encodeURIComponent(groupName)}`;
    
    navigator.clipboard.writeText(fullUrl);
    setCopiedGroup(groupName);
    setTimeout(() => setCopiedGroup(null), 3000);
  };

  const toggleAllGroups = (collapse: boolean) => {
    if (!services) return;
    const newMap: Record<string, boolean> = {};
    services.forEach((cat: any) => {
      cat.services?.forEach((s: any) => {
        if (s.groupName) {
          newMap[s.groupName] = collapse;
        }
      });
    });
    setCollapsedGroups(newMap);
  };

  // Helper to group services by groupName
  const getGroupedServices = (servicesList: any[]) => {
    const groups: Record<string, any[]> = {};
    const q = deferredSearch.trim().toLowerCase();
    
    (servicesList || []).filter((s: any) => s.isActive).forEach((service: any) => {
      const matchQuery = 
        !q ||
        service.name?.toLowerCase().includes(q) || 
        (service.dhruId && String(service.dhruId).includes(q)) ||
        (service.groupName && service.groupName.toLowerCase().includes(q));

      if (matchQuery) {
        const group = service.groupName || (lang === 'ar' ? "خدمات عامة" : "General Services");
        if (!groups[group]) groups[group] = [];
        groups[group].push(service);
      }
    });
    return groups;
  };

  // Filter categories - Reseller Pricing dedicated strictly to GSM services (IMEI, Server, Remote)
  const filteredCategories = useMemo(() => {
    let cats = Array.isArray(services) ? services : [];
    const gsmCategories = ["imei", "server", "remote"];

    return cats.map((c: any) => ({
      ...c,
      services: (c.services || []).filter((s: any) => {
        const type = getProviderServiceType({ ...s, category_name: c.name });
        if (!gsmCategories.includes(type)) return false;
        if (selectedCategory === "all") return true;
        return type === selectedCategory || categoryMatchesFilter(c.name, selectedCategory);
      })
    })).filter((c: any) => c.services.length > 0);
  }, [services, selectedCategory]);

  // Flatten all groups matching search for virtual lazy scroll
  const allDisplayGroups = useMemo(() => {
    const list: DisplayGroup[] = [];
    filteredCategories.forEach((cat: any) => {
      const grouped = getGroupedServices(cat.services);
      const groupNames = Object.keys(grouped);
      groupNames.forEach(groupName => {
        list.push({
          categoryName: cat.name,
          groupName,
          services: grouped[groupName]
        });
      });
    });
    return sortDisplayGroups(list) as DisplayGroup[];
  }, [filteredCategories, deferredSearch, lang]);

  const defaultCollapsedGroups = useMemo(
    () => createInitialCollapsedGroups(allDisplayGroups),
    [allDisplayGroups]
  );

  // Total matching services count
  const totalMatchingServices = useMemo(() => {
    return allDisplayGroups.reduce((sum, g) => sum + g.services.length, 0);
  }, [allDisplayGroups]);

  // Sliced groups to render in DOM
  const visibleGroups = useMemo(() => {
    return allDisplayGroups.slice(0, visibleGroupCount);
  }, [allDisplayGroups, visibleGroupCount]);

  // Group visible items by category for rendering headers
  const visibleCategorySections = useMemo(() => {
    const map = new Map<string, { categoryName: string; groups: DisplayGroup[] }>();
    visibleGroups.forEach(item => {
      if (!map.has(item.categoryName)) {
        map.set(item.categoryName, {
          categoryName: item.categoryName,
          groups: []
        });
      }
      map.get(item.categoryName)!.groups.push(item);
    });
    return Array.from(map.values());
  }, [visibleGroups]);

  // Infinite Scroll Trigger with IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current) return;
    if (visibleGroupCount >= allDisplayGroups.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleGroupCount(prev => Math.min(prev + 15, allDisplayGroups.length));
        }
      },
      { rootMargin: "400px" } // Preload 400px ahead so scrolling is instantaneous
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [visibleGroupCount, allDisplayGroups.length]);

  // Standalone Single Section Data with Smart Resilient Match
  const singleSectionData = useMemo(() => {
    if (!activeSection || !services || !Array.isArray(services)) return null;
    const target = activeSection.trim().toLowerCase();

    // 1. Direct or Case-Insensitive Exact Group Match
    for (const cat of services) {
      if (!cat.services) continue;
      const allActive = cat.services.filter((s: any) => s.isActive);
      const exactServices = allActive.filter((s: any) => {
        const gn = (s.groupName || "").trim().toLowerCase();
        return gn === target;
      });
      if (exactServices.length > 0) {
        return {
          groupName: exactServices[0].groupName,
          categoryName: cat.name,
          servicesList: exactServices
        };
      }
    }

    // 2. Partial Group Name Match (e.g., "Xiaomi Remove Mi Account" within "Xiaomi Remove Mi Account [Instant]")
    for (const cat of services) {
      if (!cat.services) continue;
      const allActive = cat.services.filter((s: any) => s.isActive);
      const partialServices = allActive.filter((s: any) => {
        const gn = (s.groupName || "").toLowerCase();
        return gn.includes(target) || target.includes(gn);
      });
      if (partialServices.length > 0) {
        return {
          groupName: partialServices[0].groupName || activeSection,
          categoryName: cat.name,
          servicesList: partialServices
        };
      }
    }

    // 3. Category Name Match (e.g., "IMEI Services" or "server")
    for (const cat of services) {
      if (!cat.services) continue;
      const catName = (cat.name || "").toLowerCase();
      if (catName.includes(target) || target.includes(catName)) {
        const allActive = cat.services.filter((s: any) => s.isActive);
        if (allActive.length > 0) {
          return {
            groupName: cat.name,
            categoryName: cat.name,
            servicesList: allActive
          };
        }
      }
    }

    // 4. Keyword / Service Name Search Match across all categories
    const matchingServices: any[] = [];
    let matchedCatName = "";
    for (const cat of services) {
      if (!cat.services) continue;
      cat.services.filter((s: any) => s.isActive).forEach((s: any) => {
        const nameMatch = s.name?.toLowerCase().includes(target);
        const groupMatch = s.groupName?.toLowerCase().includes(target);
        const idMatch = s.dhruId && String(s.dhruId) === target;
        if (nameMatch || groupMatch || idMatch) {
          matchingServices.push(s);
          if (!matchedCatName) matchedCatName = cat.name;
        }
      });
    }

    if (matchingServices.length > 0) {
      return {
        groupName: activeSection,
        categoryName: matchedCatName || (lang === "ar" ? "خدمات مطابقة" : "Matching Services"),
        servicesList: matchingServices
      };
    }

    // Fallback: If section specified but no matching services found, show empty container with clear message
    return {
      groupName: activeSection,
      categoryName: lang === "ar" ? "خدمات" : "Services",
      servicesList: []
    };
  }, [activeSection, services, lang]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 gap-4 text-primary">
        <span className="material-symbols-outlined animate-spin text-5xl">refresh</span>
        <p className="text-sm font-semibold text-on-surface-variant">
          {lang === 'ar' ? 'جاري تحميل وتجهيز قائمة الخدمات والأسعار...' : 'Loading services & pricing...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-error/10 text-error rounded-xl border border-error/20 flex items-center gap-2 font-medium">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8 relative" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Copied Toast Notification */}
      {copiedGroup && (
        <div className="fixed bottom-6 left-6 z-50 bg-primary text-surface font-bold px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
          <span className="material-symbols-outlined text-2xl">check_circle</span>
          <span>{lang === 'ar' ? `تم نسخ رابط صفحة قسم "${copiedGroup}" بنجاح!` : `Copied standalone link for "${copiedGroup}"!`}</span>
        </div>
      )}

      {/* --- STANDALONE SINGLE SECTION VIEW MODE --- */}
      {activeSection && singleSectionData ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Breadcrumb & Navigation Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 dark:bg-surface-container p-5 sm:p-6 rounded-2xl border dark:border-white/10 shadow-xs">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-2">
                <button onClick={closeSingleSection} className="hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  {lang === 'ar' ? 'جميع الأقسام' : 'All Sections'}
                </button>
                <span>/</span>
                <span className="text-slate-500 dark:text-slate-400">{singleSectionData.categoryName}</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-bold dark:text-white flex items-center gap-3">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl sm:text-3xl">folder</span>
                {stripEmojis(singleSectionData.groupName)}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {lang === 'ar' 
                  ? `عرض مستقل لخدمات قسم ${stripEmojis(singleSectionData.groupName)} (${singleSectionData.servicesList.length} خدمات مجهزة)`
                  : `Standalone view for ${stripEmojis(singleSectionData.groupName)} (${singleSectionData.servicesList.length} services)`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={(e) => copyGroupLink(e, singleSectionData!.groupName)}
                className="bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">share</span>
                {lang === 'ar' ? 'مشاركة رابط هذا القسم' : 'Share Section Link'}
              </button>

              <button
                onClick={closeSingleSection}
                className="btn-secondary py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">apps</span>
                {lang === 'ar' ? 'العودة لجميع الأقسام' : 'Back to All'}
              </button>
            </div>
          </div>

          {/* Standalone Section Card */}
          <div className="dark:bg-surface-container rounded-2xl overflow-hidden border dark:border-white/10 shadow-xs">
            <div className="dark:bg-surface-container px-5 sm:px-6 py-4 border-b dark:border-white/10 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold dark:text-white flex items-center gap-3">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">folder_open</span>
                {stripEmojis(singleSectionData.groupName)}
              </h3>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800/50">
                {singleSectionData.servicesList.length} {lang === 'ar' ? 'خدمات' : 'services'}
              </span>
            </div>

            {/* Render Services */}
            {singleSectionData.servicesList.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400">
                <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">search_off</span>
                <p className="font-bold text-base dark:text-white">
                  {lang === 'ar' ? `لم يتم العثور على خدمات نشطة مطابقة لقسم "${singleSectionData.groupName}" حالياً` : `No active services found in section "${singleSectionData.groupName}" currently`}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                  {lang === 'ar' ? 'قد يكون تم تحديث اسم القسم أو نقل الخدمات. يمكنك استعراض كافة الأقسام المتاحة أو استخدام البحث.' : 'The section may have been renamed or moved. You can browse all sections or use the search bar.'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
                  <button onClick={closeSingleSection} className="btn-secondary py-2.5 px-6 text-xs sm:text-sm rounded-xl font-bold">
                    {lang === 'ar' ? 'استعراض كافة الأقسام والخدمات' : 'Browse All Services'}
                  </button>
                </div>
              </div>
            ) : (
              <ServicesListRenderer servicesList={singleSectionData.servicesList} lang={lang} dict={dict} discountPercent={discountPercent} />
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Cross-Link Banner to Gaming & Social Media Services */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-200/60 dark:border-blue-900/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-2xl">sports_esports</span>
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base dark:text-white">
                  {lang === 'ar' ? "قسم خدمات الألعاب والشحن الرقمي والسوشيال ميديا" : "Gaming, Digital Vouchers & Social Media Hub"}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {lang === 'ar'
                    ? "تصفح الكتالوج المخصص لشدات ببجي، جواهر فري فاير، بطاقات ايتونز وجوجل بلاي، واشتراكات الميديا."
                    : "Browse player ID top-ups for PUBG, Free Fire, Google Play, iTunes, and streaming subscriptions."}
                </p>
              </div>
            </div>
            <Link
              href={`/${lang}/services`}
              className="shrink-0 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-2"
            >
              <span>{lang === 'ar' ? "استعراض خدمات الألعاب والميديا" : "Browse Gaming Catalog"}</span>
              <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_forward</span>
            </Link>
          </div>

          {/* VIP Membership Active Banner */}
          {discountPercent > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800/50 shrink-0">
                  <span className="material-symbols-outlined text-2xl">workspace_premium</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base dark:text-white flex items-center gap-2">
                    <span>{lang === 'ar' ? `مرحباً بك! لديك "${userSession?.membershipTier?.nameAr || userSession?.membershipTier?.name || 'عضوية VIP'}"` : `Welcome! You have "${userSession?.membershipTier?.name || 'VIP Membership'}"`}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                      VIP
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {lang === 'ar' 
                      ? `تم تفعيل خصم ${discountPercent}% تلقائياً على كافة أسعار الخدمات المعروضة أدناه.` 
                      : `A ${discountPercent}% discount is automatically applied to all service prices below.`}
                  </p>
                </div>
              </div>

              <div className="px-3.5 py-1.5 rounded-xl dark:bg-surface-container border border-blue-200 dark:border-blue-900/50 flex items-center gap-2">
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{lang === 'ar' ? 'نسبة الخصم:' : 'Active Discount:'}</span>
                <span className="text-base font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                  -{discountPercent}%
                </span>
              </div>
            </div>
          )}

          {/* Filters and Controls Header */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative flex-grow">
                <span className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400`}>search</span>
                <input 
                  id="pricing-search-input"
                  name="pricingSearch"
                  type="text" 
                  aria-label={lang === 'ar' ? 'البحث في قائمة الأسعار والخدمات' : 'Search services and pricing'}
                  placeholder={dict.pricing?.search || "ابحث عن خدمة أو موديل أو قسم..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full dark:bg-surface-container border dark:border-white/10 rounded-xl py-3 ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} dark:text-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-xs placeholder:text-slate-400 dark:placeholder:text-slate-500`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    aria-label={lang === 'ar' ? 'مسح البحث' : 'Clear search'}
                    onClick={() => setSearchQuery("")}
                    className={`absolute ${lang === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200`}
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
              </div>

              <select 
                id="pricing-category-select"
                name="pricingCategory"
                aria-label={lang === 'ar' ? 'تصفية حسب نوع الخدمة' : 'Filter by category'}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="dark:bg-surface-container border dark:border-white/10 rounded-xl py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm dark:text-slate-200 focus:outline-none focus:border-blue-600 w-full min-[480px]:w-auto min-[480px]:min-w-[180px] max-w-full shadow-xs cursor-pointer"
              >
                <option value="all">{lang === 'ar' ? 'جميع الأقسام' : 'All Categories'}</option>
                <option value="imei">{lang === 'ar' ? 'خدمات IMEI' : 'IMEI Services'}</option>
                <option value="server">{lang === 'ar' ? 'خدمات السيرفر' : 'Server Credits'}</option>
                <option value="remote">{lang === 'ar' ? 'خدمات التحكم عن بعد' : 'Remote Unlocks'}</option>
              </select>
            </div>

            {/* Global Expand / Collapse Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => toggleAllGroups(false)}
                className="dark:bg-surface-container border dark:border-white/10 hover:border-blue-500 dark:hover:border-blue-500 text-xs px-3.5 py-2.5 rounded-xl font-medium dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-base">unfold_more</span>
                {lang === 'ar' ? 'توسيع الكل' : 'Expand All'}
              </button>
              <button
                onClick={() => toggleAllGroups(true)}
                className="dark:bg-surface-container border dark:border-white/10  dark:hover:border-white/20 text-xs px-3.5 py-2.5 rounded-xl font-medium dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-base">unfold_less</span>
                {lang === 'ar' ? 'طي الكل' : 'Collapse All'}
              </button>
            </div>
          </div>

          {/* Quick Stat Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>
              {lang === 'ar'
                ? `عرض ${visibleGroups.length} من ${allDisplayGroups.length} قسم (${totalMatchingServices} خدمة متاحة)`
                : `Showing ${visibleGroups.length} of ${allDisplayGroups.length} sections (${totalMatchingServices} services)`}
            </span>
            {visibleGroups.length < allDisplayGroups.length && (
              <span className="text-blue-600 dark:text-blue-400 font-mono text-[11px] font-semibold">
                {lang === 'ar' ? "يتم تحميل المزيد تلقائياً عند التمرير ↓" : "Auto-loading on scroll ↓"}
              </span>
            )}
          </div>

          {allDisplayGroups.length === 0 ? (
            <div className="p-12 text-center dark:bg-surface-container rounded-2xl border dark:border-white/10 text-slate-500 dark:text-slate-400 flex flex-col items-center gap-3 shadow-xs">
              <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">search_off</span>
              <p className="font-semibold text-base dark:text-slate-100">
                {lang === 'ar' ? 'لم يتم العثور على أي خدمات تطابق بحثك.' : 'No services matched your search criteria.'}
              </p>
              <button 
                onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                className="btn-secondary py-2 px-4 text-xs rounded-xl mt-2"
              >
                {lang === 'ar' ? 'إعادة ضبط البحث' : 'Reset Search'}
              </button>
            </div>
          ) : (
            visibleCategorySections.map((categorySection, catIdx) => {
              const iconName = categorySection.categoryName.toLowerCase().includes('imei') 
                ? 'phone_iphone' 
                : categorySection.categoryName.toLowerCase().includes('server') 
                  ? 'dns' 
                  : 'cast';

              return (
                <div key={catIdx} className="space-y-4 animate-in fade-in duration-300">
                  <h2 className="text-xl sm:text-2xl font-bold dark:text-white mb-4 flex items-center gap-2 border-b dark:border-white/10 pb-3">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">{iconName}</span>
                    {categorySection.categoryName}
                  </h2>

                  {categorySection.groups.map((groupItem, idx) => {
                    const groupName = groupItem.groupName;
                    const groupServicesList = groupItem.services;
                    const isCollapsed = collapsedGroups[groupName] ?? defaultCollapsedGroups[groupName] ?? true;

                    return (
                      <div 
                        key={idx} 
                        className="dark:bg-surface-container rounded-2xl overflow-hidden border dark:border-white/10 shadow-xs  dark:hover:border-white/20 transition-all duration-200 group/card"
                      >
                        {/* Category Section Header */}
                        <div 
                          onClick={() => toggleGroupCollapse(groupName, isCollapsed)}
                          className="dark:bg-surface-container hover:bg-slate-50/80 dark:hover:bg-surface-container-high/80 dark:hover:bg-surface-container-high/70 px-5 sm:px-6 py-4 border-b dark:border-white/10 flex items-center justify-between cursor-pointer select-none transition-colors group/head"
                          title={lang === 'ar' ? 'انقر لفتح وإغلاق خدمات هذا القسم' : 'Click to toggle section services'}
                        >
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl group-hover/head:scale-105 transition-transform">folder</span>
                            <div>
                              <h3 className="text-base sm:text-lg font-bold dark:text-white group-hover/head:text-blue-600 dark:group-hover/head:text-blue-400 transition-colors flex items-center gap-2">
                                {stripEmojis(groupName)}
                                <span className="text-xs font-normal text-slate-500 dark:text-slate-400 dark:bg-background px-2.5 py-0.5 rounded-full border dark:border-white/10">
                                  {groupServicesList.length} {lang === 'ar' ? 'خدمات' : 'services'}
                                </span>
                              </h3>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Open in Standalone Purchase Page Link */}
                            {groupServicesList[0]?.id && (
                              <Link
                                href={`/${lang}/purchase?serviceId=${groupServicesList[0].id}`}
                                onClick={(e) => e.stopPropagation()}
                                title={lang === 'ar' ? 'فتح صفحة الشراء المباشرة' : 'Open direct purchase page'}
                                className="bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40 p-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold"
                              >
                                <span className="material-symbols-outlined text-base">shopping_cart_checkout</span>
                                <span className="hidden sm:inline">{lang === 'ar' ? 'صفحة الشراء' : 'Purchase'}</span>
                              </Link>
                            )}

                            {/* Copy Purchase Link Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const targetId = groupServicesList[0]?.id;
                                const fullUrl = targetId 
                                  ? `${window.location.origin}/${lang}/purchase?serviceId=${targetId}`
                                  : `${window.location.origin}/${lang}/purchase`;
                                navigator.clipboard.writeText(fullUrl);
                                setCopiedGroup(groupName);
                                setTimeout(() => setCopiedGroup(null), 3000);
                              }}
                              title={lang === 'ar' ? 'نسخ رابط الشراء المباشر' : 'Copy purchase link'}
                              className="dark:bg-background border dark:border-white/10 hover:border-blue-500 dark:hover:border-blue-500 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded-xl transition-all flex items-center gap-1 text-xs font-medium shadow-xs"
                            >
                              <span className="material-symbols-outlined text-base">link</span>
                              <span className="hidden sm:inline">{copiedGroup === groupName ? (lang === 'ar' ? 'تم النسخ!' : 'Copied!') : (lang === 'ar' ? 'نسخ الرابط' : 'Copy Link')}</span>
                            </button>

                            {/* Expand / Collapse Icon */}
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleGroupCollapse(groupName, isCollapsed); }}
                              className="w-8 h-8 rounded-lg dark:bg-background border dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                              <span className="material-symbols-outlined text-xl transition-transform duration-300" style={{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}>
                                expand_more
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Services Body */}
                        {!isCollapsed && (
                          <div className="animate-in fade-in duration-200">
                            <ServicesListRenderer servicesList={groupServicesList} lang={lang} dict={dict} discountPercent={discountPercent} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}

          {/* Infinite Scroll Sentinel & Loader */}
          {visibleGroups.length < allDisplayGroups.length && (
            <div ref={sentinelRef} className="py-8 flex flex-col items-center justify-center gap-2 text-slate-500">
              <span className="material-symbols-outlined animate-spin text-3xl text-blue-600">sync</span>
              <span className="text-xs font-semibold">
                {lang === 'ar' ? 'جاري تحميل المزيد من الأقسام والخدمات...' : 'Loading more services on scroll...'}
              </span>
              <button
                onClick={() => setVisibleGroupCount(allDisplayGroups.length)}
                className="mt-2 text-xs text-blue-600 underline hover:text-blue-700 font-medium"
              >
                {lang === 'ar' ? 'عرض كافة الأقسام دفعة واحدة' : 'Load all sections at once'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
