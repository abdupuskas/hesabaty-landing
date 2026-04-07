import { useTranslations } from 'next-intl';
import { Lock, X, Check } from 'lucide-react';
import { Reveal } from '@/components/reveal';

export function PrivacyPromise() {
  const t = useTranslations('privacy');

  const neverDo = [
    { title: t('neverDo1Title'), body: t('neverDo1Body') },
    { title: t('neverDo2Title'), body: t('neverDo2Body') },
    { title: t('neverDo3Title'), body: t('neverDo3Body') },
  ];

  const doList = [
    { title: t('do1Title'), body: t('do1Body') },
    { title: t('do2Title'), body: t('do2Body') },
    { title: t('do3Title'), body: t('do3Body') },
  ];

  return (
    <section
      id="privacy"
      className="relative flex flex-col items-center gap-16 border-t border-white/5 px-6 py-28 md:px-20"
    >
      <div className="flex max-w-4xl flex-col items-center gap-6">
        <Reveal>
          <div className="flex items-center gap-2 rounded-full border border-accent/20 bg-accent/[0.08] px-4 py-2">
            <Lock className="size-3.5 text-accent" strokeWidth={2.5} />
            <span className="text-xs font-semibold tracking-wide text-accent">
              {t('badge')}
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="text-center text-4xl font-extrabold leading-[1.05] tracking-tight text-text md:text-6xl">
            {t('headline')}
          </h2>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="max-w-2xl text-center text-base leading-relaxed text-text-secondary md:text-lg">
            {t('body')}
          </p>
        </Reveal>
      </div>

      <Reveal delay={0.1} className="w-full max-w-5xl">
      <div className="grid overflow-hidden rounded-3xl border border-white/[0.08] bg-background/40 lg:grid-cols-2">
        {/* What we never do */}
        <div
          className="flex flex-col gap-6 border-b border-white/[0.06] p-12 lg:border-b-0 lg:border-e lg:border-white/[0.06]"
          style={{
            background:
              'linear-gradient(160deg, rgba(239,68,68,0.04), rgba(15,17,21,0))',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-[10px] border border-danger/25 bg-danger/[0.12]">
              <X className="size-3.5 text-danger" strokeWidth={3} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-danger">
              {t('neverDoLabel')}
            </span>
          </div>
          <div className="flex flex-col gap-4">
            {neverDo.map((item, i) => (
              <div key={item.title}>
                <div className="flex flex-col gap-1">
                  <span className="text-lg font-bold tracking-tight text-text">
                    {item.title}
                  </span>
                  <span className="text-sm leading-relaxed text-text-muted">
                    {item.body}
                  </span>
                </div>
                {i < neverDo.length - 1 && (
                  <div className="mt-4 h-px w-full bg-white/[0.05]" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* What we do */}
        <div
          className="flex flex-col gap-6 p-12"
          style={{
            background:
              'linear-gradient(160deg, rgba(56,189,248,0.06), rgba(15,17,21,0))',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-[10px] border border-accent/30 bg-accent/[0.12]">
              <Check className="size-3.5 text-accent" strokeWidth={3} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              {t('doLabel')}
            </span>
          </div>
          <div className="flex flex-col gap-4">
            {doList.map((item, i) => (
              <div key={item.title}>
                <div className="flex flex-col gap-1">
                  <span className="text-lg font-bold tracking-tight text-text">
                    {item.title}
                  </span>
                  <span className="text-sm leading-relaxed text-text-secondary">
                    {item.body}
                  </span>
                </div>
                {i < doList.length - 1 && (
                  <div className="mt-4 h-px w-full bg-white/[0.05]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      </Reveal>
    </section>
  );
}
