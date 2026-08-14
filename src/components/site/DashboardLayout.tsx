import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Activity, CalendarCheck, ChartLine, CreditCard, Home, LogOut, Settings, Trophy,
  UsersRound, Menu, Bell, Search, Megaphone, Building2, ClipboardList,
  Sparkles, Heart, MessageSquare, TrendingUp, Wallet, Target, BarChart3,
  BookOpen, LayoutTemplate, Dumbbell, Award, ScanLine,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRole, ROLE_LABEL, type Role } from "@/lib/role";
import { apiData } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";

type NavItem = { icon: typeof Home; label: string; to: string };

/* Fallback: NAV_BY_ROLE statis (dipakai kalau /auth/menus belum tersedia) */
const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  owner: [
    { icon: Home, label: "Dashboard", to: "/dashboard" },
    { icon: UsersRound, label: "Athletes Overview", to: "/athletes" },
    { icon: Megaphone, label: "Coaches", to: "/coaches" },
    { icon: BookOpen, label: "Training Programs", to: "/programs" },
    { icon: Wallet, label: "Revenue", to: "/revenue" },
    { icon: ChartLine, label: "Reports", to: "/reports" },
    { icon: Settings, label: "Settings", to: "/settings" },
  ],
  admin: [
    { icon: Home, label: "Dashboard", to: "/dashboard" },
    { icon: UsersRound, label: "Athletes", to: "/athletes" },
    { icon: BookOpen, label: "Training Programs", to: "/programs" },
    { icon: LayoutTemplate, label: "Session Builder", to: "/session-builder" },
    { icon: Dumbbell, label: "Drill Library", to: "/drills" },
    { icon: Activity, label: "Training Sessions", to: "/training" },
    { icon: Target, label: "Skill Assessment", to: "/assessment" },
    { icon: ScanLine, label: "OCR Import", to: "/assessment/import" },
    { icon: Award, label: "Match Performance", to: "/match-performance" },
    { icon: BarChart3, label: "Assessment Insights", to: "/insights" },
    { icon: CreditCard, label: "Payments", to: "/payments" },
    { icon: CalendarCheck, label: "Schedule", to: "/schedule" },
    { icon: ChartLine, label: "Reports", to: "/reports" },
    { icon: Settings, label: "Settings", to: "/settings" },
  ],
  coach: [
    { icon: Home, label: "Dashboard", to: "/dashboard" },
    { icon: BookOpen, label: "Training Programs", to: "/programs" },
    { icon: LayoutTemplate, label: "Session Builder", to: "/session-builder" },
    { icon: Dumbbell, label: "Drill Library", to: "/drills" },
    { icon: Activity, label: "Training Sessions", to: "/training" },
    { icon: Target, label: "Skill Assessment", to: "/assessment" },
    { icon: ScanLine, label: "OCR Import", to: "/assessment/import" },
    { icon: Award, label: "Match Performance (PIR)", to: "/match-performance" },
    { icon: BarChart3, label: "Assessment Insights", to: "/insights" },
    { icon: UsersRound, label: "My Athletes", to: "/my-athletes" },
  ],
  parent: [
    { icon: Home, label: "Dashboard", to: "/dashboard" },
    { icon: TrendingUp, label: "Progress", to: "/progress" },
    { icon: CalendarCheck, label: "Schedule", to: "/schedule" },
    { icon: ClipboardList, label: "Attendance", to: "/attendance" },
    { icon: CreditCard, label: "Payments", to: "/payments" },
    { icon: MessageSquare, label: "Coach Feedback", to: "/coach-feedback" },
  ],
};

/* Map icon string dari API -> komponen lucide */
const ICON_MAP: Record<string, typeof Home> = {
  Home, UsersRound, Megaphone, BookOpen, Wallet, ChartLine, Settings,
  LayoutTemplate, Dumbbell, Activity, Target, ScanLine, Award, BarChart3,
  CreditCard, CalendarCheck, TrendingUp, ClipboardList, MessageSquare,
};

interface MenuApiItem { label: string; icon: string; to: string; permission: string | null }

const MENUS_CACHE_KEY = (role: Role) => `sportacademy.menus.${role}`;

function toNavItems(menus: MenuApiItem[]): NavItem[] {
  return menus
    .filter((m) => m.icon in ICON_MAP)
    .map((m) => ({ icon: ICON_MAP[m.icon] ?? Home, label: m.label, to: m.to }));
}

/**
 * Menu dinamis dari backend /auth/menus dengan cache localStorage.
 * Render langsung dari cache saat load (anti-blink), fetch async lalu update cache.
 * Fallback NAV_BY_ROLE hanya dipakai kalau belum ada cache & fetch gagal.
 */
