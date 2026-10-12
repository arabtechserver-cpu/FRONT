"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import AOS from "aos";

export default function AosInit() {
  const pathname = usePathname();

  useEffect(() => {
    const initTimer = setTimeout(() => {
      AOS.init({
        disable: () => (typeof window !== "undefined" ? window.innerWidth < 768 : false),
        duration: 350,
        delay: 0,
        once: true,
        easing: "ease-out-cubic",
        offset: 40,
        mirror: false,
        throttleDelay: 50,
        debounceDelay: 20,
      });
      AOS.refresh();
    }, 50);

    const handleRefresh = () => {
      AOS.refresh();
    };

    window.addEventListener("load", handleRefresh);
    window.addEventListener("resize", handleRefresh, { passive: true });

    return () => {
      window.removeEventListener("load", handleRefresh);
      window.removeEventListener("resize", handleRefresh);
      clearTimeout(initTimer);
    };
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      AOS.refresh();
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}
