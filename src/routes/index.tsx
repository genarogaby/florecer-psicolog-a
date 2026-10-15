import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CalendarDays, FileText, Wallet, Globe } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sereno — Software para psicólogos" },
      { name: "description", content: "Agenda, expedientes clínicos, cobros y portal de reservas en línea para tu consulta." },
      { property: "og:title", content: "Sereno — Software para psicólogos" },
      { property: "og:description", content: "Gestiona tu consulta de psicología en un solo lugar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const features = [
  { icon: CalendarDays, t: "Agenda", d: "Citas presenciales y en línea, organizadas por semana." },
  { icon: FileText, t: "Expedientes", d: "Historia clínica y notas de cada sesión, privadas." },
  { icon: Wallet, t: "Cobros", d: "Registra pagos y conoce el saldo de cada paciente." },
  { icon: Globe, t: "Portal", d: "Tus pacientes solicitan cita desde un enlace propio." },
];

function Index() {
  return (
    <div className="min-h-screen">
      <section className="bg-hero text-sidebar-foreground">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
          <span className="font-display text-2xl">Sereno</span>
          <Button asChild variant="secondary"><Link to="/auth">Entrar</Link></Button>
        </div>
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-28">
          <h1 className="text-5xl md:text-7xl max-w-3xl leading-[1.05]">Tu consulta, en calma y en orden.</h1>
          <p className="mt-6 max-w-xl text-lg opacity-80">
            Agenda, expedientes clínicos, cobros y reservas en línea. Todo lo que un psicólogo necesita, sin complicaciones.
          </p>
          <Button asChild size="lg" className="mt-10 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90">
            <Link to="/auth">Comenzar gratis</Link>
          </Button>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 -mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pb-24">
        {features.map((f) => (
          <div key={f.t} className="rounded-2xl bg-card p-6 shadow-soft">
            <f.icon className="h-6 w-6 text-primary" />
            <h3 className="mt-4 text-xl">{f.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
