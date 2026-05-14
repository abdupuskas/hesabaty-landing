'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import {
  createRevenueAction,
  updateRevenueAction,
  deleteRevenueAction,
} from '@/lib/transactions/actions';
import { Trash2, ChevronDown } from 'lucide-react';

type Channel = { id: string; name: string };

export type RevenueFormValues = {
  id?: string;
  amount?: number;
  item_name?: string | null;
  quantity?: number | null;
  payment_method?: string | null;
  shipping_provider?: string | null;
  status?: string;
  collected_at?: string | null;
  channel_id?: string | null;
  note?: string | null;
};

export function RevenueForm({
  locale,
  channels,
  initial,
}: {
  locale: string;
  channels: Channel[];
  initial?: RevenueFormValues;
}) {
  const t = useTranslations('app.form');
  const tIn = useTranslations('app.moneyIn.fields');
  const tList = useTranslations('app.list');
  const router = useRouter();
  const isEdit = !!initial?.id;

  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const action = isEdit ? updateRevenueAction : createRevenueAction;
      const result = await action(formData);
      if (result && !result.ok) setError(result.error);
    });
  };

  const onDelete = () => {
    if (!initial?.id) return;
    if (!confirm(tList('deleteConfirm'))) return;
    const fd = new FormData();
    fd.append('id', initial.id);
    fd.append('locale', locale);
    startTransition(async () => {
      await deleteRevenueAction(fd);
    });
  };

  const defaultDate = initial?.collected_at
    ? initial.collected_at.slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  const defaultAmount = initial?.amount != null ? (initial.amount / 100).toFixed(2) : '';

  return (
    <form action={onSubmit} className="space-y-5">
      <input type="hidden" name="locale" value={locale} />
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}

      <Field label={t('amount')} required>
        <input
          type="number"
          name="amount"
          step="0.01"
          min="0"
          required
          defaultValue={defaultAmount}
          placeholder={t('amountPlaceholder')}
          className={inputClass}
        />
      </Field>

      <Field label={tIn('itemName')}>
        <input
          type="text"
          name="item_name"
          defaultValue={initial?.item_name ?? ''}
          placeholder={tIn('itemNamePlaceholder')}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('channel')}>
          <SelectWrap>
            <select
              name="channel_id"
              defaultValue={initial?.channel_id ?? ''}
              className={selectClass}
            >
              <option value="">{t('channelPlaceholder')}</option>
              {channels.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </SelectWrap>
        </Field>
        <Field label={tIn('quantity')}>
          <input
            type="number"
            name="quantity"
            min="0"
            step="1"
            defaultValue={initial?.quantity ?? ''}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={tIn('collectedAt')}>
          <input type="date" name="collected_at" defaultValue={defaultDate} className={inputClass} />
        </Field>
        <Field label={t('status')}>
          <SelectWrap>
            <select name="status" defaultValue={initial?.status ?? 'paid'} className={selectClass}>
              <option value="paid">{t('statusPaid')}</option>
              <option value="unpaid">{t('statusUnpaid')}</option>
            </select>
          </SelectWrap>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('paymentMethod')}>
          <input
            type="text"
            name="payment_method"
            defaultValue={initial?.payment_method ?? ''}
            placeholder={t('paymentMethodPlaceholder')}
            className={inputClass}
          />
        </Field>
        <Field label={tIn('shippingProvider')}>
          <input
            type="text"
            name="shipping_provider"
            defaultValue={initial?.shipping_provider ?? ''}
            placeholder={tIn('shippingPlaceholder')}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label={t('note')}>
        <textarea
          name="note"
          rows={3}
          defaultValue={initial?.note ?? ''}
          placeholder={t('notePlaceholder')}
          className={inputClass}
        />
      </Field>

      {error ? (
        <p className="text-sm text-danger" role="alert">
          {translateError(t, error)}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-3 pt-2">
        {isEdit ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-md border border-danger/40 bg-card px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
          >
            <Trash2 size={14} strokeWidth={1.75} />
            {t('delete')}
          </button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <Link
            href="/app/money-in"
            className="rounded-md border border-border bg-card px-3 py-2 text-sm text-text-secondary hover:text-text hover:border-text-muted transition-colors"
          >
            {t('cancel')}
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-background hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {pending ? t('saving') : t('save')}
          </button>
        </div>
      </div>
    </form>
  );
}

const inputClass =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none';

const selectClass =
  'w-full appearance-none rounded-md border border-border bg-background ps-3 pe-9 py-2 text-sm text-text focus:border-accent focus:outline-none';

function SelectWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown
        size={14}
        strokeWidth={1.75}
        className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-text-muted"
      />
    </div>
  );
}

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

function translateError(t: ReturnType<typeof useTranslations>, code: string): string {
  if (code === 'amountInvalid' || code === 'amountRequired') return t(`errors.${code}`);
  return t('errors.generic');
}
