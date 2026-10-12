import { Locale } from "@/i18n/config";
import { Metadata } from "next";
import ServicesPage from "../services/page";

export async function generateMetadata(
  props: {
    params: Promise<{ lang: Locale }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const isAr = params.lang === "ar";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://borai.store";

  const title = isAr
    ? "متجر شحن الألعاب الرسمي | شدات ببجي، جواهر فري فاير، روبلوكس - BORAI STORE"
    : "Official Game Top-Ups | PUBG Mobile UC, Free Fire Diamonds, Roblox - BORAI STORE";
  const description = isAr
    ? "القسم الرسمي المخصص لشحن الألعاب الإلكترونية في متجر بورعي (BORAI STORE). شحن فوري بالآيدي ID لـ شدات ببجي موبايل، جواهر فري فاير، روبلوكس، كول أوف ديوتي، بيس، وتيك توك بأرخص الأسعار وتسليم آلي فوري 24/7."
    : "Official Gaming Top-Up portal at BORAI STORE. Instant player ID top-up for PUBG Mobile UC, Free Fire Diamonds, Roblox Robux, Call of Duty, and eFootball with 24/7 automated delivery.";

  return {
    title,
    description,
    keywords: [
      "شحن ألعاب",
      "شحن العاب",
      "شحن شدات ببجي",
      "شدات ببجي فوري",
      "ببجي موبايل",
      "PUBG UC",
      "شحن جواهر فري فاير",
      "جواهر فري فاير بالآيدي",
      "Free Fire Diamonds",
      "شحن روبلوكس",
      "روبكس روبلوكس",
      "Roblox Robux",
      "شحن كول اوف ديوتي",
      "شحن بيس موبايل",
      "شحن تيك توك",
      "شحن يلا لودو",
      "بطاقات العاب",
      "بطاقات ستيم",
      "بطاقات بلايستيشن",
      "BORAI STORE",
      "بورعي ستور",
      "متجر بورعي"
    ],
    alternates: {
      canonical: `${siteUrl}/${params.lang}/gaming`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${params.lang}/gaming`,
      siteName: isAr ? "BORAI STORE (بورعي ستور)" : "BORAI STORE",
      type: "website"
    }
  };
}
export default ServicesPage;
