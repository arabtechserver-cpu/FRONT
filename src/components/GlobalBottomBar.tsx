"use client";

import dynamic from "next/dynamic";

const ZoalnaBottomBar = dynamic(
  () => import("@/components/zoalna/ZoalnaBottomBar"),
  { ssr: false }
);

export default function GlobalBottomBar({ lang }: { lang: string }) {
  return (
    <ZoalnaBottomBar
      lang={lang}
      onOpenAuth={() => {}}
    />
  );
}
