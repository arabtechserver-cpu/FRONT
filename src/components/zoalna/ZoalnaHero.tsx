"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface SlideItem {
  id?: number | string;
  image: string;
  link: string;
  alt?: string;
}

interface SideMenuItem {
  icon?: string;
  text: string;
  link: string;
}

interface ZoalnaHeroProps {
  lang: string;
  slides?: SlideItem[];
  sideMenu?: SideMenuItem[];
}

export default function ZoalnaHero({ lang, slides: initialSlides, sideMenu: initialSideMenu }: ZoalnaHeroProps) {
  const isAr = lang === "ar";
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const defaultSlides: SlideItem[] = [
    { id: 1, image: "/images/zoalna/slide_1.png", link: `/${lang}/pricing`, alt: isAr ? "عرض 1" : "Slide 1" },
    { id: 2, image: "/images/zoalna/slide_2.png", link: `/${lang}/pricing?cat=imei`, alt: isAr ? "عرض 2" : "Slide 2" },
    { id: 3, image: "/images/zoalna/slide_3.png", link: `/${lang}/pricing?cat=server`, alt: isAr ? "عرض 3" : "Slide 3" },
  ];

  const defaultSideMenu: SideMenuItem[] = [
    { icon: "account", text: isAr ? "الحساب" : "Account", link: `/${lang}/profile` },
    { icon: "wallet", text: isAr ? "المحفظة" : "Wallet", link: `/${lang}/wallet` },
    { icon: "orders", text: isAr ? "الطلبات" : "Orders", link: `/${lang}/orders` },
  ];

  const formatLink = (url: string) => {
    if (!url) return "#";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("#")) return url;
    if (url.startsWith(`/${lang}/`) || url === `/${lang}`) return url;
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    return `/${lang}${cleanUrl}`;
  };

  const getSideMenuText = (item: SideMenuItem) => {
    if (isAr) return item.text;
    if ((item as any).textEn) return (item as any).textEn;
    const textLower = (item.text || "").trim();
    if (textLower === "الحساب") return "Account";
    if (textLower === "المحفظة") return "Wallet";
    if (textLower === "الطلبات") return "Orders";
    return item.text;
  };

  const slides = (initialSlides && initialSlides.length > 0) ? initialSlides : defaultSlides;
  const sideMenu = (initialSideMenu && initialSideMenu.length > 0) ? initialSideMenu : defaultSideMenu;

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const renderSideIcon = (icon?: string) => {
    switch (icon) {
      case "wallet":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21 7H3a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zm0 10H3V9h18zm-4-4a1 1 0 1 1-1 1 1 1 0 0 1 1-1z" />
          </svg>
        );
      case "orders":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 4h12V4H6zm0 4h12V8H6zm0 4h12v-2H6z" />
          </svg>
        );
      case "account":
      default:
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5z" />
          </svg>
        );
    }
  };

  return (
    <div className="home-wrapper">
      <aside className="home-side-menu">
        {sideMenu.map((item, idx) => (
          <Link key={idx} href={formatLink(item.link)} className="side-card">
            <span className="icon">
              {renderSideIcon(item.icon)}
            </span>
            <span className="txt">{getSideMenuText(item)}</span>
          </Link>
        ))}
      </aside>

      <div
        id="home-slider"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="slider-wrapper">
          <div className="slides">
            {slides.map((s, idx) => (
              <div
                key={s.id || idx}
                className={`slide ${idx === currentSlide ? "active" : ""}`}
              >
                <Link href={formatLink(s.link)}>
                  <img src={s.image} alt={s.alt || `Slide ${idx + 1}`} />
                  <div className="overlay" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {slides.length > 1 && (
          <div className="slider-controls">
            <div className="slider-dots">
              {slides.map((_, idx) => (
                <span
                  key={idx}
                  className={idx === currentSlide ? "active" : ""}
                  onClick={() => setCurrentSlide(idx)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
