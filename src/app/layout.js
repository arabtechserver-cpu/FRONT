import "./globals.css";
import ContactFloatingButton from "../components/ContactFloatingButton";
import MainLayout from "../components/MainLayout";
import { API_BASE_URL, SITE_URL, fetchWithTimeout } from "../config";
import { cache } from "react";

// Skip API fetch during Vercel build when the API is not reachable
const isBuildTime = typeof window === "undefined" && (API_BASE_URL.includes("localhost") || API_BASE_URL.includes("127.0.0.1"));

const getSiteSettings = cache(async () => {
  let siteName = "عرب تك سيرفر";
  let siteLogo = "/logo.jpg";
  let siteFavicon = "/favicon.png";

  if (!isBuildTime) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/api/settings`, { next: { revalidate: 10 } });
      if (res.ok) {
        const settings = await res.json();
        if (settings.site_name) siteName = settings.site_name;
        if (settings.site_logo && settings.site_logo !== "default") siteLogo = settings.site_logo;
        if (settings.site_favicon && settings.site_favicon !== "default") siteFavicon = settings.site_favicon;
      }
    } catch (error) {
      console.error("Failed to fetch settings for metadata:", error);
    }
  }

  return { siteName, siteLogo, siteFavicon };
});

export async function generateMetadata() {
  const { siteName, siteLogo, siteFavicon } = await getSiteSettings();

  const siteLogoUrl = siteLogo.startsWith("http") || siteLogo.startsWith("data:")
    ? siteLogo
    : (siteLogo.includes("uploads")
        ? `${API_BASE_URL}${siteLogo.startsWith("/") ? siteLogo : `/${siteLogo}`}`
        : `${SITE_URL}${siteLogo.startsWith("/") ? siteLogo : `/${siteLogo}`}`);

  const siteFaviconUrl = siteFavicon.startsWith("http") || siteFavicon.startsWith("data:")
    ? siteFavicon
    : (siteFavicon.includes("uploads")
        ? `${API_BASE_URL}${siteFavicon.startsWith("/") ? siteFavicon : `/${siteFavicon}`}`
        : `${SITE_URL}${siteFavicon.startsWith("/") ? siteFavicon : `/${siteFavicon}`}`);

  const titleText = `${siteName} | لخدمات وبرامج السوفت وير`;
  const descText = `سيرفر ${siteName} لخدمات وبرامج السوفت وير. شحن وتفعيل تلقائي فوري بأفضل الأسعار.`;

  return {
    metadataBase: new URL(SITE_URL),
    title: titleText,
    description: descText,
    verification: {
      google: "BpQsEK6Xln0FauVIlj0qYpPxuzvoYrACWOehkyBc5-U",
    },
    keywords: [
      siteName,
      `${siteName} سوفت وير`,
      `سيرفر ${siteName}`,
      "تفعيل برامج سوفت وير",
      "خدمات سوفت وير",
      "تفعيل دونجلات سوفت وير",
      "تفعيل بوكسات سوفت وير",
      "شحن USDT",
      "تفعيل كانفا برو",
      "تفعيل نتفليكس",
      "سيرفر خدمات رقمية"
    ],
    alternates: {
      canonical: SITE_URL,
    },
    openGraph: {
      title: titleText,
      description: descText,
      url: SITE_URL,
      siteName: siteName,
      images: [
        {
          url: siteLogoUrl,
          width: 1200,
          height: 630,
          alt: `${siteName} - لخدمات وبرامج السوفت وير`
        }
      ],
      locale: "ar_EG",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: titleText,
      description: descText,
      images: [siteLogoUrl],
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon.png", type: "image/png" },
        { url: "/icons/icon-16.png", sizes: "16x16", type: "image/png" },
        { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
        { url: "/icons/icon-48.png", sizes: "48x48", type: "image/png" },
        { url: "/icons/icon-96.png", sizes: "96x96", type: "image/png" },
        { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: siteFaviconUrl, type: "image/png" }
      ],
      apple: [
        { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }
      ],
      shortcut: ["/favicon.ico"],
    }
  };
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }) {
  const { siteName, siteLogo, siteFavicon } = await getSiteSettings();

  const siteLogoUrl = siteLogo.startsWith("http") || siteLogo.startsWith("data:")
    ? siteLogo
    : (siteLogo.includes("uploads")
        ? `${API_BASE_URL}${siteLogo.startsWith("/") ? siteLogo : `/${siteLogo}`}`
        : `${SITE_URL}${siteLogo.startsWith("/") ? siteLogo : `/${siteLogo}`}`);

  const siteFaviconUrl = siteFavicon.startsWith("http") || siteFavicon.startsWith("data:")
    ? siteFavicon
    : (siteFavicon.includes("uploads")
        ? `${API_BASE_URL}${siteFavicon.startsWith("/") ? siteFavicon : `/${siteFavicon}`}`
        : `${SITE_URL}${siteFavicon.startsWith("/") ? siteFavicon : `/${siteFavicon}`}`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        "name": siteName,
        "alternateName": [siteName],
        "url": SITE_URL,
        "logo": {
          "@type": "ImageObject",
          "@id": `${SITE_URL}/#logo`,
          "url": siteLogoUrl,
          "caption": `${siteName} Logo`
        },
        "description": `سيرفر ${siteName} لخدمات وبرامج السوفت وير. شحن وتفعيل تلقائي فوري بأفضل الأسعار.`
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        "url": SITE_URL,
        "name": `${siteName} | لخدمات وبرامج السوفت وير`,
        "description": `سيرفر ${siteName} لخدمات وبرامج السوفت وير. شحن وتفعيل تلقائي فوري بأفضل الأسعار.`,
        "publisher": {
          "@id": `${SITE_URL}/#organization`
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${SITE_URL}/?search={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        },
        "inLanguage": "ar"
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": `ما هو متجر ${siteName}؟`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `سيرفر ${siteName} هو منصة متكاملة لخدمات وبرامج السوفت وير بأسرع تنفيذ تلقائي وأفضل الأسعار.`
            }
          },
          {
            "@type": "Question",
            "name": "كيف يمكنني تفعيل البرامج وتجديد اشتراكات الأدوات؟",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "يمكنك تفعيل وتجديد اشتراكات البرامج والخدمات مباشرة عبر إدخال البيانات المطلوبة للخدمة، وتحديد الباقة المناسبة، وإتمام الدفع لتبدأ عملية التفعيل التلقائي فوراً."
            }
          },
          {
            "@type": "Question",
            "name": `ما هي طرق الدفع المتاحة في متجر ${siteName}؟`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "يدعم المتجر الدفع الإلكتروني المباشر، الدفع عبر رصيد المحفظة الخاص بك، وطرق الدفع المحلية مثل فودافون كاش ومحافظ الهاتف الذكي في مصر."
            }
          },
          {
            "@type": "Question",
            "name": "كيف أضمن أمان تفعيل البرامج والخدمات؟",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `متجر ${siteName} آمن وموثوق 100%، وتتم كافة المعاملات عبر بوابات دفع مشفرة وخدمات تفعيل رسمية تضمن حماية خصوصية العملاء.`
            }
          }
        ]
      }
    ]
  };

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="BpQsEK6Xln0FauVIlj0qYpPxuzvoYrACWOehkyBc5-U" />
        {/* PWA Settings */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00b4d8" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href={siteLogoUrl} />

        {/* Favicon / Tab Icon - Multiple sizes for Google crawler */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/icons/icon-48.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/icons/icon-96.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />

        {/* SEO Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Anti-Flicker Theme Initialization Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = localStorage.getItem('theme');
                  var theme = savedTheme || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {
                  console.error('Failed to set theme early:', e);
                }
              })();
            `,
          }}
        />

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning={true}>
        <MainLayout>
          {children}
          <ContactFloatingButton />
        </MainLayout>
      </body>
    </html>
  );
}
