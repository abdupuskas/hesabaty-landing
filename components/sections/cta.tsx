import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Reveal } from '@/components/reveal';
import { LiveBadge } from '@/components/live-badge';

export function Cta() {
  const t = useTranslations('cta');

  return (
    <section
      className="flex flex-col items-center gap-10 border-t border-white/5 px-6 py-32 md:px-20"
      style={{
        background:
          'radial-gradient(circle at center, rgba(56,189,248,0.08), transparent 60%)',
      }}
    >
      <Reveal>
        <div className="flex items-center gap-2 rounded-full border border-accent/25 bg-accent/[0.1] px-4 py-2">
          <LiveBadge>
            <span className="block size-1.5 rounded-full bg-accent" />
          </LiveBadge>
          <span className="text-xs font-semibold tracking-wide text-accent">
            {t('badge')}
          </span>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <h2 className="max-w-4xl text-center text-5xl font-extrabold leading-[1.05] tracking-[-0.025em] text-text md:text-7xl">
          {t('headline')}
        </h2>
      </Reveal>

      <Reveal delay={0.16}>
        <p className="max-w-xl text-center text-base leading-relaxed text-text-secondary md:text-lg">
          {t('body')}
        </p>
      </Reveal>

      <Reveal delay={0.24}>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="/waitlist"
            className="cursor-pointer rounded-2xl bg-accent px-8 py-4.5 text-base font-bold text-background hover:bg-accent/90 transition-colors"
          >
            {t('joinWaitlist')}
          </Link>
          <Link
            href="/contact"
            className="cursor-pointer rounded-2xl border border-white/10 bg-white/[0.04] px-8 py-4.5 text-base font-semibold text-text backdrop-blur-md hover:bg-white/[0.08] transition-colors"
          >
            {t('requestInvite')}
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
