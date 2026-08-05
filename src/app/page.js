"use client";

import "./home.css";
import { useState, useEffect, useCallback } from "react";

import Link from "next/link";
import { API_BASE_URL } from "@/config";

// ─── helpers ────────────────────────────────────────────────────────────────
function resolveImage(path) {
  if (!path || path === "default" || path === "null") return null;
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${clean}`;
}

function getMinPrice(packagesStr) {
  try {
    const pkgs = typeof packagesStr === "string" ? JSON.parse(packagesStr) : (packagesStr || []);
    if (!Array.isArray(pkgs) || pkgs.length === 0) return null;
    const prices = pkgs.map(p => Number(p.price)).filter(p => p > 0);
    return prices.length ? Math.min(...prices).toFixed(2) : null;
  } catch { return null; }
}

function getCatIcon(image) {
  if (!image) return "📁";
  const src = resolveImage(image);
  if (src) return <img src={src} alt="" style={{ width: 38, height: 38, objectFit: "contain", borderRadius: 8 }} />;
  const map = { games: "🎮", apps: "📱", telecom: "📞", payment: "💳", software: "💻", accounts: "🔑" };
  return map[image] || "📁";
}

function getWhatsappLink(text) {
  if (!text) return "https://wa.me/16728972935";
  const match = text.match(/\+?[\d\s()-]{8,}/);
  if (match) return `https://wa.me/${match[0].replace(/\D/g, "")}`;
  return "https://wa.me/16728972935";
}

const DEFAULT_SLIDES = [
  { title: "قسم خدمات سيرفر والأدوات", highlight: "Server & Tools", desc: "كافة خدمات السيرفر، تفعيل الأدوات، البوكسات الرقمية والدعم الفني.", badge: "القسم الأساسي", color: "#10b981", icon: "🛠️", link: "/category/14" },
  { title: "أحدث خدمات وأكواد APPLE", highlight: "Apple Services", desc: "تفعيل اشتراكات آبل، بطاقات الهدايا، وحلول الحسابات الرسمية.", badge: "مميز وحصري", color: "#a855f7", icon: "🍏", link: "/category/13" },
  { title: "صرف USDT بأفضل سعر", highlight: "Zoom USDT", desc: "كافة طرق الدفع | عمولة صفر | تنفيذ تلقائي فوري 100%.", badge: "عرض خاص", color: "#00b4d8", icon: "🪙", link: "/wallet" },
];

const WHY_US = [
  { icon: "🚀", title: "سرعة التنفيذ", desc: "تنفيذ تلقائي فوري في ثوانٍ." },
  { icon: "🛡️", title: "أمان عالي", desc: "بيانات مشفرة وخدمات موثقة." },
  { icon: "🕐", title: "دعم 24/7", desc: "فريق دعم جاهز على مدار الساعة." },
  { icon: "💰", title: "أفضل الأسعار", desc: "أسعار تنافسية بدون رسوم خفية." },
];

