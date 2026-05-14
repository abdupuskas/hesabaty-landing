'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Trash2 } from 'lucide-react';
import { deleteAccountAction } from '@/lib/auth/actions';

export function DeleteAccountForm({ locale }: { locale: string }) {
  const t = useTranslations('app.settings.dangerZone');
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-danger/40 bg-card px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-colors"
      >
        <Trash2 size={14} strokeWidth={1.75} />
        {t('deleteCta')}
      </button>
    );
  }

  return (
    <form action={deleteAccountAction} className="space-y-3">
      <input type="hidden" name="locale" value={locale} />
      <p className="text-sm text-text-secondary">{t('confirmBody')}</p>
      <input
        type="text"
        name="confirmation"
        required
        autoComplete="off"
        placeholder={t('confirmPlaceholder')}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-danger focus:outline-none"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-md bg-danger px-3 py-2 text-sm font-medium text-background hover:bg-danger/90 transition-colors"
        >
          <Trash2 size={14} strokeWidth={1.75} />
          {t('confirmDelete')}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-md border border-border bg-card px-3 py-2 text-sm text-text-secondary hover:text-text hover:border-text-muted transition-colors"
        >
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}
