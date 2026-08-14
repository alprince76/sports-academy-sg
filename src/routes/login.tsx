import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Settings, Megaphone, Users, Trophy, ArrowRight, Sparkles, LogIn } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/useAuth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — SportAcademy" }] }),
  component: LoginPage,
});

const DEMO_ACCOUNTS = [
  { role: "owner", email: "owner@local.dev", label: "Academy Owner", icon: Building2, accent: "from-emerald-500 to-emerald-700" },
  { role: "admin", email: "admin@local.dev", label: "Admin", icon: Settings, accent: "from-emerald-400 to-emerald-600" },
  { role: "coach", email: "coach@local.dev", label: "Coach", icon: Megaphone, accent: "from-emerald-500 to-teal-600" },
  { role: "parent", email: "parent@local.dev", label: "Parent", icon: Users, accent: "from-emerald-400 to-green-600" },
];

const DEMO_PASSWORD = "Xk9#mQ2$vL7pWz4!";

function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const doLogin = async (em: string, pw: string) => {
    setBusy(true);
    try {
      await signIn(em, pw);
      toast.success("Login berhasil");
      navigate({ to: "/dashboard" });
    } catch (e: any) {
      toast.error(e?.message ?? "Login gagal");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-secondary/30">
      <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "var(--gradient-hero, none)" }} />
      <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Trophy className="h-4 w-4" />
            </div>
            <span className="font-display text-lg font-bold">SportAcademy</span>
          </div>
          <Badge variant="secondary" className="gap-1 bg-primary-soft text-primary">
            <Sparkles className="h-3 w-3" /> Dev Branch
          </Badge>
        </div>

        <div className="mx-auto mt-10 max-w-md">
          <Card className="border-border/70 shadow-elevated">
            <CardContent className="p-6">
              <h1 className="font-display text-2xl font-bold tracking-tight">
                Masuk ke <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">SportAcademy</span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">Login via Supabase Auth (local dev)</p>

              <form
                className="mt-6 grid gap-4"
                onSubmit={(e) => { e.preventDefault(); doLogin(email, password); }}
              >
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@local.dev" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                </div>
                <Button type="submit" disabled={busy} className="w-full">
                  <LogIn className="mr-1 h-4 w-4" /> {busy ? "Memproses..." : "Masuk"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8">
            <p className="mb-3 text-center text-xs uppercase tracking-widest text-muted-foreground">
              Quick login (akun demo ter-seed di Supabase local)
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {DEMO_ACCOUNTS.map(({ role, email: em, label, icon: Icon, accent }) => (
                <button
                  key={role}
                  onClick={() => doLogin(em, DEMO_PASSWORD)}
                  disabled={busy}
                  className="group flex items-center gap-3 rounded-xl border border-border/70 bg-background p-3.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-elevated"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="truncate font-mono text-[11px] text-muted-foreground">{em}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
