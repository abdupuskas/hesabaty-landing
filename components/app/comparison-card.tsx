import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

type Tone = 'success' | 'danger' | 'accent';

export function ComparisonCard({
  label,
  current,
  previous,
  format,
  tone,
  vsLabel,
}: {
  label: string;
  current: number;
  previous: number;
  format: (n: number) => string;
  tone: Tone;
  vsLabel: string;
}) {
  const diff = current - previous;
  const pct = previous === 0 ? null : (diff / Math.abs(previous)) * 100;
  const trend: 'up' | 'down' | 'flat' = diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat';

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    trend === 'flat'
      ? 'text-text-muted'
      : tone === 'danger'
        ? trend === 'up'
          ? 'text-danger'
          : 'text-success'
        : trend === 'up'
          ? 'text-success'
          : 'text-danger';

  const valueColor =
    tone === 'success' ? 'text-success' : tone === 'danger' ? 'text-danger' : 'text-accent';

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="text-xs uppercase tracking-wider text-text-muted">{label}</div>
      <div className={`mt-3 text-2xl font-semibold tabular-nums ${valueColor}`}>
        {format(current)}
      </div>
      <div className={`mt-2 inline-flex items-center gap-1 text-xs ${trendColor}`}>
        <TrendIcon size={12} strokeWidth={2} />
        <span className="tabular-nums">
          {pct == null ? '—' : `${diff >= 0 ? '+' : ''}${pct.toFixed(0)}%`}
        </span>
        <span className="text-text-muted">{vsLabel}</span>
      </div>
    </div>
  );
}
