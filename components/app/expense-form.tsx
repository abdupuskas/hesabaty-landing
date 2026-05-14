'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  createExpenseAction,
  updateExpenseAction,
  deleteExpenseAction,
} from '@/lib/transactions/actions';
import { Trash2, ChevronDown } from 'lucide-react';

type Category = { id: string; name: string; icon?: string | null };

export type ExpenseFormValues = {
  id?: string;
  amount?: number;
  name?: string | null;
  vendor?: string | null;
  payment_method?: string | null;
  paid_at?: string | null;
  due_date?: string | null;
  is_recurring?: boolean | null;
  category_id?: string | null;
  note?: string | null;
};

export function ExpenseForm({
  locale,
  categories,
  initial,
}: {
  locale: string;
  categories: Category[];
  initial?: ExpenseFormValues;
}) {
  const t = useTranslations('app.form');
  const tOut = useTranslations('app.moneyOut.fields');
  const tList = useTranslations('app.list');
  const isEdit = !!initial?.id;

  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<'paid' | 'unpaid'>(
    initial?.paid_at === null ? 'unpaid' : initial ? 'paid' : 'paid'
  );

  const onSubmit = (formData: FormData) => {
    setError(null);
    formData.set('status', status);
    startTransition(async () => {
      const action = isEdit ? updateExpenseAction : createExpenseAction;
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
      await deleteExpenseAction(fd);
    });
  };

  const defaultPaidAt = initial?.paid_at
    ? initial.paid_at.slice(0, 10)
    : new Date().toISOString().slice(0, 10);
  const defaultDueDate = initial?.due_date ? initial.due_date.slice(0, 10) : '';
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={tOut('name')}>
          <input
            type="text"
            name="name"
            defaultValue={initial?.name ?? ''}
            placeholder={tOut('namePlaceholder')}
            className={inputClass}
          />
        </Field>
        <Field label={tOut('vendor')}>
          <input
            type="text"
            name="vendor"
            defaultValue={initial?.vendor ?? ''}
            placeholder={tOut('vendorPlaceholder')}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label={t('category')}>
        <SelectWrap>
          <select
            name="category_id"
            defaultValue={initial?.category_id ?? ''}
            className={selectClass}
          >
            <option value="">{t('categoryPlaceholder')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon ? `${c.icon} ` : ''}
                {c.name}
              </option>
            ))}
          </select>
        </SelectWrap>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('status')}>
          <SelectWrap>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'paid' | 'unpaid')}
              className={selectClass}
            >
              <option value="paid">{t('statusPaid')}</option>
              <option value="unpaid">{t('statusUnpaid')}</option>
            </select>
          </SelectWrap>
        </Field>
        {status === 'paid' ? (
          <Field label={tOut('paidAt')}>
            <input type="date" name="paid_at" defaultValue={defaultPaidAt} className={inputClass} />
          </Field>
        ) : (
          <Field label={tOut('dueDate')}>
            <input type="date" name="due_date" defaultValue={defaultDueDate} className={inputClass} />
          </Field>
        )}
      </div>

      <Field label={t('paymentMethod')}>
        <input
          type="text"
          name="payment_method"
          defaultValue={initial?.payment_method ?? ''}
          placeholder={t('paymentMethodPlaceholder')}
          className={inputClass}
        />
      </Field>

      <label className="flex items-center gap-2 text-sm text-text-secondary">
        <input
          type="checkbox"
          name="is_recurring"
          defaultChecked={!!initial?.is_recurring}
          className="size-4 rounded border-border bg-background accent-accent"
        />
        {tOut('isRecurring')}
      </label>

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
            href="/app/money-out"
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
