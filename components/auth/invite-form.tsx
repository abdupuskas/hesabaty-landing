'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { validateInviteAction, type ActionResult } from '@/lib/auth/actions';
import { TextField } from './text-field';
import { SubmitButton } from './submit-button';

const initial: ActionResult | null = null;

export function InviteForm({ locale }: { locale: string }) {
  const t = useTranslations('auth.invite');
  const tCommon = useTranslations('auth.common');
  const [state, action] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => validateInviteAction(formData),
    initial
  );

  let errorMessage: string | null = null;
  if (state && !state.ok) {
    if (state.error === 'invalid') errorMessage = t('errors.invalid');
    else if (state.error === 'already_used') errorMessage = t('errors.alreadyUsed');
    else if (state.error === 'rate_limited') errorMessage = t('errors.rateLimited');
    else errorMessage = t('errors.generic');
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      <TextField
        label={t('codeLabel')}
        name="code"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        placeholder={t('codePlaceholder')}
        className="font-mono uppercase tracking-[0.2em]"
        required
      />
      {errorMessage ? <p className="text-sm text-danger">{errorMessage}</p> : null}
      <SubmitButton label={t('submit')} loadingLabel={tCommon('loading')} />
    </form>
  );
}
