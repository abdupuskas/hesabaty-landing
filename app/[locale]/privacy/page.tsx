import { setRequestLocale, getTranslations } from 'next-intl/server';
import { LegalLayout, LegalSection } from '@/components/legal-layout';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacyPage' });
  return {
    title: `${t('title')} — Hesabaty Business`,
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'privacyPage' });

  const strong = (chunks: React.ReactNode) => (
    <strong className="font-semibold text-text">{chunks}</strong>
  );

  const introNode = t.rich('intro', { strong });

  return (
    <LegalLayout
      eyebrow={t('eyebrow')}
      title={t('title')}
      lastUpdated={t('lastUpdated')}
      intro={introNode}
    >
      <LegalSection title={t('section1Title')}>
        <p className="text-base leading-relaxed text-text-secondary">
          {t('section1Body')}
        </p>
        <ul className="flex flex-col gap-2 ps-5">
          {([1, 2, 3, 4] as const).map((n) => (
            <li
              key={n}
              className="text-base leading-relaxed text-text-secondary"
            >
              • {t.rich(`section1Bullet${n}`, { strong })}
            </li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title={t('section2Title')}>
        <p className="text-base leading-relaxed text-text-secondary">
          {t('section2Body')}
        </p>
      </LegalSection>

      <LegalSection title={t('section3Title')}>
        <p className="text-base leading-relaxed text-text-secondary">
          {t('section3Body')}
        </p>
      </LegalSection>

      <LegalSection title={t('section4Title')}>
        <p className="text-base leading-relaxed text-text-secondary">
          {t('section4Body')}
        </p>
      </LegalSection>

      <LegalSection title={t('section5Title')}>
        <p className="text-base leading-relaxed text-text-secondary">
          {t.rich('section5Body', {
            link: (chunks) => (
              <a
                href="mailto:privacy@hesabaty.com"
                className="font-semibold text-accent hover:underline"
              >
                {chunks}
              </a>
            ),
          })}
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
