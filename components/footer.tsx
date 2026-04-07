import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Logo } from './logo';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="w-full border-t border-white/5 bg-background/60">
      <div className="flex flex-col gap-10 px-6 pt-16 pb-12 md:flex-row md:items-start md:justify-between md:gap-20 md:px-20">
        <div className="flex max-w-sm flex-col gap-4">
          <Logo />
          <p className="text-sm text-text-muted leading-relaxed">
            {t('tagline')}
          </p>
        </div>

        <div className="flex flex-col gap-3.5">
          <span className="text-xs font-bold uppercase tracking-wider text-text">
            {t('product')}
          </span>
          <Link
            href="/#features"
            className="text-sm text-text-secondary hover:text-text transition-colors"
          >
            {t('features')}
          </Link>
          <Link
            href="/#how-it-works"
            className="text-sm text-text-secondary hover:text-text transition-colors"
          >
            {t('howItWorks')}
          </Link>
          <Link
            href="/#pricing"
            className="text-sm text-text-secondary hover:text-text transition-colors"
          >
            {t('pricing')}
          </Link>
        </div>

        <div className="flex flex-col gap-3.5">
          <span className="text-xs font-bold uppercase tracking-wider text-text">
            {t('legal')}
          </span>
          <Link
            href="/privacy"
            className="text-sm text-text-secondary hover:text-text transition-colors"
          >
            {t('privacyPolicy')}
          </Link>
          <Link
            href="/terms"
            className="text-sm text-text-secondary hover:text-text transition-colors"
          >
            {t('termsOfUse')}
          </Link>
        </div>

        <div className="flex flex-col gap-3.5">
          <span className="text-xs font-bold uppercase tracking-wider text-text">
            {t('contact')}
          </span>
          <Link
            href="/contact"
            className="text-sm text-text-secondary hover:text-text transition-colors"
          >
            {t('contactUs')}
          </Link>
          <a
            href={`mailto:${t('supportEmail')}`}
            className="text-sm text-text-secondary hover:text-text transition-colors"
          >
            {t('supportEmail')}
          </a>
          <span className="text-sm text-text-secondary">{t('location')}</span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-2 border-t border-white/5 px-6 py-6 md:flex-row md:px-20">
        <span className="text-xs text-text-muted">{t('copyright')}</span>
        <span className="text-xs text-text-muted">{t('madeWith')}</span>
      </div>
    </footer>
  );
}
