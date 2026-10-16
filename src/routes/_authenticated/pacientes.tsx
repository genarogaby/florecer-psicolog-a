import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { patientsQ } from "@/lib/queries";
import { PageHeader, Panel } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { fields } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/pacientes")({
  head: () => ({ meta: [{ title: "Pacientes — Flore-ser Psicología" }, { name: "description", content: "Lista de pacientes y expedientes." }] }),
  component: Pacientes,
});

function Pacientes() {
  const qc = useQueryClient();
  const { data: patients = [] } = useQuery(patientsQ);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = fields(e.currentTarget, ["full_name","email","phone","birth_date","reason"]);
    const { error } = await supabase.from("patients").insert({
      full_name: f.full_name, email: f.email || null, phone: f.phone || null,
      birth_date: f.birth_date || null, reason: f.reason || null,
    });
    if (error) { toast.error("No se pudo guardar"); return; }
    toast.success("Paciente registrado");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["patients"] });
  }

  const list = patients.filter((p) => p.full_name.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader
        title="Pacientes"
        sub={`${patients.length} en total`}
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button>Nuevo paciente</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nuevo paciente</DialogTitle></DialogHeader>
              <form onSubmit={create} className="space-y-3">
                <div><Label>Nombre completo</Label><Input name="full_name" required /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Correo</Label><Input name="email" type="email" /></div>
                  <div><Label>Teléfono</Label><Input name="phone" /></div>
                </div>
                <div><Label>Fecha de nacimiento</Label><Input name="birth_date" type="date" /></div>
                <div><Label>Motivo de consulta</Label><Textarea name="reason" /></div>
                <Button className="w-full">Guardar</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <Input placeholder="Buscar paciente…" value={q} onChange={(e) => setQ(e.target.value)} className="mb-4 max-w-sm" />
      <Panel className="p-0 overflow-hidden">
        {list.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">Aún no hay pacientes.</p>
        ) : (
          <ul className="divide-y">
            {list.map((p) => (
              <li key={p.id}>
                <Link to="/pacientes/$id" params={{ id: p.id }} className="flex justify-between gap-4 px-5 py-4 hover:bg-muted">
                  <span className="font-medium">{p.full_name}</span>
                  <span className="text-sm text-muted-foreground">{p.phone ?? p.email ?? ""}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
