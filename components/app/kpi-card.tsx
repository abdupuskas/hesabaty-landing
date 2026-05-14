import { ArrowDownToLine, ArrowUpFromLine, TrendingUp, Clock, AlertCircle } from 'lucide-react';

type Tone = 'success' | 'danger' | 'accent' | 'warning' | 'muted';

const ICON: Record<Tone, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  success: ArrowDownToLine,
  danger: ArrowUpFromLine,
  accent: TrendingUp,
  warning: AlertCircle,
  muted: Clock,
};

const COLOR: Record<Tone, string> = {
  success: 'text-success',
  danger: 'text-danger',
  accent: 'text-accent',
  warning: 'text-warning',
  muted: 'text-text',
};

export function KpiCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: Tone;
}) {
  const Icon = ICON[tone];
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-text-muted">{label}</div>
        <Icon size={16} strokeWidth={1.75} />
      </div>
      <div className={`mt-3 text-2xl font-semibold tabular-nums ${COLOR[tone]}`}>{value}</div>
    </div>
  );
}
