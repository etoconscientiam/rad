import { setRequestLocale } from 'next-intl/server';
import { ConfiguratorClient } from '@/components/configurator/ConfiguratorClient';

export default async function ConfiguratorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ConfiguratorClient />;
}
