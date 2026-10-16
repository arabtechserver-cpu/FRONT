import { Locale } from "@/i18n/config";
import { Metadata } from "next";
import ProductClient from "./ProductClient";
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

interface Props {
  params: Promise<{ lang: Locale; slug: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const isAr = params.lang === "ar";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://borai.store";

  const cleanTitle = params.slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const title = isAr
    ? `شحن ${cleanTitle} فوري بالآيدي | BORAI STORE - برعي ستور`
    : `Instant ${cleanTitle} Top-Up by ID | BORAI STORE`;

  const description = isAr
    ? `شحن فوري بالمعرف ID لـ ${cleanTitle} عبر متجر برعي (BORAI STORE). استلم شحنتك فوراً في حسابك بشكل آلي وآمن بأفضل الأسعار وأسرع تسليم.`
    : `Instant Player ID Top-Up for ${cleanTitle} on BORAI STORE. Automated 24/7 delivery with full security and wholesale prices.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${params.lang}/product/${params.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${params.lang}/product/${params.slug}`,
      siteName: isAr ? "BORAI STORE (برعي ستور)" : "BORAI STORE",
      type: "website",
    },
  };
}

export default async function ProductPage(props: Props) {
  const params = await props.params;
  const services = await fetchDigitalServices();

  return (
    <ProductClient
      lang={params.lang}
      slug={params.slug}
      initialServices={services}
    />
  );
}
