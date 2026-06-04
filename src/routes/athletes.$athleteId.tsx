import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Trophy, Phone, User } from "lucide-react";
import { ATHLETES } from "@/lib/demo-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/athletes/$athleteId")({
  head: ({ params }) => {
    const a = ATHLETES.find((x) => x.id === params.athleteId);
    return { meta: [{ title: `${a?.name ?? "Atlet"} — SportAcademy` }] };
  },
  component: AthleteDetail,
  notFoundComponent: () => (
    <DashboardLayout title="Atlet tidak ditemukan">
      <Button asChild><Link to="/athletes">Kembali</Link></Button>
    </DashboardLayout>
  ),
});

function AthleteDetail() {
  const { athleteId } = Route.useParams();
  const a = ATHLETES.find((x) => x.id === athleteId);
  if (!a) throw notFound();

  const history = [
    { date: "3 Jun 2026", type: "Latihan", note: "Drill finishing — 5 gol dari 8 percobaan", score: 88 },
    { date: "1 Jun 2026", type: "Latihan", note: "Passing accuracy 84%", score: 84 },
    { date: "29 Mei 2026", type: "Match", note: "vs SSB Pelita, assist 1", score: 86 },
    { date: "27 Mei 2026", type: "Latihan", note: "Stamina drill, top tier", score: 90 },
  ];

  const attendance = [
    { week: "W22", v: 100 }, { week: "W23", v: 75 }, { week: "W24", v: 100 },
    { week: "W25", v: 100 }, { week: "W26", v: 90 },
  ];

  return (
    <DashboardLayout
      title={a.name}
      subtitle={`${a.age} tahun · ${a.position} · ${a.team}`}
      actions={
        <Button asChild variant="outline"><Link to="/athletes"><ArrowLeft className="mr-1 h-4 w-4" />Kembali</Link></Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/70 lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary-soft text-2xl text-primary">
                  {a.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <p className="mt-3 font-display text-xl font-bold">{a.name}</p>
              <Badge variant="secondary" className="mt-2 bg-primary-soft text-primary">{a.status}</Badge>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Stat label="Performance" value={`${a.progress}`} />
              <Stat label="Attendance" value={`${a.attendance}%`} />
            </div>
            <div className="mt-6 space-y-3 text-sm">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Orang Tua</p>
              <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" />{a.parent.name}</div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{a.parent.phone}</div>
            </div>
            <div className="mt-6">
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Achievements</p>
              <div className="flex flex-wrap gap-2">
                {a.achievements.length === 0 && <p className="text-xs text-muted-foreground">Belum ada pencapaian.</p>}
                {a.achievements.map((ach) => (
                  <Badge key={ach} variant="secondary" className="gap-1 bg-accent text-accent-foreground">
                    <Trophy className="h-3 w-3" />{ach}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="font-display text-lg font-semibold">Skill Breakdown</h2>
              <div className="mt-5 space-y-4">
                {a.skills.map((s) => (
                  <div key={s.name}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{s.name}</span>
                      <span className="font-semibold">{s.value}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400" style={{ width: `${s.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardContent className="p-6">
              <Tabs defaultValue="history">
                <TabsList>
                  <TabsTrigger value="history">Training History</TabsTrigger>
                  <TabsTrigger value="attendance">Attendance</TabsTrigger>
                  <TabsTrigger value="feedback">Coach Feedback</TabsTrigger>
                </TabsList>
                <TabsContent value="history" className="mt-4 space-y-3">
                  {history.map((h, i) => (
                    <div key={i} className="flex items-start justify-between rounded-xl border border-border p-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-primary-soft text-primary">{h.type}</Badge>
                          <span className="text-xs text-muted-foreground">{h.date}</span>
                        </div>
                        <p className="mt-2 text-sm">{h.note}</p>
                      </div>
                      <span className="font-display text-lg font-bold text-primary">{h.score}</span>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="attendance" className="mt-4">
                  <div className="flex h-40 items-end gap-3">
                    {attendance.map((w) => (
                      <div key={w.week} className="flex flex-1 flex-col items-center gap-2">
                        <div className="w-full rounded-t-md bg-gradient-to-t from-primary to-emerald-400" style={{ height: `${w.v}%` }} />
                        <span className="text-xs text-muted-foreground">{w.week}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="feedback" className="mt-4 space-y-3">
                  <div className="rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Coach Bayu</p>
                      <span className="text-xs text-muted-foreground">3 Juni 2026</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">"{a.note}"</p>
                  </div>
                  <div className="rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Coach Andre</p>
                      <span className="text-xs text-muted-foreground">27 Mei 2026</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">"Konsentrasi saat sesi sangat baik. Lanjutkan!"</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/50 p-3 text-center">
      <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
      <p className="font-display text-xl font-bold">{value}</p>
    </div>
  );
}
