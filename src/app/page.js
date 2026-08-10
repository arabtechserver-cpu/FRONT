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

const FALLBACK_CATEGORIES = [
  { id: 14, name: "قسم خدمات سيرفر والأدوات", description: "تفعيل الأدوات والبوكسات الرقمية والدعم الفني.", color: "#10b981" },
  { id: 13, name: "خدمات APPLE", description: "أكواد واشتراكات وخدمات آبل.", color: "#a855f7" },
  { id: 4, name: "الأرصدة والعملات", description: "USDT وطرق دفع متعددة.", color: "#06b6d4" },
  { id: 7, name: "اشتراكات", description: "اشتراكات رقمية وتنفيذ سريع.", color: "#d946ef" },
  { id: 5, name: "سوشال ميديا", description: "خدمات حسابات ومنصات اجتماعية.", color: "#ec4899" },
  { id: 10, name: "البرمجة والتصميم", description: "حلول برمجية وتصميمات احترافية.", color: "#6366f1" },
];

export default function Home() {
  const [categories, setCategories]         = useState([]);
  const [loading, setLoading]               = useState(true);
  const [searchTerm, setSearchTerm]         = useState("");
  const [slides, setSlides]                 = useState([]);
  const [currentSlide, setCurrentSlide]     = useState(0);
  const [popularServices, setPopularServices] = useState([]);
  const [popularLoading, setPopularLoading] = useState(true);
  const [settings, setSettings]             = useState({ site_name: "عرب تك سيرفر", announcement_text: "" });
  const [activeSection, setActiveSection]   = useState("all"); // all | popular
  const [reviews, setReviews]               = useState([]);
  const [featuredSections, setFeaturedSections] = useState([]);
  const [recentOrders, setRecentOrders]     = useState([]);
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

    fetch(`${API_BASE_URL}/api/orders/recent`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setRecentOrders(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // ── auto-slide & instant image preloading ───────────────────────────────────
  useEffect(() => {
    if (!slides.length) return;

    // Instant image preloading in GPU memory
    slides.forEach(slide => {
      if (slide.icon && (slide.icon.startsWith("data:") || slide.icon.startsWith("http") || slide.icon.startsWith("/uploads"))) {
        const url = slide.icon.startsWith("/uploads") ? `${API_BASE_URL}${slide.icon}` : slide.icon;
        const img = new Image();
        img.src = url;
      }
    });

    const t = setInterval(() => setCurrentSlide(p => (p + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides]);

  const categorySource = categories.length > 0 ? categories : FALLBACK_CATEGORIES;
  const rootCats = [...categorySource].filter(c => !c.parent_id).sort((a, b) => {
    const orderA = a.sort_order || 0;
    const orderB = b.sort_order || 0;
    if (orderA !== orderB) {
      if (orderA === 0) return 1;
      if (orderB === 0) return -1;
      return orderA - orderB;
    }
    return a.name.localeCompare(b.name, 'ar');
  });
  const filteredCats = rootCats.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const displayServices = activeSection === "popular" ? popularServices : filteredCats;

  return (
    <>
      {/* ══════════════════════════════════════════════════════
          HERO BANNER
      ══════════════════════════════════════════════════════ */}
      <section className="hero-banner">


        {/* ── Slides area wrapper (fixed height, slides are absolute inside it) */}
        <div className="hero-slides-area">
          {slides.map((slide, idx) => {
            const isImage = slide.icon && (slide.icon.startsWith("data:") || slide.icon.startsWith("http") || slide.icon.startsWith("/uploads"));
            const imgSrc = isImage ? (slide.icon.startsWith("/uploads") ? `${API_BASE_URL}${slide.icon}` : slide.icon) : null;
            // If color is white/near-white, use a visible accent instead
            const isWhiteColor = !slide.color || slide.color === "#ffffff" || slide.color === "#fff" || slide.color.toLowerCase() === "white";
            const accentColor = isWhiteColor ? "#0ea5e9" : slide.color;

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
                    <img 
                      src={imgSrc} 
                      alt={slide.title} 
                      className="banner-bg-img" 
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                    />
                    <div className="banner-bg-overlay" />
                  </>
                )}

                <div className="banner-info">
                  <span className="banner-badge" style={{ borderColor: accentColor, color: accentColor, background: `${accentColor}22` }}>{slide.badge}</span>
                  <h1 className="banner-title">
                    {slide.title}<br />
                    <span style={{ backgroundImage: `linear-gradient(135deg,#fff 0%,${accentColor} 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>{slide.highlight}</span>
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
                    <Link href={slide.link} className="hero-cta-btn" style={{ "--cta-color": accentColor }}>
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
            dir="ltr"
            style={{ direction: "ltr", textAlign: "left" }}
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
              {loading && categories.length === 0 ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="hp-cat-icon-card hp-skeleton" />
                ))
              ) : (
                rootCats.slice(0, 6).map(cat => (
                  <Link key={cat.id} href={`/category/${cat.id}`} className="hp-cat-icon-card">
                    <div className="hp-cat-icon-circle" style={{ background: "transparent", border: "none", width: "64px", height: "64px" }}>
                      {cat.image ? (
                        <img src={resolveImage(cat.image)} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      ) : (
                        <span style={{ fontSize: "2rem" }}>📁</span>
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
                {activeSection === "popular"
                  ? (popularLoading ? "الأكثر طلباً" : `${popularServices.length} خدمة`)
                  : `${filteredCats.length} قسم`}
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
              loading && categories.length === 0 ? (
                <div className="hp-list">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="hp-row hp-skeleton" />
                  ))}
                </div>
              ) : filteredCats.length === 0 ? (
                <div className="hp-empty">لا توجد أقسام مطابقة 😕</div>
              ) : (
                <div className="hp-list">
                  {filteredCats.slice(0, 30).map(cat => {
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

          {/* Reviews Marquee directly under Why Us (3 Rows) */}
          {reviews.length > 0 && (
            <div className="hp-reviews-section" style={{ marginTop: "24px" }}>
              <div className="hp-section-header">
                <span className="hp-section-title-icon">⭐</span>
                <h2 className="hp-section-heading">آراء وتقييمات المستخدمين</h2>
              </div>
              <div className="hp-reviews-marquee-wrapper">
                {(() => {
                  const r1 = reviews.filter((_, i) => i % 3 === 0);
                  const r2 = reviews.filter((_, i) => i % 3 === 1);
                  const r3 = reviews.filter((_, i) => i % 3 === 2);
                  const rows = [
                    { data: r1.length > 0 ? r1 : reviews, reverse: false },
                    { data: r2.length > 0 ? r2 : reviews, reverse: true },
                    { data: r3.length > 0 ? r3 : reviews, reverse: false }
                  ];
                  return rows.map((row, rowIdx) => {
                    const trackData = [...row.data, ...row.data, ...row.data, ...row.data, ...row.data, ...row.data];
                    return (
                      <div key={rowIdx} className={`hp-reviews-marquee-track ${row.reverse ? 'reverse' : ''}`}>
                        {trackData.map((rev, i) => (
                          <div key={`${rev.id || i}-${i}`} className="hp-review-card">
                            <div className="hp-review-header">
                              <div className="hp-review-avatar">{rev.name ? rev.name.charAt(0) : "★"}</div>
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
                  });
                })()}
              </div>
            </div>
          )}
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
              <Link href="/wallet" className="hp-payment-method visa">VISA</Link>
              <Link href="/wallet" className="hp-payment-method mastercard">MC</Link>
              <Link href="/wallet" className="hp-payment-method paypal">PayPal</Link>
              <Link href="/wallet" className="hp-payment-method bitcoin">₿</Link>
            </div>
          </div>

          {/* Quick Support Widget */}
          <div className="hp-support-box">
            <div className="hp-section-header">
              <span className="hp-section-title-icon">📞</span>
              <h2 className="hp-section-heading">مساعدة سريعة</h2>
            </div>
            <p className="hp-support-desc">فريق الدعم الفني جاهز للرد على استفساراتك على مدار الساعة عبر الواتساب.</p>
            <a href="https://wa.me/249123667227" target="_blank" rel="noopener noreferrer" className="hp-support-btn">
              <span className="hp-support-btn-icon">💬</span>
              تواصل معنا الآن
            </a>
          </div>

          {/* How it works widget */}
          <div className="hp-steps-box">
            <div className="hp-section-header">
              <span className="hp-section-title-icon">⚙️</span>
              <h2 className="hp-section-heading">كيف تطلب خدمة؟</h2>
            </div>
            <div className="hp-step-item">
              <div className="hp-step-num">1</div>
              <div className="hp-step-text">اختر الخدمة المناسبة لاحتياجك</div>
            </div>
            <div className="hp-step-item">
              <div className="hp-step-num">2</div>
              <div className="hp-step-text">أدخل البيانات وأتمم الدفع</div>
            </div>
            <div className="hp-step-item">
              <div className="hp-step-num">3</div>
              <div className="hp-step-text">استلم طلبك فوراً أو خلال دقائق</div>
            </div>
          </div>

          {/* Live Stats widget */}
          <div className="hp-live-stats-box">
            <div className="hp-section-header">
              <span className="hp-section-title-icon">📊</span>
              <h2 className="hp-section-heading">أداء السيرفر</h2>
            </div>
            <div className="hp-live-stat-row">
              <span className="hp-ls-label">حالة السيرفر</span>
              <span className="hp-ls-val status-online">متصل (Online)</span>
            </div>
            <div className="hp-live-stat-row">
              <span className="hp-ls-label">سرعة التنفيذ</span>
              <span className="hp-ls-val">فوري لمعظم الخدمات</span>
            </div>
            <div className="hp-live-stat-row">
              <span className="hp-ls-label">وقت التشغيل</span>
              <span className="hp-ls-val">99.9% (Uptime)</span>
            </div>
          </div>

          {/* Live Orders (Social Proof) */}
          {recentOrders.length > 0 && (
            <div className="hp-recent-orders-box">
              <div className="hp-section-header">
                <span className="hp-section-title-icon">🛍️</span>
                <h2 className="hp-section-heading">أحدث الطلبات</h2>
              </div>
              <div className="hp-recent-orders-list">
                {recentOrders.map((order, i) => {
                  const initial = order.customer_name ? order.customer_name.charAt(0).toUpperCase() : 'ز';
                  const name = order.customer_name ? order.customer_name.split(' ')[0] : 'زائر';
                  const timeStr = order.created_at ? new Date(order.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'الآن';
                  const colors = ['#3b82f6', '#a855f7', '#ef4444'];
                  
                  return (
                    <div key={i} className="hp-ro-item">
                      <div className="hp-ro-avatar" style={{ background: colors[i % colors.length] }}>{initial}</div>
                      <div className="hp-ro-info">
                        <div className="hp-ro-text"><span>{name}</span> طلب خدمة <b>{order.service_name}</b></div>
                        <div className="hp-ro-time">{timeStr}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Trust Guarantee Widget */}
          <div className="hp-trust-box">
            <div className="hp-trust-icon">🛡️</div>
            <h3>ضمان الخدمة الذهبي</h3>
            <p>نحن نضمن لك تنفيذ جميع طلباتك بأعلى جودة وفي أسرع وقت. في حال وجود أي مشكلة، نضمن لك استرداد كامل أموالك إلى محفظتك.</p>
          </div>

          {/* Telegram Channel Widget */}
          <div className="hp-telegram-box">
            <div className="hp-tg-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.21-1.12-.33-1.08-.7.02-.19.27-.39.75-.59 2.95-1.28 4.91-2.13 5.89-2.53 2.79-1.16 3.37-1.37 3.76-1.37.08 0 .26.02.35.1.08.06.12.15.14.24.01.1-.01.21-.03.34z"/></svg>
            </div>
            <h3>قناتنا على تيليجرام</h3>
            <p>انضم إلينا لمعرفة آخر التحديثات والخدمات المضافة يومياً.</p>
            <a href="https://t.me/arabtechserveronline" target="_blank" rel="noopener noreferrer" className="glass-btn" style={{ padding: '12px 16px', borderRadius: '14px', minWidth: '220px', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', background: 'rgba(0, 136, 204, 0.1)', borderColor: 'rgba(0, 136, 204, 0.2)', color: '#fff' }}>✈️ قناة تيليجرام عرب تك</a>
          </div>

          {/* Working Hours Widget */}
          <div className="hp-working-hours-box">
            <div className="hp-wh-icon">⏱️</div>
            <h3>أوقات العمل والتنفيذ</h3>
            <p>نعمل لخدمتكم على مدار 24 ساعة طوال أيام الأسبوع.</p>
            <ul className="hp-wh-list">
              <li>الخدمات التلقائية: <b>فوري ⚡</b></li>
              <li>الخدمات اليدوية: <b>1 - 15 دقيقة</b></li>
              <li>الدعم الفني: <b>متاح 24/7</b></li>
            </ul>
          </div>

          {/* Reseller Program Widget */}
          <div className="hp-reseller-box">
            <div className="hp-reseller-icon">🤝</div>
            <h3>نظام الوكلاء (API)</h3>
            <p>اربط موقعك بسيرفرنا مجاناً واحصل على أسعار مخفضة حصرياً للوكلاء.</p>
            <a href="/api-docs" className="hp-reseller-btn">تصفح الـ API</a>
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



      {/* Developer / Programmer Portfolio & Hire Section */}
      <div 
        className="hp-dev-banner container"
        style={{
          marginTop: "30px",
          marginBottom: "30px",
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          background: "var(--bg-glass)",
          border: "var(--border-glass)",
          borderRadius: "20px",
          padding: "24px 30px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          direction: "rtl",
          boxShadow: "var(--shadow-card)",
          boxSizing: "border-box"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div style={{
            width: "54px",
            height: "54px",
            borderRadius: "16px",
            background: "var(--primary-light, rgba(14, 165, 233, 0.15))",
            border: "1px solid var(--primary-color, rgba(14, 165, 233, 0.3))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.6rem",
            flexShrink: 0
          }}>
            👨‍💻
          </div>
          <div style={{ maxWidth: "600px" }}>
            <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 900, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
              تصميم وتطوير المبرمج: <span style={{ color: "var(--primary-color, #0ea5e9)" }}>مينا سمير</span> ✨
            </h3>
            <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: "1.6" }}>
              هل تريد سيرفر أو موقع متجر إلكتروني احترافي متكامل مثل هذا المتجر لعملك؟ تواصل معي الآن لتحويل فكرتك إلى واقع بأعلى جودة! 🚀
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <a 
            href="https://portfolio-18f21.web.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              padding: "10px 24px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
              border: "none",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: "0.9rem",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 16px rgba(14, 165, 233, 0.35)",
              transition: "all 0.2s ease"
            }}
          >
            🌐 معرض أعمالي
          </a>
        </div>
      </div>

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
