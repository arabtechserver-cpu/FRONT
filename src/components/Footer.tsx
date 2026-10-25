"use client";

import Link from "next/link";
import { ArrowUpLeft, ArrowUpRight, Download, MessageCircle, Send, Smartphone, Users } from "lucide-react";
import { SITE_CONTACTS } from "@/lib/site-contacts";
import { useAppInstall } from "@/components/InstallAppProvider";
import { useStoreNavigation } from '@/components/StoreNavigationProvider';
import { navigationPages } from '@/lib/store-pages';
import "@/styles/store-footer.css";

interface FooterProps {
  dict?: unknown;
  lang?: string;
}

export default function Footer({ lang = "ar" }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const isAr = lang === "ar";
  const { installed, canInstall, installing, openApp } = useAppInstall();
  const pages = useStoreNavigation();
  const Arrow = isAr ? ArrowUpLeft : ArrowUpRight;
  const text = (ar: string, en: string) => isAr ? ar : en;
  const storeLinks = [
    ["/services", text("كل الخدمات", "All services")],
    ...navigationPages(pages, 'footer').map(page => [`/pages/${page.slug}`, isAr ? page.title : page.titleEn || page.title]),
  ];
  const accountLinks = [
    ["/profile", text("حسابي", "My account")],
    ["/orders", text("متابعة طلباتي", "Track my orders")],
    ["/wallet", text("محفظتي وشحن الرصيد", "Wallet & balance")],
    ["/register", text("إنشاء حساب", "Create an account")],
  ];

  return (
    <footer className="store-footer" dir={isAr ? "rtl" : "ltr"} aria-label={text("روابط المتجر والتواصل", "Store links and contact")}>
      <div className="store-footer-inner">
        <div className="store-footer-top">
          <div className="store-footer-brand">
            <Link href={`/${lang}`} aria-label={text("برعي ستور — الرئيسية", "BORAI STORE — Home")} className="store-footer-logo"><img src="/images/borai-logo.png" alt="BORAI SERVER" width={240} height={82} loading="lazy" /></Link>
            <p>{text("ألعابك، بطاقاتك واشتراكاتك… كلها في مكان واحد. اختار خدمتك وتابع طلبك بسهولة مع برعي ستور.", "Your games, gift cards and subscriptions, all in one place. Find your service and follow your order with BORAI STORE.")}</p>
            <a className="store-footer-support" href={SITE_CONTACTS.whatsappUrl} target="_blank" rel="noopener noreferrer"><MessageCircle size={19} aria-hidden="true" /><span>{text("محتاج مساعدة؟ كلمنا", "Need a hand? Talk to us")}</span><Arrow size={16} aria-hidden="true" /></a>
          </div>
          <nav className="store-footer-links" aria-label={text("خدمات المتجر", "Store services")}>
            <h2>{text("اكتشف المتجر", "Explore the store")}</h2>
            {storeLinks.map(([href, label]) => <Link key={href} href={`/${lang}${href}`}>{label}</Link>)}
          </nav>
          <nav className="store-footer-links" aria-label={text("روابط حسابك", "Your account links")}>
            <h2>{text("كل ما يخص حسابك", "Your account")}</h2>
            {accountLinks.map(([href, label]) => <Link key={href} href={`/${lang}${href}`}>{label}</Link>)}
          </nav>
          <div className="store-footer-contact">
            <h2>{text("خلّيك قريب", "Stay connected")}</h2>
            <p>{text("تابع أخبار المتجر أو تواصل معنا للمساعدة في طلبك.", "Follow store updates or get help with your order.")}</p>
            <nav className="store-footer-socials" aria-label={text("وسائل التواصل", "Contact channels")}>
              <a href={SITE_CONTACTS.whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label={text("تواصل عبر واتساب", "Contact on WhatsApp")}><MessageCircle size={20} aria-hidden="true" /></a>
              <a href={SITE_CONTACTS.telegramUrl} target="_blank" rel="noopener noreferrer" aria-label={text("قناة تيليجرام", "Telegram channel")}><Send size={19} aria-hidden="true" /></a>
              <a href={SITE_CONTACTS.whatsappGroupUrl} target="_blank" rel="noopener noreferrer" aria-label={text("مجموعة واتساب", "WhatsApp group")}><Users size={20} aria-hidden="true" /></a>
            </nav>
            <a className="store-footer-phone" href={SITE_CONTACTS.whatsappUrl} target="_blank" rel="noopener noreferrer"><bdi dir="ltr">{SITE_CONTACTS.phone}</bdi></a>
          </div>
        </div>
        {!installed && <div className="store-footer-app">
          <span className="store-footer-app-icon"><Smartphone size={26} aria-hidden="true" /></span>
          <div><h2>{text("برعي ستور معاك في أي وقت", "BORAI STORE, always within reach")}</h2><p>{text("ضيف التطبيق على جهازك ووصل للمتجر وطلباتك بضغطة واحدة.", "Add the app to your device for one-tap access to the store and your orders.")}</p></div>
          <button type="button" onClick={openApp} disabled={installing}><Download size={18} aria-hidden="true" />{canInstall ? text("تثبيت التطبيق الآن", "Install app now") : text("تطبيق برعي", "BORAI app")}</button>
        </div>}
        <div className="store-footer-bottom">
          <p>© {currentYear} BORAI STORE · {text("جميع الحقوق محفوظة", "All rights reserved")}</p>
          <nav aria-label={text("سياسات المتجر", "Store policies")}><Link href={`/${lang}/terms`}>{text("الشروط والأحكام", "Terms & conditions")}</Link><Link href={`/${lang}/refund`}>{text("سياسة الاسترجاع", "Refund policy")}</Link></nav>
        </div>
      </div>
    </footer>
  );
}
