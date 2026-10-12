import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import ServicesClient from "./ServicesClient";
import { Metadata } from "next";

import { getBackendCandidates } from "@/lib/api-proxy-candidates";

async function fetchDigitalServices(): Promise<any[]> {
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
        throw new Error("Empty digital catalog");
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
  const params = await props.params;
  const isAr = params.lang === "ar";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://borai.store";
  const title = isAr
    ? "خدمات الألعاب والشحن الرقمي وتفعيل البرامج | BORAI STORE - بورعي ستور"
    : "Gaming Top-Ups, Digital Gift Cards & Tool Activations | BORAI STORE";
  const description = isAr
    ? "تصفح أسرع خدمات الشحن الرقمي المباشر في متجر BORAI STORE: شحن شدات ببجي، جواهر فري فاير، روبلوكس، بطاقات جوجل بلاي، أيتونز، ستيم، بلايستيشن، واشتراكات البرامج وأدوات السوفت وير بأفضل أسعار الجملة وتسليم آلي فوري."
    : "Browse official instant digital services from BORAI STORE: PUBG UC, Free Fire Diamonds, Roblox Robux, Google Play, iTunes, Steam, PlayStation cards, and GSM software tool activations at wholesale prices with instant automated delivery.";

  return {
    title,
    description,
    keywords: [
      "خدمات الألعاب",
      "شحن ألعاب فوري",
      "بطاقات رقمية",
      "شدات ببجي",
      "جواهر فري فاير",
      "روبلوكس",
      "تفعيل برامج",
      "انلوك تول",
      "شيميرا تول",
      "بورنيو سكماتك",
      "BORAI STORE",
      "بورعي ستور",
      "متجر بورعي",
      "Game Topups",
      "Gift Cards",
      "Software Activations"
    ],
    alternates: {
      canonical: `${siteUrl}/${params.lang}/services`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${params.lang}/services`,
      siteName: isAr ? "BORAI STORE (بورعي ستور)" : "BORAI STORE",
      type: "website"
    }
  };
}

interface Props {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ServicesPage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const dict = await getDictionary(params.lang);
  const initialServices = await fetchPricingServicesSafe();

  const initialCat = typeof searchParams?.cat === "string" 
    ? searchParams.cat 
    : (typeof searchParams?.category === "string" ? searchParams.category : "all");
  const initialSearch = typeof searchParams?.search === "string" 
    ? searchParams.search 
    : (typeof searchParams?.section === "string" ? searchParams.section : "");

  return (
    <ServicesClient
      lang={params.lang}
      dict={dict}
      initialServices={initialServices}
      initialCategory={initialCat}
      initialSearchQuery={initialSearch}
    />
  );
}

async function fetchPricingServicesSafe() {
  try {
    return await fetchDigitalServices();
  } catch {
    return [];
  }
}
