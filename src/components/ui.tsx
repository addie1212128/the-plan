import clsx from "clsx";

export function PageHeader({
  title,
  subtitle,
  icon,
  actions,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink-600 px-6 py-5">
      <div className="flex items-center gap-3">
        {icon && <div className="grid h-10 w-10 place-items-center rounded-lg bg-ink-600/70">{icon}</div>}
        <div>
          <h1 className="font-display text-2xl text-parchment-100">{title}</h1>
          {subtitle && <p className="text-sm text-parchment-300/70">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-xl border border-dashed border-ink-500 px-8 py-12 text-center">
      {icon && <div className="text-parchment-300/40">{icon}</div>}
      <h3 className="font-display text-xl text-parchment-100">{title}</h3>
      <div className="text-sm text-parchment-300/70">{children}</div>
    </div>
  );
}

export function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={clsx("block space-y-1.5", className)}>
      <span className="text-xs font-medium uppercase tracking-wider text-parchment-300/60">{label}</span>
      {children}
    </label>
  );
}
