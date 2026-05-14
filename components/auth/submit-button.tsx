'use client';

import { useFormStatus } from 'react-dom';

export function SubmitButton({
  label,
  loadingLabel,
}: {
  label: string;
  loadingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-background hover:bg-accent/90 disabled:opacity-60 transition-colors"
    >
      {pending ? loadingLabel : label}
    </button>
  );
}
