import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { profileQ } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { fields } from "@/lib/format";

export const Route = createFileRoute("/reservar/$id")({
  head: () => ({
    meta: [
      { title: "Solicitar cita — Sereno" },
      { name: "description", content: "Solicita una cita con tu psicólogo en línea." },
      { property: "og:title", content: "Solicitar cita" },
      { property: "og:description", content: "Solicita una cita con tu psicólogo en línea." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Reservar,
});

function Reservar() {
  const { id } = Route.useParams();
  const { data: profile, isLoading } = useQuery(profileQ(id));
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = fields(e.currentTarget, ["name","email","phone","preferred_at","message"]);
    const { error } = await supabase.from("booking_requests").insert({
      owner_id: id, name: f.name, email: f.email, phone: f.phone || null,
      preferred_at: new Date(f.preferred_at).toISOString(), message: f.message || null,
    });
    if (error) { toast.error("No se pudo enviar la solicitud"); return; }
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-hero flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-soft">
        {isLoading ? <p>Cargando…</p> : !profile ? <p>Este enlace no es válido.</p> : sent ? (
          <div className="text-center">
            <h1 className="text-3xl">¡Solicitud enviada!</h1>
            <p className="mt-3 text-muted-foreground">{profile.display_name} se pondrá en contacto contigo para confirmar tu cita.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">{profile.specialty}</p>
            <h1 className="text-3xl">{profile.display_name}</h1>
            <p className="mt-2 mb-6 text-muted-foreground">Solicita tu cita. Te confirmaremos por correo o teléfono.</p>
            <form onSubmit={submit} className="space-y-3">
              <div><Label>Nombre completo</Label><Input name="name" required /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Correo</Label><Input name="email" type="email" required /></div>
                <div><Label>Teléfono</Label><Input name="phone" /></div>
              </div>
              <div><Label>Fecha y hora preferida</Label><Input name="preferred_at" type="datetime-local" required /></div>
              <div><Label>¿En qué te podemos ayudar? (opcional)</Label><Textarea name="message" /></div>
              <Button className="w-full">Enviar solicitud</Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
