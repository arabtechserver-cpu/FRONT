"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/config";

const DEFAULT_SLIDES = [
  { title: "قسم خدمات سيرفر والأدوات", highlight: "Server & Tools", desc: "كافة خدمات السيرفر، تفعيل الأدوات، البوكسات الرقمية والدعم الفني.", badge: "القسم الأساسي", color: "#10b981", icon: "🛠️", link: "/category/14" },
  { title: "أحدث خدمات وأكواد APPLE", highlight: "Apple Services", desc: "تفعيل اشتراكات آبل، بطاقات الهدايا، وحلول الحسابات الرسمية.", badge: "مميز وحصري", color: "#a855f7", icon: "🍏", link: "/category/13" },
  { title: "خدمات USDT والمحفظة", highlight: "Zoom USDT", desc: "راجع السعر وطريقة الدفع المتاحة بوضوح قبل تأكيد الطلب.", badge: "خدمات المحفظة", color: "#00b4d8", icon: "🪙", link: "/wallet" },
];

export default function HeroSlider({ customSlides = [] }) {
  const [slides, setSlides] = useState(DEFAULT_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (customSlides && customSlides.length > 0) {
      setSlides(customSlides);
      customSlides.forEach(s => {
        if (s.icon && (s.icon.startsWith("data:") || s.icon.startsWith("http") || s.icon.startsWith("/uploads"))) {
          const url = s.icon.startsWith("/uploads") ? `${API_BASE_URL}${s.icon}` : s.icon;
          const img = new Image();
          img.src = url;
        }
      });
    } else {
      // Try to load cached banners
      try {
        const cachedBanners = localStorage.getItem("arabtech_cached_banners");
        if (cachedBanners) {
          const parsed = JSON.parse(cachedBanners);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSlides(parsed);
          }
        }
      } catch(e) {}

      // Fetch fresh banners from API
      fetch(`${API_BASE_URL}/api/banners`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && Array.isArray(data) && data.length > 0) {
            setSlides(data);
            try {
              localStorage.setItem("arabtech_cached_banners", JSON.stringify(data));
            } catch(e) {}
          }
        })
        .catch(err => console.error("Error fetching banners:", err));
    }
  }, [JSON.stringify(customSlides)]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section className="hero-section" style={{ position: "relative", minHeight: "450px", borderRadius: "16px", overflow: "hidden", marginBottom: "15px", padding: 0 }}>
      <div className="hero-slides-area">
        {slides.map((slide, idx) => {
          const isImage = slide.icon && (slide.icon.startsWith("data:") || slide.icon.startsWith("http") || slide.icon.startsWith("/uploads"));
          const imgSrc = isImage ? (slide.icon.startsWith("/uploads") ? `${API_BASE_URL}${slide.icon}` : slide.icon) : null;
          const isWhiteColor = !slide.color || slide.color === "#ffffff" || slide.color === "#fff" || slide.color.toLowerCase() === "white";
          const accentColor = isWhiteColor ? "#0ea5e9" : slide.color;

          return (
            <div
              key={idx}
              className={`banner-content ${isImage ? "has-bg-img" : "no-bg-img"}`}
              style={{
                opacity: currentSlide === idx ? 1 : 0,
                visibility: currentSlide === idx ? "visible" : "hidden",
                transition: "opacity 0.6s ease-in-out, visibility 0.6s",
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 40px",
                flexWrap: "wrap",
                zIndex: currentSlide === idx ? 2 : 1
              }}
            >
              {isImage && (
                <>
                  <img 
                    src={imgSrc} 
                    alt={slide.title} 
                    className="banner-bg-img" 
                    loading="eager"
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: -2 }}
                  />
                  <div className="banner-bg-overlay" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(90deg, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.4) 100%)", zIndex: -1 }} />
                </>
              )}

              <div className="banner-info" style={{ flex: "1 1 50%", minWidth: "300px", zIndex: 3 }}>
                {slide.badge && <span className="banner-badge" style={{ display: "inline-block", padding: "6px 12px", borderRadius: "30px", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "15px", borderColor: accentColor, color: accentColor, background: `${accentColor}22`, border: `1px solid ${accentColor}` }}>{slide.badge}</span>}
                <h1 className="banner-title" style={{ fontSize: "2.5rem", fontWeight: "900", color: "var(--text-main)", marginBottom: "10px", lineHeight: "1.2" }}>
                  {slide.title}<br />
                  <span style={{ backgroundImage: `linear-gradient(135deg, var(--text-main) 0%, ${accentColor} 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>{slide.highlight}</span>
                </h1>
                <p className="banner-desc" style={{ color: "var(--text-muted)", fontSize: "1.1rem", marginBottom: "25px", maxWidth: "80%" }}>{slide.desc}</p>

                {slide.link && (
                  <Link href={slide.link} className="hero-cta-btn" style={{ "--cta-color": accentColor, display: "inline-block", padding: "12px 30px", borderRadius: "8px", fontWeight: "bold", color: "#fff", background: accentColor, textDecoration: "none", boxShadow: `0 4px 15px ${accentColor}40` }}>
                    دخول القسم الآن ←
                  </Link>
                )}
              </div>

              {!isImage && slide.icon && (
                <div className="banner-graphic" style={{ flex: "1 1 40%", display: "flex", justifyContent: "center", zIndex: 3 }}>
                  <span className="coin-icon" style={{ fontSize: "10rem", color: slide.color, filter: `drop-shadow(0 0 30px ${slide.color}88)`, animation: "float 4s ease-in-out infinite" }}>{slide.icon}</span>
                </div>
              )}
            </div>
          );
        })}

        <div className="hero-dots" style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "8px", zIndex: 10 }}>
          {slides.map((_, idx) => (
            <button key={idx} onClick={() => setCurrentSlide(idx)} style={{ width: currentSlide === idx ? 24 : 8, height: 8, borderRadius: 4, border: "none", background: currentSlide === idx ? "#fff" : "rgba(255,255,255,0.4)", cursor: "pointer", transition: "all 0.3s" }} aria-label={`Go to slide ${idx + 1}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
