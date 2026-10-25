import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'BORAI STORE | برعي ستور',
    short_name: 'برعي ستور',
    description: 'متجر برعي لشحن الألعاب والبطاقات والخدمات الرقمية ومتابعة الطلبات.',
    lang: 'ar',
    dir: 'rtl',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0f172a',
    prefer_related_applications: false,
    categories: ['shopping', 'utilities'],
    icons: [
      { src: '/borai-favicon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/borai-favicon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
    shortcuts: [
      { name: 'المتجر', url: '/ar/services' },
      { name: 'طلباتي', url: '/ar/orders' },
      { name: 'المحفظة', url: '/ar/wallet' },
    ],
  };
}
