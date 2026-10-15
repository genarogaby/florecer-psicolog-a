import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { requestsQ } from "@/lib/queries";
import { PageHeader, Panel, StatusBadge } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { dateTime } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/solicitudes")({
  head: () => ({ meta: [{ title: "Portal del paciente — Sereno" }, { name: "description", content: "Solicitudes de cita en línea." }] }),
  component: Solicitudes,
});

type Req = { id: string; name: string; email: string; phone: string | null; preferred_at: string; message: string | null; status: string };

function Solicitudes() {
  const qc = useQueryClient();
  const { userId } = Route.useRouteContext();
  const { data: reqs = [] } = useQuery(requestsQ);
  const link = typeof window !== "undefined" ? `${window.location.origin}/reservar/${userId}` : "";

  async function accept(r: Req) {
    const { data: pat, error } = await supabase.from("patients").insert({ full_name: r.name, email: r.email, phone: r.phone, reason: r.message }).select().single();
    if (error || !pat) return toast.error("No se pudo aceptar");
    await supabase.from("appointments").insert({ patient_id: pat.id, start_at: r.preferred_at, price: 800 });
    await supabase.from("booking_requests").update({ status: "aceptada" }).eq("id", r.id);
    toast.success("Paciente creado y cita agendada");
    qc.invalidateQueries();
  }
  async function reject(id: string) {
    await supabase.from("booking_requests").update({ status: "rechazada" }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["requests"] });
  }

  return (
    <>
      <PageHeader title="Portal del paciente" sub="Comparte tu enlace para que tus pacientes soliciten cita." />
      <Panel className="mb-6 flex flex-wrap items-center gap-3 justify-between">
        <code className="text-sm break-all">{link}</code>
        <Button variant="outline" onClick={() => { navigator.clipboard.writeText(link); toast.success("Enlace copiado"); }}>Copiar enlace</Button>
      </Panel>
      <div className="space-y-3">
        {reqs.length === 0 && <p className="text-sm text-muted-foreground">Aún no hay solicitudes.</p>}
        {reqs.map((r) => (
          <Panel key={r.id} className="flex flex-wrap gap-4 justify-between items-start">
            <div>
              <div className="flex gap-2 items-center"><h3 className="text-lg">{r.name}</h3><StatusBadge status={r.status} /></div>
              <p className="text-sm text-muted-foreground">{r.email}{r.phone ? ` · ${r.phone}` : ""}</p>
              <p className="text-sm mt-1">Prefiere: {dateTime(r.preferred_at)}</p>
              {r.message && <p className="text-sm mt-2 text-muted-foreground">"{r.message}"</p>}
            </div>
            {r.status === "pendiente" && (
              <div className="flex gap-2"><Button onClick={() => accept(r)}>Aceptar</Button><Button variant="outline" onClick={() => reject(r.id)}>Rechazar</Button></div>
            )}
          </Panel>
        ))}
      </div>
    </>
  );
}
