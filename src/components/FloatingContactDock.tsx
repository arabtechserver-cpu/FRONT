"use client";

import React from "react";
import { SITE_CONTACTS } from "@/lib/site-contacts";

interface FloatingContactDockProps {
  lang?: string;
  whatsappNumber?: string;
  telegramUsername?: string;
  whatsappGroupUrl?: string;
}

export default function FloatingContactDock({
  lang = "ar",
  whatsappNumber = SITE_CONTACTS.phone,
  telegramUsername = SITE_CONTACTS.telegramUsername,
  whatsappGroupUrl = SITE_CONTACTS.whatsappGroupUrl,
}: FloatingContactDockProps) {
  const isAr = lang === "ar";
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, "");
  const cleanTelegram = telegramUsername.replace(/^@/, "");

  const handleOpenAi = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("toggle-ai-chat"));
    }
  };

  return (
    <aside
      aria-label={isAr ? "قنوات التواصل والمساعد الذكي" : "Contact channels and AI Assistant"}
      className="fixed left-0 top-[48%] -translate-y-1/2 z-[870] flex flex-col gap-1.5 p-1 bg-slate-900/60 dark:bg-background/90 backdrop-blur-md rounded-r-2xl border-y border-r border-white/10 dark:border-amber-500/20 shadow-[0_10px_30px_rgba(15,17,26,0.4)] select-none"
    >
      {/* WhatsApp */}
      <a
        href={`https://wa.me/${cleanPhone}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={isAr ? "تواصل عبر واتساب" : "Contact via WhatsApp"}
        title={isAr ? "واتساب الدعم الفني" : "WhatsApp Support"}
        className="group relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      </a>

      {/* Telegram */}
      <a
        href={`https://t.me/${cleanTelegram}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={isAr ? "تواصل عبر تيليجرام" : "Contact via Telegram"}
        title={isAr ? "قناة ودعم تيليجرام" : "Telegram Channel"}
        className="group relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white flex items-center justify-center shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      </a>

      {/* WhatsApp Group */}
      <a
        href={whatsappGroupUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={isAr ? "مجموعة واتساب" : "WhatsApp Group"}
        title={isAr ? "انضم لمجموعة واتساب" : "Join our WhatsApp group"}
        className="group relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#128C7E] hover:bg-[#0f766e] text-white flex items-center justify-center shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="7" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3M17 4a3 3 0 0 1 0 6M21 21v-3a6 6 0 0 0-4-5.65" />
        </svg>
      </a>

      {/* AI Assistant Button */}
      <button
        type="button"
        onClick={handleOpenAi}
        aria-label={isAr ? "فتح المساعد الذكي AI" : "Open AI Assistant"}
        title={isAr ? "المساعد الذكي للدعم الفني (متصل)" : "AI Customer Support Assistant"}
        className="group relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#44403c] hover:bg-[#2b3142] border border-amber-400/50 hover:border-amber-400 text-amber-400 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <circle cx="12" cy="5" r="2" />
          <path d="M12 7v4" />
          <line x1="8" y1="16" x2="8.01" y2="16" strokeWidth="2.5" />
          <line x1="16" y1="16" x2="16.01" y2="16" strokeWidth="2.5" />
        </svg>
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border border-slate-900 rounded-full animate-pulse" />
      </button>
    </aside>
  );
}
