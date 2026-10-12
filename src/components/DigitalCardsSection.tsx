import React from "react";
import Link from "next/link";

interface DigitalCardItem {
  titleAr: string;
  titleEn: string;
  image: string;
  query: string;
}

const CARDS: DigitalCardItem[] = [
  {
    titleAr: "كروت ايتونز",
    titleEn: "iTunes Cards",
    image: "/images/zoalna/card_itunes.webp",
    query: "iTunes",
  },
  {
    titleAr: "ريزر جولد",
    titleEn: "Razer Gold",
    image: "/images/zoalna/card_razergold.webp",
    query: "Razer Gold",
  },
  {
    titleAr: "كروت استيم",
    titleEn: "Steam Cards",
    image: "/images/zoalna/card_steam.webp",
    query: "Steam",
  },
  {
    titleAr: "كروت بلايستيشن",
    titleEn: "PlayStation Cards",
    image: "/images/zoalna/card_playstation.webp",
    query: "PlayStation",
  },
  {
    titleAr: "كروت اكس بوكس",
    titleEn: "Xbox Cards",
    image: "/images/zoalna/card_xbox.webp",
    query: "Xbox",
  },
];

export default function DigitalCardsSection({ lang = "ar" }: { lang?: string }) {
  return null;
}
