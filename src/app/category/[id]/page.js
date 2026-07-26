import CategoryClient from "./CategoryClient";
import { API_BASE_URL, SITE_URL } from "@/config";
import { cache } from "react";

const categoryNamesMap = {
  1: "قسم الالعاب",
  2: "تطبيقات اللايف",
  3: "بطاقات الكترونية",
  4: "الأرصدة والعملات",
  5: "سوشال ميديا",
  6: "خدمات السيرفر",
  7: "اشتراكات",
  8: "الذكاء الاصطناعي",
  9: "قسم الارقام",
  10: "البرمجة والتصميم",
  11: "حسابات جاهزة",
  12: "إعلانات ممولة",
  13: "خدمات Apple و iCloud",
  14: "قسم خدمات سيرفر والأدوات",
  15: "Apple",
  16: "أدوات وتفعيلات السيرفر (Schematics & Tools)"
};

const getCategoryData = cache(async function getCategoryData(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/categories`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const categories = await res.json();
    const cat = (Array.isArray(categories) ? categories : []).find(c => Number(c.id) === Number(id));
    if (cat) return cat;
  } catch (err) {
    console.error("Error fetching category in metadata:", err.message || err);
  }
  return { id: Number(id), name: categoryNamesMap[id] || "الخدمات المتاحة" };
});

const getCategoryServices = cache(async function getCategoryServices(catId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/services`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const services = await res.json();
      return (Array.isArray(services) ? services : []).filter(s => Number(s.category_id) === Number(catId));
    }
  } catch (err) {
    console.error("Error fetching services in metadata:", err.message || err);
  }
  return [];
});

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

export async function generateMetadata({ params }) {
  const unwrappedParams = await params;
  const id = unwrappedParams.id;
  const category = await getCategoryData(id);
  const siteName = await getSiteName();

  const title = `قسم ${category.name} تفعيل فوري بأفضل الأسعار | ${siteName}`;
  const description = `تصفح جميع خدمات شحن وتفعيل ${category.name} الفورية. أفضل العروض والأسعار الحصرية على سيرفر ${siteName} لخدمات وبرامج السوفت وير.`;

  return {
    title,
    description,
    keywords: [
      `شحن ${category.name}`,
      `قسم ${category.name}`,
      siteName,
      `متجر ${siteName}`,
      `عروض ${category.name}`,
      `شحن رخيص ${category.name}`,
      `شراء بطاقات ${category.name}`
    ],
    alternates: {
      canonical: `${SITE_URL}/category/${id}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/category/${id}`,
      siteName: siteName,
      images: [
        {
          url: category.image 
            ? (category.image.startsWith("http") ? category.image : `${API_BASE_URL}${category.image.startsWith("/") ? category.image : `/${category.image}`}`) 
            : `${SITE_URL}/uploads/og-image.png`,
          alt: category.name
        }
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        category.image 
          ? (category.image.startsWith("http") ? category.image : `${API_BASE_URL}${category.image.startsWith("/") ? category.image : `/${category.image}`}`) 
          : `${SITE_URL}/uploads/og-image.png`
      ],
    }
  };
}

export default async function Page({ params }) {
  const unwrappedParams = await params;
  const id = unwrappedParams.id;
  const category = await getCategoryData(id);
  const services = await getCategoryServices(id);

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
        "name": category.name,
        "item": `${SITE_URL}/category/${id}`
      }
    ]
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `قسم ${category.name} - تفعيل فوري تلقائي`,
    "description": `تصفح جميع خدمات شحن وتفعيل ${category.name} الفورية. أفضل العروض والأسعار الحصرية.`,
    "url": `${SITE_URL}/category/${id}`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": services.length,
      "itemListElement": services.map((s, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "item": {
          "@type": "Product",
          "name": s.name,
          "description": s.description,
          "url": `${SITE_URL}/service/${s.id}`,
          "image": s.image 
            ? (s.image.startsWith("http") ? s.image : `${API_BASE_URL}${s.image.startsWith("/") ? s.image : `/${s.image}`}`) 
            : `${SITE_URL}/logo.jpg`
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
      <CategoryClient params={params} />
    </>
  );
}
