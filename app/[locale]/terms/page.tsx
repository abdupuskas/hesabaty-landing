import { setRequestLocale, getTranslations } from 'next-intl/server';
import { LegalLayout, LegalSection } from '@/components/legal-layout';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'termsPage' });
  return {
    title: `${t('title')} — Hesabaty Business`,
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'termsPage' });

  const sections = [1, 2, 3, 4, 5, 6, 7] as const;

  return (
    <LegalLayout
      eyebrow={t('eyebrow')}
      title={t('title')}
      lastUpdated={t('lastUpdated')}
      intro={t('intro')}
    >
      {sections.map((n) => (
        <LegalSection key={n} title={t(`section${n}Title`)}>
          <p className="text-base leading-relaxed text-text-secondary">
            {t(`section${n}Body`)}
          </p>
        </LegalSection>
      ))}
    </LegalLayout>
  );
}
