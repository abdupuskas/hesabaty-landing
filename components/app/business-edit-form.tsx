'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { updateBusinessAction } from '@/lib/business/actions';
import { INDUSTRIES } from '@/lib/onboarding/industries';

export function BusinessEditForm({
  locale,
  initial,
}: {
  locale: string;
  initial: { name: string; industry: string; custom_industry_name: string | null };
}) {
  const t = useTranslations('app.settings.business');
  const tOnb = useTranslations('onboarding');
  const tForm = useTranslations('app.form');

  const [industry, setIndustry] = useState(initial.industry);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  const onSubmit = (formData: FormData) => {
    setError(null);
    setDone(false);
    startTransition(async () => {
      const res = await updateBusinessAction(formData);
      if (res.ok) setDone(true);
      else setError(res.error);
    });
  };

  return (
    <form action={onSubmit} className="space-y-5">
      <input type="hidden" name="locale" value={locale} />

      <Field label={t('name')} required>
        <input
          type="text"
          name="name"
          required
          minLength={2}
          defaultValue={initial.name}
          className={inputClass}
        />
      </Field>

      <Field label={t('industry')} required>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {INDUSTRIES.map((ind) => {
            const active = industry === ind.key;
            return (
              <label
                key={ind.key}
                className={`relative flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-sm transition-colors ${
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
                <span className="text-xl" aria-hidden>{ind.icon}</span>
                <span className="text-xs">{tOnb(`industries.${ind.key}` as 'industries.fashion')}</span>
              </label>
            );
          })}
        </div>
      </Field>

      {industry === 'other' ? (
        <Field label={t('customIndustry')}>
          <input
            type="text"
            name="custom_industry_name"
            defaultValue={initial.custom_industry_name ?? ''}
            placeholder={tOnb('customIndustryPlaceholder')}
            className={inputClass}
            required
          />
        </Field>
      ) : null}

      {error ? (
        <p className="text-sm text-danger" role="alert">
          {tOnb(`errors.${error}` as 'errors.nameRequired' | 'errors.industryRequired' | 'errors.customIndustryRequired' | 'errors.unauthorized' | 'errors.generic')}
        </p>
      ) : null}
      {done ? <p className="text-sm text-success">{t('saved')}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-background hover:bg-accent/90 transition-colors disabled:opacity-50"
      >
        {pending ? tForm('saving') : tForm('save')}
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
