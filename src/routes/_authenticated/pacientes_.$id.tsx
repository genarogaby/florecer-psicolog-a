import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { appointmentsQ, notesQ, patientsQ, paymentsQ } from "@/lib/queries";
import { PageHeader, Panel, StatusBadge } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { balance, dateOnly, dateTime, money } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/pacientes_/$id")({
  head: () => ({ meta: [{ title: "Expediente — Flore-ser Psicología" }, { name: "description", content: "Expediente clínico del paciente." }] }),
  component: Expediente,
});

function Expediente() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const { data: patients = [] } = useQuery(patientsQ);
  const { data: allAppts = [] } = useQuery(appointmentsQ);
  const { data: allPays = [] } = useQuery(paymentsQ);
  const { data: notes = [] } = useQuery(notesQ(id));
  const p = patients.find((x) => x.id === id);
  const appts = allAppts.filter((a) => a.patient_id === id);
  const pays = allPays.filter((x) => x.patient_id === id);
  const bal = balance(pays, appts);

  if (!p) return <p className="text-muted-foreground">Cargando expediente…</p>;

  async function addNote(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const { error } = await supabase.from("session_notes").insert({ patient_id: id, title: String(f.get("title")) || "Nota de sesión", content: String(f.get("content")) });
    if (error) { toast.error("No se pudo guardar la nota"); return; }
    form.reset();
    qc.invalidateQueries({ queryKey: ["notes", id] });
  }

  return (
    <>
      <Link to="/pacientes" className="text-sm text-muted-foreground underline">← Pacientes</Link>
      <PageHeader title={p.full_name} sub={[p.email, p.phone, p.birth_date && `Nac. ${dateOnly(p.birth_date)}`].filter(Boolean).join(" · ")} />
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Panel><p className="text-sm text-muted-foreground">Sesiones completadas</p><p className="font-display text-3xl">{appts.filter((a) => a.status === "completada").length}</p></Panel>
        <Panel><p className="text-sm text-muted-foreground">Total pagado</p><p className="font-display text-3xl">{money(pays.reduce((s, x) => s + Number(x.amount), 0))}</p></Panel>
        <Panel><p className="text-sm text-muted-foreground">Saldo</p><p className={`font-display text-3xl ${bal < 0 ? "text-destructive" : "text-success"}`}>{money(bal)}</p></Panel>
      </div>
      {p.reason && <Panel className="mb-6"><p className="text-sm text-muted-foreground">Motivo de consulta</p><p className="mt-1">{p.reason}</p></Panel>}
      <Tabs defaultValue="notas">
        <TabsList><TabsTrigger value="notas">Notas clínicas</TabsTrigger><TabsTrigger value="citas">Citas</TabsTrigger><TabsTrigger value="pagos">Pagos</TabsTrigger></TabsList>
        <TabsContent value="notas" className="space-y-4">
          <Panel>
            <form onSubmit={addNote} className="space-y-2">
              <Input name="title" placeholder="Título (ej. Sesión 4 — ansiedad)" />
              <Textarea name="content" required rows={4} placeholder="Observaciones, intervenciones, tareas…" />
              <Button>Guardar nota</Button>
            </form>
          </Panel>
          {notes.map((n) => (
            <Panel key={n.id}>
              <div className="flex justify-between"><h3 className="text-lg">{n.title}</h3><span className="text-xs text-muted-foreground">{dateTime(n.created_at)}</span></div>
              <p className="mt-2 whitespace-pre-wrap text-sm">{n.content}</p>
            </Panel>
          ))}
        </TabsContent>
        <TabsContent value="citas">
          <Panel><ul className="divide-y">{appts.length === 0 && <li className="text-sm text-muted-foreground">Sin citas.</li>}
            {appts.map((a) => <li key={a.id} className="py-3 flex justify-between"><span>{dateTime(a.start_at)}</span><span>{money(a.price)}</span><StatusBadge status={a.status} /></li>)}
          </ul></Panel>
        </TabsContent>
        <TabsContent value="pagos">
          <Panel><ul className="divide-y">{pays.length === 0 && <li className="text-sm text-muted-foreground">Sin pagos.</li>}
            {pays.map((x) => <li key={x.id} className="py-3 flex justify-between"><span>{dateOnly(x.paid_at)}</span><span>{x.concept} · {x.method}</span><span>{money(x.amount)}</span></li>)}
          </ul></Panel>
        </TabsContent>
      </Tabs>
    </>
  );
}
