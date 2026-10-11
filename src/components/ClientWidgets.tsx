"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";

const AnalyticsTracker = dynamic(() => import("@/components/AnalyticsTracker"), { ssr: false });
const AosInit = dynamic(() => import("@/components/AosInit"), { ssr: false });
const AiChatWidget = dynamic(() => import("@/components/AiChatWidget"), { ssr: false });

export default function ClientWidgets({ lang }: { lang: string }) {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event?.reason;
      if (!reason) return;

      const reasonStr = typeof reason === "object" ? JSON.stringify(reason) : String(reason);
      if (
        reason?.isNotDisplayed ||
        reason?.opt_out_or_no_session ||
        reason?.type === "user_dismissed" ||
        reasonStr.includes("gsi") ||
        reasonStr.includes("requestAdapter") ||
        reasonStr.includes("sandboxed")
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return (
    <React.Suspense fallback={null}>
      <AosInit />
      <AnalyticsTracker />
      <AiChatWidget />
    </React.Suspense>
  );
}
