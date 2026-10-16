import type { Metadata, Viewport } from "next";
import { SITE_CONTACTS } from "@/lib/site-contacts";
import Script from "next/script";
import { notFound } from "next/navigation";
import { Cairo, Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "../../globals.css";
import "@/styles/user-theme.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#2563eb",
};
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getDictionary } from "@/i18n/get-dictionary";
import { Locale, i18n } from "@/i18n/config";
import ClientWidgets from "@/components/ClientWidgets";
import { ThemeProvider } from "@/context/ThemeContext";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";
import MainLayoutWrapper from "@/components/MainLayoutWrapper";
import GlobalBottomBar from "@/components/GlobalBottomBar";
import FloatingContactDock from "@/components/FloatingContactDock";
import NavigationProgressBar from "@/components/NavigationProgressBar";
import localHomepageConfig from "@/data/homepage_config.json";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://borai.store";

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  if (!i18n.locales.includes(params.lang as Locale)) {
    notFound();
  }
  const isAr = params.lang === "ar";
  const siteTitle = isAr
    ? "BORAI STORE | متجر برعي لشحن الألعاب، البطاقات والخدمات الرقمية"
    : "BORAI STORE | Instant Game Top-Ups, Digital Cards & Activations";
  const siteDesc = isAr
    ? "متجر BORAI STORE (برعي ستور) المنصة الرسمية المعتمدة لشحن الألعاب (ببجي موبايل، فري فاير، روبلوكس)، البطاقات الرقمية وبطاقات الهدايا (iTunes, Google Play, Steam, PlayStation, Xbox)، وتفعيل برامج السوفت وير والأدوات الرقمية بأفضل الأسعار وأسرع تسليم فوري 24/7."
    : "BORAI STORE: Official automated platform for instant game topups (PUBG UC, Free Fire, Roblox), digital gift cards (Steam, PlayStation, Xbox, iTunes), and GSM software tool activations with 24/7 delivery.";

  return {
    title: {
      template: "%s | BORAI STORE - برعي ستور",
      default: siteTitle,
    },
    description: siteDesc,
    keywords: [
      "BORAI STORE",
      "برعي ستور",
      "متجر برعي",
      "سيرفر برعي",
      "موقع برعي",
      "borai store",
      "borai.store",
      "شحن ألعاب",
      "شحن العاب",
      "شحن شدات ببجي",
      "ببجي موبايل",
      "شحن جواهر فري فاير",
      "فري فاير",
      "شحن روبلوكس",
      "روبلكس",
      "شحن كول اوف ديوتي",
      "شحن يلا لودو",
      "شحن تيك توك",
      "بطاقات رقمية",
      "بطاقات ستيم",
      "بطاقات بلايستيشن",
      "بطاقات اكس بوكس",
      "بطاقات جوجل بلاي",
      "بطاقات ايتونز",
      "تفعيل برامج",
      "تفعيل انلوك تول",
      "UnlockTool",
      "تفعيل شيميرا",
      "Chimera Tool",
      "بورنيو سكماتك",
      "Borneo Schematics",
      "تفعيل DFT Pro",
      "فك شفرات الهواتف",
      "تخطي حساب جوجل FRP",
      "سيرفر ريسيلر",
      "اشتراكات رقمية",
      "خدمات رقمية",
      "Game Topups",
      "PUBG UC",
      "Free Fire Diamonds",
      "Roblox Robux",
      "Digital Cards",
      "Steam Gift Cards",
      "PlayStation Network",
      "Software Activations",
      "GSM Server Reseller"
    ],
    metadataBase: new URL(siteUrl),
    applicationName: "BORAI STORE",
    authors: [{ name: "BORAI STORE", url: siteUrl }],
    creator: "BORAI STORE",
    publisher: "BORAI STORE",
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: siteTitle,
      description: siteDesc,
      url: `${siteUrl}/${params.lang}`,
      siteName: isAr ? "BORAI STORE (برعي ستور)" : "BORAI STORE",
      images: [
        {
          url: isAr
            ? `${siteUrl}/images/og_share_ar.png`
            : `${siteUrl}/images/og_share_en.png`,
          width: 1200,
          height: 630,
          alt: isAr ? "BORAI STORE - متجر برعي لشحن الألعاب والخدمات الرقمية" : "BORAI STORE Official Platform",
        },
      ],
      locale: isAr ? "ar_AR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDesc,
      images: [
        isAr
          ? `${siteUrl}/images/og_share_ar.png`
          : `${siteUrl}/images/og_share_en.png`,
      ],
    },
    alternates: {
      canonical: `${siteUrl}/${params.lang}`,
      languages: {
        "ar": `${siteUrl}/ar`,
        "en": `${siteUrl}/en`,
        "x-default": siteUrl,
      },
    },
    icons: {
      icon: [
        { url: "/borai-favicon.png?v=3", sizes: "32x32", type: "image/png" },
        { url: "/borai-favicon-48.png?v=3", sizes: "48x48", type: "image/png" },
        { url: "/borai-favicon-192.png?v=3", sizes: "192x192", type: "image/png" },
      ],
      shortcut: "/borai-favicon.png?v=3",
      apple: "/borai-favicon-192.png?v=3",
    },
    verification: {
      google: "PFe3nlp9X8Bkt_3XJb1Ftzs0IksgLkZnreUyCErj6-Y",
    },
  };
}

