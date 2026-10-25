"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { INSTALL_DISMISS_KEY, REMIND_AFTER_MS, isStandalone, shouldOfferInstall } from '@/lib/pwa-install';
import { requestNativeInstall } from '@/lib/app-install-controller';
import '@/styles/install-app.css';

interface InstallPrompt extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' } | void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
interface InstallBridge { prompt: InstallPrompt | null; installed: boolean; }
const installBridge = () => {
  const target = window as Window & { __boraiAppInstall?: InstallBridge };
  return target.__boraiAppInstall ||= { prompt: null, installed: false };
};
interface InstallSettings {
  announcementBar?: { enabled?: boolean; title?: string; linkText?: string };
  appModal?: { enabled?: boolean };
}
const InstallContext = createContext({ installed: false, canInstall: false, installing: false, announcementEnabled: true, announcementTitle: "", announcementButtonText: "", openApp: () => {}, openInstall: () => {} });
export const useAppInstall = () => useContext(InstallContext);

export default function InstallAppProvider({ lang, initialSettings, children }: {
  lang: string; initialSettings?: InstallSettings; children: React.ReactNode;
}) {
  const isAr = lang === 'ar';
  const pathname = usePathname();
  const [settings, setSettings] = useState<InstallSettings>(initialSettings || {});
  const [installed, setInstalled] = useState(false);
  const [ready, setReady] = useState(false);
  const [promptEvent, setPromptEvent] = useState<InstallPrompt | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installError, setInstallError] = useState('');
  const installLock = useRef(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const dialog = useRef<HTMLDivElement>(null);

  const remindLater = useCallback(() => {
    setShowInvite(false);
    try { localStorage.setItem(INSTALL_DISMISS_KEY, String(Date.now() + REMIND_AFTER_MS)); } catch {}
  }, []);

  useEffect(() => {
    const displayMode = window.matchMedia('(display-mode: standalone)');
    const updateInstalled = () => setInstalled(installBridge().installed || isStandalone(displayMode.matches, (navigator as Navigator & { standalone?: boolean }).standalone));
    updateInstalled();
    setIsIos(/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
    setReady(true);
    const syncPrompt = () => { setPromptEvent(installBridge().prompt); updateInstalled(); };
    const beforeInstall = (event: Event) => {
      if (typeof (event as InstallPrompt).prompt !== 'function') return;
      event.preventDefault(); installBridge().prompt = event as InstallPrompt; syncPrompt();
    };
    const didInstall = () => {
      installBridge().installed = true; installBridge().prompt = null;
      setInstalled(true); setPromptEvent(null); setShowHelp(false); remindLater();
    };
    window.addEventListener('beforeinstallprompt', beforeInstall);
    window.addEventListener('appinstalled', didInstall);
    window.addEventListener('borai-install-ready', syncPrompt);
    syncPrompt();
    displayMode.addEventListener('change', updateInstalled);
    if ('serviceWorker' in navigator && window.isSecureContext) {
      navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).catch(() => {
        // Browsers can still offer manual installation when workers are disabled.
      });
    }
    const controller = new AbortController();
    fetch('/api/homepage', { cache: 'no-store', signal: controller.signal }).then(response => response.ok ? response.json() : null)
      .then(data => { if (data) setSettings(data); }).catch(() => {});
    return () => {
      controller.abort();
      window.removeEventListener('beforeinstallprompt', beforeInstall);
      window.removeEventListener('appinstalled', didInstall);
      window.removeEventListener('borai-install-ready', syncPrompt);
      displayMode.removeEventListener('change', updateInstalled);
    };
  }, [remindLater]);

  useEffect(() => {
    setShowInvite(false);
    if (!ready || !promptEvent || installing) return;
    let remindAfter: string | null = null;
    try { remindAfter = localStorage.getItem(INSTALL_DISMISS_KEY); } catch {}
    if (!shouldOfferInstall({ installed, enabled: settings.appModal?.enabled !== false, remindAfter, pathname })) return;
    const timer = window.setTimeout(() => setShowInvite(true), 8000);
    return () => window.clearTimeout(timer);
  }, [installed, settings.appModal?.enabled, pathname, ready, promptEvent, installing]);

  const modalOpen = (showInvite || showHelp) && !installed;
  const closeModal = useCallback(() => { setShowHelp(false); remindLater(); }, [remindLater]);

  useEffect(() => {
    if (!modalOpen) return;
    returnFocus.current = document.activeElement as HTMLElement;
    closeButton.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeModal();
      if (event.key === 'Tab') {
        const controls = dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]');
        if (!controls?.length) return;
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', handleKey); returnFocus.current?.focus(); };
  }, [modalOpen, closeModal]);

  const openInstall = async () => {
    if (installed || installLock.current) return;
    setInstallError('');
    if (!installBridge().prompt) { setShowHelp(true); return; }
    installLock.current = true;
    setInstalling(true);
    try {
      const choice = await requestNativeInstall(installBridge());
      setPromptEvent(null);
      if (choice?.outcome === 'accepted') { installBridge().installed = true; setInstalled(true); }
      closeModal();
    } catch {
      setPromptEvent(null); setShowHelp(true);
      setInstallError(isAr ? 'لم يكتمل طلب التثبيت. افتح الموقع في Chrome أو Edge وحاول مرة أخرى.' : 'Installation could not start. Open the site in Chrome or Edge and try again.');
    } finally { setInstalling(false); installLock.current = false; }
  };

  const canInstall = !!promptEvent && !installed;
  const brandText = (value: string) => value.replace(/زولنا|zoalna/gi, isAr ? 'برعي ستور' : 'BORAI STORE');
  const openApp = () => { if (!installed) { setInstallError(''); setShowHelp(true); } };
  return <InstallContext.Provider value={{ installed, canInstall, installing, announcementEnabled: settings.announcementBar?.enabled !== false, announcementTitle: isAr ? brandText(settings.announcementBar?.title || "تطبيق برعي ستور الرسمي:") : "The official BORAI STORE app:", announcementButtonText: canInstall ? (isAr ? brandText(settings.announcementBar?.linkText || "تثبيت التطبيق الآن") : "Install app now") : (isAr ? "تطبيق برعي على جهازك" : "BORAI on your device"), openApp, openInstall }}>
    {children}
    {modalOpen && <div className="pwa-dialog-backdrop" onClick={event => { if (event.target === event.currentTarget) closeModal(); }}>
      <div ref={dialog} className="pwa-dialog" role="dialog" aria-modal="true" aria-labelledby="pwa-install-title" dir={isAr ? 'rtl' : 'ltr'}>
        <button ref={closeButton} type="button" className="pwa-close" aria-label={isAr ? 'إغلاق نافذة التطبيق' : 'Close app window'} onClick={closeModal}>×</button>
        <img className="pwa-dialog-logo" src="/images/borai-logo.png" alt={isAr ? 'شعار برعي' : 'BORAI logo'} width={220} height={80} />
        <h2 id="pwa-install-title">{isAr ? 'تطبيق برعي ستور' : 'The BORAI STORE app'}</h2>
        <p>{isAr ? 'المتجر وطلباتك ومحفظتك، بضغطة واحدة من شاشة جهازك.' : 'Your store, orders and wallet, one tap from your home screen.'}</p>
        {installError && <p role="status">{installError}</p>}
        {canInstall ? <button type="button" className="pwa-primary pwa-install-now" disabled={installing} onClick={openInstall}>{installing ? (isAr ? 'جارٍ فتح التثبيت…' : 'Opening installer…') : (isAr ? 'تثبيت التطبيق الآن' : 'Install app now')}</button> : <p className="pwa-availability" role="status">{installing ? (isAr ? 'أكمل التثبيت من نافذة المتصفح.' : 'Complete installation in the browser prompt.') : isIos ? (isAr ? 'على iPhone، الإضافة للشاشة الرئيسية متاحة من قائمة المشاركة في Safari.' : 'On iPhone, add to Home Screen using Safari’s Share menu.') : (isAr ? 'التثبيت المباشر غير متاح هنا حاليًا. افتح الموقع في Chrome أو Edge لتثبيت تطبيق برعي.' : 'Direct installation is not available here right now. Open this site in Chrome or Edge to install BORAI.')}</p>}
        <button type="button" className="pwa-later" onClick={closeModal}>{isAr ? 'المتابعة عبر المتصفح' : 'Continue in browser'}</button>
      </div>
    </div>}
  </InstallContext.Provider>;
}
