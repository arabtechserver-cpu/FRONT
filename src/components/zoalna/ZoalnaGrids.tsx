"use client";

import React, { useState } from "react";
import Link from "next/link";

interface ZoalnaGridsProps {
  lang: string;
  searchPlaceholder?: string;
  banner1?: { image: string; alt?: string; link?: string };
  gamesGroup1?: ItemCard[];
  banner2?: { image: string; alt?: string; link?: string };
  gamesGroup2?: ItemCard[];
  banner3?: { image: string; alt?: string; link?: string };
  digitalCards?: ItemCard[];
  subscriptionsCard?: {
    image: string;
    title: string;
    description: string;
    buttonText: string;
    buttonUrl: string;
  };
}

interface ItemCard {
  title: string;
  image: string;
  href: string;
  query: string;
}

const TITLE_EN_MAP: Record<string, string> = {
  "فري فاير": "Free Fire",
  "ببجي موبايل": "PUBG Mobile",
  "موبايل ليجند": "Mobile Legends",
  "جنشن امباكت": "Genshin Impact",
  "يلا ليدو": "Yalla Ludo",
  "جواكر": "Jawaker",
  "لوردس موبايل": "Lords Mobile",
  "بلود استريك": "Blood Strike",
  "فيزا": "RedotPay Visa",
  "كلاش اوف كلانس": "Clash of Clans",
  "كلاش رويال": "Clash Royale",
  "فيفا موبايل": "FC Mobile",
  "بيس موبايل": "eFootball Mobile",
  "براول ستارز": "Brawl Stars",
  "تيك توك": "TikTok Coins",
  "تجديد استارلينك": "Starlink Renewal",
  "كروت ايتونز": "iTunes Cards",
  "ريزر جولد": "Razer Gold",
  "كروت استيم": "Steam Wallet",
  "كروت بلايستيشن": "PlayStation PSN",
  "كروت اكس بوكس": "Xbox Live",
};

