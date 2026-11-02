import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, CalendarDays, Users, Wallet, Inbox, Settings } from "lucide-react";

// Perfil único de la consulta: la app no usa cuentas, todos los datos
// pertenecen a este identificador fijo.
export const OWNER_ID = "00000000-0000-0000-0000-000000000001";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: () => ({ userId: OWNER_ID }),
  component: Layout,
});

const nav = [
  { to: "/panel", label: "Panel", icon: LayoutDashboard },
  { to: "/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/pacientes", label: "Pacientes", icon: Users },
  { to: "/pagos", label: "Pagos", icon: Wallet },
  { to: "/solicitudes", label: "Portal", icon: Inbox },
  { to: "/ajustes", label: "Ajustes", icon: Settings },
] as const;

function Layout() {
  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-sidebar text-sidebar-foreground md:w-60 md:min-h-screen flex md:flex-col p-3 gap-1 overflow-x-auto">
        <div className="hidden md:block font-display text-2xl px-3 py-4">Flore-ser Psicología</div>
        {nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent shrink-0"
            activeProps={{ className: "bg-sidebar-accent text-sidebar-primary" }}
          >
            <n.icon className="h-4 w-4" /> {n.label}
          </Link>
        ))}
      </aside>
      <main className="flex-1 p-6 md:p-10 max-w-6xl">
        <Outlet />
      </main>
    </div>
  );
}
