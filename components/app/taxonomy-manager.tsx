'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';

export type TaxonomyItem = {
  id: string;
  name: string;
  is_custom: boolean | null;
};

type Action = (formData: FormData) => Promise<{ ok: true } | { ok: false; error: string }>;

export function TaxonomyManager({
  items,
  locale,
  createAction,
  renameAction,
  deleteAction,
  addLabel,
  newPlaceholder,
}: {
  items: TaxonomyItem[];
  locale: string;
  createAction: Action;
  renameAction: Action;
  deleteAction: Action;
  addLabel: string;
  newPlaceholder: string;
}) {
  const t = useTranslations('app.taxonomy');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const callAction = (action: Action, formData: FormData, onDone?: () => void) => {
    setError(null);
    formData.append('locale', locale);
    startTransition(async () => {
      const res = await action(formData);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onDone?.();
    });
  };

  const onCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    callAction(createAction, fd, () => {
      e.currentTarget.reset();
    });
  };

  const beginEdit = (item: TaxonomyItem) => {
    setEditingId(item.id);
    setDraft(item.name);
    setError(null);
  };

  const saveEdit = (id: string) => {
    if (!draft.trim()) return;
    const fd = new FormData();
    fd.append('id', id);
    fd.append('name', draft.trim());
    callAction(renameAction, fd, () => {
      setEditingId(null);
      setDraft('');
    });
  };

  const onDelete = (id: string) => {
    if (!confirm(t('deleteConfirm'))) return;
    const fd = new FormData();
    fd.append('id', id);
    callAction(deleteAction, fd);
  };

  const errorText = error
    ? t(`errors.${error}` as 'errors.nameRequired' | 'errors.unauthorized' | 'errors.generic' | 'errors.inUse')
    : null;

  return (
    <div className="space-y-4">
      <form onSubmit={onCreate} className="flex gap-2">
        <input
          type="text"
          name="name"
          required
          minLength={1}
          placeholder={newPlaceholder}
          disabled={pending}
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-2 text-sm font-medium text-background hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          <Plus size={14} strokeWidth={2} />
          {addLabel}
        </button>
      </form>

      {errorText ? (
        <p className="text-sm text-danger" role="alert">
          {errorText}
        </p>
      ) : null}

      {items.length === 0 ? (
        <p className="rounded-md border border-border bg-card px-4 py-8 text-center text-sm text-text-secondary">
          {t('empty')}
        </p>
      ) : (
        <ul className="rounded-md border border-border bg-card">
          {items.map((item) => {
            const isEditing = editingId === item.id;
            return (
              <li
                key={item.id}
                className="flex items-center gap-3 border-b border-border/60 px-4 py-2.5 last:border-b-0"
              >
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-sm text-text focus:border-accent focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => saveEdit(item.id)}
                      disabled={pending}
                      className="grid size-7 place-items-center rounded-md text-success hover:bg-success/10 transition-colors disabled:opacity-50"
                      aria-label={t('save')}
                    >
                      <Check size={14} strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setDraft('');
                      }}
                      className="grid size-7 place-items-center rounded-md text-text-muted hover:bg-background hover:text-text transition-colors"
                      aria-label={t('cancel')}
                    >
                      <X size={14} strokeWidth={2} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-text">{item.name}</span>
                    {item.is_custom ? (
                      <>
                        <button
                          type="button"
                          onClick={() => beginEdit(item)}
                          className="grid size-7 place-items-center rounded-md text-text-secondary hover:bg-background hover:text-text transition-colors"
                          aria-label={t('rename')}
                        >
                          <Pencil size={12} strokeWidth={1.75} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(item.id)}
                          disabled={pending}
                          className="grid size-7 place-items-center rounded-md text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
                          aria-label={t('delete')}
                        >
                          <Trash2 size={12} strokeWidth={1.75} />
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider text-text-muted">
                        {t('default')}
                      </span>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
