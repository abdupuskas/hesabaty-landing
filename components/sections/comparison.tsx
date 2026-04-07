import { useTranslations, useLocale } from 'next-intl';
import { X, Check } from 'lucide-react';
import { Reveal, RevealStagger, RevealChild } from '@/components/reveal';
import { CountUp } from '@/components/count-up';

export function Comparison() {
  const t = useTranslations('comparison');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const cons = [
    t('accountantCon1'),
    t('accountantCon2'),
    t('accountantCon3'),
    t('accountantCon4'),
  ];

  const pros = [
    t('hesabatyPro1'),
    t('hesabatyPro2'),
    t('hesabatyPro3'),
    t('hesabatyPro4'),
  ];

  return (
    <section className="flex flex-col items-center gap-16 border-t border-white/5 px-6 py-28 md:px-20">
      <div className="flex max-w-3xl flex-col items-center gap-5">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-accent">
            {t('eyebrow')}
          </span>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="text-center text-4xl font-extrabold leading-[1.05] tracking-tight text-text md:text-6xl">
            {t('headline')}
          </h2>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="max-w-xl text-center text-base leading-relaxed text-text-secondary md:text-lg">
            {t('body')}
          </p>
        </Reveal>
      </div>

      <RevealStagger className="grid w-full max-w-5xl gap-6 md:grid-cols-2">
        {/* Accountant card */}
        <RevealChild>
          <div
            className="group flex h-full flex-col gap-6 rounded-3xl border border-white/[0.06] p-10 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.12]"
            style={{
              background:
                'linear-gradient(160deg, rgba(26,29,35,0.4), rgba(15,17,21,0.2))',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                {t('accountantLabel')}
              </span>
              <span className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-text-muted">
                {t('accountantBadge')}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <CountUp
                to={12000}
                prefix={isAr ? '' : 'EGP '}
                suffix={isAr ? ' ج.م' : ''}
                className="text-6xl font-extrabold tracking-tight text-text-muted leading-none"
              />
              <span className="text-lg font-medium text-text-muted">
                {t('perMonth')}
              </span>
            </div>
            <div className="h-px w-full bg-white/[0.06]" />
            <div className="flex flex-col gap-3.5">
              {cons.map((con) => (
                <div key={con} className="flex items-center gap-3">
                  <div className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-text-muted/15">
                    <X className="size-2.5 text-text-muted" strokeWidth={3} />
                  </div>
                  <span className="text-sm text-text-muted">{con}</span>
                </div>
              ))}
            </div>
          </div>
        </RevealChild>

        {/* Hesabaty card */}
        <RevealChild>
          <div
            className="group relative flex h-full flex-col gap-6 rounded-3xl border border-accent/30 p-10 transition-all duration-300 hover:-translate-y-1 hover:border-accent/50"
            style={{
              background:
                'linear-gradient(160deg, rgba(56,189,248,0.12), rgba(2,116,223,0.04))',
              boxShadow: '0 30px 60px rgba(56, 189, 248, 0.1)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                {t('hesabatyLabel')}
              </span>
              <span className="rounded-md bg-accent px-2.5 py-1 text-[11px] font-bold text-background">
                {t('hesabatyBadge')}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-5xl font-extrabold tracking-tight text-text leading-[1.05] md:text-[3.5rem]">
                {t('hesabatyValueProp')}
              </span>
              <span className="text-base font-medium text-text-secondary">
                {t('hesabatyValuePropSub')}
              </span>
            </div>
            <div className="h-px w-full bg-accent/15" />
            <div className="flex flex-col gap-3.5">
              {pros.map((pro) => (
                <div key={pro} className="flex items-center gap-3">
                  <div className="flex size-[18px] shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/20">
                    <Check className="size-2.5 text-accent" strokeWidth={3} />
                  </div>
                  <span className="text-sm font-medium text-text">{pro}</span>
                </div>
              ))}
            </div>
          </div>
        </RevealChild>
      </RevealStagger>

      <Reveal delay={0.2}>
        <p className="text-base text-text-secondary md:text-lg">
          {t.rich('savingsLine', {
            strong: (chunks) => (
              <strong className="font-bold text-text">{chunks}</strong>
            ),
          })}
        </p>
      </Reveal>
    </section>
  );
}
