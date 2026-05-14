import { setRequestLocale, getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';
import { getPendingInviteCookie } from '@/lib/auth/invite-cookie';
import { AuthShell } from '@/components/auth/auth-shell';
import { OAuthButtons } from '@/components/auth/oauth-buttons';
import { OrDivider } from '@/components/auth/divider';
import { SignUpForm } from '@/components/auth/signup-form';

export default async function SignupPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { locale } = await params;
  const { status } = await searchParams;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(`/${locale}/app`);

  const pendingInvite = await getPendingInviteCookie();
  if (!pendingInvite) redirect(`/${locale}/invite`);

  const t = await getTranslations('auth');
  const tCommon = await getTranslations('auth.common');

  if (status === 'check-email') {
    return (
      <AuthShell title={t('signup.title')} subtitle={t('signup.checkEmail')}>
        <p className="text-sm text-text-secondary">{t('signup.checkEmail')}</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={t('signup.title')}
      subtitle={t('signup.subtitle')}
      footer={
        <span>
          {t('signup.haveAccountPrompt')}{' '}
          <Link href="/login" className="text-accent hover:underline">
            {t('signup.haveAccountCta')}
          </Link>
        </span>
      }
    >
      <OAuthButtons locale={locale} />
      <OrDivider label={tCommon('or')} />
      <SignUpForm locale={locale} />
    </AuthShell>
  );
}
