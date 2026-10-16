import { Locale } from "@/i18n/config";
import { Metadata } from "next";
import CartClient from "./CartClient";

interface Props {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const isAr = params.lang === "ar";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://borai.store";

  const title = isAr
    ? "سلة المشتريات | BORAI STORE - برعي ستور"
    : "Shopping Cart | BORAI STORE";
  const description = isAr
    ? "راجع سلة مشترياتك من شحن الألعاب والبطاقات الرقمية وأكمل طلبك الفوري بأمان عبر BORAI STORE."
    : "Review your shopping cart with game top-ups, digital cards, and complete instant orders safely on BORAI STORE.";

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${params.lang}/cart`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${params.lang}/cart`,
      siteName: isAr ? "BORAI STORE (برعي ستور)" : "BORAI STORE",
      type: "website",
    },
  };
}

export default async function CartPage(props: Props) {
  const params = await props.params;
  return <CartClient lang={params.lang} />;
}
