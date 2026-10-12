"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface NavigationProgressBarProps {
  lang?: string;
}

export default function NavigationProgressBar({ lang = "ar" }: NavigationProgressBarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAr = lang === "ar";

  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [showPill, setShowPill] = useState(false);

  const trickleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pillTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeRouteRef = useRef<string>("");

  const clearTimers = useCallback(() => {
    if (trickleTimerRef.current) {
      clearInterval(trickleTimerRef.current);
      trickleTimerRef.current = null;
    }
    if (pillTimerRef.current) {
      clearTimeout(pillTimerRef.current);
      pillTimerRef.current = null;
    }
    if (cleanupTimerRef.current) {
      clearTimeout(cleanupTimerRef.current);
      cleanupTimerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clearTimers();
    setIsVisible(true);
    setProgress(18);

    // Show floating spinner pill if loading takes more than 160ms
    pillTimerRef.current = setTimeout(() => {
      setShowPill(true);
    }, 160);

    trickleTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 35) return prev + 14;
        if (prev < 60) return prev + 7;
        if (prev < 80) return prev + 3;
        if (prev < 93) return prev + 1;
        return prev;
      });
    }, 120);

    // Fallback safety timeout (8 seconds)
    cleanupTimerRef.current = setTimeout(() => {
      finish();
    }, 8000);
  }, [clearTimers]);

  const finish = useCallback(() => {
    if (trickleTimerRef.current) {
      clearInterval(trickleTimerRef.current);
      trickleTimerRef.current = null;
    }
    if (pillTimerRef.current) {
      clearTimeout(pillTimerRef.current);
      pillTimerRef.current = null;
    }

    setProgress(100);

    setTimeout(() => {
      setIsVisible(false);
      setShowPill(false);
      setTimeout(() => {
        setProgress(0);
      }, 250);
    }, 200);
  }, []);

  // Update active route reference
  useEffect(() => {
    const fullPath = (pathname || "") + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    if (activeRouteRef.current && activeRouteRef.current !== fullPath && isVisible) {
      finish();
    }
    activeRouteRef.current = fullPath;
  }, [pathname, searchParams, isVisible, finish]);

  useEffect(() => {
    const handleLinkClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;

      const rawHref = anchor.getAttribute("href");
      if (!rawHref) return;

      if (
        rawHref.startsWith("#") ||
        rawHref.startsWith("javascript:") ||
        rawHref.startsWith("tel:") ||
        rawHref.startsWith("mailto:")
      ) {
        return;
      }

      if (anchor.hasAttribute("download")) return;
      if (anchor.target && anchor.target !== "_self") return;

      try {
        const currentUrl = new URL(window.location.href);
        const targetUrl = new URL(anchor.href, window.location.href);

        if (targetUrl.origin !== currentUrl.origin) return;

        // Ignore clicks to identical URL
        if (
          targetUrl.pathname === currentUrl.pathname &&
          targetUrl.search === currentUrl.search &&
          targetUrl.hash === currentUrl.hash
        ) {
          return;
        }

        // Anchor change on same page
        if (targetUrl.pathname === currentUrl.pathname && targetUrl.search === currentUrl.search && targetUrl.hash) {
          return;
        }

        start();
      } catch {
        // Ignore invalid URL
      }
    };

    const handlePopState = () => {
      start();
    };

    const handleCustomStart = () => {
      start();
    };

    const handleCustomFinish = () => {
      finish();
    };

    document.addEventListener("click", handleLinkClick, { capture: true });
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("route_navigation_start", handleCustomStart);
    window.addEventListener("route_navigation_finish", handleCustomFinish);

    return () => {
      document.removeEventListener("click", handleLinkClick, { capture: true });
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("route_navigation_start", handleCustomStart);
      window.removeEventListener("route_navigation_finish", handleCustomFinish);
      clearTimers();
    };
  }, [start, finish, clearTimers]);

  if (!isVisible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[999999] pointer-events-none"
      dir={isAr ? "rtl" : "ltr"}
      aria-hidden="true"
    >
      {/* Top Gradient Progress Bar */}
      <div
        className="h-[3px] w-full bg-transparent overflow-hidden"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: "opacity 200ms ease",
        }}
      >
        <div
          className="h-full relative shadow-[0_0_12px_rgba(56,189,248,0.7),0_0_6px_rgba(37,99,235,0.5)]"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, #2563eb 0%, #38bdf8 50%, #6366f1 100%)",
            transition: progress === 100 ? "width 180ms ease-out" : "width 220ms cubic-bezier(0.1, 0.9, 0.2, 1)",
            transformOrigin: isAr ? "right" : "left",
          }}
        >
          {/* Glowing Head Particle */}
          <div
            className={`absolute top-0 bottom-0 w-3 bg-white/80 blur-[1px] shadow-[0_0_8px_#ffffff] ${
              isAr ? "left-0" : "right-0"
            }`}
          />
        </div>
      </div>

      {/* Floating Status Pill for Sustained Route Loading */}
      {showPill && isVisible && (
        <div
          className={`fixed top-4 ${
            isAr ? "left-4" : "right-4"
          } flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-white/10 shadow-lg text-white text-xs font-medium animate-in fade-in zoom-in-95 duration-150`}
        >
          <svg
            className="w-3.5 h-3.5 animate-spin text-sky-400"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span className="tracking-tight">{isAr ? "جارٍ التحميل..." : "Loading..."}</span>
        </div>
      )}
    </div>
  );
}
