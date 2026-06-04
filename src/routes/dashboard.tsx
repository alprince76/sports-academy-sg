import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Activity, ArrowUpRight, CalendarCheck, ChartLine, CreditCard,
  Home, LogOut, Settings, Trophy, UsersRound, Wallet,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — SportAcademy" },
      { name: "description", content: "Demo dashboard akademi olahraga dengan data atlet realtime." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="flex min-h-screen bg-secondary/30">
      <Sidebar />
      <div className="flex-1">
        <TopBar />
        <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <Header />
          <StatGrid />
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AthletesCard />
            </div>
            <UpcomingCard />
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <AttendanceCard />
            <RevenueCard />
            <TopPerformersCard />
          </div>
        </main>
      </div>
    </div>
  );
}

const NAV = [
  { icon: Home, label: "Dashboard", active: true },
  { icon: UsersRound, label: "Athletes" },
  { icon: Activity, label: "Training" },
  { icon: CalendarCheck, label: "Schedule" },
  { icon: Wallet, label: "Payments" },
  { icon: ChartLine, label: "Reports" },
  { icon: Settings, label: "Settings" },
];

function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-border bg-sidebar lg:block">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Trophy className="h-4 w-4" />
        </div>
        <span className="font-display font-bold">SportAcademy</span>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {NAV.map((n) => (
          <button
            key={n.label}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              n.active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
            }`}
          >
            <n.icon className="h-4 w-4" />
            {n.label}
          </button>
        ))}
      </nav>
      <div className="absolute bottom-4 left-4 right-4">
        <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-sidebar-accent/50">
          <LogOut className="h-4 w-4" />
          Kembali ke Beranda
        </Link>
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <div>
        <p className="text-xs text-muted-foreground">Akademi</p>
        <p className="text-sm font-semibold">SSB Garuda Muda</p>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="bg-primary-soft text-primary">Pro Plan</Badge>
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary text-primary-foreground">BA</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

function Header() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Selamat datang, Coach Bayu 👋</h1>
        <p className="mt-1 text-sm text-muted-foreground">Berikut ringkasan akademi Anda hari ini.</p>
      </div>
      <Button>
        + Add Athlete
      </Button>
    </div>
  );
}

const STATS = [
  { label: "Total Atlet", value: "128", change: "+12", icon: UsersRound, trend: "naik" },
  { label: "Pelatih Aktif", value: "8", change: "+1", icon: Activity, trend: "naik" },
  { label: "Attendance Rate", value: "92%", change: "+4%", icon: CalendarCheck, trend: "naik" },
  { label: "Revenue Bulan Ini", value: "Rp 48,2jt", change: "+18%", icon: CreditCard, trend: "naik" },
];

function StatGrid() {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STATS.map((s) => (
        <Card key={s.label} className="border-border/70">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <Badge variant="secondary" className="gap-1 bg-primary-soft text-primary">
                <ArrowUpRight className="h-3 w-3" />
                {s.change}
              </Badge>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">{s.label}</p>
            <p className="font-display text-2xl font-bold">{s.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

const ATHLETES = [
  { name: "Rafi Pratama", age: 12, pos: "Forward", team: "U-12 A", progress: 86, status: "Great" },
  { name: "Dimas Saputra", age: 11, pos: "Midfielder", team: "U-12 A", progress: 78, status: "Good" },
  { name: "Aldi Setiawan", age: 13, pos: "Defender", team: "U-14 B", progress: 91, status: "Great" },
  { name: "Bagas Kurniawan", age: 10, pos: "Goalkeeper", team: "U-10", progress: 72, status: "Good" },
  { name: "Reza Maulana", age: 13, pos: "Forward", team: "U-14 A", progress: 88, status: "Great" },
];

function AthletesCard() {
  return (
    <Card className="border-border/70">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">Atlet Aktif</h2>
            <p className="text-xs text-muted-foreground">Progress terbaru dari pelatihan minggu ini</p>
          </div>
          <Button variant="ghost" size="sm" className="text-primary">Lihat semua</Button>
        </div>
        <div className="mt-5 overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Atlet</th>
                <th className="px-4 py-3 text-left font-medium">Tim</th>
                <th className="px-4 py-3 text-left font-medium">Progress</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {ATHLETES.map((a, i) => (
                <tr key={a.name} className={i !== ATHLETES.length - 1 ? "border-b border-border" : ""}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary-soft text-xs text-primary">
                          {a.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{a.name}</p>
                        <p className="text-xs text-muted-foreground">{a.age}thn · {a.pos}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{a.team}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400"
                          style={{ width: `${a.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold">{a.progress}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="bg-primary-soft text-primary">{a.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

const UPCOMING = [
  { time: "16:00", date: "Hari ini", title: "Latihan U-12 A", coach: "Coach Bayu" },
  { time: "17:30", date: "Hari ini", title: "Latihan U-14 B", coach: "Coach Andre" },
  { time: "09:00", date: "Besok", title: "Friendly Match vs SSB Pelita", coach: "All teams" },
  { time: "16:00", date: "Rabu", title: "Latihan U-10", coach: "Coach Rangga" },
];

function UpcomingCard() {
  return (
    <Card className="border-border/70">
      <CardContent className="p-6">
        <h2 className="font-display text-lg font-semibold">Jadwal Mendatang</h2>
        <div className="mt-5 space-y-4">
          {UPCOMING.map((u, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <span className="text-[10px] font-medium uppercase">{u.date.slice(0, 3)}</span>
                  <span className="text-xs font-bold">{u.time}</span>
                </div>
                {i !== UPCOMING.length - 1 && <div className="mt-1 h-6 w-px bg-border" />}
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm font-semibold">{u.title}</p>
                <p className="text-xs text-muted-foreground">{u.coach}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AttendanceCard() {
  const days = [
    { d: "Sen", v: 88 }, { d: "Sel", v: 92 }, { d: "Rab", v: 85 },
    { d: "Kam", v: 95 }, { d: "Jum", v: 90 }, { d: "Sab", v: 96 }, { d: "Min", v: 78 },
  ];
  return (
    <Card className="border-border/70">
      <CardContent className="p-6">
        <h2 className="font-display text-lg font-semibold">Attendance Minggu Ini</h2>
        <p className="mt-1 text-xs text-muted-foreground">Rata-rata 92% kehadiran</p>
        <div className="mt-6 flex h-32 items-end justify-between gap-2">
          {days.map((d) => (
            <div key={d.d} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-primary to-emerald-400 transition-all hover:opacity-80"
                style={{ height: `${d.v}%` }}
              />
              <span className="text-xs text-muted-foreground">{d.d}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RevenueCard() {
  return (
    <Card className="border-border/70">
      <CardContent className="p-6">
        <h2 className="font-display text-lg font-semibold">Revenue Overview</h2>
        <p className="mt-1 text-xs text-muted-foreground">Bulan Juni 2026</p>
        <div className="mt-5 flex items-baseline gap-2">
          <span className="font-display text-3xl font-bold">Rp 48,2jt</span>
          <Badge variant="secondary" className="bg-primary-soft text-primary">+18%</Badge>
        </div>
        <div className="mt-5 space-y-3">
          {[
            { label: "Membership Aktif", value: "112", pct: 88 },
            { label: "Pembayaran Tertunda", value: "9", pct: 30 },
            { label: "Trial Members", value: "7", pct: 50 },
          ].map((r) => (
            <div key={r.label}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="font-semibold">{r.value}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${r.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TopPerformersCard() {
  const top = [
    { n: "Aldi Setiawan", pts: 91, badge: "🥇" },
    { n: "Reza Maulana", pts: 88, badge: "🥈" },
    { n: "Rafi Pratama", pts: 86, badge: "🥉" },
  ];
  return (
    <Card className="border-border/70 bg-gradient-to-br from-primary-soft/50 to-card">
      <CardContent className="p-6">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-semibold">Top Performers</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Athlete of the month</p>
        <div className="mt-5 space-y-3">
          {top.map((p, i) => (
            <div key={p.n} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <span className="text-2xl">{p.badge}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold">{p.n}</p>
                <p className="text-xs text-muted-foreground">Rank #{i + 1}</p>
              </div>
              <span className="font-display text-lg font-bold text-primary">{p.pts}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
