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
  const rawName = metadata?.site_name || "سيرفر الوفاق";
  const siteName = rawName
    .replace(/عرب\s*تك\s*برو\s*سيرفر/g, 'سيرفر الوفاق')
    .replace(/عرب\s*تك\s*سيرفر(\s*online)?/gi, 'سيرفر الوفاق')
    .replace(/عرب\s*تك/g, 'الوفاق')
    .trim() || "سيرفر الوفاق";

  const title = `${siteName} | Al-Wefaq Server - خدمات السوفت وير والسيرفر`;
  const description = `${siteName} (Al-Wefaq Server)، يقدم خدمات السوفت وير والاشتراكات وأدوات GSM وخدمات IMEI والسيرفر.`;

  return {
    title,
    description,
    keywords: [
      "Al-Wefaq Server",
      "سيرفر الوفاق",
      "Al-Wefaq",
      "خدمات السوفت وير",
      "تفعيل دونجلات وبوكسات",
      siteName
    ],
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
