'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { LayoutDashboard, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, BarChart3, Sparkles, Plug, Settings } from 'lucide-react';

const NAV = [
  { href: '/app', key: 'dashboard', icon: LayoutDashboard },
  { href: '/app/money-in', key: 'moneyIn', icon: ArrowDownToLine },
  { href: '/app/money-out', key: 'moneyOut', icon: ArrowUpFromLine },
  { href: '/app/transactions', key: 'transactions', icon: ArrowLeftRight },
  { href: '/app/reports', key: 'reports', icon: BarChart3 },
  { href: '/app/ask', key: 'ask', icon: Sparkles },
  { href: '/app/integrations/shopify', key: 'shopify', icon: Plug },
  { href: '/app/settings', key: 'settings', icon: Settings },
] as const;

export function Sidebar() {
  const t = useTranslations('app.nav');
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-60 shrink-0 flex-col border-e border-border bg-card/40 px-3 py-6">
      <div className="px-3 mb-8">
        <span className="text-base font-semibold tracking-tight text-text">Hesabaty</span>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, key, icon: Icon }) => {
          const active = pathname === href || (href !== '/app' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-secondary hover:bg-card hover:text-text'
              }`}
            >
              <Icon size={18} strokeWidth={1.75} />
              <span>{t(key)}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
