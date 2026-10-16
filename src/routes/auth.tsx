import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Flore-ser Psicología" },
      { name: "description", content: "Accede a tu consulta en Flore-ser Psicología." },
      { property: "og:title", content: "Entrar — Flore-ser Psicología" },
      { property: "og:description", content: "Accede a tu consulta en Flore-ser Psicología." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => data.user && nav({ to: "/panel" }));
  }, [nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error("Correo o contraseña incorrectos");
    else nav({ to: "/panel" });
    setBusy(false);
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) toast.error("No se pudo iniciar con Google");
    else if (!r.redirected) nav({ to: "/panel" });
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex bg-hero text-sidebar-foreground p-12 items-end">
        <h1 className="text-5xl leading-tight">Bienvenido a<br />Flore-ser Psicología.</h1>
      </div>
      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm space-y-4">
          <h2 className="text-3xl">Iniciar sesión</h2>
          <div className="space-y-1"><Label>Correo</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="space-y-1"><Label>Contraseña</Label><Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <Button className="w-full" disabled={busy}>Entrar</Button>
          <Button type="button" variant="outline" className="w-full" onClick={google}>Continuar con Google</Button>
        </form>
      </div>
    </div>
  );
}
