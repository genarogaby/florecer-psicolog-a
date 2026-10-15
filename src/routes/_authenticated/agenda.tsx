import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { appointmentsQ, patientsQ } from "@/lib/queries";
import { PageHeader, Panel, StatusBadge } from "@/components/PageHeader";
import { NativeSelect } from "@/components/NativeSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/agenda")({
  head: () => ({ meta: [{ title: "Agenda — Sereno" }, { name: "description", content: "Agenda semanal de citas." }] }),
  component: Agenda,
});

function startOfWeek(d: Date) {
  const x = new Date(d); x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

function Agenda() {
  const qc = useQueryClient();
  const { data: appts = [] } = useQuery(appointmentsQ);
  const { data: patients = [] } = useQuery(patientsQ);
  const [week, setWeek] = useState(() => startOfWeek(new Date()));
  const [open, setOpen] = useState(false);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => { const d = new Date(week); d.setDate(d.getDate() + i); return d; }), [week]);

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const { error } = await supabase.from("appointments").insert({
      patient_id: String(f.get("patient_id")),
      start_at: new Date(String(f.get("start_at"))).toISOString(),
      duration_min: Number(f.get("duration_min")),
      modality: String(f.get("modality")),
      price: Number(f.get("price")),
    });
    if (error) { toast.error("No se pudo crear la cita"); return; }
    toast.success("Cita agendada");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["appointments"] });
  }

  async function setStatus(id: string, status: string) {
    await supabase.from("appointments").update({ status }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["appointments"] });
  }

  const shift = (n: number) => { const d = new Date(week); d.setDate(d.getDate() + n * 7); setWeek(d); };

  return (
    <>
      <PageHeader
        title="Agenda"
        sub={`Semana del ${week.toLocaleDateString("es-MX", { day: "numeric", month: "long" })}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => shift(-1)}><ChevronLeft /></Button>
            <Button variant="outline" onClick={() => setWeek(startOfWeek(new Date()))}>Hoy</Button>
            <Button variant="outline" size="icon" onClick={() => shift(1)}><ChevronRight /></Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button disabled={!patients.length}>Nueva cita</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Nueva cita</DialogTitle></DialogHeader>
                <form onSubmit={create} className="space-y-3">
                  <div><Label>Paciente</Label>
                    <NativeSelect name="patient_id" required>{patients.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}</NativeSelect></div>
                  <div><Label>Fecha y hora</Label><Input name="start_at" type="datetime-local" required /></div>
                  <div className="grid grid-cols-3 gap-2">
                    <div><Label>Minutos</Label><Input name="duration_min" type="number" defaultValue={50} /></div>
                    <div><Label>Precio</Label><Input name="price" type="number" defaultValue={800} /></div>
                    <div><Label>Modalidad</Label><NativeSelect name="modality"><option>presencial</option><option>en línea</option></NativeSelect></div>
                  </div>
                  <Button className="w-full">Guardar</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />
      {!patients.length && <p className="mb-4 text-sm text-muted-foreground">Primero registra un paciente para poder agendar.</p>}
      <div className="grid gap-3 md:grid-cols-7">
        {days.map((d) => {
          const list = appts.filter((a) => new Date(a.start_at).toDateString() === d.toDateString());
          const today = d.toDateString() === new Date().toDateString();
          return (
            <Panel key={d.toISOString()} className={`p-3 min-h-40 ${today ? "ring-2 ring-primary" : ""}`}>
              <p className="text-xs uppercase text-muted-foreground">{d.toLocaleDateString("es-MX", { weekday: "short" })}</p>
              <p className="font-display text-2xl">{d.getDate()}</p>
              <div className="mt-2 space-y-2">
                {list.map((a) => (
                  <div key={a.id} className="rounded-lg bg-secondary p-2 text-xs space-y-1">
                    <p className="font-semibold">{new Date(a.start_at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</p>
                    <p>{a.patients?.full_name}</p>
                    <StatusBadge status={a.status} />
                    {a.status === "programada" && (
                      <div className="flex gap-2 pt-1">
                        <button className="underline" onClick={() => setStatus(a.id, "completada")}>Completar</button>
                        <button className="underline text-destructive" onClick={() => setStatus(a.id, "cancelada")}>Cancelar</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Panel>
          );
        })}
      </div>
    </>
  );
}
