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

const DEFAULT_SLIDES = [
  { title: "قسم خدمات سيرفر والأدوات", highlight: "Server & Tools", desc: "كافة خدمات السيرفر، تفعيل الأدوات، البوكسات الرقمية والدعم الفني.", badge: "القسم الأساسي", color: "#10b981", icon: "🛠️", link: "/category/14" },
  { title: "أحدث خدمات وأكواد APPLE", highlight: "Apple Services", desc: "تفعيل اشتراكات آبل، بطاقات الهدايا، وحلول الحسابات الرسمية.", badge: "مميز وحصري", color: "#a855f7", icon: "🍏", link: "/category/13" },
  { title: "صرف USDT بأفضل سعر", highlight: "Zoom USDT", desc: "كافة طرق الدفع | عمولة صفر | تنفيذ تلقائي فوري 100%.", badge: "عرض خاص", color: "#00b4d8", icon: "🪙", link: "/wallet" },
];

const WHY_US = [
  { icon: "🔒", title: "أمان وموثوقية", desc: "حماية كاملة للبيانات." },
  { icon: "⚡", title: "سرعة في التنفيذ", desc: "إنجاز الطلبات في أسرع وقت." },
  { icon: "🎧", title: "دعم متخصص", desc: "فريق خبراء بخدمتك." },
  { icon: "💰", title: "أسعار تنافسية", desc: "الأفضل في السوق." },
];

