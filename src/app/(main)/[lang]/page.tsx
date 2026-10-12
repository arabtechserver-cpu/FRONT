import { Metadata } from "next";
import { SITE_CONTACTS } from "@/lib/site-contacts";
import { notFound } from "next/navigation";
import { Locale, i18n } from "@/i18n/config";
import { getBackendCandidates } from "@/lib/api-proxy-candidates";
import ZoalnaHomepage from "@/components/zoalna/ZoalnaHomepage";
import localHomepageConfig from "@/data/homepage_config.json";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getHomepageConfig() {
  const backendCandidates = getBackendCandidates(null, process.env.INTERNAL_API_URL);
  const candidates = [...new Set([
    ...backendCandidates,
    "https://api.borai.store",
    process.env.INTERNAL_API_URL,
    "http://127.0.0.1:5000",
    "http://localhost:5000",
    process.env.NEXT_PUBLIC_API_URL,
  ].filter(Boolean) as string[])];

  try {
    const res = await Promise.any(candidates.map(async (baseUrl) => {
      const cleanBase = baseUrl.replace(/\/$/, "");
      const r = await fetch(`${cleanBase}/api/homepage`, {
        cache: "no-store",
        signal: AbortSignal.timeout(3500)
      });
      if (!r.ok) throw new Error(`Homepage API returned ${r.status}`);
      return r.json();
    }));
    if (res && (res.heroSlider || res.heroSection || res.gamesGroup1)) {
      return res;
    }
    return localHomepageConfig;
  } catch {
    return localHomepageConfig;
  }
}

export async function generateMetadata(props: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const params = await props.params;
  if (!i18n.locales.includes(params.lang as Locale)) {
    notFound();
  }
  const isAr = params.lang === "ar";
  const title = isAr
    ? "متجر بورعي | شحن ألعاب، بطاقات رقمية وتفعيل برامج فوري - BORAI STORE"
    : "BORAI STORE | Instant Game Top-Ups, Digital Gift Cards & Software Tools";
  const description = isAr
    ? "متجر BORAI STORE (بورعي ستور) المتجر الأسرع لشحن الألعاب والبطاقات الرقمية: شحن فوري لـ شدات ببجي، جواهر فري فاير، روبلوكس، كول أوف ديوتي، بيس، بطاقات ستيم وبلايستيشن وجوجل بلاي، وتفعيل برامج السوفت وير والأدوات الرقمية بأفضل الأسعار وتسليم آلي 24/7."
    : "BORAI STORE: Fast and official online store for game top-ups (PUBG UC, Free Fire Diamonds, Roblox), digital gift cards (Steam, PlayStation, Xbox, iTunes), and GSM software tool activations with instant 24/7 delivery.";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://borai.store";
  const shareImg = "/images/zoalna/logo.png";

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    keywords: [
      "BORAI STORE",
      "بورعي ستور",
      "متجر بورعي",
      "سيرفر بورعي",
      "borai store",
      "شحن ألعاب",
      "شحن العاب",
      "شحن ببجي",
      "شدات ببجي",
      "ببجي موبايل",
      "شحن فري فاير",
      "جواهر فري فاير",
      "شحن روبلوكس",
      "روبكس",
      "شحن تيك توك",
      "شحن كول اوف ديوتي",
      "شحن يلا لودو",
      "بطاقات رقمية",
      "بطاقات ستيم",
      "بطاقات بلايستيشن",
      "بطاقات اكس بوكس",
      "بطاقات جوجل بلاي",
      "تفعيل برامج",
      "تفعيل انلوك تول",
      "تفعيل شيميرا",
      "بورنيو سكماتك",
      "تفعيل DFT Pro",
      "فك شفرات",
      "سيرفر ريسيلر",
      "Game Topups",
      "PUBG UC",
      "Free Fire Diamonds",
      "Roblox Robux",
      "Steam Cards",
      "PlayStation Gift Card",
      "Software Activations"
    ],
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${params.lang}`,
      siteName: isAr ? "BORAI STORE (بورعي ستور)" : "BORAI STORE",
      images: [
        {
          url: shareImg,
          width: 600,
          height: 600,
          alt: isAr ? "BORAI STORE - بورعي ستور" : "BORAI STORE",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [shareImg],
    },
  };
}

export default async function Home(props: { params: Promise<{ lang: Locale }> }) {
  const params = await props.params;
  if (!i18n.locales.includes(params.lang as Locale)) {
    notFound();
  }
  const hp = await getHomepageConfig();
  const isAr = params.lang === "ar";
  const whatsappNum = hp?.noticeBar?.whatsapp || SITE_CONTACTS.phone;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://borai.store";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": isAr ? "BORAI STORE | متجر بورعي" : "BORAI STORE",
            "url": siteUrl,
            "potentialAction": {
              "@type": "SearchAction",
              "target": `${siteUrl}/${params.lang}/pricing?search={search_term_string}`,
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
      <ZoalnaHomepage
        lang={params.lang}
        whatsappNum={whatsappNum}
        config={hp}
      />
    </>
  );
}
