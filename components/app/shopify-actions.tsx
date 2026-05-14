'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { RefreshCw, Plug } from 'lucide-react';
import { syncShopifyAction, disconnectShopifyAction } from '@/lib/shopify/actions';

export function ShopifyActions({ locale }: { locale: string }) {
  const t = useTranslations('app.shopify');
  const tList = useTranslations('app.list');
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const onSync = () => {
    setMessage(null);
    const fd = new FormData();
    fd.append('locale', locale);
    startTransition(async () => {
      const res = await syncShopifyAction(fd);
      setMessage(
        res.ok
          ? { kind: 'ok', text: t('syncSuccess') }
          : { kind: 'err', text: t('syncFailed') }
      );
    });
  };

  const onDisconnect = () => {
    if (!confirm(t('disconnectConfirm'))) return;
    setMessage(null);
    const fd = new FormData();
    fd.append('locale', locale);
    startTransition(async () => {
      const res = await disconnectShopifyAction(fd);
      setMessage(
        res.ok
          ? { kind: 'ok', text: t('disconnectSuccess') }
          : { kind: 'err', text: t('disconnectFailed') }
      );
    });
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSync}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-2 text-sm font-medium text-background hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} strokeWidth={1.75} className={pending ? 'animate-spin' : ''} />
          {pending ? tList('searchPlaceholder') : t('syncNow')}
        </button>
        <button
          type="button"
          onClick={onDisconnect}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-md border border-danger/40 bg-card px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
        >
          <Plug size={14} strokeWidth={1.75} />
          {t('disconnect')}
        </button>
      </div>
      {message ? (
        <p
          className={`text-xs ${
            message.kind === 'ok' ? 'text-success' : 'text-danger'
          }`}
          role="status"
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
