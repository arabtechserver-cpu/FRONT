import ServicesClient from "./ServicesClient";
import { API_BASE_URL, SITE_URL } from "@/config";
import { cache } from "react";

export const dynamic = "force-dynamic";

const getSiteName = cache(async function getSiteName() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/settings`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const settings = await res.json();
      if (settings.site_name) return settings.site_name;
    }
  } catch (err) {
    console.error("Error fetching site name in metadata:", err);
  }
  return "عرب تك سيرفر";
});

const getCategoriesAndServices = cache(async function getCategoriesAndServices() {
  try {
    const [catRes, serviceRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/categories`, { next: { revalidate: 3600 } }),
      // /api/services is ~2.5MB — exceeds Next.js hardcoded 2MB per-item cache limit.
      // Use no-store to skip the cache entirely and avoid repeated warning logs.
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
  const siteName = await getSiteName();

  const title = `كافة خدمات السوفت وير والاشتراكات المتاحة | ${siteName}`;
  const description = `تصفح وابحث في كافة خدمات السوفت وير وتفعيلات الدونجلات والبرامج المتاحة. أفضل الأسعار وسرعة تفعيل تلقائية على متجر ${siteName}.`;

  return {
    title,
    description,
    keywords: [
      "خدمات السوفت وير",
      "تفعيل دونجلات وبوكسات",
      "اشتراكات ترفيهية",
      "بطاقات هدايا",
      siteName,
      `متجر ${siteName}`
    ],
    alternates: {
      canonical: `${SITE_URL}/services`,
    }
  };
}

export default async function Page() {
  const siteName = await getSiteName();
  const { categories } = await getCategoriesAndServices();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "الرئيسية",
        "item": SITE_URL
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "الخدمات المتاحة",
        "item": `${SITE_URL}/services`
      }
    ]
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `الخدمات المتاحة في ${siteName}`,
    "description": `تصفح وابحث في كافة الخدمات الرقمية المتوفرة للشحن والدفع المباشر في متجر ${siteName}.`,
    "url": `${SITE_URL}/services`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": categories.length,
      "itemListElement": categories.map((cat, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "item": {
          "@type": "CollectionPage",
          "name": cat.name,
          "url": `${SITE_URL}/category/${cat.id}`,
          "image": cat.image ? (cat.image.startsWith("http") ? cat.image : `${API_BASE_URL}${cat.image.startsWith("/") ? cat.image : `/${cat.image}`}`) : `${SITE_URL}/logo.jpg`
        }
      }))
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <ServicesClient />
    </>
  );
}
