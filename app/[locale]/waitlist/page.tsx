import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Zap, Gift, MessageCircle, Sparkles } from 'lucide-react';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { WaitlistForm } from '@/components/waitlist-form';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'waitlistPage' });
  return {
    title: `${t('title')} — Hesabaty Business`,
  };
}

export default async function WaitlistPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'waitlistPage' });

  const benefits = [
    { icon: Zap, title: t('benefit1Title'), body: t('benefit1Body') },
    { icon: Gift, title: t('benefit2Title'), body: t('benefit2Body') },
    {
      icon: MessageCircle,
      title: t('benefit3Title'),
      body: t('benefit3Body'),
    },
    { icon: Sparkles, title: t('benefit4Title'), body: t('benefit4Body') },
  ];

  return (
    <main className="flex min-h-screen flex-col">
      <Nav />

      <section className="flex flex-col items-center gap-5 px-6 pt-20 pb-10 md:px-20">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-accent">
          {t('eyebrow')}
        </span>
        <h1 className="text-center text-5xl font-extrabold leading-[1.05] tracking-[-0.02em] text-text md:text-7xl">
          {t('title')}
        </h1>
        <p className="max-w-xl text-center text-base leading-relaxed text-text-secondary md:text-lg">
          {t('body')}
        </p>
      </section>

      <section className="flex flex-col items-center px-6 pb-24 md:px-20">
        <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_1.1fr]">
          {/* Benefits card */}
          <div
            className="flex flex-col gap-6 rounded-3xl border border-accent/20 p-10"
            style={{
              background:
                'linear-gradient(160deg, rgba(56,189,248,0.08), rgba(2,116,223,0.02))',
            }}
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              {t('benefitsLabel')}
            </span>
            <div className="mt-2 flex flex-col gap-6">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <div key={benefit.title} className="flex items-start gap-3.5">
                    <div className="flex size-[42px] shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/[0.15]">
                      <Icon
                        className="size-[18px] text-accent"
                        strokeWidth={2}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-base font-bold text-text">
                        {benefit.title}
                      </span>
                      <span className="text-sm leading-relaxed text-text-secondary">
                        {benefit.body}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <WaitlistForm />
        </div>
      </section>

      <Footer />
    </main>
  );
}
