import { Sparkles } from 'lucide-react';

export function ComingSoonCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-6 py-12 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-full bg-accent/10 text-accent">
        <Sparkles size={20} strokeWidth={1.75} />
      </div>
      <h2 className="mt-4 text-lg font-medium text-text">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">{body}</p>
    </div>
  );
}
