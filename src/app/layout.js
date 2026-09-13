import "./globals.css";
import NextTopLoader from 'nextjs-toploader';
import ContactFloatingButton from "../components/ContactFloatingButton";
import MainLayout from "../components/MainLayout";
import AnnouncementOverlay from "../components/AnnouncementOverlay";
import { I18nProvider } from "@/lib/i18n";
import { API_BASE_URL, SITE_URL, fetchWithTimeout } from "../config";
import { cache } from "react";
import { Tajawal } from 'next/font/google';

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '700', '800', '900'],
  variable: '--font-tajawal',
});

// Skip API fetch during Vercel build when the API is not reachable
const isBuildTime = typeof window === "undefined" && (API_BASE_URL.includes("localhost") || API_BASE_URL.includes("127.0.0.1"));

const resolveMediaUrl = (value, fallback) => {
  if (!value || value === "default") return fallback;
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:")) return value;
  if (value.startsWith("/uploads/") || value.startsWith("uploads/")) {
    return `${API_BASE_URL}${value.startsWith("/") ? "" : "/"}${value}`;
  }
  return value.startsWith("/") ? value : `/${value}`;
};

const getSiteSettings = cache(async () => {
  let siteName = "SK-unlocker";
  let siteLogo = "/logo.png";
  let siteFavicon = "/favicon.png";

  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/settings/metadata`, { next: { revalidate: 300 } });
    if (res.ok) {
      const settings = await res.json();
      if (settings.site_name) {
        siteName = settings.site_name.trim();
      }
      if (settings.site_logo && settings.site_logo !== "default") siteLogo = settings.site_logo;
      if (settings.site_favicon && settings.site_favicon !== "default") siteFavicon = settings.site_favicon;
    }
  } catch {
    // Keep metadata rendering resilient during build or temporary API downtime.
  }
  return {
    siteName: siteName || "SK-unlocker",
    siteLogo: resolveMediaUrl(siteLogo, "/logo.png"),
    siteFavicon: resolveMediaUrl(siteFavicon, "/favicon.png"),
  };
});

export async function generateMetadata() {
  const { siteName, siteFavicon, siteLogo } = await getSiteSettings();
  const siteUrl = SITE_URL || "https://sk-unlocker.com";
  const title = siteName || "SK-unlocker";
  const description = "SK-unlocker — المنصة الأولى لخدمات السوفت وير، تفعيل البرامج، أدوات GSM، وخدمات السيرفر وIMEI بأسعار مناسبة وتسليم فوري.";

  return {
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    keywords: [
      "SK-unlocker",
      "SK-UNLOCKER",
      "sk-unlocker",
      "SK unlocker",
      "سيرفر SK-unlocker لخدمات السوفت وير",
      "تفعيل برامج",
      "خدمات سيرفر",
      "فك شفرات",
      "أدوات GSM",
      "شحن وتفعيل",
      "خدمات رقمية"
    ],
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: "SK-unlocker",
      locale: "ar_SA",
      type: "website",
      images: [
        {
          url: "/og-image.png",
          width: 1024,
          height: 1024,
          alt: "SK-unlocker",
        }
      ],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: ["/og-image.png"],
    },
    icons: {
      icon: siteFavicon,
      shortcut: siteFavicon,
      apple: siteFavicon,
    },
    verification: {
      google: "98MXmfIHXauUjaZPs2tF1w439NPxK2pIvWr2wRQe0JI",
    },
  };
}

export default async function RootLayout({ children }) {
  const { siteName, siteLogo, siteFavicon } = await getSiteSettings();
  const siteLogoUrl = siteLogo;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteName,
    "url": SITE_URL || "https://sk-unlocker.com",
    "publisher": {
      "@type": "Organization",
      "name": siteName,
      "url": SITE_URL || "https://sk-unlocker.com",
      "logo": siteLogoUrl || "/logo.png"
    },
    "mainEntity": [
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "كيف أضمن أمان تفعيل البرامج والخدمات؟",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `متجر ${siteName} آمن وموثوق 100%، وتتم كافة المعاملات عبر بوابات دفع مشفرة وخدمات رسمية تضمن حماية خصوصية العملاء.`
            }
          }
        ]
      }
    ]
  };

  return (
    <html lang="ar" dir="rtl" data-theme="light" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="98MXmfIHXauUjaZPs2tF1w439NPxK2pIvWr2wRQe0JI" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href={siteLogoUrl} />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href={siteFavicon} />
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
                  var savedTheme = localStorage.getItem('theme') || 'light';
                  document.documentElement.setAttribute('data-theme', savedTheme);
                  var savedLanguage = localStorage.getItem('sk_unlocker_user_language') || 'ar';
                  if (savedLanguage !== 'en' && savedLanguage !== 'ar') savedLanguage = 'ar';
                  var isRtl = savedLanguage === 'ar';
                  document.documentElement.lang = savedLanguage;
                  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
                } catch (e) {
                  console.error('Failed to set theme early:', e);
                }
              })();
            `,
          }}
        />

        {/* Service Worker Unregistration & Cache Busting */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for (let registration of registrations) {
                    registration.unregister().then(function(boolean) {
                      if(boolean) {
                        console.log('Successfully unregistered old service worker.');
                        // Force clear all caches to remove the bad CSS MIME type cache
                        caches.keys().then(function(names) {
                          for (let name of names) {
                            caches.delete(name);
                          }
                          // Reload once to fetch fresh assets
                          if (!sessionStorage.getItem('sw_cache_cleared')) {
                            sessionStorage.setItem('sw_cache_cleared', 'true');
                            window.location.reload(true);
                          }
                        });
                      }
                    });
                  }
                });
              }
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning={true} className="font-sans">
        <AnnouncementOverlay />
        <NextTopLoader color="#00b4d8" showSpinner={false} />
        <I18nProvider>
          <MainLayout>
            {children}
            <ContactFloatingButton />
          </MainLayout>
        </I18nProvider>
      </body>
    </html>
  );
}
