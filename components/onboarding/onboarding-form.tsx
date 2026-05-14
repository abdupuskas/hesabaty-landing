'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
import { completeOnboardingAction } from '@/lib/onboarding/actions';
import { INDUSTRIES } from '@/lib/onboarding/industries';

const SUGGESTED_CHANNELS = ['Instagram', 'WhatsApp', 'Shopify', 'Facebook', 'Pop-ups', 'Wholesale'];

export function OnboardingForm({ locale }: { locale: string }) {
  const t = useTranslations('onboarding');
  const [industry, setIndustry] = useState<string>('');
  const [channels, setChannels] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const toggleChannel = (name: string) => {
    setChannels((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const onSubmit = (formData: FormData) => {
    setError(null);
    formData.delete('channels');
    for (const c of channels) formData.append('channels', c);
    startTransition(async () => {
      const result = await completeOnboardingAction(formData);
      if (!result.ok) setError(result.error);
    });
  };

  return (
    <form action={onSubmit} className="space-y-8">
      <input type="hidden" name="locale" value={locale} />

      <Section title={t('section.business')} subtitle={t('section.businessHint')}>
        <Field label={t('businessName')} required>
          <input
            type="text"
            name="name"
            required
            minLength={2}
            placeholder={t('businessNamePlaceholder')}
            className={inputClass}
          />
        </Field>
      </Section>

      <Section title={t('section.industry')} subtitle={t('section.industryHint')}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {INDUSTRIES.map((ind) => {
            const active = industry === ind.key;
            return (
              <label
                key={ind.key}
                className={`relative flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border px-3 py-4 text-sm transition-colors ${
                  active
                    ? 'border-accent/40 bg-accent/10 text-accent'
                    : 'border-border bg-card text-text-secondary hover:text-text hover:border-text-muted'
                }`}
              >
                <input
                  type="radio"
                  name="industry"
                  value={ind.key}
                  checked={active}
                  onChange={() => setIndustry(ind.key)}
                  className="sr-only"
                  required
                />
                <span className="text-2xl" aria-hidden>{ind.icon}</span>
                <span className="text-xs">{t(`industries.${ind.key}`)}</span>
              </label>
            );
          })}
        </div>
        {industry === 'other' ? (
          <div className="mt-3">
            <input
              type="text"
              name="custom_industry_name"
              placeholder={t('customIndustryPlaceholder')}
              required
              className={inputClass}
            />
          </div>
        ) : null}
      </Section>

      <Section title={t('section.channels')} subtitle={t('section.channelsHint')}>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_CHANNELS.map((c) => {
            const active = channels.has(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggleChannel(c)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? 'border-accent/40 bg-accent/10 text-accent'
                    : 'border-border bg-card text-text-secondary hover:text-text hover:border-text-muted'
                }`}
              >
                {active ? <Check size={12} strokeWidth={2} /> : null}
                {c}
              </button>
            );
          })}
        </div>
      </Section>

      {error ? (
        <p className="text-sm text-danger" role="alert">
          {t(`errors.${error}` as 'errors.nameRequired' | 'errors.industryRequired' | 'errors.customIndustryRequired' | 'errors.unauthorized' | 'errors.generic')}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-accent px-4 py-3 text-sm font-medium text-background hover:bg-accent/90 transition-colors disabled:opacity-50"
      >
        {pending ? t('submitting') : t('submit')}
      </button>
    </form>
  );
}

const inputClass =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none';

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-base font-medium text-text">{title}</h2>
      <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}
