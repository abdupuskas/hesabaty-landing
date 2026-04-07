import { useTranslations } from 'next-intl';
import { ChevronUp, FileText, Lock } from 'lucide-react';
import { Reveal, RevealStagger, RevealChild } from '@/components/reveal';
import { CountUp } from '@/components/count-up';
import { LiveBadge } from '@/components/live-badge';

export function Features() {
  const t = useTranslations('features');

  return (
    <section
      id="features"
      className="flex flex-col items-center gap-16 border-t border-white/5 px-6 py-28 md:px-20"
    >
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
      </div>

      <div className="flex w-full max-w-6xl flex-col gap-5">
        {/* Top row */}
        <RevealStagger className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <RevealChild className="h-full">
            <BigLiveProfit />
          </RevealChild>
          <div className="flex flex-col gap-5">
            <RevealChild className="h-full">
              <MultiChannel />
            </RevealChild>
            <RevealChild className="h-full">
              <AiAssistant />
            </RevealChild>
          </div>
        </RevealStagger>

        {/* Bottom row */}
        <RevealStagger className="grid gap-5 lg:grid-cols-3">
          <RevealChild className="h-full">
            <PdfReports />
          </RevealChild>
          <RevealChild className="h-full">
            <Bilingual />
          </RevealChild>
          <RevealChild className="h-full">
            <PrivacyCard />
          </RevealChild>
        </RevealStagger>
      </div>
    </section>
  );
}

function BigLiveProfit() {
  const t = useTranslations('features');
  return (
    <div
      className="group flex min-h-[420px] flex-col justify-between overflow-hidden rounded-[28px] border border-accent/[0.18] p-12 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_30px_80px_rgba(56,189,248,0.15)]"
      style={{
        background:
          'linear-gradient(160deg, rgba(56,189,248,0.12), rgba(2,116,223,0.02))',
      }}
    >
      <div className="flex flex-col gap-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">
          {t('liveProfitLabel')}
        </span>
        <h3 className="text-3xl font-bold leading-[1.15] tracking-tight text-text md:text-4xl">
          {t('liveProfitTitle')}
        </h3>
        <p className="max-w-md text-sm leading-relaxed text-text-secondary">
          {t('liveProfitBody')}
        </p>
      </div>
      <div
        className="flex w-fit flex-col gap-3.5 rounded-[18px] border border-accent/20 bg-background/60 p-6 backdrop-blur-xl"
      >
        <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          {t('thisMonthProfit')}
        </span>
        <CountUp
          to={47250}
          prefix="EGP "
          className="text-4xl font-extrabold tracking-tight text-text leading-none"
        />
        <div className="flex items-center gap-2.5">
          <LiveBadge className="flex items-center gap-1 rounded-lg bg-success/15 px-2.5 py-1">
            <ChevronUp className="size-2.5 text-success" strokeWidth={3} />
            <span className="text-xs font-bold text-success">23%</span>
          </LiveBadge>
          <span className="text-xs text-text-muted">{t('vsLastMonth')}</span>
        </div>
      </div>
    </div>
  );
}

function MultiChannel() {
  const t = useTranslations('features');
  const channels = [
    t('channelInstagram'),
    t('channelWhatsapp'),
    t('channelShopify'),
    t('channelPopups'),
  ];

  return (
    <div
      className="group flex min-h-[200px] flex-col justify-between rounded-[28px] border border-white/[0.06] p-9 transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_24px_60px_rgba(56,189,248,0.08)]"
      style={{
        background:
          'linear-gradient(160deg, rgba(26,29,35,0.6), rgba(15,17,21,0.2))',
      }}
    >
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">
          {t('multiChannelLabel')}
        </span>
        <h3 className="text-2xl font-bold leading-tight tracking-tight text-text">
          {t('multiChannelTitle')}
        </h3>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {channels.map((label) => (
          <div
            key={label}
            className="rounded-full border border-white/[0.08] bg-background/60 px-3.5 py-2"
          >
            <span className="text-xs font-medium text-text">{label}</span>
          </div>
        ))}
        <div className="rounded-full border border-white/[0.08] bg-background/60 px-3.5 py-2">
          <span className="text-xs font-medium text-text-secondary">
            {t('channelCustom')}
          </span>
        </div>
      </div>
    </div>
  );
}

