'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Plug } from 'lucide-react';
import { connectShopifyAction } from '@/lib/shopify/connect-action';

type ErrorKey =
  | 'unauthorized'
  | 'storeRequired'
  | 'invalidDomain'
  | 'storeUnreachable'
  | 'generic';

export function ShopifyConnectForm({ locale }: { locale: string }) {
  const t = useTranslations('app.shopify.connectForm');
  const [error, setError] = useState<ErrorKey | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (formData: FormData) => {
    setError(null);
    formData.append('locale', locale);
    startTransition(async () => {
      const res = await connectShopifyAction(formData);
      if (!res.ok) {
        setError(res.error as ErrorKey);
        return;
      }
      // Hand off to Shopify OAuth. The shopify-callback edge function will
      // redirect the browser back here with ?status=success|error.
      window.location.href = res.authUrl;
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-10 place-items-center rounded-lg bg-accent/10 text-accent">
          <Plug size={18} strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-medium text-text">{t('title')}</h2>
          <p className="mt-1 text-sm text-text-secondary">{t('subtitle')}</p>
        </div>
      </div>

      <form action={onSubmit} className="mt-6 space-y-4">
        <Field label={t('storeLabel')} hint={t('storeHint')}>
          <input
            type="text"
            name="store_url"
            required
            autoComplete="off"
            placeholder={t('storePlaceholder')}
            className={inputClass}
          />
        </Field>
        {error ? (
          <p className="text-sm text-danger" role="alert">
            {t(`errors.${error}`)}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-background hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {pending ? t('connecting') : t('submit')}
        </button>
      </form>
    </div>
  );
}

const inputClass =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none';

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1.5 block text-xs text-text-muted">{hint}</span> : null}
    </label>
  );
}
