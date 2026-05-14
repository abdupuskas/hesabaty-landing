'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Smartphone, X } from 'lucide-react';

export function SmartBanner() {
  const t = useTranslations('app.smartBanner');
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  return (
    <div className="md:hidden flex items-center gap-3 border-b border-border bg-card/60 px-4 py-2">
      <Smartphone size={14} strokeWidth={1.75} className="shrink-0 text-accent" />
      <p className="min-w-0 flex-1 truncate text-xs text-text-secondary">{t('body')}</p>
      <a
        href="https://apps.apple.com/app/hesabaty-business"
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded-md bg-accent px-2.5 py-1 text-[11px] font-medium text-background"
      >
        {t('cta')}
      </a>
      <button
        type="button"
        onClick={() => setHidden(true)}
        aria-label={t('dismiss')}
        className="shrink-0 grid size-6 place-items-center rounded-md text-text-muted hover:bg-background hover:text-text transition-colors"
      >
        <X size={12} strokeWidth={1.75} />
      </button>
    </div>
  );
}
