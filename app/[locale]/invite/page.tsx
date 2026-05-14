import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { InviteForm } from '@/components/auth/invite-form';

export default async function InvitePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('auth.invite');

  return (
    <AuthShell
      title={t('title')}
      subtitle={t('subtitle')}
      footer={
        <span>
          {t('haveAccountPrompt')}{' '}
          <Link href="/login" className="text-accent hover:underline">
            {t('haveAccountCta')}
          </Link>
        </span>
      }
    >
      <InviteForm locale={locale} />
    </AuthShell>
  );
}
