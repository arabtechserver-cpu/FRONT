"use client";

import { useState, useEffect, useMemo, useCallback, useLayoutEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/config";
import HeroSlider from "@/components/HeroSlider";
import { useI18n } from "@/lib/i18n";
import { trackConversion } from "@/lib/analytics";
import {
  Search,
  Clock,
  Flame,
  Smartphone,
  Server,
  Radio,
  Zap,
  Gamepad2,
  Wallet,
  LogIn,
  ChevronDown,
  ChevronUp,
  Settings,
  Home,
  X,
  ExternalLink,
  Layers
} from "lucide-react";

export default function ServicesClient({
  initialCategories = [],
  initialServices = [],
  isHome = false,
  defaultType = null,
  homeHeroTitle,
  homeHeroSubtitle
}) {
  const router = useRouter();
  const { t, meta } = useI18n();
  const searchParams = useSearchParams();
  const urlType = searchParams.get("type");
  const typeFilter = urlType || defaultType;

  const [services, setServices] = useState(initialServices);
  const [categories, setCategories] = useState(initialCategories);
  const [customer, setCustomer] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(initialServices.length === 0);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceSort, setPriceSort] = useState("default");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [visibleCategories, setVisibleCategories] = useState(30);
  const [hotOnly, setHotOnly] = useState(false);

  // Accordion state: map of categoryId -> boolean (true = collapsed)
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    try {
      const s = sessionStorage.getItem("spider_services_search");
      if (s) setSearchTerm(s);
      const l = sessionStorage.getItem("spider_services_limit");
      if (l) setVisibleCategories(parseInt(l, 10));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem("spider_services_search", searchTerm);
      sessionStorage.setItem("spider_services_limit", visibleCategories.toString());
    } catch {}
  }, [searchTerm, visibleCategories]);

  useEffect(() => {
    trackConversion("catalog_view", { typeFilter: typeFilter || "all" });
  }, [typeFilter]);

  useEffect(() => {
    try {
      const token = localStorage.getItem("customer_token");
      if (token) {
        fetch(`${API_BASE_URL}/api/customer/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data) setCustomer(data);
            setAuthChecked(true);
          })
          .catch(() => setAuthChecked(true));
      } else {
        setAuthChecked(true);
      }
    } catch {
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    try {
      const cachedCats = localStorage.getItem("spider_cached_categories");
      const cachedSvcs = localStorage.getItem("spider_cached_services");
      if (cachedCats) setCategories(JSON.parse(cachedCats));
      if (cachedSvcs) {
        setServices(JSON.parse(cachedSvcs));
        setLoading(false);
      }
    } catch {}

    fetch(`${API_BASE_URL}/api/categories`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name, "en"));
        setCategories(sorted);
        try { localStorage.setItem("spider_cached_categories", JSON.stringify(sorted)); } catch {}
      })
      .catch(() => {});

    const token = typeof window !== "undefined" ? localStorage.getItem("customer_token") : null;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    fetch(`${API_BASE_URL}/api/services`, { headers })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setServices(data);
        setLoading(false);
        try { localStorage.setItem("spider_cached_services", JSON.stringify(data)); } catch {}
      })
      .catch(() => setLoading(false));
  }, []);

  // Robust classifier to ensure IMEI, Server, and Remote services are always properly categorized
  const classifyServiceType = useCallback((categoryName, serviceName, packageName, explicitType) => {
    const explicit = String(explicitType || "").trim().toLowerCase();
    if (explicit === "server" || explicit === "remote" || explicit === "imei") {
      return explicit;
    }
    const combined = `${categoryName || ""} ${serviceName || ""} ${packageName || ""}`.toLowerCase();
    if (/remote|flexihub|flexi\s*hub|usb\s*sharing|auth\s*tool|auth\s*flash|cpid|teamviewer|anydesk|unbrick|edl\s*auth/i.test(combined)) {
      return "remote";
    }
    if (/activation|license|credit|gift\s*card|game|pubg|free\s*fire|freefire|xbox|playstation|spotify|twitch|mastercard|visa|support|box\b|dongle|top-?up|redeem|telegram|digital|sigma|z3x|chimera|octoplus|unlocktool|pragmafix|alientool|hydra|teratool|samkey|sut\s*tool|flasher\s*pro|arab-unlock/i.test(combined)) {
      if (/network\s*unlocked|sim\s*not\s*supported|carrier\s*unlock/i.test(combined) && !/credit|activation|license/i.test(combined)) {
        return "imei";
      }
      return "server";
    }
    return "imei";
  }, []);

  // Unpack services and their packages into flat, purchasable service items
  const unpackedItems = useMemo(() => {
    const items = [];
    services.forEach((service) => {
      const catObj = categories.find((c) => Number(c.id) === Number(service.category_id));
      const catName = catObj?.name || service.category_name || "";

      let pkgs = [];
      if (Array.isArray(service.packages)) {
        pkgs = service.packages;
      } else if (typeof service.packages === "string" && service.packages.trim()) {
        try { pkgs = JSON.parse(service.packages); } catch {}
      }

      if (pkgs && pkgs.length > 0) {
        pkgs.forEach((pkg, index) => {
          const isGeneric = /^package\s*\d+$/i.test(String(pkg?.name || "").trim());
          const displayName = isGeneric ? service.name : (pkg?.name || service.name);
          const price = Number(pkg?.price ?? service.price ?? 0);
          const deliveryTime = pkg?.delivery_time || service.execution_time || service.delivery_time || "1-24 Hours";
          const desc = pkg?.description || service.description || "";
          const rawType = pkg?.api_service_type || service.api_service_type || catObj?.menu_service_type;
          const type = classifyServiceType(catName, service.name, pkg?.name, rawType);

          items.push({
            uniqueId: `${service.id}_pkg_${pkg.id || index}`,
            serviceId: service.id,
            packageId: pkg.id,
            name: displayName,
            parentServiceName: service.name,
            categoryId: Number(service.category_id),
            categoryName: catName,
            image: service.image,
            price,
            deliveryTime,
            description: desc,
            isHot: Boolean(service.is_featured || service.is_hot || service.badge === "HOT"),
            apiServiceType: type,
            serviceRef: service,
            packageRef: pkg
          });
        });
      } else {
        const price = Number(service.price || 0);
        const deliveryTime = service.execution_time || service.delivery_time || "1-24 Hours";
        const desc = service.description || "";
        const rawType = service.api_service_type || catObj?.menu_service_type;
        const type = classifyServiceType(catName, service.name, "", rawType);

        items.push({
          uniqueId: `${service.id}`,
          serviceId: service.id,
          packageId: null,
          name: service.name,
          parentServiceName: service.name,
          categoryId: Number(service.category_id),
          categoryName: catName,
          image: service.image,
          price,
          deliveryTime,
          description: desc,
          isHot: Boolean(service.is_featured || service.is_hot || service.badge === "HOT"),
          apiServiceType: type,
          serviceRef: service,
          packageRef: null
        });
      }
    });
    return items;
  }, [services, categories, classifyServiceType]);

  const typeFilteredItems = useMemo(() => {
    if (!typeFilter) return unpackedItems;
    const target = String(typeFilter).trim().toLowerCase();
    return unpackedItems.filter((item) => {
      return item.apiServiceType === target || item.apiServiceType.includes(target);
    });
  }, [unpackedItems, typeFilter]);

  const catalogCategories = useMemo(() => {
    let cats = categories;
    if (selectedCategory && selectedCategory !== "all") {
      cats = cats.filter((c) => Number(c.id) === Number(selectedCategory));
    }
    if (typeFilter) {
      const target = typeFilter.toLowerCase();
      cats = cats.filter((cat) => {
        const catItems = typeFilteredItems.filter(
          (item) => Number(item.categoryId) === Number(cat.id)
        );
        const assignedType = classifyServiceType(cat.name, "", "", cat.menu_service_type);
        return assignedType === target || catItems.length > 0;
      });
    }
    if (priceSort === "asc" || priceSort === "desc") {
      cats = [...cats].sort((a, b) => {
        const aPrices = typeFilteredItems
          .filter((item) => Number(item.categoryId) === Number(a.id))
          .map((item) => item.price);
        const bPrices = typeFilteredItems
          .filter((item) => Number(item.categoryId) === Number(b.id))
          .map((item) => item.price);
        const aMin = aPrices.length ? Math.min(...aPrices) : Infinity;
        const bMin = bPrices.length ? Math.min(...bPrices) : Infinity;
        return priceSort === "asc" ? aMin - bMin : bMin - aMin;
      });
    }
    return cats;
  }, [categories, typeFilteredItems, typeFilter, selectedCategory, priceSort, classifyServiceType]);

  const filteredItems = useMemo(() => {
    return typeFilteredItems.filter((item) => {
      const q = searchTerm.toLowerCase().trim();
      if (q) {
        const matchSearch =
          item.name.toLowerCase().includes(q) ||
          item.parentServiceName.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q));
        if (!matchSearch) return false;
      }
      if (hotOnly && !item.isHot) return false;
      return true;
    });
  }, [typeFilteredItems, searchTerm, hotOnly]);

  const uncategorizedItems = useMemo(() => {
    return filteredItems
      .filter((item) => !catalogCategories.some((c) => Number(c.id) === Number(item.categoryId)))
      .sort((a, b) => {
        if (priceSort === "asc") return a.price - b.price;
        if (priceSort === "desc") return b.price - a.price;
        return a.name.localeCompare(b.name, "en");
      });
  }, [filteredItems, catalogCategories, priceSort]);

  // Accordion Toggle Handlers
  const toggleGroup = (groupId) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const collapseAll = () => {
    const next = {};
    catalogCategories.forEach((cat) => {
      next[cat.id] = true;
    });
    setCollapsedGroups(next);
  };

  const expandAll = () => {
    setCollapsedGroups({});
  };

  const renderIcon = (service) => {
    const type = (service.api_service_type || "").toLowerCase();
    if (type === "imei") return <Smartphone size={16} style={{ color: "#0284c7" }} />;
    if (type === "server") return <Server size={16} style={{ color: "#10b981" }} />;
    if (type === "remote") return <Radio size={16} style={{ color: "#f59e0b" }} />;
    return <Zap size={16} style={{ color: "#64748b" }} />;
  };

  const isAr = meta.language === "ar";
  const TABS = [
    { href: "/resellerpricing/imei", value: "imei", label: isAr ? "خدمة IMEI" : "IMEI Service", icon: <Smartphone size={14} /> },
    { href: "/resellerpricing/server", value: "server", label: isAr ? "خدمة السيرفر" : "Server Service", icon: <Server size={14} /> },
    { href: "/resellerpricing/remote", value: "remote", label: isAr ? "خدمة الريموت" : "Remote Service", icon: <Radio size={14} /> },
    { href: "/resellerpricing", value: null, label: isAr ? "كل الخدمات" : "All Services", icon: <Zap size={14} /> },
  ];

  let pageTitle = isAr ? "أسعار الموزعين / كل الخدمات" : "Reseller Pricing / All Services";
  let breadcrumbLabel = isAr ? "كل الخدمات" : "All Services";
  if (typeFilter === "imei") {
    pageTitle = isAr ? "أسعار الموزعين / خدمة IMEI" : "Reseller Pricing / IMEI Service";
    breadcrumbLabel = isAr ? "خدمة IMEI" : "IMEI Service";
  } else if (typeFilter === "server") {
    pageTitle = isAr ? "أسعار الموزعين / خدمة السيرفر" : "Reseller Pricing / Server Service";
    breadcrumbLabel = isAr ? "خدمة السيرفر" : "Server Service";
  } else if (typeFilter === "remote") {
    pageTitle = isAr ? "أسعار الموزعين / خدمة الريموت" : "Reseller Pricing / Remote Service";
    breadcrumbLabel = isAr ? "خدمة الريموت" : "Remote Service";
  }

  return (
    <div className="bg-gray w-100" style={{ minHeight: "calc(100vh - 400px)" }}>
      <div className="w-100 min-height">

        {/* Top Header Strip & Breadcrumbs */}
        <div className="bg-white py-2 py-lg-4 border-bottom mb-2 mb-lg-3 w-100">
          <div className="container px-3 px-lg-3 p-lg-0">
            <h3 className="page-title m-0">
              {pageTitle}
            </h3>
          </div>

          <div className="container d-none d-md-block">
            <ul className="breadcrumb mt-1">
              <Home size={14} style={{ color: "#64748b" }} />
              <Link href="/">{isAr ? "الرئيسية" : "Home"}</Link>
              <span className="breadcrumb-separator">/</span>
              <Link href="/resellerpricing">{isAr ? "أسعار الموزعين" : "Reseller Pricing"}</Link>
              {typeFilter && (
                <>
                  <span className="breadcrumb-separator">/</span>
                  <span className="breadcrumb-current">{breadcrumbLabel}</span>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Service Type Switcher Tabs */}
        <div className="container reseller-pricing">
          <div className="page-container">
            <div className="reseller-tabs-bar">
              {TABS.map((tab) => {
                const active = (typeFilter || null) === tab.value;
                return (
                  <Link
                    key={tab.label}
                    href={tab.href}
                    className={`reseller-tab-item ${active ? "active" : ""}`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Hero Slider — home only */}
        {isHome && <HeroSlider />}

        <div className="body-container w-100">

          {/* Search and Filters Panel */}
          <div className="container reseller-pricing">
            <div className="page-container">
              <div className="card-search p-0 px-1 px-lg-0 py-lg-4 bottom-space">
                <div className="row align-items-center">

                  {/* Search Input */}
                  <div className="col-lg-4">
                    <div className="form-group" style={{ position: "relative" }}>
                      <Search
                        size={16}
                        style={{
                          position: "absolute",
                          top: "50%",
                          transform: "translateY(-50%)",
                          [meta.dir === "rtl" ? "right" : "left"]: 14,
                          color: "#0284c7",
                          pointerEvents: "none"
                        }}
                      />
                      <input
                        type="text"
                        name="search"
                        id="searchservicebox"
                        className="form-control"
                        placeholder={meta.language === "ar" ? "ابحث عن خدمة..." : "Search Service..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                          paddingLeft: meta.dir === "rtl" ? (searchTerm ? 36 : 14) : 38,
                          paddingRight: meta.dir === "rtl" ? 38 : (searchTerm ? 36 : 14)
                        }}
                        autoComplete="off"
                      />
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={() => setSearchTerm("")}
                          style={{
                            position: "absolute",
                            top: "50%",
                            transform: "translateY(-50%)",
                            [meta.dir === "rtl" ? "left" : "right"]: 12,
                            background: "#e2e8f0",
                            border: "none",
                            borderRadius: "50%",
                            width: 20,
                            height: 20,
                            color: "#475569",
                            fontSize: "0.72rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Group Select Dropdown */}
                  <div className="col-lg-4">
                    <div className="form-group">
                      <select
                        className="form-control no-chosen"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        <option value="all">{meta.language === "ar" ? "كل الأقسام" : "All Groups"}</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Hot Filter & Sort */}
                  <div className="col-lg-4">
                    <div className="hot-sort-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                      <div className="custom-control custom-checkbox">
                        <input
                          type="checkbox"
                          name="hot"
                          checked={hotOnly}
                          onChange={(e) => setHotOnly(e.target.checked)}
                          className="custom-control-input"
                          id="hotitem"
                        />
                        <label className="custom-control-label" htmlFor="hotitem">
                          {meta.language === "ar" ? "عرض الأكثر طلباً فقط" : "Show only HOT Products"}
                        </label>
                      </div>

                      <select
                        className="form-control"
                        value={priceSort}
                        onChange={(e) => setPriceSort(e.target.value)}
                        style={{ width: "auto", minWidth: 120, height: 38, fontSize: "0.82rem" }}
                      >
                        <option value="default">{meta.language === "ar" ? "ترتيب: افتراضي" : "Sort: Default"}</option>
                        <option value="asc">{meta.language === "ar" ? "السعر: من الأقل للأعلى" : "Price: Low to High"}</option>
                        <option value="desc">{meta.language === "ar" ? "السعر: من الأعلى للأقل" : "Price: High to Low"}</option>
                      </select>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Group Accordion Controls */}
          <div className="container reseller-pricing">
            <div className="page-container">
              <div className="accordion-controls-bar">
                <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#475569", display: "flex", alignItems: "center", gap: 8 }}>
                  <Layers size={16} color="#0284c7" />
                  <span>{catalogCategories.length} {meta.language === "ar" ? "أقسام" : "Groups"}</span>
                  <span style={{ color: "#cbd5e1" }}>•</span>
                  <span>{filteredItems.length} {meta.language === "ar" ? "خدمة" : "Services"}</span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    className="accordion-toggle-btn"
                    onClick={expandAll}
                  >
                    <ChevronDown size={14} />
                    <span>{meta.language === "ar" ? "توسيع الكل" : "Expand All"}</span>
                  </button>
                  <button
                    type="button"
                    className="accordion-toggle-btn"
                    onClick={collapseAll}
                  >
                    <ChevronUp size={14} />
                    <span>{meta.language === "ar" ? "طي الكل" : "Collapse All"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Group Tables & Accordions */}
          <div className="container reseller-pricing">
            <div className="page-container">
              {loading && services.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#0284c7", fontWeight: 700, fontSize: "1.05rem" }}>
                  {meta.language === "ar" ? "جاري تحميل الخدمات..." : "Loading services..."}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="card-search" style={{ textAlign: "center", padding: "50px 20px" }}>
                  <Search size={44} color="#94a3b8" style={{ margin: "0 auto 12px", display: "block" }} />
                  <h3 style={{ margin: "0 0 8px", color: "#0f172a", fontSize: "1.2rem", fontWeight: 800 }}>
                    {meta.language === "ar" ? "لم يتم العثور على خدمات" : "No Services Found"}
                  </h3>
                  <p style={{ color: "#64748b", marginBottom: 18, fontSize: "0.9rem" }}>
                    {meta.language === "ar" ? "جرب كلمات بحث مختلفة أو أعد ضبط الفلاتر." : "Try different keywords or reset the filters."}
                  </p>
                  <button
                    type="button"
                    onClick={() => { setSearchTerm(""); setSelectedCategory("all"); setHotOnly(false); }}
                    className="order-btn-link"
                    style={{ cursor: "pointer", border: "none", padding: "8px 22px" }}
                  >
                    {meta.language === "ar" ? "إعادة تعيين الفلاتر" : "Reset Filters"}
                  </button>
                </div>
              ) : (
                <div className="services w-100">
                  {catalogCategories
                    .slice(0, searchTerm.trim() ? catalogCategories.length : visibleCategories)
                    .map((cat) => {
                      const catItems = filteredItems
                        .filter((item) => Number(item.categoryId) === Number(cat.id))
                        .sort((a, b) => {
                          if (priceSort === "asc") return a.price - b.price;
                          if (priceSort === "desc") return b.price - a.price;
                          return a.name.localeCompare(b.name, "en");
                        });
                      if (catItems.length === 0) return null;

                      // Accordion logic: if searching, force open. Otherwise respect collapsed state.
                      const isCollapsed = Boolean(collapsedGroups[cat.id]) && !searchTerm.trim();

                      return (
                        <div
                          key={cat.id}
                          className={`group card mb-3 bottom-space active g_${cat.id} ${isCollapsed ? "is-collapsed" : ""}`}
                        >
                          {/* Accordion Group Header */}
                          <div
                            className="group-card-header"
                            onClick={() => toggleGroup(cat.id)}
                            role="button"
                            tabIndex={0}
                            aria-expanded={!isCollapsed}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <ChevronDown
                                size={18}
                                className="group-chevron"
                                style={{
                                  transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
                                  transition: "transform 0.2s ease",
                                  color: isCollapsed ? "#94a3b8" : "#0284c7"
                                }}
                              />
                              <h5 className="group-title m-0">{cat.name}</h5>
                              <span className="badge-group-count">{catItems.length}</span>
                            </div>
                            <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>
                              {isCollapsed
                                ? (meta.language === "ar" ? "اضغط للتوسيع" : "Click to expand")
                                : (meta.language === "ar" ? "اضغط للطي" : "Click to collapse")}
                            </span>
                          </div>

                          {/* Table Body (collapsible) */}
                          {!isCollapsed && (
                            <>
                              {/* Desktop Table View */}
                              <div className="table-responsive d-none d-md-block">
                                <table className="table table-striped table-hover m-0">
                                  <thead>
                                    <tr>
                                      <th style={{ width: 44 }} className="d-none d-lg-table-cell">#</th>
                                      <th>{meta.language === "ar" ? "اسم الخدمة" : "Service Name"}</th>
                                      <th className="text-center no-wrap d-none d-lg-table-cell" style={{ width: 170 }}>
                                        <span>{meta.language === "ar" ? "وقت التسليم" : "Delivery Time"}</span>
                                      </th>
                                      <th className="text-right" style={{ width: 160 }}>
                                        {meta.language === "ar" ? "السعر" : "Price"}
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {catItems.map((item) => {
                                      const delivery = item.deliveryTime || "1-24 Hours";
                                      const isHot = item.isHot;
                                      const orderHref = item.packageId
                                        ? `/service/${item.serviceId}?package=${item.packageId}`
                                        : `/service/${item.serviceId}`;

                                      const showParentSnippet =
                                        item.parentServiceName &&
                                        item.parentServiceName !== cat.name &&
                                        !item.name.toLowerCase().includes(item.parentServiceName.toLowerCase().slice(0, 10));

                                      return (
                                        <tr
                                          key={item.uniqueId}
                                          className="service active"
                                          style={{ cursor: "pointer" }}
                                          onClick={() => router.push(orderHref)}
                                        >
                                          <td className="cursor-pointer text-center service-icon-cell d-none d-lg-table-cell">
                                            {renderIcon(item.serviceRef)}
                                          </td>
                                          <td className="cursor-pointer w-100" style={{ whiteSpace: "normal" }}>
                                            <Link
                                              href={orderHref}
                                              className="searchme"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              {item.name}
                                            </Link>
                                            {isHot && <span className="hot-tag">HOT</span>}
                                            {showParentSnippet && (
                                              <div className="service-desc-snippet" style={{ color: "#64748b", fontSize: "0.78rem", marginTop: 2 }}>
                                                {item.parentServiceName}
                                              </div>
                                            )}
                                            {item.description && item.description !== item.name && item.description !== item.parentServiceName && (
                                              <div className="service-desc-snippet">
                                                {item.description}
                                              </div>
                                            )}
                                          </td>
                                          <td className="text-center border-left no-wrap d-none d-lg-table-cell">
                                            <span className="delivery-time-text">
                                              <Clock size={13} style={{ color: "#0284c7" }} />
                                              <span>{delivery}</span>
                                            </span>
                                          </td>
                                          <td className="text-right border-left">
                                            <div className="price-cell-wrapper">
                                              <span className="nowrap price-display">
                                                <span className="prefix">$</span> {item.price.toFixed(2)}
                                                <span className="suffix"></span>
                                              </span>
                                              <Link
                                                href={orderHref}
                                                className="order-btn-link"
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                                {meta.language === "ar" ? "طلب" : "Order"}
                                              </Link>
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>

                              {/* Mobile Responsive Cards View */}
                              <div className="mobile-service-list d-block d-md-none">
                                {catItems.map((item) => {
                                  const delivery = item.deliveryTime || "1-24 Hours";
                                  const isHot = item.isHot;
                                  const orderHref = item.packageId
                                    ? `/service/${item.serviceId}?package=${item.packageId}`
                                    : `/service/${item.serviceId}`;

                                  const showParentSnippet =
                                    item.parentServiceName &&
                                    item.parentServiceName !== cat.name &&
                                    !item.name.toLowerCase().includes(item.parentServiceName.toLowerCase().slice(0, 10));

                                  return (
                                    <div
                                      key={item.uniqueId}
                                      className="mobile-service-card"
                                      onClick={() => router.push(orderHref)}
                                    >
                                      <div className="mobile-service-top">
                                        <div className="mobile-service-name-wrap">
                                          <Link
                                            href={orderHref}
                                            className="mobile-service-name"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            {item.name}
                                          </Link>
                                          {isHot && <span className="hot-tag">HOT</span>}
                                        </div>
                                        <div className="mobile-service-price">
                                          <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>$</span>
                                          <span>{item.price.toFixed(2)}</span>
                                        </div>
                                      </div>

                                      {showParentSnippet && (
                                        <div className="mobile-service-snippet" style={{ color: "#64748b" }}>
                                          {item.parentServiceName}
                                        </div>
                                      )}

                                      {item.description && item.description !== item.name && item.description !== item.parentServiceName && (
                                        <div className="mobile-service-snippet">
                                          {item.description}
                                        </div>
                                      )}

                                      <div className="mobile-service-bottom">
                                        <span className="mobile-service-delivery">
                                          <Clock size={12} style={{ color: "#0284c7" }} />
                                          <span>{delivery}</span>
                                        </span>

                                        <Link
                                          href={orderHref}
                                          className="mobile-service-order-btn"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          {meta.language === "ar" ? "طلب الخدمة" : "Order"}
                                        </Link>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}

                  {/* Uncategorized Services */}
                  {uncategorizedItems.length > 0 && (
                    <div className="group card mb-3 bottom-space active">
                      <div className="group-card-header">
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Zap size={18} color="#0284c7" />
                          <h5 className="group-title m-0">{meta.language === "ar" ? "خدمات أخرى" : "Other Services"}</h5>
                          <span className="badge-group-count">{uncategorizedItems.length}</span>
                        </div>
                      </div>

                      {/* Desktop Table View */}
                      <div className="table-responsive d-none d-md-block">
                        <table className="table table-striped table-hover m-0">
                          <thead>
                            <tr>
                              <th style={{ width: 44 }} className="d-none d-lg-table-cell">#</th>
                              <th>{meta.language === "ar" ? "اسم الخدمة" : "Service Name"}</th>
                              <th className="text-center no-wrap d-none d-lg-table-cell" style={{ width: 170 }}>
                                <span>{meta.language === "ar" ? "وقت التسليم" : "Delivery Time"}</span>
                              </th>
                              <th className="text-right" style={{ width: 160 }}>
                                {meta.language === "ar" ? "السعر" : "Price"}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {uncategorizedItems.map((item) => {
                              const delivery = item.deliveryTime || "1-24 Hours";
                              const isHot = item.isHot;
                              const orderHref = item.packageId
                                ? `/service/${item.serviceId}?package=${item.packageId}`
                                : `/service/${item.serviceId}`;

                              return (
                                <tr
                                  key={item.uniqueId}
                                  className="service active"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => router.push(orderHref)}
                                >
                                  <td className="cursor-pointer text-center service-icon-cell d-none d-lg-table-cell">
                                    {renderIcon(item.serviceRef)}
                                  </td>
                                  <td className="cursor-pointer w-100" style={{ whiteSpace: "normal" }}>
                                    <Link
                                      href={orderHref}
                                      className="searchme"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {item.name}
                                    </Link>
                                    {isHot && <span className="hot-tag">HOT</span>}
                                    {item.description && item.description !== item.name && (
                                      <div className="service-desc-snippet">
                                        {item.description}
                                      </div>
                                    )}
                                  </td>
                                  <td className="text-center border-left no-wrap d-none d-lg-table-cell">
                                    <span className="delivery-time-text">
                                      <Clock size={13} style={{ color: "#0284c7" }} />
                                      <span>{delivery}</span>
                                    </span>
                                  </td>
                                  <td className="text-right border-left">
                                    <div className="price-cell-wrapper">
                                      <span className="nowrap price-display">
                                        <span className="prefix">$</span> {item.price.toFixed(2)}
                                        <span className="suffix"></span>
                                      </span>
                                      <Link
                                        href={orderHref}
                                        className="order-btn-link"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {meta.language === "ar" ? "طلب" : "Order"}
                                      </Link>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Responsive Cards View */}
                      <div className="mobile-service-list d-block d-md-none">
                        {uncategorizedItems.map((item) => {
                          const delivery = item.deliveryTime || "1-24 Hours";
                          const isHot = item.isHot;
                          const orderHref = item.packageId
                            ? `/service/${item.serviceId}?package=${item.packageId}`
                            : `/service/${item.serviceId}`;

                          return (
                            <div
                              key={item.uniqueId}
                              className="mobile-service-card"
                              onClick={() => router.push(orderHref)}
                            >
                              <div className="mobile-service-top">
                                <div className="mobile-service-name-wrap">
                                  <Link
                                    href={orderHref}
                                    className="mobile-service-name"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {item.name}
                                  </Link>
                                  {isHot && <span className="hot-tag">HOT</span>}
                                </div>
                                <div className="mobile-service-price">
                                  <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>$</span>
                                  <span>{item.price.toFixed(2)}</span>
                                </div>
                              </div>

                              {item.description && item.description !== item.name && (
                                <div className="mobile-service-snippet">
                                  {item.description}
                                </div>
                              )}

                              <div className="mobile-service-bottom">
                                <span className="mobile-service-delivery">
                                  <Clock size={12} style={{ color: "#0284c7" }} />
                                  <span>{delivery}</span>
                                </span>

                                <Link
                                  href={orderHref}
                                  className="mobile-service-order-btn"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {meta.language === "ar" ? "طلب الخدمة" : "Order"}
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Load More Button */}
                  {!searchTerm.trim() && visibleCategories < catalogCategories.length && (
                    <div style={{ display: "flex", justifyContent: "center", margin: "20px 0" }}>
                      <button
                        type="button"
                        className="reseller-tab-item active"
                        style={{ cursor: "pointer", padding: "10px 28px", fontSize: "0.9rem", border: "none" }}
                        onClick={() => setVisibleCategories((c) => c + 30)}
                      >
                        <ChevronDown size={15} />
                        <span>{meta.language === "ar" ? `تحميل المزيد من الأقسام (${catalogCategories.length - visibleCategories} متبقي)` : `Load More Groups (${catalogCategories.length - visibleCategories} remaining)`}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
