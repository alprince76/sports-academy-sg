import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Trophy, Phone, User, FileDown, HeartPulse, CalendarClock } from "lucide-react";
import { ATHLETES, healthStatusColor } from "@/lib/demo-data";
import { PERIODIC_ASSESSMENTS, SKILL_CATEGORIES, SKILL_SCALE, getAthleteEvaluations, type SkillCategory } from "@/lib/assessment-data";
import { RadarChart } from "@/components/site/RadarChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

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
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { toast.success("Export started", { description: "PDF report sedang disiapkan" }); setTimeout(() => window.print(), 400); }}>
            <FileDown className="mr-1 h-4 w-4" />Export Report
          </Button>
          <Button asChild variant="outline"><Link to="/athletes"><ArrowLeft className="mr-1 h-4 w-4" />Kembali</Link></Button>
        </div>
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
            <div className="mt-6 rounded-xl border border-border p-4">
              <div className="flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-primary" />
                <p className="text-xs font-semibold uppercase text-muted-foreground">Health Status</p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Badge variant="secondary" className={healthStatusColor(a.health.status)}>{a.health.status}</Badge>
                <span className="text-[11px] text-muted-foreground">Updated {a.health.updatedAt}</span>
              </div>
              {a.health.note && (
                <p className="mt-2 text-xs text-muted-foreground">{a.health.note}</p>
              )}
              {a.health.expectedReturn && (
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarClock className="h-3 w-3" /> Perkiraan kembali: <span className="font-medium text-foreground">{a.health.expectedReturn}</span>
                </p>
              )}
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
                <TabsList className="flex-wrap">
                  <TabsTrigger value="history">Training History</TabsTrigger>
                  <TabsTrigger value="attendance">Attendance</TabsTrigger>
                  <TabsTrigger value="feedback">Coach Feedback</TabsTrigger>
                  <TabsTrigger value="assessments">Assessments</TabsTrigger>
                  <TabsTrigger value="radar">Radar Skills</TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
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
                <TabsContent value="assessments" className="mt-4 space-y-4">
                  <AssessmentsTab athleteId={a.id} />
                </TabsContent>
                <TabsContent value="radar" className="mt-4">
                  {(() => {
                    const pa = PERIODIC_ASSESSMENTS.find((p) => p.athleteId === a.id) ?? PERIODIC_ASSESSMENTS[0];
                    return (
                      <div className="flex flex-col items-center">
                        <RadarChart
                          axes={[...SKILL_CATEGORIES]}
                          series={[
                            { label: "Previous", color: "#94a3b8", values: SKILL_CATEGORIES.map((c) => pa.previous[c]) },
                            { label: "Current", color: "hsl(var(--primary))", values: SKILL_CATEGORIES.map((c) => pa.current[c]) },
                          ]}
                          size={320}
                        />
                        <div className="mt-3 flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-400" />Previous Period</span>
                          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" />Current Period</span>
                        </div>
                      </div>
                    );
                  })()}
                </TabsContent>
                <TabsContent value="reports" className="mt-4 space-y-3">
                  <div className="rounded-xl border border-border p-4">
                    <p className="text-sm font-semibold">Monthly Progress Trend</p>
                    <div className="mt-3 flex h-32 items-end gap-2">
                      {[68, 72, 75, 78, 82, 86].map((v, i) => (
                        <div key={i} className="flex flex-1 flex-col items-center gap-1">
                          <span className="text-[10px] font-semibold">{v}</span>
                          <div className="w-full rounded-t bg-gradient-to-t from-primary to-emerald-400" style={{ height: `${v}%` }} />
                          <span className="text-[10px] text-muted-foreground">M{i+1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border p-4 text-sm">
                    <p className="font-semibold">Quarterly Skill Growth</p>
                    <p className="mt-1 text-muted-foreground">Avg skill +0.6 dari Q1 ke Q2. Pertumbuhan terbesar di Ball Handling (+1.2).</p>
                  </div>
                  <Button className="w-full" onClick={() => { toast.success("Export started", { description: "PDF report sedang disiapkan" }); setTimeout(() => window.print(), 400); }}>
                    <FileDown className="mr-1 h-4 w-4" />Export Athlete Report (PDF)
                  </Button>
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

function AssessmentsTab({ athleteId }: { athleteId: string }) {
  const pa = PERIODIC_ASSESSMENTS.find((p) => p.athleteId === athleteId) ?? PERIODIC_ASSESSMENTS[0];
  const logs = getAthleteEvaluations(athleteId);
  const [category, setCategory] = useState<SkillCategory | "all">("all");
  const [range, setRange] = useState<"1m" | "3m" | "6m" | "all">("3m");

  const now = new Date("2026-06-04");
  const rangeMs = range === "1m" ? 31 : range === "3m" ? 93 : range === "6m" ? 186 : 3650;
  const filtered = logs
    .filter((e) => category === "all" || e.category === category)
    .filter((e) => (now.getTime() - new Date(e.date).getTime()) / 86400000 <= rangeMs)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <>
      <div className="flex items-center justify-between rounded-xl border border-border p-4">
        <div>
          <p className="text-sm font-semibold">Periodic Assessment</p>
          <p className="text-xs text-muted-foreground">{pa.date}</p>
        </div>
        <Badge variant="secondary" className={pa.status === "Published" ? "bg-primary-soft text-primary" : pa.status === "Reviewed" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}>{pa.status}</Badge>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {SKILL_CATEGORIES.map((c) => (
          <div key={c} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
            <span>{c}</span>
            <span className="font-display font-bold text-primary">{pa.current[c]} · {SKILL_SCALE[pa.current[c]-1]?.label}</span>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border p-4">
        <p className="text-xs font-semibold uppercase text-muted-foreground">Recommendations</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {pa.recommendations.map((r) => <li key={r}>{r}</li>)}
        </ul>
      </div>

      <div className="rounded-xl border border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Evaluation Timeline</p>
            <p className="text-xs text-muted-foreground">Riwayat evaluasi per sesi berdasarkan kategori skill</p>
          </div>
          <div className="flex gap-2">
            <Select value={category} onValueChange={(v) => setCategory(v as SkillCategory | "all")}>
              <SelectTrigger className="h-9 w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {SKILL_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={range} onValueChange={(v) => setRange(v as typeof range)}>
              <SelectTrigger className="h-9 w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">1 Bulan</SelectItem>
                <SelectItem value="3m">3 Bulan</SelectItem>
                <SelectItem value="6m">6 Bulan</SelectItem>
                <SelectItem value="all">Semua</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {filtered.length === 0 && (
            <p className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
              Tidak ada evaluasi pada rentang & kategori yang dipilih.
            </p>
          )}
          {filtered.slice(0, 30).map((e) => (
            <div key={e.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-soft font-display text-sm font-bold text-primary">
                {e.score}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="bg-secondary text-xs">{e.category}</Badge>
                  <span className="text-xs font-medium">{e.sessionTitle}</span>
                  <span className="text-xs text-muted-foreground">· {e.coach}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{e.note}</p>
              </div>
              <span className="flex-shrink-0 text-[11px] text-muted-foreground">{e.dateLabel}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