export default async function RootLayout(
  props: Readonly<{
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
  }>
) {
  const params = await props.params;
  if (!i18n.locales.includes(params.lang as Locale)) {
    notFound();
  }

  const {
    children
  } = props;

  const lang = params.lang as Locale;
  const dict = await getDictionary(lang);
  const dir = lang === "ar" ? "rtl" : "ltr";
  const isAr = lang === "ar";

  const jsonLdWebsite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": isAr ? "BORAI STORE | برعي ستور" : "BORAI STORE",
    "alternateName": [
      "BORAI STORE",
      "برعي ستور",
      "متجر برعي",
      "Borai Store"
    ],
    "url": siteUrl,
    "inLanguage": ["ar", "en"],
    "description": isAr
      ? "الموقع الرسمي لمتجر BORAI STORE (برعي ستور) لخدمات شحن الألعاب، البطاقات الرقمية، والخدمات التكنولوجية الفورية."
      : "Official BORAI STORE platform for game credits, digital vouchers, and remote tech services.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${siteUrl}/ar/pricing?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  const jsonLdOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "BORAI STORE | برعي ستور",
    "legalName": "BORAI STORE",
    "alternateName": [
      "BORAI STORE",
      "برعي ستور",
      "متجر برعي",
      "Borai Store"
    ],
    "url": siteUrl,
    "logo": `${siteUrl}/images/logo_en.png`,
    "sameAs": [
      SITE_CONTACTS.telegramUrl,
      SITE_CONTACTS.whatsappGroupUrl
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": SITE_CONTACTS.phone,
      "contactType": "customer service",
      "availableLanguage": ["Arabic", "English"]
    }
  };

  const jsonLdSoftware = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "BORAI STORE - برعي ستور",
    "operatingSystem": "All (Web, Windows, Mac, Android, iOS)",
    "applicationCategory": "BusinessApplication, UtilitiesApplication",
    "url": siteUrl,
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "lowPrice": "0.10",
      "offerCount": "1000+"
    },
    "description": isAr
      ? "المنصة الرائدة لشحن الألعاب، البطاقات الرقمية، وتفعيل البرامج والخدمات الفورية مع تسليم فوري وتلقائي على مدار الساعة."
      : "The leading global platform for game credits, digital gift cards, and automated software service delivery."
  };

  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": isAr ? "ما هو متجر BORAI STORE؟" : "What is BORAI STORE?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": isAr
            ? "متجر BORAI STORE (برعي ستور) هو المنصة الرسمية لخدمات شحن الألعاب، البطاقات الرقمية، والاشتراكات، والخدمات التقنية المتطورة بأسرع وقت وأفضل الأسعار."
            : "BORAI STORE is the official platform providing digital game topups, voucher cards, activations, and instant server services."
        }
      },
      {
        "@type": "Question",
        "name": isAr ? "هل يوفر BORAI STORE ربط API للوكلاء والموزعين؟" : "Does BORAI STORE provide API integration for resellers?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": isAr
            ? "نعم، المنصة تدعم الربط المباشر المتوافق مع Dhru Fusion وWebx عبر واجهة برمجة التطبيقات API."
            : "Yes, we provide full REST API compatibility with Dhru Fusion and Webx platforms."
        }
      },
      {
        "@type": "Question",
        "name": isAr ? "ما هي طرق الدفع المتاحة في BORAI STORE؟" : "What payment methods are supported in BORAI STORE?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": isAr
            ? "نوفر شحناً فورياً للمحفظة عبر إنستاباي (Instapay)، فودافون كاش، محفظة العملات الرقمية USDT (TRC20/BEP20)، باي بال، وفيزا/ماستركارد، وبنكك وفوري."
            : "We support instant wallet topups via Instapay, Vodafone Cash, USDT Crypto, PayPal, Bankak, and cards."
        }
      }
    ]
  };

  const jsonLdStore = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "name": isAr ? "متجر برعي | BORAI STORE" : "BORAI STORE Official Store",
    "alternateName": [
      "BORAI STORE",
      "برعي ستور",
      "متجر برعي",
      "سيرفر برعي",
      "Borai Store"
    ],
    "url": siteUrl,
    "image": `${siteUrl}/borai-favicon-192.png`,
    "description": isAr
      ? "متجر برعي ستور الرسمي لشحن الألعاب الإلكترونية، البطاقات الرقمية وبطاقات الهدايا، وتفعيل برامج السوفت وير والخدمات الرقمية مع تسليم فوري وتلقائي 24/7."
      : "Official BORAI STORE platform for digital gaming credits, gift vouchers, and GSM software tool activations with 24/7 instant automated delivery.",
    "currenciesAccepted": "USD, EGP, SAR, AED, SDG",
    "paymentAccepted": "Cash, Credit Card, Cryptocurrency, Instapay, Vodafone Cash, PayPal",
    "priceRange": "$0.10 - $1000",
    "hasMerchantReturnPolicy": {
      "@type": "MerchantReturnPolicy",
      "applicableCountry": "GLOBAL",
      "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
      "merchantReturnDays": 1,
      "returnMethod": "https://schema.org/ReturnByMail",
      "returnFees": "https://schema.org/FreeReturn"
    }
  };

  return (
    <html lang={lang} dir={dir} className="user-site" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
        <meta name="google-site-verification" content="PFe3nlp9X8Bkt_3XJb1Ftzs0IksgLkZnreUyCErj6-Y" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* Explicit High-Priority Favicon Links */}
        <link rel="icon" type="image/png" sizes="32x32" href="/borai-favicon.png?v=3" />
        <link rel="icon" type="image/png" sizes="48x48" href="/borai-favicon-48.png?v=3" />
        <link rel="icon" type="image/png" sizes="192x192" href="/borai-favicon-192.png?v=3" />
        <link rel="shortcut icon" href="/borai-favicon.png?v=3" />
        <link rel="apple-touch-icon" href="/borai-favicon-192.png?v=3" />
        {/* Explicit Meta tags for WhatsApp, Telegram, Facebook & Twitter link previews */}
        <meta property="og:image" content={isAr ? `${siteUrl}/images/og_share_ar.png` : `${siteUrl}/images/og_share_en.png`} />
        <meta property="og:image:secure_url" content={isAr ? `${siteUrl}/images/og_share_ar.png` : `${siteUrl}/images/og_share_en.png`} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="BORAI STORE Logo" />
        <meta name="twitter:image" content={isAr ? `${siteUrl}/images/og_share_ar.png` : `${siteUrl}/images/og_share_en.png`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdStore) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftware) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
        />
      </head>
      <body
        className={`${cairo.variable} ${inter.variable} ${jakarta.variable} ${jetbrains.variable} user-theme font-sans antialiased min-h-screen flex flex-col relative`}
      >
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('app_theme');document.documentElement.classList.toggle('dark',t!=='light');}catch(e){document.documentElement.classList.add('dark');}`,
          }}
        />
        <ThemeProvider>
          <CartProvider>
            <NavigationProgressBar lang={lang} />
            <div className="user-ambient" aria-hidden="true">
              <span className="user-ambient__glow user-ambient__glow--primary" />
              <span className="user-ambient__glow user-ambient__glow--secondary" />
            </div>
            {/* Client Enhancement Widgets (Lazy loaded, non-blocking) */}
            <ClientWidgets lang={lang} />

            {/* Floating Contact & AI Assistant Dock */}
            <FloatingContactDock lang={lang} />

            <Navbar
              lang={lang}
              dict={dict.nav}
              initialAnnouncementBar={localHomepageConfig?.announcementBar}
            />
            
            <MainLayoutWrapper lang={lang}>
              {children}
            </MainLayoutWrapper>

            <CartDrawer lang={lang} />

            <GlobalBottomBar lang={lang} />

            <Footer lang={lang} dict={dict.footer} />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
