"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";

interface MainLayoutWrapperProps {
  children: React.ReactNode;
  lang: string;
}

export default function MainLayoutWrapper({ children, lang }: MainLayoutWrapperProps) {
  const pathname = usePathname();
  const isHomePage = pathname === `/${lang}` || pathname === `/${lang}/` || pathname === "/";

  useEffect(() => {
    if (typeof window !== "undefined" && !window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname]);

  return (
    <main
      className={`flex-grow w-full max-w-[100vw] min-w-0 overflow-x-hidden bg-transparent ${
        isHomePage ? "p-0" : "max-w-[1240px] mx-auto px-2 min-[320px]:px-3 sm:px-6 pt-4 sm:pt-6 pb-16"
      }`}
    >
      <div key={pathname} className="page-transition-view min-w-0 w-full">
        {children}
      </div>
    </main>
  );
}
