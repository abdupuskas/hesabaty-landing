import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import {
  LogOut,
  Building2,
  Tag,
  Layers,
  Bell,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentBusiness } from '@/lib/business';
import { signOutAction } from '@/lib/auth/actions';
import { PasswordChangeForm } from '@/components/app/password-change-form';
import { DeleteAccountForm } from '@/components/app/delete-account-form';

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('app.settings');

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const business = await getCurrentBusiness();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight text-text">{t('title')}</h1>
      <p className="mt-1 text-sm text-text-secondary">{t('subtitle')}</p>

      <section className="mt-8 rounded-xl border border-border bg-card">
        <header className="border-b border-border px-5 py-3">
          <h2 className="text-sm font-medium text-text">{t('account')}</h2>
        </header>
        <div className="px-5 py-4">
          <Row label={t('email')} value={user?.email ?? '—'} />
        </div>
      </section>

      {business ? (
        <section className="mt-6 rounded-xl border border-border bg-card">
          <header className="border-b border-border px-5 py-3">
            <h2 className="text-sm font-medium text-text">{t('manage')}</h2>
          </header>
          <ul className="divide-y divide-border/60">
            <NavRow
              href="/app/settings/business"
              icon={<Building2 size={14} strokeWidth={1.75} />}
              label={t('business.title')}
              hint={business.name}
            />
            <NavRow
              href="/app/settings/channels"
              icon={<Layers size={14} strokeWidth={1.75} />}
              label={t('channels.title')}
              hint={t('channels.hint')}
            />
            <NavRow
              href="/app/settings/categories"
              icon={<Tag size={14} strokeWidth={1.75} />}
              label={t('categories.title')}
              hint={t('categories.hint')}
            />
            <NavRow
              href="/app/settings/notifications"
              icon={<Bell size={14} strokeWidth={1.75} />}
              label={t('notifications.title')}
              hint={t('notifications.hint')}
            />
          </ul>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl border border-border bg-card">
        <header className="border-b border-border px-5 py-3">
          <h2 className="text-sm font-medium text-text">{t('language')}</h2>
        </header>
        <div className="flex gap-2 px-5 py-4">
          <LangChip href="/app/settings" labelLocale="en" active={locale === 'en'}>
            {t('languageEn')}
          </LangChip>
          <LangChip href="/app/settings" labelLocale="ar" active={locale === 'ar'}>
            {t('languageAr')}
          </LangChip>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-card">
        <header className="border-b border-border px-5 py-3">
          <h2 className="text-sm font-medium text-text">{t('password.title')}</h2>
          <p className="mt-1 text-xs text-text-muted">{t('password.subtitle')}</p>
        </header>
        <div className="px-5 py-4">
          <PasswordChangeForm />
        </div>
      </section>

      <form action={signOutAction} className="mt-6 flex justify-end">
        <input type="hidden" name="locale" value={locale} />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm text-text-secondary hover:text-text hover:border-text-muted transition-colors"
        >
          <LogOut size={14} strokeWidth={1.75} />
          {t('signOut')}
        </button>
      </form>

      <section className="mt-10 rounded-xl border border-danger/30 bg-danger/5">
        <header className="border-b border-danger/30 px-5 py-3">
          <h2 className="text-sm font-medium text-danger">{t('dangerZone.title')}</h2>
          <p className="mt-1 text-xs text-text-secondary">{t('dangerZone.body')}</p>
        </header>
        <div className="px-5 py-4">
          <DeleteAccountForm locale={locale} />
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <span className="text-xs uppercase tracking-wider text-text-muted">{label}</span>
      <span className="text-sm text-text">{value}</span>
    </div>
  );
}

function NavRow({
  href,
  icon,
  label,
  hint,
}: {
  href: '/app/settings/business' | '/app/settings/channels' | '/app/settings/categories' | '/app/settings/notifications';
  icon: React.ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-3 px-5 py-3 text-sm text-text hover:bg-background/40 transition-colors"
      >
        <span className="grid size-7 place-items-center rounded-md bg-background text-text-secondary">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm text-text">{label}</div>
          <div className="truncate text-xs text-text-muted">{hint}</div>
        </div>
        <ChevronRight size={14} strokeWidth={1.75} className="text-text-muted rtl:hidden" />
        <ChevronLeft size={14} strokeWidth={1.75} className="hidden text-text-muted rtl:inline" />
      </Link>
    </li>
  );
}

function LangChip({
  href,
  labelLocale,
  active,
  children,
}: {
  href: '/app/settings';
  labelLocale: 'en' | 'ar';
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      locale={labelLocale}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? 'border-accent/40 bg-accent/10 text-accent'
          : 'border-border bg-card text-text-secondary hover:text-text hover:border-text-muted'
      }`}
    >
      {children}
    </Link>
  );
}
