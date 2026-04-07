'use client';

import { useTranslations } from 'next-intl';
import { TrendingUp } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { CountUp } from '@/components/count-up';
import { LiveBadge } from '@/components/live-badge';

export function Hero() {
  const t = useTranslations('hero');
  const reduce = useReducedMotion();

  const fadeUp = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0 },
  };

  const transition = (delay: number) => ({
    duration: 0.6,
    delay,
    ease: [0.21, 0.47, 0.32, 0.98] as const,
  });

  return (
    <section className="relative flex flex-col items-center gap-16 px-6 pt-16 pb-24 md:flex-row md:items-center md:justify-between md:gap-20 md:px-20 md:pt-24 md:pb-32">
      <div className="flex max-w-2xl flex-col gap-8">
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={transition(0)}
          className="flex w-fit items-center gap-2 rounded-full border border-accent/20 bg-accent/[0.08] px-4 py-2"
        >
          <LiveBadge>
            <span className="block size-1.5 rounded-full bg-accent" />
          </LiveBadge>
          <span className="text-xs font-medium tracking-wide text-accent">
            {t('badge')}
          </span>
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={transition(0.08)}
          className="text-5xl font-extrabold leading-[1.05] tracking-[-0.02em] text-text md:text-7xl"
        >
          {t('headline')}
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={transition(0.16)}
          className="max-w-lg text-lg leading-relaxed text-text-secondary"
        >
          {t('subheadline')}
        </motion.p>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={transition(0.24)}
          className="flex flex-wrap items-center gap-3"
        >
          <button
            type="button"
            className="cursor-pointer rounded-xl bg-accent px-7 py-4 text-sm font-semibold text-background hover:bg-accent/90 transition-colors"
          >
            {t('downloadIos')}
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-xl border border-white/10 bg-white/[0.04] px-7 py-4 text-sm font-semibold text-text backdrop-blur-md hover:bg-white/[0.08] transition-colors"
          >
            {t('watchDemo')}
          </button>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={transition(0.32)}
          className="flex items-center gap-6 pt-2"
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <div className="size-6 rounded-full bg-accent border-2 border-background" />
              <div className="size-6 rounded-full bg-sky-500 border-2 border-background -ms-2" />
              <div className="size-6 rounded-full bg-sky-700 border-2 border-background -ms-2" />
            </div>
            <span className="text-xs text-text-muted">{t('earlyUsers')}</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-xs text-text-muted">{t('rating')}</span>
        </motion.div>
      </div>

      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 32 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.8,
          delay: 0.2,
          ease: [0.21, 0.47, 0.32, 0.98],
        }}
      >
        <PhoneMockup />
      </motion.div>
    </section>
  );
}

function PhoneMockup() {
  const t = useTranslations('hero');
  const reduce = useReducedMotion();

  return (
    <div className="flex shrink-0 items-center justify-center">
      <div
        className="flex h-[680px] w-[340px] flex-col gap-4 rounded-[42px] border-2 border-white/[0.08] p-6"
        style={{
          background: 'linear-gradient(160deg, #1A1D23, #0F1115)',
          boxShadow: '0 40px 80px rgba(56, 189, 248, 0.15)',
        }}
      >
        {/* Status bar */}
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-semibold text-text-muted">
            9:41
          </span>
          <span className="text-[11px] font-semibold text-text-muted">
            ●●● 5G
          </span>
        </div>

        {/* Greeting */}
        <div className="flex flex-col gap-1">
          <span className="text-sm text-text-muted">{t('phoneGreeting')}</span>
          <span className="text-xl font-bold text-text">
            {t('phoneBusinessName')}
          </span>
        </div>

        {/* Profit card */}
        <div
          className="flex flex-col gap-1.5 rounded-[20px] border border-accent/25 p-6"
          style={{
            background:
              'linear-gradient(160deg, rgba(56,189,248,0.12), rgba(56,189,248,0.02))',
          }}
        >
          <span className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
            {t('phoneProfitLabel')}
          </span>
          <CountUp
            to={47250}
            prefix="EGP "
            className="text-3xl font-extrabold tracking-tight text-text"
          />
          <div className="mt-1 flex items-center gap-1.5">
            <motion.span
              className="text-xs font-semibold text-success"
              animate={reduce ? undefined : { scale: [1, 1.08, 1] }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              ↑ 23%
            </motion.span>
            <span className="text-xs text-text-muted">
              {t('phoneVsLastMonth')}
            </span>
          </div>
        </div>

        {/* Money in/out */}
        <div className="flex gap-2.5">
          <div className="flex flex-1 flex-col gap-1 rounded-[14px] border border-border bg-card p-3.5">
            <span className="text-[10px] uppercase tracking-wider text-text-muted">
              {t('phoneMoneyIn')}
            </span>
            <span className="text-base font-bold text-text">EGP 84,500</span>
          </div>
          <div className="flex flex-1 flex-col gap-1 rounded-[14px] border border-border bg-card p-3.5">
            <span className="text-[10px] uppercase tracking-wider text-text-muted">
              {t('phoneMoneyOut')}
            </span>
            <span className="text-base font-bold text-text">EGP 37,250</span>
          </div>
        </div>

        {/* Recent activity */}
        <div className="mt-1 flex flex-col gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            {t('phoneRecentActivity')}
          </span>
          <div className="flex flex-col rounded-[14px] border border-border bg-card">
            <div className="flex items-center gap-3 border-b border-border px-3.5 py-3">
              <div className="flex size-8 items-center justify-center rounded-[9px] bg-accent-dark">
                <TrendingUp className="size-3.5 text-accent" strokeWidth={2.5} />
              </div>
              <div className="flex flex-1 flex-col">
                <span className="text-xs font-semibold text-text">
                  {t('phoneInstagramOrder')}
                </span>
                <span className="text-[10px] text-text-muted">
                  Today, 14:32
                </span>
              </div>
              <span className="text-[13px] font-bold text-text">
                +EGP 1,250
              </span>
            </div>
            <div className="flex items-center gap-3 px-3.5 py-3">
              <div className="flex size-8 items-center justify-center rounded-[9px] bg-accent-dark">
                <TrendingUp className="size-3.5 text-accent" strokeWidth={2.5} />
              </div>
              <div className="flex flex-1 flex-col">
                <span className="text-xs font-semibold text-text">
                  {t('phoneWhatsappSale')}
                </span>
                <span className="text-[10px] text-text-muted">
                  Today, 11:18
                </span>
              </div>
              <span className="text-[13px] font-bold text-text">+EGP 850</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
