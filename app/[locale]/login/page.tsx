import { setRequestLocale, getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';
import { AuthShell } from '@/components/auth/auth-shell';
import { OAuthButtons } from '@/components/auth/oauth-buttons';
import { OrDivider } from '@/components/auth/divider';
import { LoginForm } from '@/components/auth/login-form';

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(`/${locale}/app`);

  const t = await getTranslations('auth');
  const tCommon = await getTranslations('auth.common');

  return (
    <AuthShell
      title={t('login.title')}
      subtitle={t('login.subtitle')}
      footer={
        <span>
          {t('login.haveInvitePrompt')}{' '}
          <Link href="/invite" className="text-accent hover:underline">
            {t('login.haveInviteCta')}
          </Link>
        </span>
      }
    >
      <OAuthButtons locale={locale} />
      <OrDivider label={tCommon('or')} />
      <LoginForm locale={locale} />
    </AuthShell>
  );
}
