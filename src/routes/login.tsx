import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Settings, Megaphone, Users, Trophy, ArrowRight, Sparkles } from "lucide-react";
import { setRole, type Role, ROLE_USERS } from "@/lib/role";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Demo Login — SportAcademy" }] }),
  component: LoginPage,
});

const ROLES: {
  role: Role;
  icon: typeof Building2;
  desc: string;
  cta: string;
  accent: string;
}[] = [
  {
    role: "owner",
    icon: Building2,
    desc: "Manage academy operations, revenue, coaches, and athlete development.",
    cta: "Enter as Academy Owner",
    accent: "from-emerald-500 to-emerald-700",
  },
  {
    role: "admin",
    icon: Settings,
    desc: "Manage athletes, schedules, memberships, and academy administration.",
    cta: "Enter as Admin",
    accent: "from-emerald-400 to-emerald-600",
  },
  {
    role: "coach",
    icon: Megaphone,
    desc: "Track attendance, training sessions, and athlete performance.",
    cta: "Enter as Coach",
    accent: "from-emerald-500 to-teal-600",
  },
  {
    role: "parent",
    icon: Users,
    desc: "Monitor your child's progress, attendance, and coach feedback.",
    cta: "Enter as Parent",
    accent: "from-emerald-400 to-green-600",
  },
];

function LoginPage() {
  const navigate = useNavigate();

  const enter = (role: Role) => {
    setRole(role);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-secondary/30">
      <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "var(--gradient-hero, none)" }} />
      <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-20">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Trophy className="h-4 w-4" />
            </div>
            <span className="font-display text-lg font-bold">SportAcademy</span>
          </Link>
          <Badge variant="secondary" className="gap-1 bg-primary-soft text-primary">
            <Sparkles className="h-3 w-3" /> Demo Mode
          </Badge>
        </div>

        <div className="mx-auto mt-12 max-w-2xl text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Welcome to <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">SportAcademy</span>
          </h1>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            Choose a role to explore the platform
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map(({ role, icon: Icon, desc, cta, accent }) => {
            const u = ROLE_USERS[role];
            return (
              <Card
                key={role}
                className="group cursor-pointer overflow-hidden border-border/70 transition-all hover:-translate-y-1 hover:shadow-elevated"
                onClick={() => enter(role)}
              >
                <CardContent className="flex h-full flex-col p-6">
                  <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-md`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-bold">{u.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Demo as {u.name}</p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                  <Button
                    className="mt-5 w-full group-hover:bg-primary/90"
                    onClick={(e) => { e.stopPropagation(); enter(role); }}
                  >
                    {cta}
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          No password required · Switch roles anytime from the profile menu
        </p>
      </div>
    </div>
  );
}
