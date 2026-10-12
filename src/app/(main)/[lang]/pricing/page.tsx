import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import PricingClient from "./PricingClient";
import { Metadata } from "next";

import { getBackendCandidates } from "@/lib/api-proxy-candidates";

async function fetchPricingServices(): Promise<any[]> {
  const backendCandidates = getBackendCandidates(null, process.env.INTERNAL_API_URL);
  const candidates = [...new Set([
    ...backendCandidates,
    "https://api.borai.store",
    process.env.INTERNAL_API_URL,
    process.env.NEXT_PUBLIC_API_URL,
    "http://127.0.0.1:5000",
    "http://localhost:5000"
  ].filter(Boolean) as string[])];

  try {
    const data = await Promise.any(
      candidates.map(async (base) => {
        const cleanBase = base.replace(/\/$/, "");
        const res = await fetch(`${cleanBase}/api/dhru/services?view=pricing`, {
          next: { revalidate: 60 },
          signal: AbortSignal.timeout(1800)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (Array.isArray(json) && json.length > 0) return json;
        throw new Error("Empty catalog");
      })
    );
    return data;
  } catch {
    return [];
  }
}

export async function generateMetadata(
  props: {
    params: Promise<{ lang: Locale }>;
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
  }
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const isAr = params.lang === "ar";
  const rawSection = searchParams?.section || searchParams?.group || searchParams?.cat || searchParams?.search;
  let section = typeof rawSection === "string" ? rawSection : undefined;

  if (section) {
    try {
      section = decodeURIComponent(section);
    } catch {
      // ignore
    }
    section = section.replace(/^%20/, '').trim();
  }

  let title = isAr ? "قائمة الأسعار والخدمات" : "Services & Price List";
  let description = isAr
    ? "تصفح قائمة أسعار وخدمات BORAI STORE (بورعي ستور) لشحن الألعاب والبطاقات الرقمية والتفعيل الفوري بأفضل الأسعار وأسرع تسليم."
    : "Browse BORAI STORE complete catalog and live price list for game credits, digital vouchers, and software activations.";

  if (section) {
    const categories = await fetchPricingServices();
    const targetLower = section.toLowerCase();
    const matchingServices: any[] = [];

    for (const cat of categories) {
      for (const s of (cat.services || [])) {
        if (!s.isActive) continue;
        const gName = (s.groupName || '').trim().toLowerCase();
        const sName = (s.name || '').trim().toLowerCase();
        if (gName === targetLower || gName.includes(targetLower) || targetLower.includes(gName) || sName.includes(targetLower)) {
          matchingServices.push(s);
        }
      }
    }

    if (matchingServices.length > 0) {
      const count = matchingServices.length;
      title = isAr
        ? `${section} (${count} خدمة)`
        : `${section} (${count} Services)`;

      description = isAr
        ? `أسعار باقة ${section} (${count} خدمة): تسليم فوري وتفعيل تلقائي 24/7 عبر متجر BORAI STORE بأفضل الأسعار المعتمدة.`
        : `Live prices for ${section} (${count} services): instant 24/7 delivery and activation on BORAI STORE.`;
    } else {
      title = `${section}`;
      description = isAr
        ? `تصفح أسعار وخدمات باقة ${section} على منصة BORAI STORE مع التسليم الفوري وأقوى عروض الموزعين.`
        : `Explore ${section} services and real-time live prices on BORAI STORE with instant 24/7 delivery.`;
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://borai.store";
  const currentUrl = `${siteUrl}/${params.lang}/pricing${section ? `?section=${encodeURIComponent(section)}` : ''}`;

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    openGraph: {
      title,
      description,
      url: currentUrl,
      siteName: isAr ? "BORAI STORE (بورعي ستور)" : "BORAI STORE",
      images: [
        {
          url: `${siteUrl}/main-logo.png`,
          width: 512,
          height: 512,
          alt: "BORAI STORE Logo",
        },
        {
          url: `${siteUrl}/images/og-image.png`,
          width: 1200,
          height: 630,
          alt: "BORAI STORE",
        },
      ],
      locale: isAr ? "ar_AR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [`${siteUrl}/main-logo.png`],
    },
  };
}

export default async function Pricing(props: { params: Promise<{ lang: Locale }> }) {
  const params = await props.params;
  const [dict, initialServices] = await Promise.all([
    getDictionary(params.lang),
    fetchPricingServices()
  ]);

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-2">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold dark:text-white mb-2">{dict.pricing.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">
            {dict.pricing.subtitle}
          </p>
        </div>
      </div>

      {/* Pricing Client List (Includes Search and Filters) */}
      <PricingClient lang={params.lang} dict={dict} initialServices={initialServices} />
    </div>
  );
}
