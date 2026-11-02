import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { profileQ } from "@/lib/queries";
import { PageHeader, Panel } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Moon, Sun } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/ajustes")({
  head: () => ({ meta: [{ title: "Ajustes — Flore-ser Psicología" }, { name: "description", content: "Configuración de tu consulta." }] }),
  component: Ajustes,
});

function Ajustes() {
  const qc = useQueryClient();
  const { userId } = Route.useRouteContext();
  const { data: profile } = useQuery(profileQ(userId));

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const price = Number(f.get("session_price"));
    if (!Number.isFinite(price) || price < 0) { toast.error("Ingresa un precio válido"); return; }
    const { error } = await supabase.from("profiles").update({ session_price: price }).eq("id", userId);
    if (error) { toast.error("No se pudo guardar"); return; }
    toast.success("Precio actualizado");
    qc.invalidateQueries({ queryKey: ["profile", userId] });
  }

  return (
    <>
      <PageHeader title="Ajustes" sub="Configura los datos de tu consulta." />
      <Panel className="max-w-md">
        <h3 className="text-lg mb-1">Precio por sesión</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Se usa como precio sugerido al agendar citas, registrar pagos y aceptar solicitudes del portal.
        </p>
        <form onSubmit={save} className="flex items-end gap-3">
          <div className="flex-1">
            <Label>Precio (MXN)</Label>
            <Input key={profile?.session_price ?? 800} name="session_price" type="number" step="0.01" min="0" required defaultValue={profile?.session_price ?? 800} />
          </div>
          <Button>Guardar</Button>
        </form>
      </Panel>
      <ThemePanel />
    </>
  );
}
