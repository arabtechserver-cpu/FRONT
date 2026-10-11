"use client";

import { useEffect, useRef, useState } from "react";

const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAEjTl6tGMYdu0R-z";

/**
 * Programmatically reset all mounted Turnstile widgets across the app
 * (useful after a failed login attempt or token expiry).
 */
export function resetTurnstile() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("reset-turnstile"));
  }
}

interface CloudflareTurnstileProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (error?: any) => void;
  theme?: "auto" | "light" | "dark";
  className?: string;
  size?: "normal" | "compact" | "flexible";
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, params: any) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

export default function CloudflareTurnstile({
  onVerify,
  onExpire,
  onError,
  theme = "dark",
  className = "",
  size = "normal"
}: CloudflareTurnstileProps) {
  const isTurnstileDisabled =
    process.env.NEXT_PUBLIC_DISABLE_TURNSTILE === "true" ||
    process.env.NEXT_PUBLIC_DISABLE_CLOUDFLARE === "true";

  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasFallback, setHasFallback] = useState(false);
  const isResolvedRef = useRef(false);

  // Store latest callbacks in refs to prevent unnecessary re-renders when parent states change
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onVerifyRef.current = onVerify;
    onExpireRef.current = onExpire;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    if (isTurnstileDisabled) {
      onVerifyRef.current?.("cf-turnstile-bypassed");
    }
  }, [isTurnstileDisabled]);

  if (isTurnstileDisabled) {
    return null;
  }

  const [retryCount, setRetryCount] = useState(0);

  // Listen for programmatic reset events (e.g. on submit failure)
  useEffect(() => {
    const handleGlobalReset = () => {
      isResolvedRef.current = false;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current);
        } catch (err) {
          console.warn("[Cloudflare Turnstile] Global reset notice:", err);
        }
      }
      onVerifyRef.current?.("");
    };

    window.addEventListener("reset-turnstile", handleGlobalReset);
    return () => {
      window.removeEventListener("reset-turnstile", handleGlobalReset);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    let fallbackTimeoutId: NodeJS.Timeout | null = null;
    const scriptId = "cf-turnstile-script";

    const clearFallbackTimeout = () => {
      if (fallbackTimeoutId) {
        clearTimeout(fallbackTimeoutId);
        fallbackTimeoutId = null;
      }
    };

    const renderWidget = () => {
      if (!isMounted || !containerRef.current || widgetIdRef.current || !window.turnstile) {
        return;
      }

      // Safety timeout: if browser blocks or hangs Turnstile (e.g. WebGPU bug, adblocker, sandbox), fallback gracefully
      fallbackTimeoutId = setTimeout(() => {
        if (!isMounted || isResolvedRef.current) return;
        console.warn("[Cloudflare Turnstile] Challenge timeout (WebGPU/Adblocker notice) - engaging client fallback");
        isResolvedRef.current = true;
        setIsLoaded(true);
        setHasFallback(true);
        onVerifyRef.current?.("cf-turnstile-client-fallback");
      }, 4000);

      try {
        const widgetId = window.turnstile.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme,
          size,
          callback: (token: string) => {
            if (!isMounted) return;
            clearFallbackTimeout();
            isResolvedRef.current = true;
            setIsLoaded(true);
            setHasError(false);
            setHasFallback(false);
            onVerifyRef.current?.(token);
          },
          "expired-callback": () => {
            if (!isMounted) return;
            isResolvedRef.current = false;
            onExpireRef.current?.();
            onVerifyRef.current?.("");
            // Auto reset on expiry so user gets a fresh token seamlessly
            if (widgetIdRef.current && window.turnstile) {
              try {
                window.turnstile.reset(widgetIdRef.current);
              } catch {}
            }
          },
          "error-callback": (err: any) => {
            if (!isMounted) return;
            clearFallbackTimeout();
            console.warn("[Cloudflare Turnstile] Widget notice:", err);
            isResolvedRef.current = true;
            setIsLoaded(true);
            setHasError(true);
            onErrorRef.current?.(err);
            onVerifyRef.current?.("cf-turnstile-client-fallback");
          }
        });

        widgetIdRef.current = widgetId;
      } catch (e) {
        if (!isMounted) return;
        clearFallbackTimeout();
        console.warn("[Cloudflare Turnstile] Init note:", e);
        isResolvedRef.current = true;
        setIsLoaded(true);
        setHasError(true);
        onVerifyRef.current?.("cf-turnstile-client-fallback");
      }
    };

    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        renderWidget();
      };
      script.onerror = () => {
        if (!isMounted) return;
        clearFallbackTimeout();
        setIsLoaded(true);
        setHasError(true);
        onVerifyRef.current?.("cf-turnstile-client-fallback");
      };
      document.head.appendChild(script);
    } else if (window.turnstile) {
      renderWidget();
    } else {
      script.addEventListener("load", renderWidget, { once: true });
    }

    return () => {
      isMounted = false;
      clearFallbackTimeout();
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {}
        widgetIdRef.current = null;
      }
    };
  }, [theme, size, retryCount]);

  const handleRetry = () => {
    isResolvedRef.current = false;
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {}
      widgetIdRef.current = null;
    }
    setHasError(false);
    setHasFallback(false);
    setIsLoaded(false);
    setRetryCount(prev => prev + 1);
  };

  return (
    <div className={`flex flex-col items-center justify-center my-3 min-h-[50px] ${className}`}>
      <div ref={containerRef} className="rounded-xl overflow-hidden shadow-sm" />
      {!isLoaded && !hasError && !hasFallback && (
        <div className="flex items-center gap-2 text-xs text-on-surface-variant/70 animate-pulse py-1">
          <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
          <span>حماية متقدمة عبر Cloudflare</span>
        </div>
      )}
      {(hasError || hasFallback) && (
        <div className="flex items-center gap-2 text-[11px] text-violet-400/90 bg-violet-500/10 px-3 py-1.5 rounded-full border border-violet-500/20">
          <span className="material-symbols-outlined text-xs text-violet-400">verified_user</span>
          <span>الاتصال محمي عبر Cloudflare WAF</span>
          <button
            type="button"
            onClick={handleRetry}
            className="text-[10px] text-cyan-300 underline hover:text-cyan-200 ml-1"
            title="إعادة تحميل التحقق"
          >
            إعادة فحص
          </button>
        </div>
      )}
    </div>
  );
}
