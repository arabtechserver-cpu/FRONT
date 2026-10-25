import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { loadStorePages } from '@/lib/store-pages-server';
import StorePageCatalog from '@/components/StorePageCatalog';

type Props = { params: Promise<{ lang: string; slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const data = await loadStorePages('/' + encodeURIComponent(slug));
  if (!data?.page) return { title: 'الصفحة غير متاحة', robots: { index: false } };
  const title = lang === 'en' && data.page.titleEn ? data.page.titleEn : data.page.title;
  return { title, description: lang === 'en' && data.page.descriptionEn ? data.page.descriptionEn : data.page.description, alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://borai.store'}/${lang}/pages/${slug}` } };
}
export default async function CustomStorePage({ params }: Props) {
  const { lang, slug } = await params;
  const data = await loadStorePages('/' + encodeURIComponent(slug));
  if (!data?.page || !Array.isArray(data.categories)) notFound();
  return <StorePageCatalog key={data.page.id} page={data.page} categories={data.categories} lang={lang} />;
}
