import { Smartphone } from 'lucide-react';

export function NoBusinessState({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: string;
}) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-full bg-accent/10 text-accent">
        <Smartphone size={20} strokeWidth={1.75} />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-text">{title}</h2>
      <p className="mt-2 text-sm text-text-secondary">{body}</p>
      <p className="mt-4 text-xs uppercase tracking-wider text-text-muted">{cta}</p>
    </div>
  );
}
