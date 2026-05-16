'use client';

import { useState, useTransition } from 'react';
import { ChevronDown, Plus, X, Check } from 'lucide-react';

export type OptionItem = {
  id: string;
  name: string;
  icon?: string | null;
};

type CreateAction = (formData: FormData) => Promise<{ ok: true } | { ok: false; error: string }>;

export function OptionSelect({
  name,
  options,
  defaultValue,
  placeholder,
  addLabel,
  newPlaceholder,
  createAction,
  locale,
  onError,
}: {
  name: string;
  options: OptionItem[];
  defaultValue: string;
  placeholder: string;
  addLabel: string;
  newPlaceholder: string;
  createAction?: CreateAction;
  locale: string;
  onError?: (code: string) => void;
}) {
  const [value, setValue] = useState(defaultValue);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [pending, startTransition] = useTransition();

  // If `value` doesn't exist in options (e.g. legacy entry from mobile that wrote
  // a string not in our table), show it as the current selection so we don't lose data.
  const hasLegacyValue =
    !!value && !options.some((o) => o.name.toLowerCase() === value.toLowerCase());

  const onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    if (v === '__add__') {
      setAdding(true);
      setDraft('');
      return;
    }
    setValue(v);
  };

  const onCreate = () => {
    const trimmed = draft.trim();
    if (!trimmed || !createAction) return;
    const fd = new FormData();
    fd.append('name', trimmed);
    fd.append('locale', locale);
    startTransition(async () => {
      const res = await createAction(fd);
      if (!res.ok) {
        onError?.(res.error);
        return;
      }
      setValue(trimmed);
      setAdding(false);
      setDraft('');
    });
  };

  if (adding) {
    return (
      <div className="flex gap-2">
        <input type="hidden" name={name} value={value} />
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onCreate();
            } else if (e.key === 'Escape') {
              setAdding(false);
              setDraft('');
            }
          }}
          placeholder={newPlaceholder}
          autoFocus
          disabled={pending}
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none"
        />
        <button
          type="button"
          onClick={onCreate}
          disabled={pending || !draft.trim()}
          className="inline-flex items-center justify-center rounded-md bg-accent px-3 py-2 text-sm font-medium text-background hover:bg-accent/90 transition-colors disabled:opacity-50"
          aria-label={addLabel}
        >
          <Check size={14} strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={() => {
            setAdding(false);
            setDraft('');
          }}
          className="inline-flex items-center justify-center rounded-md border border-border bg-card px-3 py-2 text-sm text-text-secondary hover:text-text hover:border-text-muted transition-colors"
          aria-label="Cancel"
        >
          <X size={14} strokeWidth={2} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onSelectChange}
        className="w-full appearance-none rounded-md border border-border bg-background ps-3 pe-9 py-2 text-sm text-text focus:border-accent focus:outline-none"
      >
        <option value="">{placeholder}</option>
        {hasLegacyValue ? (
          <option value={value}>{value}</option>
        ) : null}
        {options.map((o) => (
          <option key={o.id} value={o.name}>
            {o.icon ? `${o.icon} ` : ''}
            {o.name}
          </option>
        ))}
        {createAction ? (
          <option value="__add__">+ {addLabel}</option>
        ) : null}
      </select>
      {createAction ? (
        <Plus
          size={14}
          strokeWidth={1.75}
          className="pointer-events-none absolute end-9 top-1/2 -translate-y-1/2 text-text-muted opacity-0"
          aria-hidden
        />
      ) : null}
      <ChevronDown
        size={14}
        strokeWidth={1.75}
        className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-text-muted"
      />
    </div>
  );
}
