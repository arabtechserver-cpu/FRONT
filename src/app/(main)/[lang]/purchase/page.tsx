import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import PurchaseClient from "./PurchaseClient";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ serviceId?: string }>;
};

// Function to fetch single service for dynamic SEO Metadata
async function getServiceDetails(serviceId: string) {
  try {
    const candidates = [
      process.env.INTERNAL_API_URL,
      process.env.NEXT_PUBLIC_API_URL,
      "https://api.borai.store",
      "http://127.0.0.1:5000",
      "http://localhost:5000"
    ].filter(Boolean) as string[];

    const data = await Promise.any(
      candidates.map(async (base) => {
        const clean = base.replace(/\/$/, "");
        const res = await fetch(`${clean}/api/dhru/services/${serviceId}`, {
          next: { revalidate: 120 },
          signal: AbortSignal.timeout(1500)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      })
    );
    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const isAr = params.lang === "ar";
  const serviceId = searchParams.serviceId;

  if (serviceId) {
    const service = await getServiceDetails(serviceId);
    if (service) {
      const serviceName = service.name || (isAr ? "طلب خدمة سيرفر" : "Order Server Service");
      const calcPrice = service.finalPrice ?? service.price ?? ((Number(service.credit) || 0) + (Number(service.margin) || 0));
      const priceNum = typeof calcPrice === 'number' ? calcPrice : parseFloat(calcPrice) || 0;
      const isFree = priceNum === 0 && (serviceName.toLowerCase().includes("free") || serviceName.includes("مجاني"));
      const priceStr = isFree ? (isAr ? "مجاني" : "Free") : priceNum > 0 ? `${priceNum.toFixed(2)}` : (isAr ? "تواصل معنا" : "Contact Us");
      const deliveryTime = service.time || service.deliveryTime || (isAr ? "1-24 ساعة" : "1-24 Hours");
      const groupName = service.groupName || service.category?.name || "";

      const priceDisplayForTitle = isFree ? (isAr ? "مجاناً" : "Free") : priceNum > 0 ? `$${priceNum.toFixed(2)}` : (isAr ? "سعر خاص" : "Special Price");
      const title = `${serviceName} - ${priceDisplayForTitle}`;
      const description = isAr
        ? `اطلب خدمة ${serviceName} بسعر ${priceStr} فقط. وقت التسليم: ${deliveryTime}. قسم: ${groupName}. تسليم فوري ومضمون عبر متجر BORAI STORE.`
        : `Order ${serviceName} for only ${priceStr}. Delivery time: ${deliveryTime}. Category: ${groupName}. Fast & official delivery from BORAI STORE.`;

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://borai.store";
      const pageUrl = `${siteUrl}/${params.lang}/purchase?serviceId=${serviceId}`;

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          url: pageUrl,
          siteName: "BORAI STORE",
          images: [
            {
              url: `${siteUrl}/images/og-image.png`,
              width: 1200,
              height: 630,
              alt: serviceName,
            },
          ],
          locale: isAr ? "ar_AR" : "en_US",
          type: "website",
        },
        twitter: {
          card: "summary_large_image",
          title,
          description,
          images: [`${siteUrl}/images/og-image.png`],
        },
      };
    }
  }

  // Default Purchase Page Metadata
  const defaultTitle = isAr ? "طلب خدمة وتفعيل فوري | BORAI STORE" : "Order New Service | BORAI STORE";
  const defaultDesc = isAr
    ? "اختر واطلب خدمات الشحن، الألعاب، البطاقات الرقمية، والخدمات التقنية عبر متجر BORAI STORE بأفضل الأسعار وأسرع وقت."
    : "Choose and order digital gaming credits, gift cards, and server services at the best rates on BORAI STORE.";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://borai.store";

  return {
    metadataBase: new URL(siteUrl),
    title: defaultTitle,
    description: defaultDesc,
    openGraph: {
      title: defaultTitle,
      description: defaultDesc,
      url: `${siteUrl}/${params.lang}/purchase`,
      images: [
        {
          url: `${siteUrl}/images/og-image.png`,
          width: 1200,
          height: 630,
          alt: "BORAI STORE",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description: defaultDesc,
      images: [`${siteUrl}/images/og-image.png`],
    },
  };
}

export default async function Purchase(props: {
  params: Promise<{ lang: Locale }>;
  searchParams?: Promise<{ serviceId?: string }>;
}) {
  const params = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : {};
  const serviceId = searchParams.serviceId;
  const initialService = serviceId ? await getServiceDetails(serviceId) : null;
  const dict = await getDictionary(params.lang);

  return (
    <PurchaseClient
      lang={params.lang}
      dict={dict}
      initialService={initialService}
      initialServiceId={serviceId}
    />
  );
}
