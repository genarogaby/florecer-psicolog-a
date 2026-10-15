import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { patientsQ, paymentsQ, profileQ } from "@/lib/queries";
import { PageHeader, Panel } from "@/components/PageHeader";
import { NativeSelect } from "@/components/NativeSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { dateOnly, money, fields } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/pagos")({
  head: () => ({ meta: [{ title: "Pagos — Sereno" }, { name: "description", content: "Registro de pagos y cobros." }] }),
  component: Pagos,
});

function Pagos() {
  const qc = useQueryClient();
  const { data: pays = [] } = useQuery(paymentsQ);
  const { data: patients = [] } = useQuery(patientsQ);
  const { userId } = Route.useRouteContext();
  const { data: profile } = useQuery(profileQ(userId));
  const [open, setOpen] = useState(false);
  const total = pays.reduce((s, p) => s + Number(p.amount), 0);

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = fields(e.currentTarget, ["patient_id","amount","method","concept","paid_at"]);
    const { error } = await supabase.from("payments").insert({
      patient_id: f.patient_id, amount: Number(f.amount), method: f.method, concept: f.concept || "Sesión", paid_at: f.paid_at,
    });
    if (error) { toast.error("No se pudo registrar el pago"); return; }
    toast.success("Pago registrado");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["payments"] });
  }

  return (
    <>
      <PageHeader
        title="Pagos"
        sub={`Total cobrado: ${money(total)}`}
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button disabled={!patients.length}>Registrar pago</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Registrar pago</DialogTitle></DialogHeader>
              <form onSubmit={create} className="space-y-3">
                <div><Label>Paciente</Label><NativeSelect name="patient_id" required>{patients.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}</NativeSelect></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Monto</Label><Input key={profile?.session_price ?? 800} name="amount" type="number" step="0.01" required defaultValue={profile?.session_price ?? 800} /></div>
                  <div><Label>Fecha</Label><Input name="paid_at" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Método</Label><NativeSelect name="method"><option>efectivo</option><option>transferencia</option><option>tarjeta</option></NativeSelect></div>
                  <div><Label>Concepto</Label><Input name="concept" defaultValue="Sesión" /></div>
                </div>
                <Button className="w-full">Guardar</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <Panel className="p-0 overflow-hidden">
        {pays.length === 0 ? <p className="p-6 text-sm text-muted-foreground">Aún no hay pagos.</p> : (
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-muted-foreground"><tr><th className="p-3">Fecha</th><th className="p-3">Paciente</th><th className="p-3">Concepto</th><th className="p-3">Método</th><th className="p-3 text-right">Monto</th></tr></thead>
            <tbody className="divide-y">
              {pays.map((p) => (
                <tr key={p.id}><td className="p-3">{dateOnly(p.paid_at)}</td><td className="p-3">{p.patients?.full_name}</td><td className="p-3">{p.concept}</td><td className="p-3">{p.method}</td><td className="p-3 text-right font-medium">{money(p.amount)}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </>
  );
}
