import { useTranslations } from 'next-intl';
import { Reveal, RevealStagger, RevealChild } from '@/components/reveal';

export function HowItWorks() {
  const t = useTranslations('howItWorks');

  return (
    <section
      id="how-it-works"
      className="flex flex-col items-center gap-20 border-t border-white/5 px-6 py-28 md:px-20"
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
        <Reveal delay={0.16}>
          <p className="max-w-xl text-center text-base leading-relaxed text-text-secondary md:text-lg">
            {t('body')}
          </p>
        </Reveal>
      </div>

      <RevealStagger className="grid w-full max-w-6xl gap-8 lg:grid-cols-3">
        <RevealChild>
          <Step number="01" eyebrowKey="step1Eyebrow" bodyKey="step1Body">
            <Step1Mockup />
          </Step>
        </RevealChild>
        <RevealChild>
          <Step number="02" eyebrowKey="step2Eyebrow" bodyKey="step2Body">
            <Step2Mockup />
          </Step>
        </RevealChild>
        <RevealChild>
          <Step number="03" eyebrowKey="step3Eyebrow" bodyKey="step3Body">
            <Step3Mockup />
          </Step>
        </RevealChild>
      </RevealStagger>
    </section>
  );
}

function Step({
  number,
  eyebrowKey,
  bodyKey,
  children,
}: {
  number: string;
  eyebrowKey: string;
  bodyKey: string;
  children: React.ReactNode;
}) {
  const t = useTranslations('howItWorks');
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex items-center gap-3.5">
        <div className="flex size-[38px] items-center justify-center rounded-xl border border-accent/30 bg-accent/[0.12]">
          <span className="text-sm font-extrabold text-accent">{number}</span>
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          {t(eyebrowKey)}
        </span>
      </div>
      {children}
      <p className="max-w-[280px] text-center text-sm leading-relaxed text-text-secondary">
        {t(bodyKey)}
      </p>
    </div>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="group flex h-[340px] w-[280px] flex-col gap-3.5 rounded-[32px] border-2 border-white/[0.08] p-5 transition-all duration-300 hover:-translate-y-2 hover:border-accent/30"
      style={{
        background: 'linear-gradient(160deg, #1A1D23, #0F1115)',
        boxShadow: '0 30px 60px rgba(0, 0, 0, 0.5)',
      }}
    >
      {children}
    </div>
  );
}

function Step1Mockup() {
  const t = useTranslations('howItWorks');
  return (
    <PhoneFrame>
      <div className="flex items-center justify-between px-1">
        <span className="text-[13px] font-bold text-text">
          {t('step1ScreenTitle')}
        </span>
        <span className="text-[11px] font-semibold text-accent">
          {t('step1Save')}
        </span>
      </div>
      <div className="flex flex-col gap-1 rounded-[14px] border border-accent/20 bg-accent/[0.08] p-3.5">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-text-muted">
          {t('step1Amount')}
        </span>
        <span className="text-[26px] font-extrabold tracking-tight text-text leading-none">
          EGP 1,250
        </span>
      </div>
      <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-background/60 p-3">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-text-muted">
          {t('step1Channel')}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[14px]">📸</span>
          <span className="text-[12px] font-semibold text-text">Instagram</span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-background/60 p-3">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-text-muted">
          {t('step1Status')}
        </span>
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-success" />
          <span className="text-[12px] font-semibold text-text">
            {t('step1Paid')}
          </span>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-center rounded-xl bg-accent p-3.5">
        <span className="text-[13px] font-bold text-background">
          {t('step1SaveBtn')}
        </span>
      </div>
    </PhoneFrame>
  );
}

function Step2Mockup() {
  const t = useTranslations('howItWorks');
  const items = [
    { icon: '📸', label: t('step2InstagramOrder'), time: '14:32', amount: '+1,250', color: 'success' },
    { icon: '💬', label: t('step2WhatsappSale'), time: '11:18', amount: '+850', color: 'success' },
    { icon: '📦', label: t('step2ShippingFees'), time: '10:42', amount: '−180', color: 'danger' },
    { icon: '🛍️', label: t('step2ShopifyOrder'), time: '09:15', amount: '+2,100', color: 'success' },
  ] as const;

  return (
    <PhoneFrame>
      <span className="px-1 text-[13px] font-bold text-text">
        {t('step2ScreenTitle')}
      </span>
      <div className="flex flex-col overflow-hidden rounded-[14px] border border-border bg-background/60">
        {items.map((item, i) => (
          <div
            key={item.label}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 ${i < items.length - 1 ? 'border-b border-border' : ''}`}
          >
            <div className="flex size-7 items-center justify-center rounded-lg bg-accent-dark">
              <span className="text-[11px]">{item.icon}</span>
            </div>
            <div className="flex flex-1 flex-col">
              <span className="text-[11px] font-semibold text-text">
                {item.label}
              </span>
              <span className="text-[9px] text-text-muted">{item.time}</span>
            </div>
            <span
              className={`text-[12px] font-bold ${item.color === 'success' ? 'text-success' : 'text-danger'}`}
            >
              {item.amount}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-between rounded-xl border border-accent/20 bg-accent/[0.08] px-3.5 py-3">
        <span className="text-[11px] font-semibold text-text-secondary">
          {t('step2NetLabel')}
        </span>
        <span className="text-[14px] font-extrabold text-success">
          +EGP 4,020
        </span>
      </div>
    </PhoneFrame>
  );
}

function Step3Mockup() {
  const t = useTranslations('howItWorks');
  const cats = [
    { label: t('step3Inventory'), pct: 75, opacity: 1 },
    { label: t('step3Marketing'), pct: 45, opacity: 0.7 },
    { label: t('step3Shipping'), pct: 25, opacity: 0.5 },
  ];

  return (
    <PhoneFrame>
      <span className="px-1 text-[13px] font-bold text-text">
        {t('step3ScreenTitle')}
      </span>
      <div
        className="flex flex-col gap-1.5 rounded-2xl border border-accent/30 p-4"
        style={{
          background:
            'linear-gradient(160deg, rgba(56,189,248,0.15), rgba(56,189,248,0.03))',
        }}
      >
        <span className="text-[9px] font-semibold uppercase tracking-wider text-text-secondary">
          {t('step3ProfitLabel')}
        </span>
        <span className="text-[30px] font-extrabold tracking-tight text-text leading-none">
          EGP 47,250
        </span>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-success">↑ 23%</span>
          <span className="text-[10px] text-text-muted">{t('step3VsMarch')}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-background/60 p-3.5">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-text-muted">
          {t('step3TopCategories')}
        </span>
        <div className="flex flex-col gap-2">
          {cats.map((c) => (
            <div key={c.label} className="flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${c.pct}%`, opacity: c.opacity }}
                />
              </div>
              <span className="text-[10px] font-semibold text-text">
                {c.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}
