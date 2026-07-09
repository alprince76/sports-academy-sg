import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Activity, ArrowUpRight, CalendarCheck, CreditCard, Trophy, UsersRound,
  Wallet, TrendingUp, ClipboardCheck, ClipboardList, MessageSquare, Plus,
  FileBarChart, Download, Megaphone, Award, Star, HeartPulse,
} from "lucide-react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { useRole, ROLE_USERS } from "@/lib/role";
import { ATHLETES, getInjurySummary, healthStatusColor, HEALTH_STATUSES } from "@/lib/demo-data";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — SportAcademy" }] }),
  component: Dashboard,
});

function Dashboard() {
  const role = useRole();
  const user = ROLE_USERS[role];

  if (role === "owner") return <OwnerDashboard userName={user.name} />;
  if (role === "coach") return <CoachDashboard userName={user.name} />;
  if (role === "parent") return <ParentDashboard userName={user.name} />;
  return <AdminDashboard userName={user.name} />;
}

/* ---------- Shared bits ---------- */
function StatCard({ label, value, change, icon: Icon, tone = "primary" }: { label: string; value: string; change?: string; icon: typeof Activity; tone?: "primary" | "amber" }) {
  return (
    <Card className="border-border/70 transition-all hover:shadow-elevated">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone === "amber" ? "bg-amber-100 text-amber-700" : "bg-primary-soft text-primary"}`}>
            <Icon className="h-5 w-5" />
          </div>
          {change && (
            <Badge variant="secondary" className="gap-1 bg-primary-soft text-primary">
              <ArrowUpRight className="h-3 w-3" /> {change}
            </Badge>
          )}
        </div>
        <p className="mt-5 text-xs text-muted-foreground">{label}</p>
        <p className="font-display text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function QuickActions({ actions }: { actions: { label: string; icon: typeof Plus; onClick?: () => void; to?: string }[] }) {
  return (
    <Card className="border-border/70">
      <CardContent className="p-6">
        <h2 className="font-display text-lg font-semibold">Quick Actions</h2>
        <div className="mt-4 grid gap-2">
          {actions.map((a) => {
            const inner = (
              <>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <a.icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium">{a.label}</span>
                <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </>
            );
            return a.to ? (
              <Link key={a.label} to={a.to} className="flex items-center gap-3 rounded-xl border border-border p-3 transition hover:bg-secondary/50">
                {inner}
              </Link>
            ) : (
              <button key={a.label} onClick={a.onClick} className="flex items-center gap-3 rounded-xl border border-border p-3 text-left transition hover:bg-secondary/50">
                {inner}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function BarChart({ data, title, subtitle }: { data: { label: string; value: number }[]; title: string; subtitle?: string }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <Card className="border-border/70">
      <CardContent className="p-6">
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
        <div className="mt-6 flex h-32 items-end justify-between gap-2">
          {data.map((d) => (
            <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
              <div className="w-full rounded-t-md bg-gradient-to-t from-primary to-emerald-400 transition-all hover:opacity-80" style={{ height: `${(d.value / max) * 100}%` }} />
              <span className="text-xs text-muted-foreground">{d.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function LineChart({ title, subtitle, points, max = 100 }: { title: string; subtitle?: string; points: number[]; max?: number }) {
  const w = 300, h = 100;
  const path = points.map((p, i) => `${(i / (points.length - 1)) * w},${h - (p / max) * h}`).join(" ");
  return (
    <Card className="border-border/70">
      <CardContent className="p-6">
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
        <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 h-32 w-full">
          <defs>
            <linearGradient id="lg" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={`0,${h} ${path} ${w},${h}`} fill="url(#lg)" />
          <polyline points={path} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
        </svg>
      </CardContent>
    </Card>
  );
}

/* ---------- OWNER ---------- */
function OwnerDashboard({ userName }: { userName: string }) {
  return (
    <DashboardLayout title={`Selamat datang, ${userName} 👋`} subtitle="Ringkasan bisnis akademi Anda.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Athletes" value="128" change="+12" icon={UsersRound} />
        <StatCard label="Active Coaches" value="8" change="+1" icon={Megaphone} />
        <StatCard label="Monthly Revenue" value="Rp 48,2jt" change="+18%" icon={Wallet} />
        <StatCard label="Attendance Rate" value="92%" change="+4%" icon={CalendarCheck} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <StatCard label="Membership Growth" value="+12%" change="MoM" icon={TrendingUp} />
        <Card className="border-border/70 bg-gradient-to-br from-primary-soft/50 to-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-2"><Trophy className="h-5 w-5 text-primary" /><h2 className="font-display text-lg font-semibold">Top Teams</h2></div>
            <div className="mt-4 space-y-2">
              {[
                { t: "U-14 A", w: 8, score: 92 }, { t: "U-12 A", w: 7, score: 88 }, { t: "U-14 B", w: 6, score: 85 },
              ].map((t, i) => (
                <div key={t.t} className="flex items-center gap-3 rounded-lg bg-card p-2.5 border border-border">
                  <span className="text-lg">{["🥇","🥈","🥉"][i]}</span>
                  <div className="flex-1"><p className="text-sm font-semibold">{t.t}</p><p className="text-xs text-muted-foreground">{t.w} wins this season</p></div>
                  <span className="font-display text-lg font-bold text-primary">{t.score}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-6 md:grid-cols-2">
          <LineChart title="Revenue Trend" subtitle="6 bulan terakhir (Rp jt)" points={[32, 35, 38, 41, 44, 48]} max={60} />
          <LineChart title="Athlete Growth" subtitle="6 bulan terakhir" points={[92, 98, 105, 112, 120, 128]} max={150} />
        </div>
        <QuickActions actions={[
          { label: "View Reports", icon: FileBarChart, to: "/reports" },
          { label: "Revenue Analytics", icon: Wallet, to: "/revenue" },
          { label: "Export Academy Summary", icon: Download, onClick: () => toast.success("Summary exported (demo)") },
        ]} />
      </div>
    </DashboardLayout>
  );
}

/* ---------- ADMIN ---------- */
function AdminDashboard({ userName }: { userName: string }) {
  return (
    <DashboardLayout title={`Hi, ${userName} 👋`} subtitle="Operasional akademi hari ini." actions={<Button asChild><Link to="/athletes"><Plus className="mr-1 h-4 w-4" />Add Athlete</Link></Button>}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Athletes" value="128" change="+12" icon={UsersRound} />
        <StatCard label="Today's Training" value="5 sesi" icon={Activity} />
        <StatCard label="Upcoming Events" value="3" icon={CalendarCheck} />
        <StatCard label="Pending Payments" value="9" change="-2" icon={CreditCard} tone="amber" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="border-border/70 lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div><h2 className="font-display text-lg font-semibold">Today's Training</h2><p className="text-xs text-muted-foreground">5 sesi terjadwal</p></div>
              <Button asChild variant="ghost" size="sm" className="text-primary"><Link to="/training">Lihat semua</Link></Button>
            </div>
            <div className="mt-5 space-y-3">
              {[
                { time: "16:00", title: "Latihan U-12 A", coach: "Coach Bayu", attendees: 18 },
                { time: "17:30", title: "Latihan U-14 B", coach: "Coach Andre", attendees: 16 },
                { time: "18:00", title: "GK Specialist", coach: "Coach Dito", attendees: 6 },
              ].map((u, i) => (
                <div key={i} className="flex items-center gap-4 rounded-xl border border-border p-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft font-display text-sm font-bold text-primary">{u.time}</div>
                  <div className="flex-1"><p className="text-sm font-semibold">{u.title}</p><p className="text-xs text-muted-foreground">{u.coach} · {u.attendees} atlet</p></div>
                  <Badge variant="secondary" className="bg-primary-soft text-primary">Scheduled</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <QuickActions actions={[
          { label: "Add Athlete", icon: Plus, to: "/athletes" },
          { label: "Create Schedule", icon: CalendarCheck, to: "/schedule" },
          { label: "Register Payment", icon: CreditCard, to: "/payments" },
          { label: "Assign Coach", icon: Megaphone, onClick: () => toast.success("Coach assigned (demo)") },
        ]} />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <BarChart title="Attendance Today" subtitle="Per tim" data={[
          { label: "U-10", value: 86 }, { label: "U-12A", value: 94 }, { label: "U-12B", value: 78 },
          { label: "U-14A", value: 91 }, { label: "U-14B", value: 88 },
        ]} />
        <Card className="border-border/70">
          <CardContent className="p-6">
            <h2 className="font-display text-lg font-semibold">Atlet Aktif</h2>
            <div className="mt-4 space-y-3">
              {ATHLETES.slice(0, 4).map((a) => (
                <Link key={a.id} to="/athletes/$athleteId" params={{ athleteId: a.id }} className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-secondary/50">
                  <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary-soft text-xs text-primary">{a.name.split(" ").map(p=>p[0]).join("").slice(0,2)}</AvatarFallback></Avatar>
                  <div className="flex-1"><p className="text-sm font-medium">{a.name}</p><p className="text-xs text-muted-foreground">{a.team} · {a.position}</p></div>
                  <Badge variant="secondary" className="bg-primary-soft text-primary">{a.progress}</Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

/* ---------- COACH ---------- */
function CoachDashboard({ userName }: { userName: string }) {
  return (
    <DashboardLayout title={`Halo, ${userName} 👋`} subtitle="Aktivitas lapangan & evaluasi hari ini.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today's Sessions" value="3" icon={Activity} />
        <StatCard label="Athletes Assigned" value="24" icon={UsersRound} />
        <StatCard label="Pending Evaluations" value="6" icon={ClipboardList} tone="amber" />
        <StatCard label="Attendance Today" value="92%" change="+3%" icon={ClipboardCheck} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="border-border/70 lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="font-display text-lg font-semibold">Today's Sessions</h2>
            <div className="mt-4 space-y-3">
              {[
                { id: "1", time: "16:00", title: "Latihan Teknik U-12 A", attendees: 18 },
                { id: "4", time: "17:30", title: "Game Situational U-10", attendees: 14 },
                { id: "5", time: "19:00", title: "GK Specific Training", attendees: 6 },
              ].map((s) => (
                <Link key={s.id} to="/training/$sessionId" params={{ sessionId: s.id }} className="flex items-center gap-4 rounded-xl border border-border p-3 transition hover:bg-secondary/50">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft font-display text-sm font-bold text-primary">{s.time}</div>
                  <div className="flex-1"><p className="text-sm font-semibold">{s.title}</p><p className="text-xs text-muted-foreground">{s.attendees} atlet hadir terdaftar</p></div>
                  <Button size="sm" variant="secondary">Start</Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
        <QuickActions actions={[
          { label: "Start Session", icon: Activity, to: "/training" },
          { label: "Take Attendance", icon: ClipboardCheck, to: "/attendance" },
          { label: "Submit Evaluation", icon: ClipboardList, to: "/evaluations" },
        ]} />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <BarChart title="Attendance Summary" subtitle="Minggu ini" data={[
          { label: "Sen", value: 88 }, { label: "Sel", value: 92 }, { label: "Rab", value: 85 },
          { label: "Kam", value: 95 }, { label: "Jum", value: 90 }, { label: "Sab", value: 96 },
        ]} />
        <Card className="border-border/70">
          <CardContent className="p-6">
            <h2 className="font-display text-lg font-semibold">My Athletes</h2>
            <div className="mt-4 space-y-3">
              {ATHLETES.slice(0, 4).map((a) => (
                <Link key={a.id} to="/athletes/$athleteId" params={{ athleteId: a.id }} className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-secondary/50">
                  <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary-soft text-xs text-primary">{a.name.split(" ").map(p=>p[0]).join("").slice(0,2)}</AvatarFallback></Avatar>
                  <div className="flex-1"><p className="text-sm font-medium">{a.name}</p><p className="text-xs text-muted-foreground">{a.team} · {a.position}</p></div>
                  <span className="font-display text-sm font-bold text-primary">{a.progress}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

/* ---------- PARENT ---------- */
function ParentDashboard({ userName }: { userName: string }) {
  const child = ATHLETES.find((a) => a.name === "Aldi Setiawan")!;
  return (
    <DashboardLayout title={`Hi ${userName} 👋`} subtitle={`Perkembangan ${child.name} (${child.team}, ${child.position})`}>
      <Card className="mb-6 overflow-hidden border-border/70 bg-gradient-to-br from-primary-soft/60 via-card to-card">
        <CardContent className="flex flex-wrap items-center gap-6 p-6">
          <Avatar className="h-16 w-16 ring-4 ring-primary/20"><AvatarFallback className="bg-primary text-lg text-primary-foreground">AS</AvatarFallback></Avatar>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Your Child</p>
            <h2 className="font-display text-xl font-bold">{child.name}</h2>
            <p className="text-sm text-muted-foreground">{child.age} tahun · {child.team} · {child.position}</p>
          </div>
          <Button asChild><Link to="/athletes/$athleteId" params={{ athleteId: child.id }}>View Full Profile</Link></Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Performance Score" value={`${child.progress}`} change="+5" icon={TrendingUp} />
        <StatCard label="Attendance" value={`${child.attendance}%`} change="+2%" icon={ClipboardCheck} />
        <StatCard label="Achievements" value={`${child.achievements.length}`} icon={Award} />
        <StatCard label="Upcoming Training" value="3 sesi" icon={CalendarCheck} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="border-border/70 lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="font-display text-lg font-semibold">Skill Development</h2>
            <p className="mt-1 text-xs text-muted-foreground">Update terkini dari Coach Rangga</p>
            <div className="mt-5 space-y-4">
              {child.skills.map((s) => (
                <div key={s.name}>
                  <div className="mb-1 flex justify-between text-sm"><span className="font-medium">{s.name}</span><span className="text-primary font-semibold">{s.value}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400" style={{ width: `${s.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <QuickActions actions={[
          { label: "View Progress", icon: TrendingUp, to: "/progress" },
          { label: "Read Coach Notes", icon: MessageSquare, to: "/coach-feedback" },
          { label: "Check Schedule", icon: CalendarCheck, to: "/schedule" },
        ]} />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card className="border-border/70">
          <CardContent className="p-6">
            <div className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" /><h2 className="font-display text-lg font-semibold">Latest Coach Feedback</h2></div>
            <div className="mt-4 space-y-3">
              {[
                { d: "3 Jun", c: "Coach Rangga", n: child.note },
                { d: "1 Jun", c: "Coach Rangga", n: "Komunikasi di lapangan semakin matang, terus pertahankan!" },
              ].map((f, i) => (
                <div key={i} className="rounded-xl border border-border bg-secondary/30 p-3">
                  <div className="flex items-center justify-between"><p className="text-xs font-semibold text-primary">{f.c}</p><span className="text-xs text-muted-foreground">{f.d}</span></div>
                  <p className="mt-1 text-sm">{f.n}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardContent className="p-6">
            <div className="flex items-center gap-2"><Award className="h-5 w-5 text-primary" /><h2 className="font-display text-lg font-semibold">Achievement Badges</h2></div>
            <div className="mt-4 flex flex-wrap gap-3">
              {[...child.achievements, "Perfect Week", "Team Player"].map((a) => (
                <div key={a} className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary">
                  <Star className="h-3 w-3" /> {a}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
