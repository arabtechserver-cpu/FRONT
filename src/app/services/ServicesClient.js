"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/config";

export default function ServicesClient() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCategories, setVisibleCategories] = useState(5);
  const [settings, setSettings] = useState({ announcement_text: "🟢 واتساب الإدارة 1: +1 (672) 897-2935 | 🟢 واتساب الإدارة 2: +249 12 366 7227" });

  const getWhatsappLink = (text) => {
    if (!text) return "https://wa.me/16728972935";
    const digits = text.replace(/\D/g, "");
    if (digits.length >= 8) {
      return `https://wa.me/${digits}`;
    }
    return "https://wa.me/16728972935";
  };

  const staticCategories = [
    { id: 1, name: "قسم الالعاب", image: "/uploads/games-section.png", color: "#6366f1", icon: "gamepad2" },
    { id: 2, name: "تطبيقات اللايف", image: "/uploads/live-apps.png", color: "#eab308", icon: "credit-card" },
    { id: 3, name: "بطاقات الكترونية", image: "/uploads/electronic-cards.png", color: "#6366f1", icon: "credit-card" },
    { id: 4, name: "الأرصدة والعملات", image: "/uploads/balances-currencies.png", color: "#eab308", icon: "credit-card" },
    { id: 5, name: "سوشال ميديا", image: "/uploads/social-media.png", color: "#eab308", icon: "credit-card" },
    { id: 6, name: "خدمات السيرفر", image: "/uploads/server-services.png", color: "#6366f1", icon: "gamepad2" },
    { id: 7, name: "اشتراكات", image: "/uploads/subscriptions.png", color: "#d946ef", icon: "credit-card" },
    { id: 8, name: "الذكاء الاصطناعي", image: "/uploads/ai-section.png", color: "#eab308", icon: "credit-card" },
    { id: 9, name: "قسم الارقام", image: "/uploads/numbers-section.png", color: "#6366f1", icon: "credit-card" },
    { id: 10, name: "البرمجة والتصميم", image: "/uploads/programming-design.png", color: "#6366f1", icon: "gamepad2" },
    { id: 11, name: "حسابات جاهزة", image: "/uploads/ready-accounts.png", color: "#eab308", icon: "credit-card" },
    { id: 12, name: "إعلانات ممولة", image: "/uploads/ads-section.png", color: "#ec4899", icon: "share2" },
    { id: 13, name: "خدمات APPLE", image: null, color: "#a855f7", icon: "credit-card" },
    { id: 14, name: "قسم خدمات سيرفر والأدوات", image: null, color: "#10b981", icon: "credit-card" },
  ];

  const staticServices = [
    {
      id: 1,
      category_id: 1,
      name: "ببجي موبايل (PUBG Mobile)",
      description: "اشحن شدات ببجي موبايل فوراً ومباشرة في حسابك عن طريق الآيدي ID بأفضل الأسعار.",
      price: 0.99,
      image: "pubg"
    },
    {
      id: 2,
      category_id: 1,
      name: "فري فاير (Free Fire)",
      description: "اشحن جواهر فري فاير فوراً لتفعيل الفاير باس والحصول على أحدث سكنات اللعبة عبر الآيدي.",
      price: 1.10,
      image: "freefire"
    },
    {
      id: 3,
      category_id: 2,
      name: "بيجو لايف (Bigo Live)",
      description: "اشحن فاصوليا ومجوهرات تطبيق بيجو لايف لدعم البث المباشر المفضل لديك.",
      price: 1.25,
      image: "bigo"
    },
    {
      id: 4,
      category_id: 3,
      name: "فودافون كاش مصر (Vodafone Cash)",
      description: "شحن رصيد وتحويل أموال عبر محفظة فودافون كاش مباشرة بسعر الصرف الممتاز.",
      price: 1.00,
      image: "vodafone"
    },
    {
      id: 5,
      category_id: 4,
      name: "شحن رصيد USDT (TRC20)",
      description: "شراء وسحب عملة USDT الرقمية بأفضل أسعار الصرف وبسرعة تنفيذ خيالية.",
      price: 1.00,
      image: "usdt"
    },
    {
      id: 6,
      category_id: 5,
      name: "اشتراك كانفا برو (Canva Pro)",
      description: "تفعيل اشتراك كانفا برو الحساب الشخصي بكافة ميزات التصميم والذكاء الاصطناعي.",
      price: 1.99,
      image: "canva"
    },
    {
      id: 7,
      category_id: 6,
      name: "اشتراك نتفليكس (Netflix Premium)",
      description: "شاشة خاصة بك بجودة 4K UHD على حساب نتفليكس مشترك أو حساب مستقل بالكامل.",
      price: 2.50,
      image: "netflix"
    }
  ];

  useEffect(() => {
    setLoading(true);

    fetch(`${API_BASE_URL}/api/settings`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setSettings(data);
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
      })
      .catch(() => {
        const sortedStatic = [...staticCategories].sort((a, b) => a.name.localeCompare(b.name, 'en'));
        setCategories(sortedStatic);
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
      })
      .catch(() => {
        setServices(staticServices);
        setLoading(false);
      });
  }, []);

  const getFallbackEmoji = (name = "", image = "") => {
    const lowerName = (name || "").toLowerCase();
    const lowerImg = (image || "").toLowerCase();

    if (lowerImg.includes("pubg") || lowerName.includes("pubg") || lowerName.includes("ببجي")) return "🔫";
    if (lowerImg.includes("freefire") || lowerImg.includes("free fire") || lowerName.includes("فري فاير") || lowerName.includes("free fire") || lowerName.includes("freefire")) return "🔥";
    if (lowerImg.includes("bigo") || lowerName.includes("بيجو")) return "💬";
    if (lowerImg.includes("vodafone") || lowerName.includes("فودافون")) return "📱";
    if (lowerImg.includes("usdt") || lowerName.includes("usdt") || lowerName.includes("عملة") || lowerName.includes("أرصدة")) return "🪙";
    if (lowerImg.includes("canva") || lowerName.includes("كانفا")) return "🎨";
    if (lowerImg.includes("netflix") || lowerName.includes("نتفليكس")) return "🎬";
    if (lowerName.includes("ايفون") || lowerName.includes("iphone") || lowerName.includes("ipad") || lowerName.includes("ايباد") || lowerName.includes("bypass") || lowerName.includes("تخط") || lowerName.includes("icloud") || lowerName.includes("ايكلاود") || lowerName.includes("hello") || lowerName.includes("removal") || lowerName.includes("hfz") || lowerName.includes("smd") || lowerName.includes("otix")) return "📱";

    return "⚡";
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
    if (image.includes("pubg")) return "🔫";
    if (image.includes("freefire")) return "🔥";
    if (image.includes("bigo")) return "💬";
    if (image.includes("vodafone")) return "📱";
    if (image.includes("usdt")) return "🪙";
    if (image.includes("canva")) return "🎨";
    if (image.includes("netflix")) return "🎬";
    return "⚡";
  };

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const uncategorizedServices = filteredServices
    .filter((s) => !categories.some((c) => c.id === s.category_id))
    .sort((a, b) => a.name.localeCompare(b.name, 'en'));

  return (
    <>
      {/* Announcement Banner */}
      <div className="notice-bar-container notice-slim" style={{ position: "relative", top: 0, left: 0, right: 0, marginTop: "20px", marginBottom: "20px", borderRadius: "12px" }}>
        <div className="container">
          <div className="notice-row" aria-label="Announcements">
            <div className="notice-track" role="presentation">
              <div className="notice-set" role="presentation">
                <span className="notice-pill" style={{ color: "#d4af37", fontWeight: "bold", background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 4px 15px rgba(0,0,0,0.15)" }}>
                  ✨ مرحبا بكم هنا سيرفر عرب تك متاح جميع الخدمات بفضل الله واسعار مناسبه للجميع
                </span>
                <span className="notice-pill" style={{ color: "#d4af37", fontWeight: "bold", background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 4px 15px rgba(0,0,0,0.15)" }}>
                  ✨ Welcome to Arab Tech Server, all services are available and prices are suitable for everyone
                </span>
                <a href="https://wa.me/249123667227" target="_blank" rel="noopener noreferrer" className="notice-pill" style={{ color: "#fff", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 4px 15px rgba(0,0,0,0.15)" }}>
                  <span style={{ color: "#d4af37" }}>💬 واتساب 1:</span>
                  <bdi dir="ltr" style={{ fontWeight: "bold", display: "inline-block", letterSpacing: "1px" }}>+249&nbsp;12&nbsp;366&nbsp;7227</bdi>
                </a>
                <a href="https://wa.me/16728972935" target="_blank" rel="noopener noreferrer" className="notice-pill" style={{ color: "#fff", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 4px 15px rgba(0,0,0,0.15)" }}>
                  <span style={{ color: "#d4af37" }}>💬 واتساب 2:</span>
                  <bdi dir="ltr" style={{ fontWeight: "bold", display: "inline-block", letterSpacing: "1px" }}>+1&nbsp;(672)&nbsp;897-2935</bdi>
                </a>
                <a href="https://wa.me/249123667227" target="_blank" rel="noopener noreferrer" className="notice-pill" style={{ color: "#fff", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 4px 15px rgba(0,0,0,0.15)" }}>
                  <span style={{ color: "#d4af37" }}>💬 واتساب 1:</span>
                  <bdi dir="ltr" style={{ fontWeight: "bold", display: "inline-block", letterSpacing: "1px" }}>+249&nbsp;12&nbsp;366&nbsp;7227</bdi>
                </a>
                <a href="https://wa.me/16728972935" target="_blank" rel="noopener noreferrer" className="notice-pill" style={{ color: "#fff", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 4px 15px rgba(0,0,0,0.15)" }}>
                  <span style={{ color: "#d4af37" }}>💬 واتساب 2:</span>
                  <bdi dir="ltr" style={{ fontWeight: "bold", display: "inline-block", letterSpacing: "1px" }}>+1&nbsp;(672)&nbsp;897-2935</bdi>
                </a>
              </div>
              <div className="notice-set" aria-hidden="true" role="presentation">
                <span className="notice-pill" style={{ color: "#d4af37", fontWeight: "bold", background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 4px 15px rgba(0,0,0,0.15)" }}>
                  ✨ مرحبا بكم هنا سيرفر عرب تك متاح جميع الخدمات بفضل الله واسعار مناسبه للجميع
                </span>
                <span className="notice-pill" style={{ color: "#d4af37", fontWeight: "bold", background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 4px 15px rgba(0,0,0,0.15)" }}>
                  ✨ Welcome to Arab Tech Server, all services are available and prices are suitable for everyone
                </span>
                <a href="https://wa.me/249123667227" target="_blank" rel="noopener noreferrer" className="notice-pill" style={{ color: "#fff", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 4px 15px rgba(0,0,0,0.15)" }}>
                  <span style={{ color: "#d4af37" }}>💬 واتساب 1:</span>
                  <bdi dir="ltr" style={{ fontWeight: "bold", display: "inline-block", letterSpacing: "1px" }}>+249&nbsp;12&nbsp;366&nbsp;7227</bdi>
                </a>
                <a href="https://wa.me/16728972935" target="_blank" rel="noopener noreferrer" className="notice-pill" style={{ color: "#fff", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 4px 15px rgba(0,0,0,0.15)" }}>
                  <span style={{ color: "#d4af37" }}>💬 واتساب 2:</span>
                  <bdi dir="ltr" style={{ fontWeight: "bold", display: "inline-block", letterSpacing: "1px" }}>+1&nbsp;(672)&nbsp;897-2935</bdi>
                </a>
                <a href="https://wa.me/249123667227" target="_blank" rel="noopener noreferrer" className="notice-pill" style={{ color: "#fff", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 4px 15px rgba(0,0,0,0.15)" }}>
                  <span style={{ color: "#d4af37" }}>💬 واتساب 1:</span>
                  <bdi dir="ltr" style={{ fontWeight: "bold", display: "inline-block", letterSpacing: "1px" }}>+249&nbsp;12&nbsp;366&nbsp;7227</bdi>
                </a>
                <a href="https://wa.me/16728972935" target="_blank" rel="noopener noreferrer" className="notice-pill" style={{ color: "#fff", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 4px 15px rgba(0,0,0,0.15)" }}>
                  <span style={{ color: "#d4af37" }}>💬 واتساب 2:</span>
                  <bdi dir="ltr" style={{ fontWeight: "bold", display: "inline-block", letterSpacing: "1px" }}>+1&nbsp;(672)&nbsp;897-2935</bdi>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", marginBottom: "10px", gap: "12px", flexWrap: "wrap" }}>
        <h2 className="section-title" style={{ margin: 0 }}>الخدمات المتاحة</h2>
        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>
          {filteredServices.length} خدمة متوفرة
        </span>
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", margin: "0 0 20px 0" }}>
        تصفح وابحث في كافة خدمات السوفت وير وتفعيلات الدونجلات والبرامج المتاحة.
      </p>

      {/* Centered Search Bar */}
      <div className="search-container-center">
        <input
          type="text"
          className="search-input-center"
          placeholder="ابحث عن خدمة سوفت وير، تفعيلات، أدوات..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="search-icon-center">🔍</span>
      </div>

      {/* Services List (scc-grid) */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", fontSize: "1.2rem", fontWeight: 700 }}>
          جاري تحميل الخدمات...
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: "40px" }}>
          <span style={{ fontSize: "3rem" }}>📭</span>
          <h3 style={{ margin: "15px 0 10px 0" }}>لا تتوفر خدمات مطابقة للبحث</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>يرجى تجربة كلمات بحث أخرى أو تصفح الأقسام الرئيسية.</p>
          <Link href="/" className="glass-btn glass-btn-primary">العودة للرئيسية</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
          {categories.filter(cat => {
            if (searchTerm.trim().length > 0) return true;
            return true;
          }).slice(0, searchTerm.trim().length > 0 ? categories.length : visibleCategories).map((cat) => {
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
                        return <img src={src} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />;
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
                    {catServices.length} {catServices.length === 1 ? "خدمة" : catServices.length === 2 ? "خدمتين" : "خدمات"}
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
                      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
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
                                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "bold" }}>الباقات المتوفرة:</span>
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
                                    <span style={{ fontSize: "0.75rem", color: "var(--primary-color)", marginTop: "2px" }}>+ عرض المزيد ({service.packages.length - 3})</span>
                                  )}
                                </div>
                              ) : service.price > 0 ? (
                                <span style={{ color: "var(--primary-color)", fontWeight: 900, fontSize: "0.9rem" }}>
                                  $ {Number(service.price).toFixed(2)}
                                </span>
                              ) : (
                                <>
                                  <div className="scc-dot"></div>
                                  <span>اضغط للعرض</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="scc-arrow">
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left">
                              <path d="m9 18 6-6-6-6"></path>
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
                  <span style={{ fontSize: "1.2rem" }}>⚡</span>
                </div>
                <h3 className="cat-section-header" style={{ flex: "1 1 auto", wordBreak: "break-word", lineHeight: "1.4" }}>خدمات أخرى</h3>
                <span style={{
                  fontSize: "0.75rem",
                  color: "#cbd5e1",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  padding: "2px 8px",
                  borderRadius: "10px",
                  fontWeight: "700"
                }}>
                  {uncategorizedServices.length} خدمة
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
                                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "bold" }}>الباقات المتوفرة:</span>
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
                                  <span style={{ fontSize: "0.75rem", color: "var(--primary-color)", marginTop: "2px" }}>+ عرض المزيد ({service.packages.length - 3})</span>
                                )}
                              </div>
                            ) : service.price > 0 ? (
                              <span style={{ color: "var(--primary-color)", fontWeight: 900, fontSize: "0.9rem" }}>
                                $ {Number(service.price).toFixed(2)}
                              </span>
                            ) : (
                              <>
                                <div className="scc-dot"></div>
                                <span>اضغط للعرض</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="scc-arrow">
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-chevron-left">
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

          {searchTerm.trim().length === 0 && visibleCategories < categories.length && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
              <button
                onClick={() => setVisibleCategories(prev => prev + 5)}
                className="glass-btn glass-btn-primary"
                style={{ padding: "12px 30px", borderRadius: "100px", fontSize: "1.05rem", fontWeight: "bold" }}
              >
                عرض المزيد من الأقسام ⬇️
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}




