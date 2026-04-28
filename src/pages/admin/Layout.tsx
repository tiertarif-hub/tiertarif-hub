import { Navigate, Outlet, NavLink, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  LogOut,
  Loader2,
  Menu,
  X,
  UploadCloud,
  Globe,
  BookOpen,
  Smartphone,
  Handshake,
  Network,
  ChevronRight,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useFeatureToggles, type FeatureToggles } from "@/hooks/useSettings";

type AdminNavItem = {
  label: string;
  icon: LucideIcon;
  path: string;
  feature?: keyof FeatureToggles;
};

const navItems: AdminNavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Partner & Angebote", icon: Handshake, path: "/admin/projects", feature: "has_projects" },
  { label: "Apps & Deals", icon: Smartphone, path: "/admin/apps", feature: "has_apps" },
  { label: "Seiten & Hubs", icon: Network, path: "/admin/categories", feature: "has_pages" },
  { label: "Ratgeber / Magazin", icon: BookOpen, path: "/admin/forum", feature: "has_magazine" },
  { label: "Massen-Generator", icon: UploadCloud, path: "/admin/multi-publisher", feature: "has_mass_generator" },
  { label: "Redirects", icon: BarChart3, path: "/admin/redirects", feature: "has_redirects" },
  { label: "Über uns", icon: Users, path: "/admin/about", feature: "has_about" },
  { label: "Einstellungen", icon: Settings, path: "/admin/settings" },
];

export default function AdminLayout() {
  const { user, isLoading, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const featureToggles = useFeatureToggles();

  const enabledNavItems = navItems.filter((item) => !item.feature || featureToggles[item.feature]);

  const { data: isServerAdmin, isLoading: isVerifyingAdmin } = useQuery({
    queryKey: ["verify-admin-role", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "ADMIN")
        .maybeSingle();

      if (error) {
        return false;
      }

      return data?.role === "ADMIN";
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  if (isLoading || isVerifyingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
    enabledNavItems.find((item) =>
      item.path === "/admin"
        ? location.pathname === "/admin"
        : location.pathname.startsWith(item.path)
    )?.label || "Dashboard";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-h-screen">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-[290px] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:overflow-y-auto",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-24 items-center justify-between border-b border-sidebar-border px-6">
            <Link to="/admin" className="flex items-center gap-4">
              <div className="tt-coral-shine flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg shadow-black/15">
                <span className="text-lg font-black text-sidebar-primary-foreground">T</span>
              </div>
              <div>
                <div className="text-lg font-black tracking-tight">TierTarif</div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-sidebar-foreground/70">
                  Premium Admin
                </div>
              </div>
            </Link>

            <button
              className="rounded-xl p-2 text-sidebar-foreground/70 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 pt-6">
            <div className="rounded-2xl border border-sidebar-border bg-white/5 p-4">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/70">
                <ShieldCheck className="h-4 w-4 text-sidebar-primary" />
                TierTarif Control
              </div>
              <p className="mt-2 text-sm leading-relaxed text-sidebar-foreground/82">
                Theme, Module und Inhalte für das Tierversicherungs-Portal sauber steuern.
              </p>
            </div>
          </div>

          <nav className="space-y-2 px-4 py-6">
            {enabledNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all duration-200",
                    isActive
                      ? "bg-white text-primary shadow-lg ring-1 ring-secondary/20"
                      : "text-sidebar-foreground/82 hover:bg-white/10 hover:text-white"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                        isActive
                          ? "bg-secondary/20 text-secondary shadow-sm"
                          : "bg-white/5 text-sidebar-foreground/70 group-hover:bg-white/10 group-hover:text-white"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="flex-1">{item.label}</span>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isActive
                          ? "text-primary"
                          : "text-sidebar-foreground/50 group-hover:translate-x-0.5 group-hover:text-white"
                      )}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="sticky bottom-0 mt-auto border-t border-sidebar-border bg-sidebar/95 p-4 backdrop-blur">
            <div className="rounded-2xl bg-white/5 p-4">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 border border-white/10 text-sm font-black text-white">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{user.email}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-sidebar-foreground/70">
                    <span className="h-2 w-2 rounded-full bg-secondary" />
                    Admin aktiv
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Link to="/">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start rounded-xl text-sidebar-foreground/82 hover:bg-white/10 hover:text-white"
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Zur Website
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="w-full justify-start rounded-xl text-red-100 hover:bg-red-500/10 hover:text-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Abmelden
                </Button>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-border bg-card/92 backdrop-blur-md lg:hidden">
            <div className="flex h-16 items-center justify-between px-4">
              <button
                className="rounded-xl border border-border p-2 text-primary"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="text-base font-black text-secondary">TierTarif Admin</div>
              <div className="tt-coral-shine flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black">
                T
              </div>
            </div>
          </header>

          <div className="hidden lg:block sticky top-0 z-20 border-b border-border bg-card/92 backdrop-blur-md">
            <div className="flex h-20 items-center justify-between px-8">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  TierTarif / Admin
                </div>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-secondary">
                  {currentTitle}
                </h1>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-secondary/35 bg-secondary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-secondary shadow-sm shadow-secondary/10">
                <ShieldCheck className="h-4 w-4" />
                Trust Vet Control
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
