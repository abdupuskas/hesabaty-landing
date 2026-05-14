'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { signInAction, type ActionResult } from '@/lib/auth/actions';
import { TextField } from './text-field';
import { SubmitButton } from './submit-button';

const initial: ActionResult | null = null;

export function LoginForm({ locale }: { locale: string }) {
  const tLogin = useTranslations('auth.login');
  const tCommon = useTranslations('auth.common');
  const [state, action] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => signInAction(formData),
    initial
  );

  const errorMessage =
    state && !state.ok
      ? state.error === 'invalidCredentials'
        ? tLogin('invalidCredentials')
        : tCommon('genericError')
      : null;

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      <TextField
        label={tCommon('email')}
        type="email"
        name="email"
        autoComplete="email"
        placeholder={tLogin('emailPlaceholder')}
        required
      />
      <TextField
        label={tCommon('password')}
        type="password"
        name="password"
        autoComplete="current-password"
        required
      />
      {errorMessage ? (
        <p className="text-sm text-danger">{errorMessage}</p>
      ) : null}
      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-sm text-text-secondary hover:text-text transition-colors"
        >
          {tLogin('forgotPassword')}
        </Link>
      </div>
      <SubmitButton label={tLogin('submit')} loadingLabel={tCommon('loading')} />
    </form>
  );
}
