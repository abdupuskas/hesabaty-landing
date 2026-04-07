import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/reveal';

export function Problem() {
  const t = useTranslations('problem');

  return (
    <section className="flex flex-col items-center gap-6 border-t border-white/5 px-6 py-20 md:px-20">
      <Reveal>
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-accent">
          {t('eyebrow')}
        </span>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="max-w-3xl text-center text-4xl font-bold leading-[1.15] tracking-tight text-text md:text-5xl">
          {t('headline')}
        </h2>
      </Reveal>
      <Reveal delay={0.16}>
        <p className="max-w-2xl text-center text-base leading-relaxed text-text-secondary md:text-lg">
          {t('body')}
        </p>
      </Reveal>
    </section>
  );
}
