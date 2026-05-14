import { setRequestLocale, getTranslations } from 'next-intl/server';
import { OnboardingForm } from '@/components/onboarding/onboarding-form';

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('onboarding');

  return (
    <>
      <header className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-text">{t('title')}</h1>
        <p className="mt-2 text-sm text-text-secondary">{t('subtitle')}</p>
      </header>
      <div className="mt-10">
        <OnboardingForm locale={locale} />
      </div>
    </>
  );
}
