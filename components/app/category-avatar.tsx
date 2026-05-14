type Tone = 'success' | 'danger' | 'accent' | 'muted';

const RING: Record<Tone, string> = {
  success: 'ring-success/25 text-success',
  danger: 'ring-danger/25 text-danger',
  accent: 'ring-accent/25 text-accent',
  muted: 'ring-text-muted/30 text-text-secondary',
};

function initial(name: string | null | undefined): string {
  if (!name) return '·';
  const trimmed = name.trim();
  if (!trimmed) return '·';
  const first = Array.from(trimmed)[0];
  return first?.toUpperCase() ?? '·';
}

export function CategoryAvatar({
  name,
  icon,
  tone = 'muted',
  size = 'md',
}: {
  name: string | null | undefined;
  icon: string | null | undefined;
  tone?: Tone;
  size?: 'sm' | 'md' | 'lg';
}) {
  const dim = size === 'sm' ? 'size-8 text-sm' : size === 'lg' ? 'size-11 text-lg' : 'size-10 text-base';
  return (
    <span
      className={`grid ${dim} shrink-0 place-items-center rounded-lg bg-background font-semibold ring-1 ${RING[tone]}`}
      aria-hidden
    >
      {icon ? <span>{icon}</span> : <span>{initial(name)}</span>}
    </span>
  );
}