export default function ZoalnaGrids({
  lang,
  searchPlaceholder,
  banner1 = { image: "/images/zoalna/banner_hero_1.webp", alt: "شحن الألعاب الفوري", link: "" },
  gamesGroup1: initialGroup1,
  banner2 = { image: "/images/zoalna/banner_hero_2.webp", alt: "عروض وتحديثات الألعاب", link: "" },
  gamesGroup2: initialGroup2,
  banner3 = { image: "/images/zoalna/banner_hero_3.webp", alt: "كروت الألعاب والاشتراكات", link: "" },
  digitalCards: initialDigital,
  subscriptionsCard = {
    image: "/images/zoalna/card_subscriptions.webp",
    title: "الاشتراكات الرقمية",
    description: "خدمات بث، موسيقى، ترفيه وألعاب… معالجة سريعة ودعم فني.",
    buttonText: "تصفح الآن",
    buttonUrl: "/pricing?cat=store"
  }
}: ZoalnaGridsProps) {
  const isAr = lang === "ar";
  const [searchTerm, setSearchTerm] = useState("");

  const activeSearchPlaceholder = isAr
    ? (searchPlaceholder || "ابحث عن لعبتك أو بطاقتك المفضلة (فري فاير، ببجي، ايتونز، ستيم...)")
    : "Search for games, cards, or gift codes (Free Fire, PUBG, Steam, iTunes...)";

  const getItemTitle = (item: ItemCard) => {
    if (isAr) return item.title;
    if ((item as any).titleEn) return (item as any).titleEn;
    const cleanTitle = (item.title || "").trim();
    return TITLE_EN_MAP[cleanTitle] || cleanTitle;
  };

  const formatLink = (url: string) => {
    if (!url) return "#";
    if (/^\/(?:ar\/|en\/)?pricing(?:[/?#]|$)/i.test(url)) return `/${lang}/services`;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("#")) return url;
    if (url.startsWith(`/${lang}/`) || url === `/${lang}`) return url;
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    return `/${lang}${cleanUrl}`;
  };

  const defaultGroup1: ItemCard[] = [
    { title: "فري فاير", image: "/images/zoalna/game_freefire.webp", href: `/${lang}/product/free-fire-id`, query: "فري فاير free fire" },
    { title: "ببجي موبايل", image: "/images/zoalna/game_pubg.webp", href: `/${lang}/purchase?serviceId=67e4e321-3960-486d-992d-53e3cf749cab`, query: "ببجي pubg mobile" },
    { title: "8 Ball Pool", image: "/images/zoalna/game_8ballpool.webp", href: `/${lang}/purchase?serviceId=48d93ea6-edd7-4f07-8b05-a7a91ba4cf13`, query: "8 ball pool بلياردو" },
    { title: "موبايل ليجند", image: "/images/zoalna/game_mobilelegends.webp", href: `/${lang}/purchase?serviceId=67e4e321-3960-486d-992d-53e3cf749cab`, query: "موبايل ليجند mobile legends" },
    { title: "جنشن امباكت", image: "/images/zoalna/game_genshin.webp", href: `/${lang}/purchase?serviceId=67e4e321-3960-486d-992d-53e3cf749cab`, query: "جنشن genshin impact" },
    { title: "يلا ليدو", image: "/images/zoalna/game_yallaludo.webp", href: `/${lang}/purchase?serviceId=67e4e321-3960-486d-992d-53e3cf749cab`, query: "يلا ليدو yalla ludo" },
    { title: "جواكر", image: "/images/zoalna/game_jawaker.webp", href: `/${lang}/purchase?serviceId=67e4e321-3960-486d-992d-53e3cf749cab`, query: "جواكر jawaker" },
    { title: "لوردس موبايل", image: "/images/zoalna/game_lordsmobile.webp", href: `/${lang}/purchase?serviceId=3daf900c-91ef-46b2-b169-412ea3dac55f`, query: "لوردس lords mobile" },
    { title: "بلود استريك", image: "/images/zoalna/game_bloodstrike.webp", href: `/${lang}/purchase?serviceId=67e4e321-3960-486d-992d-53e3cf749cab`, query: "بلود استريك blood strike" },
    { title: "فيزا", image: "/images/zoalna/game_redotpay.webp", href: `/${lang}/purchase?serviceId=fff2b321-a6a3-4b32-b80c-920ea56f6a3e`, query: "فيزا redotpay visa" },
  ];

  const defaultGroup2: ItemCard[] = [
    { title: "كلاش اوف كلانس", image: "/images/zoalna/game_clashofclans.webp", href: `/${lang}/purchase?serviceId=67e4e321-3960-486d-992d-53e3cf749cab`, query: "كلاش اوف كلانس clash of clans" },
    { title: "كلاش رويال", image: "/images/zoalna/game_clashroyale.webp", href: `/${lang}/purchase?serviceId=67e4e321-3960-486d-992d-53e3cf749cab`, query: "كلاش رويال clash royale" },
    { title: "فيفا موبايل", image: "/images/zoalna/game_fifa.webp", href: `/${lang}/purchase?serviceId=d5182f4b-fb1a-449e-973e-f53d27f04cfb`, query: "فيفا fifa ea fc mobile" },
    { title: "بيس موبايل", image: "/images/zoalna/game_pes.webp", href: `/${lang}/purchase?serviceId=d5182f4b-fb1a-449e-973e-f53d27f04cfb`, query: "بيس pes efootball mobile" },
    { title: "براول ستارز", image: "/images/zoalna/game_brawlstars.webp", href: `/${lang}/purchase?serviceId=67e4e321-3960-486d-992d-53e3cf749cab`, query: "براول ستارز brawl stars" },
    { title: "تيك توك", image: "/images/zoalna/game_tiktok.webp", href: `/${lang}/purchase?serviceId=bedcce9a-dd89-40c1-869a-a5c5ee97dcc3`, query: "تيك توك tiktok coins" },
    { title: "تجديد استارلينك", image: "/images/zoalna/game_starlink.webp", href: `/${lang}/purchase?serviceId=fe14ba68-8989-4634-9c17-9ece0d50a6f9`, query: "استارلينك starlink internet" },
  ];

  const defaultDigital: ItemCard[] = [
    { title: "كروت ايتونز", image: "/images/zoalna/card_itunes.webp", href: `/${lang}/purchase?serviceId=266e8362-d3f8-4ffd-8813-b43238a2868b`, query: "ايتونز itunes apple" },
    { title: "ريزر جولد", image: "/images/zoalna/card_razergold.webp", href: `/${lang}/purchase?serviceId=e74e8643-2d9e-40a8-9d3f-b4b175e9c715`, query: "ريزر جولد razer gold" },
    { title: "كروت استيم", image: "/images/zoalna/card_steam.webp", href: `/${lang}/purchase?serviceId=5b164875-f91f-4abd-871e-00dff1ecd966`, query: "استيم steam wallet" },
    { title: "كروت بلايستيشن", image: "/images/zoalna/card_playstation.webp", href: `/${lang}/purchase?serviceId=f12cc2f9-b8be-4489-b827-5bf2f4637f10`, query: "بلايستيشن playstation psn" },
    { title: "كروت اكس بوكس", image: "/images/zoalna/card_xbox.webp", href: `/${lang}/purchase?serviceId=f12cc2f9-b8be-4489-b827-5bf2f4637f10`, query: "اكس بوكس xbox live" },
  ];

  const gamesGroup1 = (initialGroup1 && initialGroup1.length > 0) ? initialGroup1 : defaultGroup1;
  const gamesGroup2 = (initialGroup2 && initialGroup2.length > 0) ? initialGroup2 : defaultGroup2;
  const digitalCards = (initialDigital && initialDigital.length > 0) ? initialDigital : defaultDigital;

  const gameLink = (game: ItemCard) => {
    if (/^https?:/i.test(game.href)) return game.href;
    const images: Record<string, string> = {
      game_freefire: "free-fire-id", game_pubg: "pubg-id", game_mobilelegends: "mobile-legends",
      game_genshin: "genshin-impact", game_yallaludo: "yalla-ludo", game_jawaker: "jawaker",
      game_lordsmobile: "lords-mobile", game_bloodstrike: "blood-strike", game_redotpay: "redotpay",
      game_clashofclans: "clash-of-clans", game_clashroyale: "clash-royale", game_fifa: "fc-mobile",
      game_pes: "efootball", game_brawlstars: "brawl-stars", game_tiktok: "tiktok", game_starlink: "starlink", game_8ballpool: "8-ball-pool",
    };
    const imageKey = game.image.split("/").pop()?.split(".")[0] || "";
    return images[imageKey] ? `/${lang}/product/${images[imageKey]}` : formatLink(game.href);
  };

  const filterMatches = (items: ItemCard[]) => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase().trim();
    return items.filter(
      (item) =>
        (item.title && item.title.toLowerCase().includes(term)) ||
        (item.query && item.query.toLowerCase().includes(term)) ||
        (getItemTitle(item).toLowerCase().includes(term))
    );
  };

  const filteredGroup1 = filterMatches(gamesGroup1);
  const filteredGroup2 = filterMatches(gamesGroup2);
  const filteredDigital = filterMatches(digitalCards);

  return (
    <>
      {/* Live Search Bar */}
      <div className="zoalna-search-bar-wrap">
        <div className="zoalna-search-bar">
          <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="#64748b" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder={activeSearchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "16px" }}
              aria-label={isAr ? "مسح البحث" : "Clear search"}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Banner 1 */}
      {!searchTerm && banner1 && banner1.image && (
        <div className="front-page-hero-image">
          {banner1.link ? (
            <Link href={formatLink(banner1.link)}>
              <img
                src={banner1.image}
                alt={banner1.alt || (isAr ? "شحن الألعاب الفوري" : "Instant Game Top-Ups")}
                loading="lazy"
              />
            </Link>
          ) : (
            <img
              src={banner1.image}
              alt={banner1.alt || (isAr ? "شحن الألعاب الفوري" : "Instant Game Top-Ups")}
              loading="lazy"
            />
          )}
        </div>
      )}

      {/* Group 1 Games Grid */}
      <main className="front-section" role="main">
        {filteredGroup1.length > 0 && (
          <div className="apps-grid">
            {filteredGroup1.map((game, i) => (
              <Link key={i} className="app-card-link" href={gameLink(game)}>
                <div className="app-card">
                  <div className="app-card__icon-inner">
                    <img loading="lazy" src={game.image} alt={getItemTitle(game)} />
                  </div>
                  <h3 className="app-card__title">{getItemTitle(game)}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Banner 2 */}
      {!searchTerm && banner2 && banner2.image && (
        <div className="front-page-hero-image">
          {banner2.link ? (
            <Link href={formatLink(banner2.link)}>
              <img
                src={banner2.image}
                alt={banner2.alt || (isAr ? "عروض وتحديثات الألعاب" : "Game Offers & Updates")}
                loading="lazy"
              />
            </Link>
          ) : (
            <img
              src={banner2.image}
              alt={banner2.alt || (isAr ? "عروض وتحديثات الألعاب" : "Game Offers & Updates")}
              loading="lazy"
            />
          )}
        </div>
      )}

      {/* Group 2 Games Grid */}
      <section className="front-section">
        {filteredGroup2.length > 0 && (
          <div className="apps-grid">
            {filteredGroup2.map((game, i) => (
              <Link key={i} className="app-card-link" href={gameLink(game)}>
                <div className="app-card">
                  <div className="app-card__icon-inner">
                    <img loading="lazy" src={game.image} alt={getItemTitle(game)} />
                  </div>
                  <h3 className="app-card__title">{getItemTitle(game)}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Banner 3 */}
      {!searchTerm && banner3 && banner3.image && (
        <div className="front-page-hero-image">
          {banner3.link ? (
            <Link href={formatLink(banner3.link)}>
              <img
                src={banner3.image}
                alt={banner3.alt || (isAr ? "كروت الألعاب والاشتراكات" : "Digital Gift Cards & Subscriptions")}
                loading="lazy"
              />
            </Link>
          ) : (
            <img
              src={banner3.image}
              alt={banner3.alt || (isAr ? "كروت الألعاب والاشتراكات" : "Digital Gift Cards & Subscriptions")}
              loading="lazy"
            />
          )}
        </div>
      )}
      {/* Mini Card Promo */}
      {subscriptionsCard && (
        <div className="home-block">
          <div className="mini-card">
            <div className="mini-card-img">
              <img
                src={subscriptionsCard.image}
                alt={isAr ? subscriptionsCard.title : "Digital Subscriptions"}
                loading="lazy"
              />
            </div>
            <div>
              <h3 className="mini-card-title">{isAr ? subscriptionsCard.title : "Digital Subscriptions"}</h3>
              <p className="mini-card-text">
                {isAr
                  ? subscriptionsCard.description
                  : "Streaming, music, and digital entertainment services with fast automated delivery."}
              </p>
              <Link href={formatLink(subscriptionsCard.buttonUrl)} className="mini-card-btn">
                {isAr ? subscriptionsCard.buttonText : "Browse Now"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
