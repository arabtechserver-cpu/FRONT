"use client";

import { SITE_CONTACTS } from "@/lib/site-contacts";

import React, { useState } from "react";
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
  const [appModalOpen, setAppModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");

  const handleOpenAuth = (tab: "login" | "register") => {
    setAuthTab(tab);
    setAuthModalOpen(true);
  };

  const activeWhatsapp = config?.floatingWhatsapp?.phone || whatsappNum;

  return (
    <div className="zoalna-root">
      {/* 1. Hero Area (Side Menu cards + Interactive Banner Slider) */}
      <ZoalnaHero
        lang={lang}
        slides={config?.heroSlider}
        sideMenu={config?.sideMenu}
      />

      {/* 2. Games Grids, Promotional Banners, and Digital Cards */}
      <ZoalnaGrids
        lang={lang}
        searchPlaceholder={config?.searchPlaceholder}
        banner1={config?.banner1}
        gamesGroup1={config?.gamesGroup1}
        banner2={config?.banner2}
        gamesGroup2={config?.gamesGroup2}
        banner3={config?.banner3}
        digitalCards={config?.digitalCards}
        subscriptionsCard={config?.subscriptionsCard}
      />

      {/* 3. Mobile Bottom Sticky Navigation & Floating Messenger */}
      <ZoalnaBottomBar
        lang={lang}
        whatsappNum={activeWhatsapp}
        floatingWhatsapp={config?.floatingWhatsapp}
        onOpenAuth={handleOpenAuth}
      />

      {/* 4. Promotional & Authentication Modals */}
      <ZoalnaModals
        lang={lang}
        appModal={config?.appModal}
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
