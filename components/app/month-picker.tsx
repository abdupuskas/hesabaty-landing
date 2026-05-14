'use client';

import { ChevronDown } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

function monthLabel(year: number, month: number, locale: string): string {
  const tag = locale === 'ar' ? 'ar-EG' : 'en-US';
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(tag, {
    month: 'long',
    year: 'numeric',
  });
}

export function MonthPicker({
  value,
  locale,
  param = 'month',
  monthsBack = 12,
}: {
  value: string | null;
  locale: string;
  param?: string;
  monthsBack?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const now = new Date();
  const options: { value: string; label: string }[] = [];
  for (let i = 0; i < monthsBack; i += 1) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth() + 1;
    const key = `${year}-${String(month).padStart(2, '0')}`;
    options.push({ value: key, label: monthLabel(year, month, locale) });
  }

  const current =
    value ||
    `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;

  const onChange = (next: string) => {
    const sp = new URLSearchParams(params.toString());
    sp.set(param, next);
    sp.delete('page');
    router.push(`${pathname}?${sp.toString()}`);
  };

  return (
    <div className="relative">
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-md border border-border bg-card py-2 ps-3 pe-9 text-sm font-medium text-text focus:border-accent focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
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
  );
}

