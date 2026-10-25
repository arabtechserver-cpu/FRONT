export interface StorePage {
  id: string; title: string; titleEn: string; slug: string; description: string; descriptionEn: string;
  enabled: boolean; navbar: boolean; menu: boolean; order: number; archived: boolean;
  serviceCount?: number;
}
export interface PagePlacement { mode: 'inherit' | 'selected' | 'all'; pageIds: string[]; }
export interface PageTarget { serviceId?: string; categoryId?: string; groupName?: string; }
export function pageTargetKey(target: PageTarget) {
  return target.serviceId ? `service:${encodeURIComponent(target.serviceId)}` : `group:${encodeURIComponent(target.categoryId || '')}:${encodeURIComponent(target.groupName || '')}`;
}
export function navigationPages(pages: StorePage[], location: 'navbar' | 'menu' | 'footer' | 'catalog') {
  return pages.filter(page => page.enabled && !page.archived && (location === 'catalog' || (location === 'footer' ? page.navbar || page.menu : page[location]))).sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, 'ar'));
}
export function notifyStorePagesChanged() {
  try { localStorage.setItem('store-pages-updated', String(Date.now())); } catch {}
  window.dispatchEvent(new Event('store-pages-updated'));
}
