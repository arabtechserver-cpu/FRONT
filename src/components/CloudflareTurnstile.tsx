"use client";

import { useEffect, useRef } from "react";

export function resetTurnstile() {
  // No-op: Cloudflare Turnstile disabled
}

interface CloudflareTurnstileProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (error?: any) => void;
  theme?: "auto" | "light" | "dark";
  className?: string;
  size?: "normal" | "compact" | "flexible";
}

export default function CloudflareTurnstile({
  onVerify
}: CloudflareTurnstileProps) {
  const onVerifyRef = useRef(onVerify);

  useEffect(() => {
    onVerifyRef.current = onVerify;
  });

  useEffect(() => {
    onVerifyRef.current?.("cf-turnstile-bypassed");
  }, []);

  return null;
}