const PAYMENT_METHODS = [
  { name: "Visa", icon: "💳", color: "#1a1f71" },
  { name: "MasterCard", icon: "💳", color: "#eb001b" },
  { name: "PayPal", icon: "🅿️", color: "#003087" },
  { name: "Bitcoin", icon: "₿", color: "#f7931a" },
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
  const [activeSection, setActiveSection]   = useState("all"); // all | popular
  const [reviews, setReviews]               = useState([]);
  const [featuredSections, setFeaturedSections] = useState([]);
  const [stats, setStats]                   = useState([
    { value: "24/7", label: "دعم مستمر" },
    { value: "+100", label: "خدمة متوفرة" },
    { value: "+50K", label: "عميل راضٍ" },
    { value: "+10K", label: "طلب منفذ" },
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

    fetch(`${API_BASE_URL}/api/categories`)
      .then(r => r.ok ? r.json() : [])
      .then(data => { setCategories(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));

    fetch(`${API_BASE_URL}/api/reviews`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setReviews(Array.isArray(data) ? data : []))
      .catch(() => {});

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
  const filteredCats = rootCats.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const displayServices = activeSection === "popular" ? popularServices : filteredCats;

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

        {/* ── Slides area wrapper (fixed height, slides are absolute inside it) */}
        <div className="hero-slides-area">
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
                {isImage && (
                  <>
                    <img src={imgSrc} alt={slide.title} className="banner-bg-img" />
                    <div className="banner-bg-overlay" />
                  </>
                )}

                <div className="banner-info">
                  <span className="banner-badge" style={{ borderColor: slide.color, color: slide.color, background: `${slide.color}22` }}>{slide.badge}</span>
                  <h1 className="banner-title">
                    {slide.title}<br />
                    <span style={{ backgroundImage: `linear-gradient(135deg,#fff 0%,${slide.color} 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>{slide.highlight}</span>
                  </h1>
                  <p className="banner-desc">{slide.desc}</p>

                  {/* Feature badges row */}
                  <div className="banner-features">
                    <div className="banner-feat-item">
                      <span className="banner-feat-icon">⚡</span>
                      <div>
                        <div className="banner-feat-title">سرعة التنفيذ</div>
                        <div className="banner-feat-sub">دقائق معدودة</div>
                      </div>
                    </div>
                    <div className="banner-feat-item">
                      <span className="banner-feat-icon">⭐</span>
                      <div>
                        <div className="banner-feat-title">نسبة نجاح عالية</div>
                        <div className="banner-feat-sub" style={{ color: "#22c55e" }}>99.9%</div>
                      </div>
                    </div>
                    <div className="banner-feat-item">
                      <span className="banner-feat-icon">🎧</span>
                      <div>
                        <div className="banner-feat-title">دعم فني 24/7</div>
                        <div className="banner-feat-sub">على مدار الساعة</div>
                      </div>
                    </div>
                    <div className="banner-feat-item">
                      <span className="banner-feat-icon">🔄</span>
                      <div>
                        <div className="banner-feat-title">تحديث يومي</div>
                        <div className="banner-feat-sub">جميع الخدمات</div>
                      </div>
                    </div>
                  </div>

                  {slide.link && (
                    <Link href={slide.link} className="hero-cta-btn" style={{ "--cta-color": slide.color }}>
                      دخول القسم الآن ←
                    </Link>
                  )}
                </div>

                {!isImage && (
                  <div className="banner-graphic">
                    <span className="coin-icon" style={{ color: slide.color, filter: `drop-shadow(0 0 30px ${slide.color}88)` }}>{slide.icon}</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* dots — absolute inside slides area */}
          <div className="hero-dots">
            {slides.map((_, idx) => (
              <button key={idx} onClick={() => setCurrentSlide(idx)} style={{ width: currentSlide === idx ? 20 : 8, height: 8, borderRadius: 4, border: "none", background: currentSlide === idx ? "#fff" : "rgba(255,255,255,0.4)", cursor: "pointer", transition: "all 0.3s" }} />
            ))}
          </div>
        </div>
        {/* ── end slides area */}

        {/* search — normal flow, sits below slides within hero-banner */}
        <div className="hero-search-container">
          <input
            type="text"
            className="search-input-center"
            placeholder="ابحث عن الخدمة التي تحتاجها..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <span className="search-icon-center">🔍</span>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════════════ */}
      <div className="hp-stats-bar">
        {stats.map((s, i) => (
          <div key={i} className="hp-stat-item">
            <div className="hp-stat-val">{s.value}</div>
            <div className="hp-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════
          MAIN TWO-COLUMN BODY
      ══════════════════════════════════════════════════════ */}
      <div className="hp-body-grid">

        {/* ── LEFT COLUMN: Categories grid + Services list ── */}
        <div className="hp-main-col">

          {/* Categories Icons Grid */}
          <div className="hp-cat-grid-section">
            <div className="hp-section-header">
              <span className="hp-section-title-icon">🔲</span>
              <h2 className="hp-section-heading">الأقسام الرئيسية</h2>
            </div>
            <div className="hp-cat-icon-grid">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="hp-cat-icon-card hp-skeleton" />
                ))
              ) : (
                rootCats.slice(0, 6).map(cat => (
                  <Link key={cat.id} href={`/category/${cat.id}`} className="hp-cat-icon-card">
                    <div className="hp-cat-icon-circle" style={{ background: `${cat.color || "#6366f1"}22`, borderColor: `${cat.color || "#6366f1"}44` }}>
                      {cat.image ? (
                        <img src={resolveImage(cat.image)} alt={cat.name} style={{ width: 32, height: 32, objectFit: "contain" }} />
                      ) : (
                        <span style={{ fontSize: "1.4rem" }}>📁</span>
                      )}
                    </div>
                    <span className="hp-cat-icon-label">{cat.name}</span>
                    <span className="hp-cat-icon-sub">{cat.description || "استعرض الخدمات"}</span>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Section tabs */}
          <div className="hp-tabs-row">
            <div className="hp-section-header" style={{ flex: 1 }}>
              <span className="hp-section-title-icon">📋</span>
              <h2 className="hp-section-heading">جميع الخدمات</h2>
              <span className="hp-count-badge">
                {activeSection === "popular" ? popularServices.length : filteredCats.length} {activeSection === "popular" ? "خدمة" : "قسم"}
              </span>
            </div>
            <div className="hp-section-tabs">
              <button
                className={`hp-tab-btn ${activeSection === "all" ? "active" : ""}`}
                onClick={() => setActiveSection("all")}
              >
                🗂️ الأقسام
              </button>
              <button
                className={`hp-tab-btn ${activeSection === "popular" ? "active" : ""}`}
                onClick={() => setActiveSection("popular")}
              >
                🔥 الأكثر طلباً
              </button>
            </div>
          </div>

          {/* Services list */}
          <div className="hp-services-panel">
            {activeSection === "all" ? (
              loading ? (
                <div className="hp-list">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="hp-row hp-skeleton" />
                  ))}
                </div>
              ) : filteredCats.length === 0 ? (
                <div className="hp-empty">لا توجد أقسام مطابقة 😕</div>
              ) : (
                <div className="hp-list">
                  {filteredCats.map(cat => {
                    const color = cat.color || "#6366f1";
                    return (
                      <Link key={cat.id} href={`/category/${cat.id}`} className="hp-row" style={{ "--rc": color }}>
                        <div className="hp-row-info">
                          <div className="hp-row-name">{cat.name}</div>
                          <div className="hp-row-sub">
                            {cat.description || "استعرض جميع الخدمات"}
                            <span className="hp-row-status-badge">متاح</span>
                          </div>
                        </div>
                        <div className="hp-row-right">
                          <div className="hp-row-action-btn">
                            طلب الخدمة
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )
            ) : (
              popularLoading ? (
                <div className="hp-list">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="hp-row hp-skeleton" />
                  ))}
                </div>
              ) : popularServices.length === 0 ? (
                <div className="hp-empty">لا توجد بيانات كافية حتى الآن 🔄</div>
              ) : (
                <div className="hp-list">
                  {popularServices.slice(0, 20).map((svc, i) => {
                    const color = svc.category_color || "#6366f1";
                    const minPrice = getMinPrice(svc.packages);
                    const rankColors = ["#f59e0b", "#94a3b8", "#cd7c2f"];
                    return (
                      <Link key={svc.id} href={`/service/${svc.id}`} className="hp-row" style={{ "--rc": color }}>
                        {i < 3 && (
                          <div className="hp-rank-badge" style={{ background: rankColors[i] }}>{i + 1}</div>
                        )}
                        <div className="hp-row-info">
                          <div className="hp-row-name">{svc.name}</div>
                          <div className="hp-row-sub">
                            <span style={{ color, fontWeight: 700 }}>{svc.category_name}</span>
                            <span className="hp-row-status-badge">🔥 {svc.order_count} طلب</span>
                          </div>
                        </div>
                        <div className="hp-row-right">
                          {minPrice && <div className="hp-row-price">${minPrice}</div>}
                          <div className="hp-row-action-btn">طلب الخدمة</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )
            )}

            <div className="hp-view-all-row">
              <Link href="/services" className="hp-view-all-btn">
                عرض جميع الخدمات ▼
              </Link>
            </div>
          </div>

          {/* Why Us - bottom of left col */}
          <div className="hp-why-section">
            <div className="hp-section-header">
              <span className="hp-section-title-icon">🏆</span>
              <h2 className="hp-section-heading">لماذا تختار عرب سيرفيس؟</h2>
            </div>
            <div className="hp-why-grid">
              {WHY_US.map((w, i) => (
                <div key={i} className="hp-why-card">
                  <div className="hp-why-card-icon">{w.icon}</div>
                  <div className="hp-why-card-title">{w.title}</div>
                  <div className="hp-why-card-desc">{w.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Featured sections + payment methods ── */}
        <div className="hp-sidebar-col">

          {/* Featured Sections */}
          {featuredSections.length > 0 && (
            <div className="hp-featured-box">
              <div className="hp-section-header">
                <span className="hp-section-title-icon">👑</span>
                <h2 className="hp-section-heading">أقسام مميزة</h2>
              </div>
              {featuredSections.map((cat, idx) => (
                <div key={idx} className="hp-featured-card">
                  {cat.image && (
                    <img src={cat.image} alt="Featured Category" className="hp-featured-cover" />
                  )}
                  <ul className="hp-featured-list">
                    {(cat.items || []).map((item, i) => (
                      <li key={i} className={`hp-featured-item${i < (cat.items || []).length - 1 ? ' has-border' : ''}`}>
                        <Link href={item.url || '#'} className="hp-featured-link">
                          {item.img && (
                            <img src={item.img} alt={item.title} className="hp-featured-item-img" />
                          )}
                          <div className="hp-featured-item-info">
                            <p className="hp-featured-item-title">{item.title}</p>
                            {item.price && <span className="hp-featured-price">${item.price}</span>}
                            <span className="hp-featured-time-badge">{item.time}</span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link href="/services" className="hp-featured-view-all">
                    عرض المزيد من العروض
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Why Choose Us (sidebar version) */}
          <div className="hp-sidebar-why">
            <div className="hp-section-header">
              <span className="hp-section-title-icon">❓</span>
              <h2 className="hp-section-heading">لماذا تختار عرب سيرفيس؟</h2>
            </div>
            <div className="hp-sidebar-why-list">
              {[
                { icon: "🔒", title: "أمان وموثوقية", desc: "حماية كاملة للبيانات" },
                { icon: "⚡", title: "سرعة في التنفيذ", desc: "إنجاز الطلبات في أسرع وقت" },
                { icon: "🎧", title: "دعم متخصص", desc: "فريق خبراء بخدمتك" },
                { icon: "💰", title: "أسعار تنافسية", desc: "ضمان على جميع الخدمات" },
              ].map((item, i) => (
                <div key={i} className="hp-sidebar-why-item">
                  <div className="hp-sidebar-why-icon">{item.icon}</div>
                  <div>
                    <div className="hp-sidebar-why-title">{item.title}</div>
                    <div className="hp-sidebar-why-desc">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="hp-payment-box">
            <div className="hp-section-header">
              <span className="hp-section-title-icon">💳</span>
              <h2 className="hp-section-heading">طرق الدفع</h2>
            </div>
            <p className="hp-payment-sub">طرق دفع آمنة ومتعددة &gt;</p>
            <div className="hp-payment-grid">
              <div className="hp-payment-method visa">VISA</div>
              <div className="hp-payment-method mastercard">MC</div>
              <div className="hp-payment-method paypal">PayPal</div>
              <div className="hp-payment-method bitcoin">₿</div>
            </div>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          BOTTOM FEATURES BAR
      ══════════════════════════════════════════════════════ */}
      <div className="hp-bottom-features">
        {[
          { icon: "🚀", title: "سرعة تنفيذ", desc: "إنجاز طلبات خلال دقائق" },
          { icon: "🖥️", title: "واجهة سهلة", desc: "تصميم سهل وسريع الاستخدام" },
          { icon: "🎧", title: "دعم فني 24/7", desc: "فريق دعم دائم على مدار الساعة" },
          { icon: "🔄", title: "تحديث يومي", desc: "إضافة خدمات جديدة يومياً" },
        ].map((f, i) => (
          <div key={i} className="hp-bottom-feat-item">
            <span className="hp-bottom-feat-icon">{f.icon}</span>
            <div>
              <div className="hp-bottom-feat-title">{f.title}</div>
              <div className="hp-bottom-feat-desc">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════
          STATS ROW (bottom)
      ══════════════════════════════════════════════════════ */}
      <div className="hp-bottom-stats">
        {[
          { value: "+50K", label: "عميل راضٍ" },
          { value: "+100", label: "خدمة متوفرة" },
          { value: "99.9%", label: "نسبة النجاح" },
          { value: "24/7", label: "دعم متواصل" },
        ].map((s, i) => (
          <div key={i} className="hp-bottom-stat">
            <div className="hp-bottom-stat-val">{s.value}</div>
            <div className="hp-bottom-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════
          REVIEWS MARQUEE
      ══════════════════════════════════════════════════════ */}
      {reviews.length > 0 && (
        <div className="hp-reviews-section">
          <div className="hp-section-header">
            <span className="hp-section-title-icon">⭐</span>
            <h2 className="hp-section-heading">آراء وتقييمات المستخدمين</h2>
          </div>
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
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════════════ */}
      <section className="faq-section">
        <div className="hp-section-header">
          <span className="hp-section-title-icon">❓</span>
          <h2 className="hp-section-heading">الأسئلة الشائعة</h2>
        </div>
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
