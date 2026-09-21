import { setRequestLocale } from 'next-intl/server';
import { DsShowcase } from './DsShowcase';

/** Витрина компонентов для визуальной сверки с прототипом. В продакшен не идёт. */
export default async function DsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DsShowcase />;
}
