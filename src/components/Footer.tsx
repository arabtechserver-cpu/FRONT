"use client";

import React from "react";
import { SITE_CONTACTS } from "@/lib/site-contacts";

interface FooterProps {
  dict?: any;
  lang?: string;
}

export default function Footer({ lang = "ar" }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const isAr = lang === "ar";

  return (
    <footer className="w-full py-6 text-center text-xs text-slate-400 border-t border-slate-100 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <nav aria-label={isAr ? "وسائل التواصل" : "Contact channels"} className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mb-4 text-sm">
          <a href={SITE_CONTACTS.telegramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-sky-500 transition-colors">{isAr ? "قناة تلجرام" : "Telegram channel"}</a>
          <a href={SITE_CONTACTS.whatsappGroupUrl} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 transition-colors">{isAr ? "مجموعة واتساب" : "WhatsApp group"}</a>
          <a href={SITE_CONTACTS.whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 transition-colors">{isAr ? "واتساب: " : "WhatsApp: "}<bdi dir="ltr">{SITE_CONTACTS.phone}</bdi></a>
        </nav>
        <p>
          {isAr
            ? `© ${currentYear} BORAI STORE (برعي ستور) — جميع الحقوق محفوظة`
            : `© ${currentYear} BORAI STORE — All rights reserved.`}
        </p>
      </div>
    </footer>
  );
}
