import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { appointmentsQ, patientsQ, paymentsQ, requestsQ } from "@/lib/queries";
import { PageHeader, Panel, StatusBadge } from "@/components/PageHeader";
import { dateTime, money } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/panel")({
  head: () => ({ meta: [{ title: "Panel — Sereno" }, { name: "description", content: "Resumen de tu consulta." }] }),
  component: PanelPage,
});

function PanelPage() {
  const { data: patients = [] } = useQuery(patientsQ);
  const { data: appts = [] } = useQuery(appointmentsQ);
  const { data: pays = [] } = useQuery(paymentsQ);
  const { data: reqs = [] } = useQuery(requestsQ);
  const now = new Date();
  const upcoming = appts.filter((a) => new Date(a.start_at) >= now && a.status === "programada").slice(0, 6);
  const month = pays.filter((p) => p.paid_at.slice(0, 7) === now.toISOString().slice(0, 7)).reduce((s, p) => s + Number(p.amount), 0);
  const pending = reqs.filter((r) => r.status === "pendiente").length;

  const stats = [
    { l: "Pacientes activos", v: patients.filter((p) => p.active).length },
    { l: "Próximas citas", v: appts.filter((a) => new Date(a.start_at) >= now && a.status === "programada").length },
    { l: "Ingresos del mes", v: money(month) },
    { l: "Solicitudes nuevas", v: pending },
  ];

  return (
    <>
      <PageHeader title="Buen día" sub="Así va tu consulta hoy." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Panel key={s.l}>
            <p className="text-sm text-muted-foreground">{s.l}</p>
            <p className="mt-2 font-display text-3xl">{s.v}</p>
          </Panel>
        ))}
      </div>
      <Panel className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl">Próximas citas</h2>
          <Link to="/agenda" className="text-sm text-primary underline">Ver agenda</Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-muted-foreground text-sm">No tienes citas próximas.</p>
        ) : (
          <ul className="divide-y">
            {upcoming.map((a) => (
              <li key={a.id} className="py-3 flex justify-between gap-4">
                <span>{a.patients?.full_name}</span>
                <span className="text-sm text-muted-foreground">{dateTime(a.start_at)} · {a.modality}</span>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