function useDynamicMenus(role: Role): NavItem[] {
  const [cached, setCached] = useState<MenuApiItem[] | null>(null);

  // Baca cache segera (client-side only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(MENUS_CACHE_KEY(role));
      if (raw) setCached(JSON.parse(raw));
    } catch { /* ignore */ }
  }, [role]);

  const { data, isError } = useQuery({
    queryKey: ["menus", role],
    queryFn: async () => {
      const result = await apiData<{ role: Role; menus: MenuApiItem[] }>("/auth/menus");
      if (typeof window !== "undefined" && result?.menus?.length) {
        localStorage.setItem(MENUS_CACHE_KEY(role), JSON.stringify(result.menus));
      }
      return result;
    },
    staleTime: 60_000,
    retry: 1,
  });

  // 1) data segar dari fetch
  if (data?.menus?.length) return toNavItems(data.menus);
  // 2) cache lokal (render instan, identik dengan data asli — tidak blink)
  if (cached?.length) return toNavItems(cached);
  // 3) terakhir: fallback statis (hanya kalau fetch gagal & belum ada cache)
  if (isError) return NAV_BY_ROLE[role] ?? [];
  // 4) masih loading & belum ada cache: tampilkan kosong (hindari flash menu salah)
  return [];
}

function NavList({ pathname, role, onNav }: { pathname: string; role: Role; onNav?: () => void }) {
  const items = useDynamicMenus(role);
  // Normalisasi: hilangkan trailing slash supaya "/athletes/" === "/athletes"
  const current = pathname.replace(/\/+$/, "");

  const isActive = (to: string) => {
    const target = to.replace(/\/+$/, "");
    if (target === "/dashboard") return current === "/dashboard";
    // match persis atau prefix segmen (bukan substring): /assessment match /assessment/import,
    // TAPI /assessment TIDAK match /assessment-other
    return current === target || current.startsWith(`${target}/`);
  };

  return (
    <nav className="flex flex-col gap-1 p-4">
      {items.map((n) => {
        const active = isActive(n.to);
        return (
          <Link
            key={n.to}
            to={n.to}
            onClick={onNav}
            aria-current={active ? "page" : undefined}
            className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
              active
                ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground shadow-sm"
                : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
            }`}
          >
            {/* indikator aktif — bar kiri */}
            <span
              aria-hidden
              className={`absolute left-0 top-1/2 h-4 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-opacity ${
                active ? "opacity-100" : "opacity-0"
              }`}
            />
            <n.icon className={`h-4 w-4 ${active ? "text-primary" : ""}`} />
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Trophy className="h-4 w-4" />
      </div>
      <span className="font-display font-bold">SportAcademy</span>
    </div>
  );
}

const ROLE_ICON: Record<Role, typeof Building2> = {
  owner: Building2,
  admin: Settings,
  coach: Megaphone,
  parent: Heart,
};

/** Nama user dari backend /auth/me (fallback ke ROLE_USERS demo). */
function useUserInfo(role: Role) {
  const [name, setName] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("sportacademy.user");
    if (stored) setName(stored);
    apiData<{ profile?: { full_name?: string | null } }>("/auth/me")
      .then((me) => {
        if (me.profile?.full_name) {
          setName(me.profile.full_name);
          localStorage.setItem("sportacademy.user", me.profile.full_name);
        }
      })
      .catch(() => { /* fallback demo */ });
  }, [role]);
  return name;
}

export function DashboardLayout({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const role = useRole();
  const fullName = useUserInfo(role);
  const navigate = useNavigate();
  const fallbackName = fullName ?? "Demo User";
  const initials = fallbackName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "DU";

  const handleLogout = () => {
    // SignOut dari Supabase + hapus state & cache menu lokal
    void supabase.auth.signOut();
    localStorage.removeItem("sportacademy.role");
    localStorage.removeItem("sportacademy.academy");
    localStorage.removeItem("sportacademy.user");
    for (const r of ["owner", "admin", "coach", "parent"] as Role[]) {
      localStorage.removeItem(MENUS_CACHE_KEY(r));
    }
    navigate({ to: "/login" });
  };

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-border bg-sidebar lg:flex lg:flex-col">
        <Brand />
        <div className="px-4 pt-3">
          <Badge variant="secondary" className="gap-1 bg-primary-soft text-primary">
            <Sparkles className="h-3 w-3" /> {ROLE_LABEL[role]} View
          </Badge>
        </div>
        <NavList pathname={pathname} role={role} />
        <div className="mt-auto p-4">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-sidebar-accent/50">
            <LogOut className="h-4 w-4" /> Keluar
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <Brand />
                <NavList pathname={pathname} role={role} />
              </SheetContent>
            </Sheet>
            <div className="hidden md:block">
              <p className="text-xs text-muted-foreground">Akademi</p>
              <p className="text-sm font-semibold">SSB Garuda Muda</p>
            </div>
          </div>
          <div className="relative mx-auto hidden max-w-md flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Cari atlet, jadwal, atau laporan..." className="pl-9" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Badge variant="secondary" className="hidden gap-1 bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200 sm:inline-flex">
              <Sparkles className="h-3 w-3" /> Dev Branch
            </Badge>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full pl-1 pr-2 transition hover:bg-secondary">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="hidden text-left sm:block">
                    <p className="text-xs font-semibold leading-tight">{fallbackName}</p>
                    <p className="text-[10px] text-muted-foreground">{ROLE_LABEL[role]}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{fallbackName}</span>
                    <span className="text-xs font-normal text-muted-foreground">{ROLE_LABEL[role]}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings"><Settings className="mr-2 h-4 w-4" /> Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="container mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
