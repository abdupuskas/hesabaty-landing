import { Nav } from './nav';
import { Footer } from './footer';

type Props = {
  eyebrow: string;
  title: string;
  lastUpdated?: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
};

export function LegalLayout({
  eyebrow,
  title,
  lastUpdated,
  intro,
  children,
}: Props) {
  return (
    <main className="flex min-h-screen flex-col">
      <Nav />
      <section className="flex flex-col items-center px-6 pt-20 pb-10 md:px-20">
        <div className="flex w-full max-w-3xl flex-col gap-4">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-accent">
            {eyebrow}
          </span>
          <h1 className="text-5xl font-extrabold leading-[1.05] tracking-[-0.02em] text-text md:text-7xl">
            {title}
          </h1>
          {lastUpdated && (
            <p className="text-sm text-text-muted">{lastUpdated}</p>
          )}
        </div>
      </section>

      <section className="flex flex-col items-center px-6 pb-24 md:px-20">
        <div className="flex w-full max-w-3xl flex-col gap-12">
          {intro && (
            <div
              className="rounded-[20px] border border-accent/20 p-8"
              style={{
                background:
                  'linear-gradient(160deg, rgba(56,189,248,0.06), rgba(56,189,248,0.01))',
              }}
            >
              <p className="text-base leading-relaxed text-text-secondary">
                {intro}
              </p>
            </div>
          )}
          {children}
        </div>
      </section>

      <Footer />
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold tracking-tight text-text md:text-3xl">
        {title}
      </h2>
      {children}
    </div>
  );
}
