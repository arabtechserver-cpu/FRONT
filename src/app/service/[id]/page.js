import ServiceClient from "./ServiceClient";
import { API_BASE_URL, SITE_URL } from "@/config";
import { cache } from "react";

const staticServices = [
  {
    id: 1,
    name: "ببجي موبايل (PUBG Mobile)",
    description: "اشحن شدات ببجي موبايل فوراً ومباشرة في حسابك عن طريق الآيدي ID بأفضل الأسعار.",
    price: 0.99,
    image: "pubg",
    packages: [
      { id: 1, name: "60 شدة (UC)", price: 0.99 },
      { id: 2, name: "325 شدة (UC)", price: 4.85 },
      { id: 3, name: "660 شدة (UC)", price: 9.50 },
      { id: 4, name: "1800 شدة (UC)", price: 23.99 }
    ]
  },
  {
    id: 2,
    name: "فري فاير (Free Fire)",
    description: "اشحن جواهر فري فاير فوراً لتفعيل الفاير باس والحصول على أحدث سكنات اللعبة عبر الآيدي.",
    price: 1.10,
    image: "freefire",
    packages: [
      { id: 1, name: "110 جواهر", price: 1.10 },
      { id: 2, name: "231 جواهر", price: 2.20 },
      { id: 3, name: "583 جواهر", price: 5.30 },
      { id: 4, name: "1188 جواهر", price: 10.50 }
    ]
  },
  {
    id: 3,
    name: "بيجو لايف (Bigo Live)",
    description: "اشحن فاصوليا ومجوهرات تطبيق بيجو لايف لدعم البث المباشر المفضل لديك.",
    price: 1.25,
    image: "bigo",
    packages: [
      { id: 1, name: "42 جوهرة", price: 1.25 },
      { id: 2, name: "297 جوهرة", price: 7.99 },
      { id: 3, name: "848 جوهرة", price: 22.50 }
    ]
  },
  {
    id: 4,
    name: "فودافون كاش مصر (Vodafone Cash)",
    description: "شحن رصيد وتحويل أموال عبر محفظة فودافون كاش مباشرة بسعر الصرف الممتاز.",
    price: 1.00,
    image: "vodafone",
    packages: [
      { id: 1, name: "إرسال 100 جنيه مصري", price: 2.10 },
      { id: 2, name: "إرسال 500 جنيه مصري", price: 10.50 },
      { id: 3, name: "إرسال 1000 جنيه مصري", price: 21.00 }
    ]
  },
  {
    id: 5,
    name: "شحن رصيد USDT (TRC20)",
    description: "شراء وسحب عملة USDT الرقمية بأفضل أسعار الصرف وبسرعة تنفيذ خيالية.",
    price: 1.00,
    image: "usdt",
    packages: [
      { id: 1, name: "10 USDT", price: 10.30 },
      { id: 2, name: "50 USDT", price: 51.50 },
      { id: 3, name: "100 USDT", price: 102.50 }
    ]
  },
  {
    id: 6,
    name: "اشتراك كانفا برو (Canva Pro)",
    description: "تفعيل اشتراك كانفا برو الحساب الشخصي بكافة ميزات التصميم والذكاء الاصطناعي.",
    price: 1.99,
    image: "canva",
    packages: [
      { id: 1, name: "تفعيل لمدة شهر", price: 1.99 },
      { id: 2, name: "تفعيل لمدة 6 أشهر", price: 8.99 },
      { id: 3, name: "تفعيل لمدة سنة كاملة", price: 14.99 }
    ]
  },
  {
    id: 7,
    name: "اشتراك نتفليكس (Netflix Premium)",
    description: "شاشة خاصة بك بجودة 4K UHD على حساب نتفليكس مشترك أو حساب مستقل بالكامل.",
    price: 2.50,
    image: "netflix",
    packages: [
      { id: 1, name: "شاشة واحدة لمدة شهر 4K", price: 2.50 },
      { id: 2, name: "حساب كامل مستقل لمدة شهر", price: 9.99 }
    ]
  }
];

const getServiceData = cache(async function getServiceData(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/services/${id}`, { next: { revalidate: 3600 } });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error("Error fetching service in metadata:", err);
  }
  const fallback = staticServices.find(s => s.id === Number(id));
  return fallback || null;
});

const getSettings = cache(async function getSettings() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/settings`, { next: { revalidate: 3600 } });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error("Error fetching settings in metadata:", err);
  }
  return null;
});

