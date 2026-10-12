"use client";

import React from "react";
import { usePathname } from "next/navigation";

interface MainLayoutWrapperProps {
  children: React.ReactNode;
  lang: string;
}

export default function MainLayoutWrapper({ children, lang }: MainLayoutWrapperProps) {
  const pathname = usePathname();
  const isHomePage = pathname === `/${lang}` || pathname === `/${lang}/` || pathname === "/";

  return (
    <main
      className={`flex-grow w-full max-w-[100vw] min-w-0 overflow-x-hidden bg-transparent ${
        isHomePage ? "p-0" : "max-w-[1240px] mx-auto px-2 min-[320px]:px-3 sm:px-6 pt-4 sm:pt-6 pb-16"
      }`}
    >
      {children}
    </main>
  );
}
