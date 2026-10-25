import ServicesClient from '@/app/(main)/[lang]/services/ServicesClient';
import type { StorePage } from '@/lib/store-pages';

export default function StorePageCatalog({ page, categories, lang }: { page: StorePage; categories: any[]; lang: string }) {
  const title = lang === 'en' && page.titleEn ? page.titleEn : page.title;
  const description = lang === 'en' && page.descriptionEn ? page.descriptionEn : page.description;
  return <ServicesClient key={page.id} lang={lang} dict={{}} initialServices={categories} pageContext={{ id: page.id, slug: page.slug, title, description }} />;
}