export default function Home() {
  const [categories, setCategories]         = useState([]);
  const [loading, setLoading]               = useState(true);
  const [searchTerm, setSearchTerm]         = useState("");
  const [slides, setSlides]                 = useState(DEFAULT_SLIDES);
  const [currentSlide, setCurrentSlide]     = useState(0);
  const [popularServices, setPopularServices] = useState([]);
  const [popularLoading, setPopularLoading] = useState(true);
  const [settings, setSettings]             = useState({ site_name: "عرب تك سيرفر", announcement_text: "" });
  const [activeSection, setActiveSection]   = useState("categories"); // categories | popular | new
  const [reviews, setReviews]               = useState([]);
  const [featuredSections, setFeaturedSections] = useState([]);
  const [stats, setStats]                   = useState([
    { icon: "👥", value: "10K+", label: "مستخدم نشط" },
    { icon: "✅", value: "50K+", label: "طلب ناجح" },
    { icon: "⚡", value: "100+", label: "خدمة متوفرة" },
    { icon: "🎧", value: "24/7", label: "دعم فني" }
  ]);

  // ── bootstrap ─────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/settings`).then(r => r.ok ? r.json() : null).then(d => {
      if (d) {
        setSettings(d);
        if (d.home_stats) {
          try {
            setStats(typeof d.home_stats === 'string' ? JSON.parse(d.home_stats) : d.home_stats);
          } catch(e) {}
        }
        if (d.featured_sections && Array.isArray(d.featured_sections)) {
          setFeaturedSections(d.featured_sections);
        }
      }
    }).catch(() => {});

    // categories
    fetch(`${API_BASE_URL}/api/categories`)
      .then(r => r.ok ? r.json() : [])
      .then(data => { setCategories(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));

    // reviews
    fetch(`${API_BASE_URL}/api/reviews`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setReviews(Array.isArray(data) ? data : []))
      .catch(() => {});

    // banners
    fetch(`${API_BASE_URL}/api/banners`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setSlides(data);
        } else {
          setSlides(DEFAULT_SLIDES);
        }
      })
      .catch(() => {});

    // popular
    fetch(`${API_BASE_URL}/api/orders/popular-services`)
      .then(r => r.ok ? r.json() : [])
      .then(data => { setPopularServices(Array.isArray(data) ? data : []); setPopularLoading(false); })
      .catch(() => setPopularLoading(false));
  }, []);

  // ── auto-slide ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!slides.length) return;
    const t = setInterval(() => setCurrentSlide(p => (p + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides]);

  const rootCats = categories.filter(c => !c.parent_id);
  const filtered = rootCats.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <>
      {/* ══════════════════════════════════════════════════════
          HERO BANNER
      ══════════════════════════════════════════════════════ */}
      <section className="hero-banner">
        {/* announcement ticker */}
        <div className="notice-bar-container notice-slim">
          <div className="container">
            <div className="notice-row" aria-label="Announcements">
              <div className="notice-track" role="presentation">
                <div className="notice-set" role="presentation">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="notice-set-item">
                      <span className="notice-pill notice-pill-gold">
                        ✨ مرحبا بكم هنا سيرفر عرب تك متاح جميع الخدمات بفضل الله واسعار مناسبه للجميع
                      </span>
                      <span className="notice-pill notice-pill-gold">
                        ✨ Welcome to Arab Tech Server, all services are available and prices are suitable for everyone
                      </span>
                      <a href="https://wa.me/249123667227" target="_blank" rel="noopener noreferrer" className="notice-pill notice-pill-link">
                        <span className="notice-pill-label">💬 واتساب 1:</span>
                        <bdi dir="ltr" className="notice-pill-bdi">+249&nbsp;12&nbsp;366&nbsp;7227</bdi>
                      </a>
                      <a href="https://wa.me/16728972935" target="_blank" rel="noopener noreferrer" className="notice-pill notice-pill-link">
                        <span className="notice-pill-label">💬 واتساب 2:</span>
                        <bdi dir="ltr" className="notice-pill-bdi">+1&nbsp;(672)&nbsp;897-2935</bdi>
                      </a>
                    </div>
                  ))}
                </div>
                <div className="notice-set" aria-hidden="true" role="presentation">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="notice-set-item">
                      <span className="notice-pill notice-pill-gold">
                        ✨ مرحبا بكم هنا سيرفر عرب تك متاح جميع الخدمات بفضل الله واسعار مناسبه للجميع
                      </span>
                      <span className="notice-pill notice-pill-gold">
                        ✨ Welcome to Arab Tech Server, all services are available and prices are suitable for everyone
                      </span>
                      <a href="https://wa.me/249123667227" target="_blank" rel="noopener noreferrer" className="notice-pill notice-pill-link">
                        <span className="notice-pill-label">💬 واتساب 1:</span>
                        <bdi dir="ltr" className="notice-pill-bdi">+249&nbsp;12&nbsp;366&nbsp;7227</bdi>
                      </a>
                      <a href="https://wa.me/16728972935" target="_blank" rel="noopener noreferrer" className="notice-pill notice-pill-link">
                        <span className="notice-pill-label">💬 واتساب 2:</span>
                        <bdi dir="ltr" className="notice-pill-bdi">+1&nbsp;(672)&nbsp;897-2935</bdi>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* slides */}
        {slides.map((slide, idx) => {
          const isImage = slide.icon && (slide.icon.startsWith("data:") || slide.icon.startsWith("http") || slide.icon.startsWith("/uploads"));
          const imgSrc = isImage ? (slide.icon.startsWith("/uploads") ? `${API_BASE_URL}${slide.icon}` : slide.icon) : null;

          return (
            <div
              key={idx}
              className="banner-content"
              style={{
                opacity: currentSlide === idx ? 1 : 0,
                visibility: currentSlide === idx ? "visible" : "hidden",
                transition: "opacity 0.6s ease-in-out, visibility 0.6s"
              }}
            >
              {/* Full-cover background image for image slides */}
              {isImage && (
                <>
                  <img
                    src={imgSrc}
                    alt={slide.title}
                    className="banner-bg-img"
                  />
                  <div className="banner-bg-overlay" />
                </>
              )}

              {/* Text Content */}
              <div className="banner-info">
                <span className="banner-badge" style={{ borderColor: slide.color, color: slide.color, background: `${slide.color}22` }}>{slide.badge}</span>
                <h1 className="banner-title">
                  {slide.title}<br />
                  <span style={{ backgroundImage: `linear-gradient(135deg,#fff 0%,${slide.color} 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>{slide.highlight}</span>
                </h1>
                <p className="banner-desc">{slide.desc}</p>
                {slide.link && (
                  <Link href={slide.link} className="hero-cta-btn" style={{ "--cta-color": slide.color }}>
                    دخول القسم الآن ←
                  </Link>
                )}
              </div>

              {/* Graphic – emoji only (image slides have bg-img above) */}
              {!isImage && (
                <div className="banner-graphic">
                  <span className="coin-icon" style={{ color: slide.color, filter: `drop-shadow(0 0 30px ${slide.color}88)` }}>{slide.icon}</span>
                </div>
              )}
            </div>
          );
        })}

        {/* search */}
        <div className="hero-search-container">
          <input type="text" className="search-input-center" placeholder="ابحث عن قسم أو خدمة..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <span className="search-icon-center">🔍</span>
        </div>

        {/* dots */}
        <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 10 }}>
          {slides.map((_, idx) => (
            <button key={idx} onClick={() => setCurrentSlide(idx)} style={{ width: currentSlide === idx ? 20 : 8, height: 8, borderRadius: 4, border: "none", background: currentSlide === idx ? "#fff" : "rgba(255,255,255,0.4)", cursor: "pointer", transition: "all 0.3s" }} />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════════════ */}
      <div className="hp-stats-bar">
        {stats.map((s, i) => (
          <div key={i} className="hp-stat-item">
            <span className="hp-stat-icon">{s.icon}</span>
            <div>
              <div className="hp-stat-val">{s.value}</div>
              <div className="hp-stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════
          FEATURED CATEGORIES (أقسام مميزة)
      ══════════════════════════════════════════════════════ */}
      <div className="hp-featured-section" style={{ marginBottom: "40px" }}>
        <h2 className="hp-section-title">أقسام مميزة</h2>
        {featuredSections.length === 0 ? null : (
        <div className="hp-featured-grid">
          {featuredSections.map((cat, idx) => (
            <div key={idx} className="hp-featured-card">
              {cat.image ? (
                <img
                  src={cat.image}
                  alt="Featured Category"
                  className="hp-featured-cover"
                />
              ) : (
                <div className="hp-featured-no-img">بدون صورة رئيسية</div>
              )}
              <ul className="hp-featured-list">
                {(cat.items || []).map((item, i) => (
                  <li key={i} className={`hp-featured-item${i < (cat.items||[]).length-1 ? ' has-border' : ''}`}>
                    <Link href={item.url || '#'} className="hp-featured-link">
                      {item.img && (
                        <img
                          src={item.img}
                          alt={item.title}
                          className="hp-featured-item-img"
                        />
                      )}
                      <div className="hp-featured-item-info">
                        <p className="hp-featured-item-title">{item.title}</p>
                        <span className="hp-featured-time-badge">{item.time}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          SECTION TOGGLE TABS  (أقسام / الأكثر طلباً / جديد)
      ══════════════════════════════════════════════════════ */}
      <div className="hp-section-tabs">
        <button className={`hp-tab-btn ${activeSection === "categories" ? "active" : ""}`} onClick={() => setActiveSection("categories")}>
          <span>🗂️</span> أقسام الخدمات
        </button>
        <button className={`hp-tab-btn ${activeSection === "popular" ? "active" : ""}`} onClick={() => setActiveSection("popular")}>
          <span>🔥</span> الأكثر طلباً
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════
          CATEGORIES LIST VIEW  (image tab)
      ══════════════════════════════════════════════════════ */}
      {activeSection === "categories" && (
        <div className="hp-services-panel">
          <div className="hp-panel-header">
            <span className="hp-panel-icon">🗂️</span>
            <span className="hp-panel-title">أقسام الخدمات</span>
            <span className="hp-panel-badge">{filtered.length} قسم</span>
          </div>

          {loading ? (
            <div className="hp-list">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="hp-row hp-skeleton" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="hp-empty">لا توجد أقسام مطابقة 😕</div>
          ) : (
            <div className="hp-list">
              {filtered.slice(0, 20).map(cat => {
                const color = cat.color || "#6366f1";
                const minPrice = null; // categories don't have direct price
                return (
                  <Link key={cat.id} href={`/category/${cat.id}`} className="hp-row" style={{ "--rc": color }}>

                    {/* info */}
                    <div className="hp-row-info">
                      <div className="hp-row-name">{cat.name}</div>
                      <div className="hp-row-sub">
                        {cat.description || "استعرض جميع الخدمات"}
                        <span className="hp-row-status">متاح الآن</span>
                      </div>
                    </div>
                    {/* right */}
                    <div className="hp-row-right">
                      <div className="hp-row-price">{minPrice ? `من ${minPrice} $` : ""}</div>
                      <div className="hp-row-btn" style={{ background: `${color}22`, border: `1px solid ${color}44`, color }}>
                        دخول القسم
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* view all */}
          <div style={{ textAlign: "center", padding: "18px 0 4px" }}>
            <Link href="/services" className="hp-view-all-btn">
              عرض جميع الأقسام ←
            </Link>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          POPULAR SERVICES LIST VIEW
      ══════════════════════════════════════════════════════ */}
      {activeSection === "popular" && (
        <div className="hp-services-panel">
          <div className="hp-panel-header">
            <span className="hp-panel-icon">🔥</span>
            <span className="hp-panel-title">الأكثر طلباً</span>
            {!popularLoading && <span className="hp-panel-badge">{popularServices.length} خدمة</span>}
          </div>

          {popularLoading ? (
            <div className="hp-list">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="hp-row hp-skeleton" />)}
            </div>
          ) : popularServices.length === 0 ? (
            <div className="hp-empty">لا توجد بيانات كافية حتى الآن 🔄</div>
          ) : (
            <div className="hp-list">
              {popularServices.slice(0, 20).map((svc, i) => {
                const color = svc.category_color || "#6366f1";
                const imgSrc = resolveImage(svc.image);
                const minPrice = getMinPrice(svc.packages);
                const rankColors = ["#f59e0b", "#94a3b8", "#cd7c2f"];

                return (
                  <Link key={svc.id} href={`/service/${svc.id}`} className="hp-row" style={{ "--rc": color }}>
                    {/* rank badge */}
                    {i < 3 && (
                      <div className="hp-rank" style={{ background: rankColors[i] }}>
                        {i + 1}
                      </div>
                    )}

                    {/* info */}
                    <div className="hp-row-info">
                      <div className="hp-row-name">{svc.name}</div>
                      <div className="hp-row-sub">
                        <span style={{ color, fontWeight: 700 }}>{svc.category_name}</span>
                        <span className="hp-row-status">🔥 {svc.order_count} طلب</span>
                      </div>
                    </div>
                    {/* right */}
                    <div className="hp-row-right">
                      <div className="hp-row-price">{minPrice ? `من ${minPrice} $` : "—"}</div>
                      <div className="hp-row-btn" style={{ background: `${color}22`, border: `1px solid ${color}44`, color }}>
                        اطلب الآن
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          REVIEWS
      ══════════════════════════════════════════════════════ */}
      <div className="hp-reviews-section">
        <h2 className="hp-section-title">الاراء وتقييمات المستخدمين</h2>
        {reviews.length > 0 ? (
          <div className="hp-reviews-marquee-wrapper">
            {[
              { data: reviews.slice(0, Math.ceil(reviews.length / 2)), reverse: false },
              { data: reviews.slice(Math.ceil(reviews.length / 2)), reverse: true }
            ].filter(row => row.data.length > 0).map((row, rowIdx) => {
              const trackData = [...row.data, ...row.data, ...row.data, ...row.data, ...row.data, ...row.data];
              return (
                <div key={rowIdx} className={`hp-reviews-marquee-track ${row.reverse ? 'reverse' : ''}`}>
                  {trackData.map((rev, i) => (
                    <div key={`${rev.id || i}-${i}`} className="hp-review-card">
                      <div className="hp-review-header">
                        <div className="hp-review-avatar">{rev.name.charAt(0)}</div>
                        <div className="hp-review-meta">
                          <span className="hp-review-name">{rev.name}</span>
                          <span className="hp-review-rating">{"⭐".repeat(rev.rating || 5)}</span>
                        </div>
                      </div>
                      <p className="hp-review-text">"{rev.review}"</p>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="hp-empty" style={{ marginTop: 20 }}>لا توجد تقييمات حتى الآن.</div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          WHY US
      ══════════════════════════════════════════════════════ */}
      <div className="hp-why-us">
        <h2 className="hp-section-title">لماذا تختارنا؟</h2>
        <div className="hp-why-grid">
          {WHY_US.map((w, i) => (
            <div key={i} className="hp-why-card">
              <span className="hp-why-icon">{w.icon}</span>
              <div className="hp-why-title">{w.title}</div>
              <div className="hp-why-desc">{w.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════════════ */}
      <section className="faq-section" style={{ marginTop: 50, marginBottom: 40 }}>
        <h2 className="hp-section-title">الأسئلة الشائعة</h2>
        <div className="faq-container">
          {[
            { q: `ما هو ${settings.site_name}؟`, a: `${settings.site_name} منصة متكاملة لخدمات وبرامج السوفت وير بأسرع تنفيذ تلقائي وأفضل الأسعار.` },
            { q: "كيف أطلب خدمة؟", a: "اختر الخدمة ← حدد الباقة ← أدخل بياناتك ← ادفع. سيُنفَّذ طلبك فوراً." },
            { q: "ما طرق الدفع المتاحة؟", a: "رصيد المحفظة الرقمية، تحويل فودافون كاش، أو شحن بـ USDT." },
            { q: "هل الموقع آمن؟", a: "نعم، نستخدم بوابات دفع مشفرة وخدمات تفعيل رسمية 100%." },
            { q: "كيف أحصل على أسعار الجملة؟", a: "تواصل معنا عبر واتساب للحصول على تسعيرة الجملة والخصومات الخاصة." },
          ].map((item, i) => (
            <details key={i} className="faq-item">
              <summary className="faq-question">{item.q}</summary>
              <p className="faq-answer">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}




