import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Chat } from '@/components/app/chat';

export default async function AskPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('app.ask');

  const suggestions = [
    t('suggestions.profit'),
    t('suggestions.topChannel'),
    t('suggestions.unpaid'),
    t('suggestions.improve'),
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight text-text">{t('title')}</h1>
      <p className="mt-1 text-sm text-text-secondary">{t('subtitle')}</p>
      <div className="mt-6">
        <Chat suggestions={suggestions} />
      </div>
    </div>
  );
}
