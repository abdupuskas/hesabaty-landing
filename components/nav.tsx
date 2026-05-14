import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Logo } from './logo';
import { LocaleSwitcher } from './locale-switcher';

export function Nav() {
  const t = useTranslations('nav');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <div className="flex items-center justify-between px-6 py-5 md:px-20">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/#features"
            className="text-sm font-medium text-text-secondary hover:text-text transition-colors"
          >
            {t('features')}
          </Link>
          <Link
            href="/#how-it-works"
            className="text-sm font-medium text-text-secondary hover:text-text transition-colors"
          >
            {t('howItWorks')}
          </Link>
          <Link
            href="/#privacy"
            className="text-sm font-medium text-text-secondary hover:text-text transition-colors"
          >
            {t('privacy')}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center rounded-[10px] border border-border bg-card px-4 py-2.5 text-sm font-semibold text-text hover:border-text-muted transition-colors"
          >
            {t('signIn')}
          </Link>
          <Link
            href="/invite"
            className="cursor-pointer rounded-[10px] bg-accent px-5 py-2.5 text-sm font-semibold text-background hover:bg-accent/90 transition-colors"
          >
            {t('getStarted')}
          </Link>
        </div>
      </div>
    </header>
  );
}
