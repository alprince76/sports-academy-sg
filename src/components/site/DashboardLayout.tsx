import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Activity, CalendarCheck, ChartLine, CreditCard, Home, LogOut, Settings, Trophy,
  UsersRound, Menu, Bell, Search, Megaphone, Building2, ClipboardCheck, ClipboardList,
  Sparkles, Heart, MessageSquare, TrendingUp, Wallet, Target, BarChart3,
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
import { useRole, setRole, clearRole, ROLE_USERS, ROLE_LABEL, type Role } from "@/lib/role";

type NavItem = { icon: typeof Home; label: string; to: string };

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  owner: [
    { icon: Home, label: "Dashboard", to: "/dashboard" },
    { icon: UsersRound, label: "Athletes Overview", to: "/athletes" },
    { icon: Megaphone, label: "Coaches", to: "/coaches" },
    { icon: Wallet, label: "Revenue", to: "/revenue" },
    { icon: ChartLine, label: "Reports", to: "/reports" },
    { icon: Settings, label: "Settings", to: "/settings" },
  ],
  admin: [
    { icon: Home, label: "Dashboard", to: "/dashboard" },
    { icon: UsersRound, label: "Athletes", to: "/athletes" },
    { icon: Activity, label: "Training", to: "/training" },
    { icon: CalendarCheck, label: "Schedule", to: "/schedule" },
    { icon: CreditCard, label: "Payments", to: "/payments" },
    { icon: ChartLine, label: "Reports", to: "/reports" },
    { icon: Target, label: "Athlete Assessment", to: "/assessment" },
    { icon: BarChart3, label: "Assessment Insights", to: "/insights" },
    { icon: Settings, label: "Settings", to: "/settings" },
  ],
  coach: [
    { icon: Home, label: "Dashboard", to: "/dashboard" },
    { icon: UsersRound, label: "My Athletes", to: "/my-athletes" },
    { icon: Activity, label: "Training Sessions", to: "/training" },
    { icon: ClipboardCheck, label: "Attendance", to: "/attendance" },
    { icon: ClipboardList, label: "Evaluations", to: "/evaluations" },
    { icon: BarChart3, label: "Assessment Insights", to: "/insights" },
  ],
  parent: [
    { icon: Home, label: "Dashboard", to: "/dashboard" },
    { icon: TrendingUp, label: "Progress", to: "/progress" },
    { icon: CalendarCheck, label: "Schedule", to: "/schedule" },
    { icon: ClipboardCheck, label: "Attendance", to: "/attendance" },
    { icon: CreditCard, label: "Payments", to: "/payments" },
    { icon: MessageSquare, label: "Coach Feedback", to: "/coach-feedback" },
  ],
};

function NavList({ pathname, role, onNav }: { pathname: string; role: Role; onNav?: () => void }) {
  const items = NAV_BY_ROLE[role];
  return (
    <nav className="flex flex-col gap-1 p-4">
      {items.map((n) => {
        const active = pathname === n.to || (n.to !== "/dashboard" && pathname.startsWith(n.to));
        return (
          <Link
            key={n.to}
            to={n.to}
            onClick={onNav}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
            }`}
          >
            <n.icon className="h-4 w-4" />
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
  const user = ROLE_USERS[role];
  const navigate = useNavigate();

  const handleSwitch = (r: Role) => {
    setRole(r);
    navigate({ to: "/dashboard" });
  };

  const handleLogout = () => {
    clearRole();
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
            <LogOut className="h-4 w-4" /> Keluar Demo
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
              <Sparkles className="h-3 w-3" /> Demo Mode Active
            </Badge>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full pl-1 pr-2 transition hover:bg-secondary">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground">{user.initials}</AvatarFallback>
                  </Avatar>
                  <div className="hidden text-left sm:block">
                    <p className="text-xs font-semibold leading-tight">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground">{ROLE_LABEL[role]}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">{user.title}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Sparkles className="mr-2 h-4 w-4" /> Switch Role
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {(Object.keys(ROLE_USERS) as Role[]).map((r) => {
                      const Icon = ROLE_ICON[r];
                      return (
                        <DropdownMenuItem key={r} onClick={() => handleSwitch(r)}>
                          <Icon className="mr-2 h-4 w-4" /> {ROLE_LABEL[r]}
                          {r === role && <Badge variant="secondary" className="ml-auto bg-primary-soft text-[10px] text-primary">Current</Badge>}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem asChild>
                  <Link to="/settings"><Settings className="mr-2 h-4 w-4" /> Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Exit Demo
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
