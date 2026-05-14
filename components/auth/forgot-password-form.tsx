'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { requestPasswordResetAction, type ActionResult } from '@/lib/auth/actions';
import { TextField } from './text-field';
import { SubmitButton } from './submit-button';

const initial: ActionResult | null = null;

export function ForgotPasswordForm({ locale }: { locale: string }) {
  const t = useTranslations('auth.forgotPassword');
  const tCommon = useTranslations('auth.common');
  const [state, action] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) =>
      requestPasswordResetAction(formData),
    initial
  );

  if (state?.ok) {
    return (
      <div className="rounded-lg border border-border bg-background/40 p-4 text-sm text-text-secondary">
        <p className="font-medium text-text">{t('sentTitle')}</p>
        <p className="mt-1">{t('sentBody')}</p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      <TextField
        label={tCommon('email')}
        type="email"
        name="email"
        autoComplete="email"
        placeholder={t('emailPlaceholder')}
        required
      />
      {state && !state.ok ? (
        <p className="text-sm text-danger">{tCommon('genericError')}</p>
      ) : null}
      <SubmitButton label={t('submit')} loadingLabel={tCommon('loading')} />
    </form>
  );
}
