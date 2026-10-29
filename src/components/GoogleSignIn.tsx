"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import Script from 'next/script';

export default function GoogleSignIn({ lang, onCredential }: { lang: string; onCredential: (response: any) => void }) {
  const [clientId, setClientId] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/auth/google/config', { cache: 'no-store', credentials: 'include', signal: controller.signal })
      .then(response => response.ok ? response.json() : null)
      .then(config => {
        if (controller.signal.aborted) return;
        if (config?.enabled && typeof config.clientId === 'string' && config.clientId) setClientId(config.clientId);
        else setUnavailable(true);
      }).catch(() => { if (!controller.signal.aborted) setUnavailable(true); });
    return () => controller.abort();
  }, []);
  const initialize = useCallback(() => {
    const google = (window as any).google?.accounts?.id;
    if (!google || !clientId || !container.current) return;
    try {
      google.initialize({ client_id: clientId, callback: onCredential, auto_select: false, cancel_on_tap_outside: true });
      google.renderButton(container.current, { theme: 'outline', size: 'large', width: 360, text: 'continue_with', shape: 'pill', locale: lang === 'ar' ? 'ar' : 'en' });
    } catch { setUnavailable(true); }
  }, [clientId, lang, onCredential]);
  useEffect(() => { initialize(); }, [initialize]);
  if (unavailable) return <p role="status" className="text-center text-sm text-slate-500">{lang === 'ar' ? 'الدخول بجوجل غير متاح حاليًا. ادخل بالبريد وكلمة المرور، أو استخدم استعادة كلمة المرور.' : 'Google sign-in is currently unavailable. Use your email and password, or reset your password.'}</p>;
  return <>{clientId && <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={initialize} onError={() => setUnavailable(true)} />}<div ref={container} className="flex min-h-[44px] w-full justify-center" /></>;
}
