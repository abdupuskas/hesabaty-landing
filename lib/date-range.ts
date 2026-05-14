export type RangeKey = 'this-month' | 'last-month' | 'this-year' | 'all-time';

export type DateRange = {
  key: RangeKey;
  startISO: string | null;
  endISO: string | null;
};

const VALID_KEYS: RangeKey[] = ['this-month', 'last-month', 'this-year', 'all-time'];

export function parseRangeKey(value: unknown): RangeKey {
  return VALID_KEYS.includes(value as RangeKey) ? (value as RangeKey) : 'this-month';
}

export function resolveDateRange(key: RangeKey, now: Date = new Date()): DateRange {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();

  if (key === 'this-month') {
    const start = new Date(Date.UTC(year, month, 1));
    const end = new Date(Date.UTC(year, month + 1, 1));
    return { key, startISO: start.toISOString(), endISO: end.toISOString() };
  }
  if (key === 'last-month') {
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));
    return { key, startISO: start.toISOString(), endISO: end.toISOString() };
  }
  if (key === 'this-year') {
    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year + 1, 0, 1));
    return { key, startISO: start.toISOString(), endISO: end.toISOString() };
  }
  return { key, startISO: null, endISO: null };
}

export function formatDate(iso: string, locale: string = 'en'): string {
  const tag = locale === 'ar' ? 'ar-EG' : 'en-GB';
  return new Date(iso).toLocaleDateString(tag, {
    day: '2-digit',
    month: 'short',
  });
}

export function parseMonth(
  value: string | null | undefined
): { year: number; month: number } | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return { year, month };
}

export function monthToDateRange(
  value: string | null | undefined
): { startISO: string; endISO: string } | null {
  const parsed = parseMonth(value);
  if (!parsed) return null;
  const start = new Date(Date.UTC(parsed.year, parsed.month - 1, 1));
  const end = new Date(Date.UTC(parsed.year, parsed.month, 1));
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}

export function currentMonthKey(now: Date = new Date()): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}
