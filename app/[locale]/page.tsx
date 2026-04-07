import { setRequestLocale } from 'next-intl/server';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { Hero } from '@/components/sections/hero';
import { Problem } from '@/components/sections/problem';
import { Comparison } from '@/components/sections/comparison';
import { Features } from '@/components/sections/features';
import { HowItWorks } from '@/components/sections/how-it-works';
import { PrivacyPromise } from '@/components/sections/privacy-promise';
import { Cta } from '@/components/sections/cta';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex min-h-screen flex-col">
      <Nav />
      <Hero />
      <Problem />
      <Comparison />
      <Features />
      <HowItWorks />
      <PrivacyPromise />
      <Cta />
      <Footer />
    </main>
  );
}
