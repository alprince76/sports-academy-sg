import { Link, useRouterState } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Activity, CalendarCheck, ChartLine, CreditCard,
  Home, LogOut, Settings, Trophy, UsersRound, Menu, Bell, Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { ReactNode } from "react";

const NAV = [
  { icon: Home, label: "Dashboard", to: "/dashboard" },
  { icon: UsersRound, label: "Athletes", to: "/athletes" },
  { icon: Activity, label: "Training", to: "/training" },
  { icon: CalendarCheck, label: "Schedule", to: "/schedule" },
  { icon: CreditCard, label: "Payments", to: "/payments" },
  { icon: ChartLine, label: "Reports", to: "/reports" },
  { icon: Settings, label: "Settings", to: "/settings" },
] as const;

function NavList({ pathname, onNav }: { pathname: string; onNav?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 p-4">
      {NAV.map((n) => {
        const active = pathname === n.to;
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

  return (
    <div className="flex min-h-screen bg-secondary/30">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-border bg-sidebar lg:flex lg:flex-col">
        <Brand />
        <NavList pathname={pathname} />
        <div className="mt-auto p-4">
          <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-sidebar-accent/50">
            <LogOut className="h-4 w-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
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
                <NavList pathname={pathname} />
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
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
            </Button>
            <Badge variant="secondary" className="hidden bg-primary-soft text-primary sm:inline-flex">Pro Plan</Badge>
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground">BA</AvatarFallback>
            </Avatar>
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
