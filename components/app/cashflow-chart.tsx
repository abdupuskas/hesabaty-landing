'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { SeriesPoint } from '@/lib/queries/dashboard';

type Props = {
  data: SeriesPoint[];
  granularity: 'day' | 'month';
  locale: string;
  title: string;
  inLabel: string;
  outLabel: string;
  empty: string;
};

export function CashflowChart({ data, granularity, locale, title, inLabel, outLabel, empty }: Props) {
  const tag = locale === 'ar' ? 'ar-EG' : 'en-GB';

  const formatTick = (key: string) => {
    if (granularity === 'month') {
      const [y, m] = key.split('-').map(Number);
      return new Date(Date.UTC(y, (m ?? 1) - 1, 1)).toLocaleDateString(tag, { month: 'short' });
    }
    const [y, m, d] = key.split('-').map(Number);
    return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1)).toLocaleDateString(tag, {
      day: '2-digit',
      month: 'short',
    });
  };

  const formatCurrencyShort = (v: number) => {
    const egp = v / 100;
    if (Math.abs(egp) >= 1000) return `${Math.round(egp / 1000)}k`;
    return Math.round(egp).toString();
  };

  const formatCurrencyFull = (v: number) =>
    (v / 100).toLocaleString(tag, {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    });

  return (
    <section className="rounded-xl border border-border bg-card">
      <header className="border-b border-border px-5 py-3">
        <h2 className="text-sm font-medium text-text">{title}</h2>
      </header>
      <div className="h-64 px-2 py-4">
        {data.length === 0 ? (
          <p className="grid h-full place-items-center text-sm text-text-secondary">{empty}</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-danger)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--color-danger)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="bucket"
                tickFormatter={formatTick}
                stroke="var(--color-text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                tickFormatter={formatCurrencyShort}
                stroke="var(--color-text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={48}
              />
              <Tooltip
                cursor={{ stroke: 'var(--color-border)' }}
                contentStyle={{
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  color: 'var(--color-text)',
                  fontSize: 12,
                }}
                labelFormatter={(label) => formatTick(String(label))}
                formatter={(value, name) => [
                  formatCurrencyFull(typeof value === 'number' ? value : Number(value) || 0),
                  name === 'in' ? inLabel : outLabel,
                ]}
              />
              <Area
                type="monotone"
                dataKey="in"
                stroke="var(--color-success)"
                strokeWidth={2}
                fill="url(#gIn)"
              />
              <Area
                type="monotone"
                dataKey="out"
                stroke="var(--color-danger)"
                strokeWidth={2}
                fill="url(#gOut)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
