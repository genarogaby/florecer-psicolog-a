import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, CalendarDays, Users, Wallet, Inbox, LogOut } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    return { userId: data.user.id };
  },
  component: Layout,
});

const nav = [
  { to: "/panel", label: "Panel", icon: LayoutDashboard },
  { to: "/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/pacientes", label: "Pacientes", icon: Users },
  { to: "/pagos", label: "Pagos", icon: Wallet },
  { to: "/solicitudes", label: "Portal", icon: Inbox },
] as const;

function Layout() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-sidebar text-sidebar-foreground md:w-60 md:min-h-screen flex md:flex-col p-3 gap-1 overflow-x-auto">
        <div className="hidden md:block font-display text-2xl px-3 py-4">Sereno</div>
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
        <button
          onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/auth" }); }}
          className="md:mt-auto flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent shrink-0"
        >
          <LogOut className="h-4 w-4" /> Salir
        </button>
      </aside>
      <main className="flex-1 p-6 md:p-10 max-w-6xl">
        <Outlet />
      </main>
    </div>
  );
}
