import { Locale } from "@/i18n/config";
import { Metadata } from "next";
import ProductClient from "./ProductClient";
import { loadStorefrontData } from "@/lib/storefront-data";

async function fetchDigitalServices(): Promise<any[]> {
  return await loadStorefrontData("/api/dhru/services?view=pricing", Array.isArray) || [];
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
      key={`${params.lang}:${params.slug}`}
      lang={params.lang}
      slug={params.slug}
      initialServices={services}
    />
  );
}
