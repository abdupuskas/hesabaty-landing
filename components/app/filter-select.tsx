'use client';

import { ChevronDown } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export function FilterSelect({
  param,
  value,
  label,
  options,
  allLabel,
}: {
  param: string;
  value: string;
  label: string;
  options: { value: string; label: string; icon?: string | null }[];
  allLabel: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const onChange = (next: string) => {
    const sp = new URLSearchParams(params.toString());
    if (next) sp.set(param, next);
    else sp.delete(param);
    sp.delete('page');
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-md border border-border bg-card py-2 ps-3 pe-9 text-sm text-text focus:border-accent focus:outline-none"
        >
          <option value="">{allLabel}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.icon ? `${o.icon} ` : ''}
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          strokeWidth={1.75}
          className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
      </div>
    </label>
  );
}
