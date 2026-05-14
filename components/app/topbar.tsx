import { useTranslations } from 'next-intl';
import { signOutAction } from '@/lib/auth/actions';
import { LogOut } from 'lucide-react';

export function Topbar({ email, locale }: { email: string; locale: string }) {
  const t = useTranslations('app.topbar');

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card/40 px-4 md:px-6">
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <span className="hidden sm:inline">{t('signedInAs')}</span>
        <span className="text-text">{email}</span>
      </div>
      <form action={signOutAction}>
        <input type="hidden" name="locale" value={locale} />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm text-text-secondary hover:text-text hover:border-text-muted transition-colors"
        >
          <LogOut size={14} strokeWidth={1.75} />
          {t('signOut')}
        </button>
      </form>
    </header>
  );
}