function AiAssistant() {
  const t = useTranslations('features');
  return (
    <div
      className="group flex min-h-[200px] flex-col justify-between rounded-[28px] border border-white/[0.06] p-9 transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_24px_60px_rgba(56,189,248,0.08)]"
      style={{
        background:
          'linear-gradient(160deg, rgba(26,29,35,0.6), rgba(15,17,21,0.2))',
      }}
    >
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">
          {t('aiLabel')}
        </span>
        <h3 className="text-2xl font-bold leading-tight tracking-tight text-text">
          {t('aiTitle')}
        </h3>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <div className="self-end max-w-[80%] rounded-[14px] rounded-br-[4px] bg-accent px-4 py-2.5">
          <span className="text-xs font-medium text-background">
            {t('aiQuestion')}
          </span>
        </div>
        <div className="self-start max-w-[80%] rounded-[14px] rounded-bl-[4px] border border-white/[0.08] bg-background/60 px-4 py-2.5">
          <span className="text-xs text-text">{t('aiAnswer')}</span>
        </div>
      </div>
    </div>
  );
}

function PdfReports() {
  const t = useTranslations('features');
  return (
    <div
      className="group flex min-h-[240px] flex-col justify-between rounded-[28px] border border-white/[0.06] p-9 transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_24px_60px_rgba(56,189,248,0.08)]"
      style={{
        background:
          'linear-gradient(160deg, rgba(26,29,35,0.6), rgba(15,17,21,0.2))',
      }}
    >
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">
          {t('pdfLabel')}
        </span>
        <h3 className="text-xl font-bold leading-tight tracking-tight text-text md:text-2xl">
          {t('pdfTitle')}
        </h3>
      </div>
      <div className="mt-4 flex w-fit items-center gap-2.5 rounded-xl border border-white/[0.08] bg-background/60 px-4 py-3.5">
        <FileText className="size-[22px] text-accent" strokeWidth={2} />
        <div className="flex flex-col">
          <span className="text-[11px] text-text-secondary">
            {t('pdfFileLabel')}
          </span>
          <span className="text-[13px] font-semibold text-text">
            {t('pdfFileName')}
          </span>
        </div>
      </div>
    </div>
  );
}

function Bilingual() {
  const t = useTranslations('features');
  return (
    <div
      className="group flex min-h-[240px] flex-col justify-between rounded-[28px] border border-white/[0.06] p-9 transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_24px_60px_rgba(56,189,248,0.08)]"
      style={{
        background:
          'linear-gradient(160deg, rgba(26,29,35,0.6), rgba(15,17,21,0.2))',
      }}
    >
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">
          {t('bilingualLabel')}
        </span>
        <h3 className="text-xl font-bold leading-tight tracking-tight text-text md:text-2xl">
          {t('bilingualTitle')}
        </h3>
      </div>
      <div className="mt-4 flex gap-2.5">
        <div className="flex flex-1 flex-col gap-1 rounded-xl border border-white/[0.08] bg-background/60 px-4 py-3.5">
          <span className="text-[10px] uppercase tracking-wider text-text-secondary">
            {t('bilingualProfit')}
          </span>
          <span className="text-sm font-bold text-text">EGP 47,250</span>
        </div>
        <div
          className="flex flex-1 flex-col gap-1 rounded-xl border border-white/[0.08] bg-background/60 px-4 py-3.5"
          dir="rtl"
          style={{ fontFamily: 'var(--font-arabic)' }}
        >
          <span className="text-[10px] text-text-secondary">الربح</span>
          <span className="text-sm font-bold text-text">٤٧٬٢٥٠ ج.م</span>
        </div>
      </div>
    </div>
  );
}

function PrivacyCard() {
  const t = useTranslations('features');
  return (
    <div
      className="group flex min-h-[240px] flex-col justify-between rounded-[28px] border border-white/[0.06] p-9 transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_24px_60px_rgba(56,189,248,0.08)]"
      style={{
        background:
          'linear-gradient(160deg, rgba(26,29,35,0.6), rgba(15,17,21,0.2))',
      }}
    >
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">
          {t('privacyLabel')}
        </span>
        <h3 className="text-xl font-bold leading-tight tracking-tight text-text md:text-2xl">
          {t('privacyTitle')}
        </h3>
      </div>
      <div
        className="mt-4 flex size-16 items-center justify-center rounded-[18px] border border-accent/30"
        style={{
          background:
            'linear-gradient(160deg, rgba(56,189,248,0.2), rgba(56,189,248,0.04))',
        }}
      >
        <Lock className="size-7 text-accent" strokeWidth={2} />
      </div>
    </div>
  );
}
