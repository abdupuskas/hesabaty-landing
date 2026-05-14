'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { signUpAction, type ActionResult } from '@/lib/auth/actions';
import { TextField } from './text-field';
import { SubmitButton } from './submit-button';

const initial: ActionResult | null = null;

export function SignUpForm({ locale }: { locale: string }) {
  const t = useTranslations('auth.signup');
  const tCommon = useTranslations('auth.common');
  const [state, action] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => signUpAction(formData),
    initial
  );

  let errorMessage: string | null = null;
  if (state && !state.ok) {
    if (state.error === 'emailExists') errorMessage = t('errors.emailExists');
    else if (state.error === 'weakPassword') errorMessage = t('errors.weakPassword');
    else if (state.error === 'noInvite') errorMessage = t('errors.noInvite');
    else errorMessage = t('errors.generic');
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      <TextField
        label={tCommon('name')}
        name="name"
        autoComplete="name"
        placeholder={t('namePlaceholder')}
      />
      <TextField
        label={tCommon('email')}
        type="email"
        name="email"
        autoComplete="email"
        placeholder={t('emailPlaceholder')}
        required
      />
      <TextField
        label={tCommon('password')}
        type="password"
        name="password"
        autoComplete="new-password"
        placeholder={t('passwordPlaceholder')}
        minLength={8}
        required
      />
      {errorMessage ? <p className="text-sm text-danger">{errorMessage}</p> : null}
      <SubmitButton label={t('submit')} loadingLabel={tCommon('loading')} />
    </form>
  );
}
