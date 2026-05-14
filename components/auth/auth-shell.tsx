import { Logo } from '@/components/logo';
import { Link } from '@/i18n/navigation';

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-5 md:px-20">
        <Link href="/" className="inline-flex hover:opacity-90 transition-opacity">
          <Logo />
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-6 pb-12 md:items-center">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold tracking-tight text-text">{title}</h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-text-secondary">{subtitle}</p>
          ) : null}
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8">
            {children}
          </div>
          {footer ? (
            <div className="mt-6 text-center text-sm text-text-secondary">{footer}</div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
