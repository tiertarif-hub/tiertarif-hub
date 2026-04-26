import { Navigate, Outlet, NavLink, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard,
  Link2,
  Mail,
  Settings,
  LogOut,
  Loader2,
  Menu,
  X,
  UploadCloud,
  BarChart3,
  Globe,
  BookOpen,
  Smartphone,
  Handshake,
  Network,
  ChevronRight,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Partner & Angebote", icon: Handshake, path: "/admin/projects" },
  { label: "Apps & Deals", icon: Smartphone, path: "/admin/apps" },
  { label: "Seiten & Hubs", icon: Network, path: "/admin/categories" },
  { label: "Magazin", icon: BookOpen, path: "/admin/forum" },
  { label: "Massen-Generator", icon: UploadCloud, path: "/admin/multi-publisher" },
  { label: "Redirects", icon: BarChart3, path: "/admin/redirects" },
  { label: "Footer-Links", icon: Link2, path: "/admin/footer-links" },
  { label: "Über uns", icon: Users, path: "/admin/about" },
  { label: "Leads", icon: Mail, path: "/admin/leads" },
  { label: "Einstellungen", icon: Settings, path: "/admin/settings" },
];

export default function AdminLayout() {
  const { user, isLoading, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: isServerAdmin, isLoading: isVerifyingAdmin } = useQuery({
    queryKey: ["verify-admin", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("verify_admin_access");
      if (error) {
        console.error("Admin verification failed:", error);
        return false;
      }
      return data === true;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading || isVerifyingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#0E1F53]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isServerAdmin) {
    return <Navigate to="/" replace />;
  }

  const currentTitle =
    navItems.find((item) =>
      item.path === "/admin"
        ? location.pathname === "/admin"
        : location.pathname.startsWith(item.path)
    )?.label || "Dashboard";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-h-screen">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-[290px] flex-col border-r border-white/10 bg-[#0E1F53] text-white shadow-2xl transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:overflow-y-auto",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-24 items-center justify-between border-b border-white/10 px-6">
            <Link to="/admin" className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF8400] shadow-lg shadow-[#FF8400]/30">
                <span className="text-lg font-black text-white">R</span>
              </div>
              <div>
                <div className="text-lg font-black tracking-tight">Portal</div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-300">
                  Premium Admin
                </div>
              </div>
            </Link>

            <button
              className="rounded-xl p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 pt-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300">
                <ShieldCheck className="h-4 w-4 text-[#FF8400]" />
                Kontrollzentrum
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">
                Struktur, Kontrolle und schnelle Aktionen für alle Portal-Bereiche.
              </p>
            </div>
          </div>

          <nav className="space-y-2 px-4 py-6">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all duration-200",
                    isActive
                      ? "bg-white text-[#0E1F53] shadow-lg"
                      : "text-slate-200 hover:bg-white/10 hover:text-white"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                        isActive
                          ? "bg-[#FF8400]/15 text-[#FF8400]"
                          : "bg-white/5 text-slate-300 group-hover:bg-white/10 group-hover:text-white"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="flex-1">{item.label}</span>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isActive
                          ? "text-[#FF8400]"
                          : "text-slate-400 group-hover:translate-x-0.5 group-hover:text-white"
                      )}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="sticky bottom-0 mt-auto border-t border-white/10 bg-[#0E1F53]/95 p-4 backdrop-blur">
            <div className="rounded-2xl bg-white/5 p-4">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 border border-white/10 text-sm font-black text-white">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{user.email}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Admin aktiv
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Link to="/">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start rounded-xl text-slate-200 hover:bg-white/10 hover:text-white"
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Zur Website
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="w-full justify-start rounded-xl text-red-200 hover:bg-red-500/10 hover:text-red-100"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Abmelden
                </Button>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md lg:hidden">
            <div className="flex h-16 items-center justify-between px-4">
              <button
                className="rounded-xl border border-slate-200 p-2 text-[#0E1F53]"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="text-base font-black text-[#0E1F53]">Portal Admin</div>
              <div className="h-10 w-10 rounded-xl bg-[#FF8400]" />
            </div>
          </header>

          <div className="hidden lg:block sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-md">
            <div className="flex h-20 items-center justify-between px-8">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Admin / Übersicht
                </div>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-[#0E1F53]">
                  {currentTitle}
                </h1>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#FF8400]">
                <ShieldCheck className="h-4 w-4" />
                B2B Control Mode
              </div>
            </div>
          </div>

          <div className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-[1680px]">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
