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
  const siteName = metadata.site_name || "عرب تك سيرفر";

  const title = `${siteName} | الصفحة الرئيسية`;
  const description = `الرئيسية في ${siteName} - كافة خدمات السوفت وير والاشتراكات المتاحة.`;

  return {
    title,
    description,
    keywords: [
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
