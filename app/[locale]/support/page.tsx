import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Mail, Clock, ChevronDown } from 'lucide-react';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'supportPage' });
  return {
    title: `${t('title')} — Hesabaty Business`,
    description: t('intro'),
  };
}

const FAQ_KEYS = [1, 2, 3, 4, 5, 6] as const;

export default async function SupportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'supportPage' });
  const email = t('contactEmail');

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
          {t('intro')}
        </p>
      </section>

      <section className="flex flex-col items-center px-6 pb-12 md:px-20">
        <div className="w-full max-w-3xl">
          <div
            className="flex flex-col gap-5 rounded-3xl border border-accent/20 p-8 md:flex-row md:items-center md:justify-between md:gap-8 md:p-10"
            style={{
              background:
                'linear-gradient(160deg, rgba(56,189,248,0.08), rgba(2,116,223,0.02))',
            }}
          >
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                {t('contactCardTitle')}
              </span>
              <p className="text-base leading-relaxed text-text-secondary">
                {t('contactCardBody')}
              </p>
              <div className="mt-2 inline-flex items-center gap-2 text-xs text-text-muted">
                <Clock className="size-3.5 text-accent" strokeWidth={2} />
                <span className="font-medium text-text-secondary">
                  {t('hoursLabel')}:
                </span>
                <span>{t('hoursValue')}</span>
              </div>
            </div>
            <a
              href={`mailto:${email}`}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-background hover:bg-accent/90 transition-colors"
            >
              <Mail className="size-4" strokeWidth={2.25} />
              {t('contactCardButton')}
            </a>
          </div>
        </div>
      </section>

      <section className="flex flex-col items-center px-6 pb-24 md:px-20">
        <div className="flex w-full max-w-3xl flex-col gap-6">
          <h2 className="text-2xl font-bold tracking-tight text-text md:text-3xl">
            {t('faqTitle')}
          </h2>
          <ul className="flex flex-col gap-3">
            {FAQ_KEYS.map((n) => (
              <li
                key={n}
                className="rounded-2xl border border-border bg-card transition-colors hover:border-text-muted"
              >
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-base font-semibold text-text">
                    <span>{t(`faq${n}Question`)}</span>
                    <ChevronDown
                      className="size-4 shrink-0 text-text-muted transition-transform group-open:rotate-180"
                      strokeWidth={2}
                    />
                  </summary>
                  <div className="border-t border-border px-5 py-4 text-sm leading-relaxed text-text-secondary">
                    {t(`faq${n}Answer`)}
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Footer />
    </main>
  );
}
