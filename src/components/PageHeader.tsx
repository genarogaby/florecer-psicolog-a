import type { ReactNode } from "react";

export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-4xl">{title}</h1>
        {sub && <p className="mt-1 text-muted-foreground">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-card p-5 shadow-soft ${className}`}>{children}</div>;
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    programada: "bg-secondary text-secondary-foreground",
    completada: "bg-success/15 text-success",
    cancelada: "bg-destructive/10 text-destructive",
    pendiente: "bg-warning/20 text-accent-foreground",
    aceptada: "bg-success/15 text-success",
    rechazada: "bg-destructive/10 text-destructive",
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] ?? "bg-muted"}`}>{status}</span>;
}
