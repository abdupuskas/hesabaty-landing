'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { updatePasswordAction, type ActionResult } from '@/lib/auth/actions';
import { TextField } from './text-field';
import { SubmitButton } from './submit-button';

const initial: ActionResult | null = null;

export function ResetPasswordForm({ locale }: { locale: string }) {
  const t = useTranslations('auth.resetPassword');
  const tCommon = useTranslations('auth.common');
  const [state, action] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => updatePasswordAction(formData),
    initial
  );

  let errorMessage: string | null = null;
  if (state && !state.ok) {
    if (state.error === 'mismatch') errorMessage = t('errors.mismatch');
    else if (state.error === 'weak') errorMessage = t('errors.weak');
    else if (state.error === 'expired') errorMessage = t('errors.expired');
    else errorMessage = t('errors.generic');
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      <TextField
        label={t('newPassword')}
        type="password"
        name="password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      <TextField
        label={t('confirmPassword')}
        type="password"
        name="confirm"
        autoComplete="new-password"
        minLength={8}
        required
      />
      {errorMessage ? <p className="text-sm text-danger">{errorMessage}</p> : null}
      <SubmitButton label={t('submit')} loadingLabel={tCommon('loading')} />
    </form>
  );
}
