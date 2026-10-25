"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { StorePage } from '@/lib/store-pages';

const StoreNavigation = createContext<StorePage[]>([]);
export const useStoreNavigation = () => useContext(StoreNavigation);

export default function StoreNavigationProvider({ initialPages, children }: { initialPages: StorePage[]; children: React.ReactNode }) {
  const [pages, setPages] = useState(initialPages);
  const pathname = usePathname();
  useEffect(() => {
    const controller = new AbortController();
    let fetching = false;
    async function refresh() {
      if (fetching || document.visibilityState === 'hidden') return;
      fetching = true;
      try {
        const response = await fetch('/api/store-pages', { cache: 'no-store', signal: controller.signal });
        if (!response.ok) return;
        const data = await response.json();
        if (!controller.signal.aborted && Array.isArray(data.pages)) setPages(data.pages);
      } catch { /* Keep the last successful menu while offline. */ }
      finally { fetching = false; }
    }
    const onStorage = (event: StorageEvent) => { if (event.key === 'store-pages-updated') refresh(); };
    refresh();
    const timer = window.setInterval(refresh, 20000);
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', onStorage);
    window.addEventListener('store-pages-updated', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      controller.abort(); window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('store-pages-updated', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [pathname]);
  return <StoreNavigation.Provider value={pages}>{children}</StoreNavigation.Provider>;
}
