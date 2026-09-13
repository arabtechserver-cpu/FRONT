import HomeClient from "./HomeClient";
import { API_BASE_URL, SITE_URL } from "@/config";
import { cache } from "react";

export const dynamic = "force-dynamic";

const getSiteMetadata = cache(async function getSiteMetadata() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/settings/metadata`, {
      next: { revalidate: 300 }
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.error("Error fetching site metadata:", err);
  }
  return {};
});

export async function generateMetadata() {
  const metadata = await getSiteMetadata();
  const siteName = metadata?.site_name?.trim() || "SK-unlocker";
  const description = `${siteName} — المنصة المتكاملة لخدمات السوفت وير، تفعيل البرامج والدونجلات، أدوات GSM، وخدمات السيرفر وIMEI بأسعار منافسة وتسليم فوري.`;

  return {
    title: siteName,
    description,
    keywords: [
      siteName, "SK-unlocker", "SK-UNLOCKER",
      "خدمات رقمية", "تفعيل برامج", "أدوات GSM",
      "فك شفرات", "شحن وتفعيل", "IMEI unlock"
    ],
    openGraph: {
      title: siteName,
      description,
      url: SITE_URL || "https://sk-unlocker.com",
      siteName,
      locale: "ar_SA",
      type: "website",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: siteName }]
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description,
      images: ["/og-image.png"]
    },
    alternates: {
      canonical: `${SITE_URL}/`
    }
  };
}

export default async function HomePage() {
  const metadata = await getSiteMetadata();
  return (
    <HomeClient
      siteName={metadata?.site_name?.trim() || "SK-unlocker"}
      settings={metadata || {}}
    />
  );
}
