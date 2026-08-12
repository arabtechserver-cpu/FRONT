"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/config";

export default function ServicesClient({ initialCategories = [], initialServices = [] }) {
  const [services, setServices] = useState(initialServices);
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState(initialServices.length === 0);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCategories, setVisibleCategories] = useState(5);
  const [settings, setSettings] = useState({ announcement_text: "ðŸŸ¢ ÙˆØ§ØªØ³Ø§Ø¨ Ø§Ù„Ø¥Ø¯Ø§Ø±Ø© 1: +1 (672) 897-2935 | ðŸŸ¢ ÙˆØ§ØªØ³Ø§Ø¨ Ø§Ù„Ø¥Ø¯Ø§Ø±Ø© 2: +249 12 366 7227" });
  
  const searchParams = useSearchParams();
  const typeFilter = searchParams.get("type"); // e.g., 'imei', 'server', 'remote'

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

    if (lowerImg.includes("pubg") || lowerName.includes("pubg") || lowerName.includes("Ø¨Ø¨Ø¬ÙŠ")) return "ðŸ”«";
    if (lowerImg.includes("freefire") || lowerImg.includes("free fire") || lowerName.includes("ÙØ±ÙŠ ÙØ§ÙŠØ±") || lowerName.includes("free fire") || lowerName.includes("freefire")) return "ðŸ”¥";
    if (lowerImg.includes("bigo") || lowerName.includes("Ø¨ÙŠØ¬Ùˆ")) return "ðŸ’¬";
    if (lowerImg.includes("vodafone") || lowerName.includes("ÙÙˆØ¯Ø§ÙÙˆÙ†")) return "ðŸ“±";
    if (lowerImg.includes("usdt") || lowerName.includes("usdt") || lowerName.includes("Ø¹Ù…Ù„Ø©") || lowerName.includes("Ø£Ø±ØµØ¯Ø©")) return "ðŸª™";
    if (lowerImg.includes("canva") || lowerName.includes("ÙƒØ§Ù†ÙØ§")) return "ðŸŽ¨";
    if (lowerImg.includes("netflix") || lowerName.includes("Ù†ØªÙÙ„ÙŠÙƒØ³")) return "ðŸŽ¬";
    if (lowerName.includes("Ø§ÙŠÙÙˆÙ†") || lowerName.includes("iphone") || lowerName.includes("ipad") || lowerName.includes("Ø§ÙŠØ¨Ø§Ø¯") || lowerName.includes("bypass") || lowerName.includes("ØªØ®Ø·") || lowerName.includes("icloud") || lowerName.includes("Ø§ÙŠÙƒÙ„Ø§ÙˆØ¯") || lowerName.includes("hello") || lowerName.includes("removal") || lowerName.includes("hfz") || lowerName.includes("smd") || lowerName.includes("otix")) return "ðŸ“±";

    return "âš¡";
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
    if (image.includes("pubg")) return "ðŸ”«";
    if (image.includes("freefire")) return "ðŸ”¥";
    if (image.includes("bigo")) return "ðŸ’¬";
    if (image.includes("vodafone")) return "ðŸ“±";

    if (image.includes("usdt")) return "ðŸª™";
    if (image.includes("canva")) return "ðŸŽ¨";
    if (image.includes("netflix")) return "ðŸŽ¬";
    return "âš¡";
  };

  const catalogCategories = useMemo(() => {
    if (!typeFilter) return categories;
    return categories.filter(cat => {
      const catServices = services.filter(s => s.category_id === cat.id);
      return catServices.some(s => (s.api_service_type || 'imei').toLowerCase() === typeFilter.toLowerCase());
    });
  }, [categories, services, typeFilter]);

  const catalogServices = services;

  const filteredServices = catalogServices.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const uncategorizedServices = filteredServices
    .filter((s) => !catalogCategories.some((c) => c.id === s.category_id))
    .sort((a, b) => a.name.localeCompare(b.name, 'en'));

  return (
    <>


      {/* Page Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", marginBottom: "10px", gap: "12px", flexWrap: "wrap" }}>
        <h2 className="section-title" style={{ margin: 0 }}>Ø§Ù„Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ù…ØªØ§Ø­Ø©</h2>
        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>
          {filteredServices.length} Ø®Ø¯Ù…Ø© Ù…ØªÙˆÙØ±Ø©
        </span>
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", margin: "0 0 20px 0" }}>
        ØªØµÙØ­ ÙˆØ§Ø¨Ø­Ø« ÙÙŠ ÙƒØ§ÙØ© Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ø³ÙˆÙØª ÙˆÙŠØ± ÙˆØªÙØ¹ÙŠÙ„Ø§Øª Ø§Ù„Ø¯ÙˆÙ†Ø¬Ù„Ø§Øª ÙˆØ§Ù„Ø¨Ø±Ø§Ù…Ø¬ Ø§Ù„Ù…ØªØ§Ø­Ø©.
      </p>

      {/* Centered Search Bar */}
      <div className="search-container-center">
        <input
          type="text"
          className="search-input-center"
          placeholder="Ø§Ø¨Ø­Ø« Ø¹Ù† Ø®Ø¯Ù…Ø© Ø³ÙˆÙØª ÙˆÙŠØ±ØŒ ØªÙØ¹ÙŠÙ„Ø§ØªØŒ Ø£Ø¯ÙˆØ§Øª..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          dir="ltr"
          style={{ direction: "ltr", textAlign: "left" }}
        />
        <span className="search-icon-center">ðŸ”</span>
      </div>

      {/* Services List (scc-grid) */}
      {loading && services.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", fontSize: "1.2rem", fontWeight: 700 }}>
          Ø¬Ø§Ø±ÙŠ ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø®Ø¯Ù…Ø§Øª...
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: "40px" }}>
          <span style={{ fontSize: "3rem" }}>ðŸ“­</span>
          <h3 style={{ margin: "15px 0 10px 0" }}>Ù„Ø§ ØªØªÙˆÙØ± Ø®Ø¯Ù…Ø§Øª Ù…Ø·Ø§Ø¨Ù‚Ø© Ù„Ù„Ø¨Ø­Ø«</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>ÙŠØ±Ø¬Ù‰ ØªØ¬Ø±Ø¨Ø© ÙƒÙ„Ù…Ø§Øª Ø¨Ø­Ø« Ø£Ø®Ø±Ù‰ Ø£Ùˆ ØªØµÙØ­ Ø§Ù„Ø£Ù‚Ø³Ø§Ù… Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©.</p>
          <Link href="/" className="glass-btn glass-btn-primary">Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„Ù„Ø±Ø¦ÙŠØ³ÙŠØ©</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
          {catalogCategories.filter(cat => {
            if (searchTerm.trim().length > 0) return true;
            return true;
          }).slice(0, searchTerm.trim().length > 0 ? catalogCategories.length : visibleCategories).map((cat) => {
            const catServices = filteredServices.filter(s => s.category_id === cat.id).sort((a, b) => a.name.localeCompare(b.name, 'en'));
            if (catServices.length === 0) return null;

            return (
              <div key={cat.id} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {/* Category Header */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  paddingBottom: "12px",
                  borderBottom: "2px solid rgba(255, 255, 255, 0.05)",
                  position: "relative",
                  flexWrap: "wrap"
                }}>
                  {cat.image && cat.image !== "default" && cat.image !== "null" && (
                    <div style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
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
                    {catServices.length} {catServices.length === 1 ? "Ø®Ø¯Ù…Ø©" : catServices.length === 2 ? "Ø®Ø¯Ù…ØªÙŠÙ†" : "Ø®Ø¯Ù…Ø§Øª"}
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
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "100%", marginTop: "6px", minWidth: 0 }}>
                                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "bold" }}>Ø§Ù„Ø¨Ø§Ù‚Ø§Øª Ø§Ù„Ù…ØªÙˆÙØ±Ø©:</span>
                                  {service.packages.slice(0, 3).map((pkg, idx) => (
                                    <div key={idx} style={{ 
                                      display: "flex", 
                                      justifyContent: "space-between", 
                                      alignItems: "center",
                                      gap: "8px",
                                      fontSize: "0.85rem", 
                                      background: "rgba(255, 255, 255, 0.03)", 
                                      padding: "4px 8px", 
                                      borderRadius: "6px",
                                      border: "1px solid rgba(255, 255, 255, 0.05)",
                                      width: "100%",
                                      boxSizing: "border-box",
                                      minWidth: 0
                                    }}>
                                      <span style={{ color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: "1 1 auto", minWidth: 0 }} title={pkg.name}>{pkg.name}</span>
                                      <span style={{ color: "var(--primary-color)", fontWeight: "bold", flexShrink: 0 }}>$\{Number(pkg.price).toFixed(2)}</span>
                                    </div>
                                  ))}
                                  {service.packages.length > 3 && (
                                    <span style={{ fontSize: "0.78rem", color: "#fbbf24", background: "rgba(245, 158, 11, 0.14)", border: "1px solid rgba(245, 158, 11, 0.35)", padding: "3px 9px", borderRadius: "8px", fontWeight: "900", marginTop: "4px", display: "inline-block" }}>+ Ø¹Ø±Ø¶ Ø§Ù„Ù…Ø²ÙŠØ¯ ({service.packages.length - 3})</span>
                                  )}
                                </div>
                              ) : service.price > 0 ? (
                                <span style={{ color: "var(--primary-color)", fontWeight: 900, fontSize: "0.9rem" }}>
                                  $ {Number(service.price).toFixed(2)}
                                </span>
                              ) : (
                                <>
                                  <div className="scc-dot"></div>
                                  <span>Ø§Ø¶ØºØ· Ù„Ù„Ø¹Ø±Ø¶</span>
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
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                paddingBottom: "12px",
                borderBottom: "2px solid rgba(255, 255, 255, 0.05)",
                position: "relative",
                flexWrap: "wrap"
              }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden"
                }}>
                  <span style={{ fontSize: "1.2rem" }}>âš¡</span>
                </div>
                <h3 className="cat-section-header" style={{ flex: "1 1 auto", wordBreak: "break-word", lineHeight: "1.4" }}>Ø®Ø¯Ù…Ø§Øª Ø£Ø®Ø±Ù‰</h3>
                <span style={{
                  fontSize: "0.75rem",
                  color: "#cbd5e1",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  padding: "2px 8px",
                  borderRadius: "10px",
                  fontWeight: "700"
                }}>
                  {uncategorizedServices.length} Ø®Ø¯Ù…Ø©
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
                                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "bold" }}>Ø§Ù„Ø¨Ø§Ù‚Ø§Øª Ø§Ù„Ù…ØªÙˆÙØ±Ø©:</span>
                                {service.packages.slice(0, 3).map((pkg, idx) => (
                                  <div key={idx} style={{ 
                                    display: "flex", 
                                    justifyContent: "space-between", 
                                    alignItems: "center",
                                    gap: "8px",
                                    fontSize: "0.85rem", 
                                    background: "rgba(255, 255, 255, 0.03)", 
                                    padding: "4px 8px", 
                                    borderRadius: "6px",
                                    border: "1px solid rgba(255, 255, 255, 0.05)",
                                    width: "100%",
                                    boxSizing: "border-box",
                                    minWidth: 0
                                  }}>
                                    <span style={{ color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: "1 1 auto", minWidth: 0 }} title={pkg.name}>{pkg.name}</span>
                                    <span style={{ color: "var(--primary-color)", fontWeight: "bold", flexShrink: 0 }}>${Number(pkg.price).toFixed(2)}</span>
                                  </div>
                                ))}
                                {service.packages.length > 3 && (
                                  <span style={{ fontSize: "0.78rem", color: "#fbbf24", background: "rgba(245, 158, 11, 0.14)", border: "1px solid rgba(245, 158, 11, 0.35)", padding: "3px 9px", borderRadius: "8px", fontWeight: "900", marginTop: "4px", display: "inline-block" }}>+ Ø¹Ø±Ø¶ Ø§Ù„Ù…Ø²ÙŠØ¯ ({service.packages.length - 3})</span>
                                )}
                              </div>
                            ) : service.price > 0 ? (
                              <span style={{ color: "var(--primary-color)", fontWeight: 900, fontSize: "0.9rem" }}>
                                $ {Number(service.price).toFixed(2)}
                              </span>
                            ) : (
                              <>
                                <div className="scc-dot"></div>
                                <span>Ø§Ø¶ØºØ· Ù„Ù„Ø¹Ø±Ø¶</span>
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
                عرض المزيد
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}




