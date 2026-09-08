import ServicesClient from "./services/ServicesClient";
import { API_BASE_URL, SITE_URL } from "@/config";
import { cache } from "react";

export const dynamic = "force-dynamic";

const getSiteMetadata = cache(async function getSiteMetadata() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/settings/metadata`, { next: { revalidate: 300 } });
    if (res.ok) {
      const settings = await res.json();
      return settings;
    }
    return {};
    if (res.ok) {
      const settings = await res.json();
      
    }
  } catch (err) {
    console.error("Error fetching site name in metadata:", err);
  }
  
});

const getCategoriesAndServices = cache(async function getCategoriesAndServices() {
  try {
    const [catRes, serviceRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/categories`, { next: { revalidate: 3600 } }),
      fetch(`${API_BASE_URL}/api/services`, { cache: 'no-store' })
    ]);
    if (catRes.ok && serviceRes.ok) {
      return {
        categories: await catRes.json(),
        services: await serviceRes.json()
      };
    }
  } catch (e) {
    console.error("Error fetching categories and services for schema:", e);
  }
  return { categories: [], services: [] };
});

export async function generateMetadata() {
  const metadata = await getSiteMetadata();
  const siteName = metadata?.site_name?.trim() || "سيرفر الوفاق - Al-Wefaq Server";

  const title = siteName;
  const description = `${siteName} — المنصة الأولى المتكاملة لخدمات السوفت وير، تفعيل البرامج والدونجلات، أدوات GSM، وخدمات السيرفر وIMEI بأسعار منافسة وتسليم فوري.`;

  return {
    title,
    description,
    keywords: [
      siteName,
      "سيرفر الوفاق",
      "Al-Wefaq Server",
      "Al-Wefaq",
      "Alwefaq",
      "سيرفر الوفاق لخدمات السوفت وير",
      "خدمات رقمية",
      "تفعيل برامج",
      "أدوات GSM",
      "فك شفرات",
      "شحن وتفعيل",
      "شحن ألعاب"
    ],
    openGraph: {
      title,
      description,
      url: SITE_URL || "https://al-wefaq.center",
      siteName: "سيرفر الوفاق - Al-Wefaq Server",
      locale: "ar_SA",
      type: "website",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "سيرفر الوفاق - Al-Wefaq Server",
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
    alternates: {
      canonical: `${SITE_URL}/`,
    }
  };
}

export default async function HomePage() {
  const metadata = await getSiteMetadata();
  const { categories, services } = await getCategoriesAndServices();

  return (
    <>
      <ServicesClient initialCategories={categories} initialServices={services} isHome={true} homeHeroTitle={metadata.home_hero_title} homeHeroSubtitle={metadata.home_hero_subtitle} />
    </>
  );
}
