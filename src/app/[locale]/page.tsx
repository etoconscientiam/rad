import { setRequestLocale } from 'next-intl/server';
import { ConfiguratorClient } from '@/components/configurator/ConfiguratorClient';
import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';
import { Hero } from '@/components/site/Hero';
import { HowItWorks } from '@/components/site/HowItWorks';
import { Works } from '@/components/site/Works';

/** Главная: витрина и конструктор на одной странице — как в прототипе. */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Header />
      <Hero />
      <ConfiguratorClient />
      <HowItWorks />
      <Works />
      <Footer />
    </>
  );
}
