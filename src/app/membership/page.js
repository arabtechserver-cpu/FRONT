import MembershipClient from "./MembershipClient";
import { API_BASE_URL, SITE_URL } from "@/config";
import { cache } from "react";

const getSiteName = cache(async function getSiteName() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/settings`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const settings = await res.json();
      if (settings.site_name) return settings.site_name;
    }
  } catch (err) {
    console.error("Error fetching site name in metadata:", err);
  }
  return "عرب تك سيرفر";
});

export async function generateMetadata() {
  const siteName = await getSiteName();

  const title = `عضوية الحساب والميزات | ${siteName}`;
  const description = `استعرض تفاصيل مستواك، العروض الترويجية والخصومات المخصصة لك في ${siteName}. كلما زادت طلباتك، زادت خصوماتك.`;

  return {
    title,
    description,
    keywords: [
      "عضوية",
      "خصومات",
      "مستوى الحساب",
      "VIP",
      "برونزي",
      "فضي",
      "ذهبي",
      "ماسي",
      siteName
    ],
    alternates: {
      canonical: `${SITE_URL}/membership`,
    }
  };
}

export default async function Page() {
  const siteName = await getSiteName();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "الرئيسية",
        "item": SITE_URL
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "العضوية والميزات",
        "item": `${SITE_URL}/membership`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <MembershipClient />
    </>
  );
}
