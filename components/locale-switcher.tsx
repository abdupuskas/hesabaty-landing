'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useTransition } from 'react';

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = locale === 'en' ? 'ar' : 'en';
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      className="cursor-pointer px-3 py-2 text-sm font-medium text-text-secondary hover:text-text transition-colors disabled:opacity-50"
    >
      {locale === 'en' ? 'العربية' : 'English'}
    </button>
  );
}