export async function generateMetadata({ params }) {
  const unwrappedParams = await params;
  const id = unwrappedParams.id;
  const service = await getServiceData(id);
  const settings = await getSettings();
  const siteName = settings?.site_name || "عرب تك سيرفر";
  const baseCurrency = settings?.base_currency || "USD";

  if (!service) {
    return {
      title: `الخدمة غير متوفرة | ${siteName}`,
      description: `الخدمة المطلوبة غير متوفرة حالياً في سيرفر ${siteName}.`
    };
  }

  const categoryNamesMap = {
    1: "ألعاب",
    2: "تطبيقات لايف",
    3: "بطاقات إلكترونية",
    4: "شحن أرصدة وعملات",
    5: "خدمات سوشيال ميديا",
    6: "خدمات سيرفر",
    7: "اشتراكات رقمية",
    8: "ذكاء اصطناعي",
    9: "أرقام افتراضية",
    10: "برمجة وتصميم",
    11: "حسابات جاهزة",
    12: "إعلانات ممولة",
    13: "خدمات Apple و iCloud",
    14: "خدمات سيرفر والأدوات",
    15: "Apple",
    16: "أدوات وتفعيلات السيرفر (Schematics & Tools)"
  };
  const categoryName = categoryNamesMap[service.category_id] || "خدمات رقمية";

  // Determine price range
  let priceText = "";
  if (service.packages && service.packages.length > 0) {
    const prices = service.packages.map(p => p.price);
    const minPrice = Math.min(...prices);
    priceText = ` بأسعار تبدأ من ${minPrice.toFixed(2)} ${baseCurrency}`;
  }

  const title = `تفعيل ${service.name} تلقائي ${priceText} - قسم ${categoryName} | ${siteName}`;
  const description = `تفعيل ${service.name} فوراً بأفضل الأسعار. ${service.description} تفعيل تلقائي آمن وموثوق 100% عبر سيرفر ${siteName} لخدمات وبرامج السوفت وير.`;

  return {
    title,
    description,
    keywords: [
      `شحن ${service.name}`,
      `شراء ${service.name}`,
      `شحن ${service.name} رخيص`,
      `موقع شحن ${service.name}`,
      `${service.name} id`,
      `باقات ${service.name}`,
      siteName,
      `${siteName} لخدمات السوفت وير`,
      categoryName,
      `شحن ${categoryName}`
    ],
    alternates: {
      canonical: `${SITE_URL}/service/${id}`,
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
      url: `${SITE_URL}/service/${id}`,
      siteName: siteName,
      images: [
        {
          url: service.image 
            ? (service.image.startsWith("http") ? service.image : `${API_BASE_URL}${service.image.startsWith("/") ? service.image : `/${service.image}`}`) 
            : `${SITE_URL}/uploads/og-image.png`,
          alt: service.name
        }
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        service.image 
          ? (service.image.startsWith("http") ? service.image : `${API_BASE_URL}${service.image.startsWith("/") ? service.image : `/${service.image}`}`) 
          : `${SITE_URL}/uploads/og-image.png`
      ],
    }
  };
}

export default async function Page({ params }) {
  const unwrappedParams = await params;
  const id = unwrappedParams.id;
  const service = await getServiceData(id);

  if (!service) {
    return <ServiceClient params={params} />;
  }

  // Construct JSON-LD schemas
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
        "name": service.name,
        "item": `${SITE_URL}/service/${id}`
      }
    ]
  };

  // Structured Data for Product / Offer
  let productJsonLd = null;
  if (service.packages && service.packages.length > 0) {
    const prices = service.packages.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    productJsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": service.name,
      "description": service.description,
      "image": service.image 
        ? (service.image.startsWith("http") ? service.image : `${API_BASE_URL}${service.image.startsWith("/") ? service.image : `/${service.image}`}`) 
        : `${SITE_URL}/icons/icon-192.png`,
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "USD",
        "lowPrice": minPrice.toFixed(2),
        "highPrice": maxPrice.toFixed(2),
        "offerCount": service.packages.length,
        "offers": service.packages.map(pkg => ({
          "@type": "Offer",
          "name": pkg.name,
          "price": Number(pkg.price || 0).toFixed(2),
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "url": `${SITE_URL}/service/${id}`
        }))
      }
    };
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      <ServiceClient params={params} />
    </>
  );
}
