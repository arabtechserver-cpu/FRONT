"use client";

import { SITE_CONTACTS } from "@/lib/site-contacts";

import React, { useState, useEffect } from "react";
import "@/styles/zoalna.css";
import ZoalnaHero from "./ZoalnaHero";
import ZoalnaGrids from "./ZoalnaGrids";
import ZoalnaBottomBar from "./ZoalnaBottomBar";
import ZoalnaModals from "./ZoalnaModals";

interface ZoalnaHomepageProps {
  lang: string;
  whatsappNum?: string;
  config?: any;
}

export default function ZoalnaHomepage({
  lang,
  whatsappNum = SITE_CONTACTS.phone,
  config,
}: ZoalnaHomepageProps) {
  const [activeConfig, setActiveConfig] = useState(config);
  const [appModalOpen, setAppModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");

  useEffect(() => {
    setActiveConfig(config);
  }, [config]);

  useEffect(() => {
    let isMounted = true;

    const syncLiveHomepage = async () => {
      try {
        const res = await fetch("/api/homepage", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" }
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && (data.heroSlider || data.heroSection || data.gamesGroup1)) {
            setActiveConfig(data);
          }
        }
      } catch {
        // Fallback silently
      }
    };

    syncLiveHomepage();

    const handleUpdateEvent = () => {
      syncLiveHomepage();
    };

    window.addEventListener("homepage_config_updated", handleUpdateEvent);
    return () => {
      isMounted = false;
      window.removeEventListener("homepage_config_updated", handleUpdateEvent);
    };
  }, []);

  const handleOpenAuth = (tab: "login" | "register") => {
    setAuthTab(tab);
    setAuthModalOpen(true);
  };

  const activeWhatsapp = activeConfig?.floatingWhatsapp?.phone || whatsappNum;

  return (
    <div className="zoalna-root">
      {/* 1. Hero Area (Side Menu cards + Interactive Banner Slider) */}
      <ZoalnaHero
        lang={lang}
        slides={activeConfig?.heroSlider}
        sideMenu={activeConfig?.sideMenu}
      />

      {/* 2. Games Grids, Promotional Banners, and Digital Cards */}
      <ZoalnaGrids
        lang={lang}
        searchPlaceholder={activeConfig?.searchPlaceholder}
        banner1={activeConfig?.banner1}
        gamesGroup1={activeConfig?.gamesGroup1}
        banner2={activeConfig?.banner2}
        gamesGroup2={activeConfig?.gamesGroup2}
        banner3={activeConfig?.banner3}
        digitalCards={activeConfig?.digitalCards}
        subscriptionsCard={activeConfig?.subscriptionsCard}
      />

      {/* 3. Mobile Bottom Sticky Navigation & Floating Messenger */}
      <ZoalnaBottomBar
        lang={lang}
        whatsappNum={activeWhatsapp}
        floatingWhatsapp={activeConfig?.floatingWhatsapp}
        onOpenAuth={handleOpenAuth}
      />

      {/* 4. Promotional & Authentication Modals */}
      <ZoalnaModals
        lang={lang}
        appModal={activeConfig?.appModal}
        appModalOpen={appModalOpen}
        onCloseAppModal={() => setAppModalOpen(false)}
        authModalOpen={authModalOpen}
        onCloseAuthModal={() => setAuthModalOpen(false)}
        authTab={authTab}
        onChangeAuthTab={setAuthTab}
      />
    </div>
  );
}
