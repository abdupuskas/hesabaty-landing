'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { changePasswordAction } from '@/lib/auth/actions';

export function PasswordChangeForm() {
  const t = useTranslations('app.settings.password');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  const onSubmit = (formData: FormData) => {
    setError(null);
    setDone(false);
    startTransition(async () => {
      const result = await changePasswordAction(formData);
      if (result.ok) {
        setDone(true);
        return;
      }
      setError(result.error);
    });
  };

  return (
    <form action={onSubmit} className="space-y-4">
      <Field label={t('newPassword')}>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
      </Field>
      <Field label={t('confirmPassword')}>
        <input
          type="password"
          name="confirm"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
      </Field>
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {t(`errors.${error}` as 'errors.weak' | 'errors.mismatch' | 'errors.generic' | 'errors.unauthorized')}
        </p>
      ) : null}
      {done ? <p className="text-sm text-success">{t('success')}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-background hover:bg-accent/90 transition-colors disabled:opacity-50"
      >
        {pending ? t('saving') : t('submit')}
      </button>
    </form>
  );
}

const inputClass =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
