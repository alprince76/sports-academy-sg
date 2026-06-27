import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ATHLETES } from "@/lib/demo-data";
import { PERIODIC_ASSESSMENTS, SKILL_CATEGORIES, SKILL_SCALE } from "@/lib/assessment-data";
import { RadarChart } from "@/components/site/RadarChart";
import { Award, Star, FileDown, TrendingUp, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/progress")({
  head: () => ({ meta: [{ title: "Progress — SportAcademy" }] }),
  component: ProgressPage,
});

function ProgressPage() {
  const child = ATHLETES.find((a) => a.name === "Aldi Setiawan")!;
  const trend = [72, 78, 75, 82, 80, 86, child.progress];
  const skills = [
    { name: "Passing", value: 85 },
    { name: "Shooting", value: 72 },
    { name: "Speed", value: 88 },
    { name: "Stamina", value: 90 },
    { name: "Teamwork", value: 92 },
  ];

  return (
    <DashboardLayout title={`${child.name}`} subtitle={`${child.age} thn · ${child.team} · ${child.position}`}>
      <Tabs defaultValue="progress">
        <TabsList>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="notes">Coach Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="font-display text-lg font-semibold">Performance Trend</h2>
              <p className="mt-1 text-xs text-muted-foreground">7 minggu terakhir</p>
              <div className="mt-6 flex h-40 items-end gap-2">
                {trend.map((v, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-xs font-semibold">{v}</span>
                    <div className="w-full rounded-t bg-gradient-to-t from-primary to-emerald-400" style={{ height: `${v}%` }} />
                    <span className="text-xs text-muted-foreground">W{i + 22}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="font-display text-lg font-semibold">Skill Development</h2>
              <div className="mt-4 space-y-3">
                {skills.map((s) => (
                  <div key={s.name}>
                    <div className="mb-1 flex justify-between text-sm"><span>{s.name}</span><span className="font-semibold text-primary">{s.value}</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400" style={{ width: `${s.value}%` }} /></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {(() => {
            const pa = PERIODIC_ASSESSMENTS.find((p) => p.athleteId === child.id) ?? PERIODIC_ASSESSMENTS[0];
            const avg = (Object.values(pa.current).reduce((a, b) => a + b, 0) / 6).toFixed(1);
            const prevAvg = (Object.values(pa.previous).reduce((a, b) => a + b, 0) / 6).toFixed(1);
            const delta = (parseFloat(avg) - parseFloat(prevAvg)).toFixed(1);
            return (
              <>
                <Card className="border-border/70">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <h2 className="font-display text-lg font-semibold">Latest Assessment</h2>
                      <Badge variant="secondary" className="bg-primary-soft text-primary">{pa.date}</Badge>
                    </div>
                    <div className="mt-4 flex items-end gap-4">
                      <div>
                        <p className="text-[10px] uppercase text-muted-foreground">Overall</p>
                        <p className="font-display text-4xl font-bold text-primary">{avg}</p>
                        <p className="text-xs text-muted-foreground">dari 5.00</p>
                      </div>
                      <Badge variant="secondary" className="bg-primary-soft text-primary"><TrendingUp className="mr-1 h-3 w-3" />{parseFloat(delta) >= 0 ? "+" : ""}{delta} vs sebelumnya</Badge>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {SKILL_CATEGORIES.map((c) => (
                        <div key={c} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-xs">
                          <span>{c}</span>
                          <span className="font-display font-bold text-primary">{pa.current[c]} · {SKILL_SCALE[pa.current[c]-1]?.label}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border/70">
                  <CardContent className="p-6">
                    <h2 className="font-display text-lg font-semibold">Skill Radar</h2>
                    <p className="mt-1 text-xs text-muted-foreground">Periode saat ini vs sebelumnya</p>
                    <div className="mt-3 flex justify-center">
                      <RadarChart
                        axes={[...SKILL_CATEGORIES]}
                        series={[
                          { label: "Previous", color: "#94a3b8", values: SKILL_CATEGORIES.map((c) => pa.previous[c]) },
                          { label: "Current", color: "hsl(var(--primary))", values: SKILL_CATEGORIES.map((c) => pa.current[c]) },
                        ]}
                      />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border/70 lg:col-span-2">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><h2 className="font-display text-lg font-semibold">Coach Recommendations</h2></div>
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                      {pa.recommendations.map((r) => <li key={r}>{r}</li>)}
                    </ul>
                    <Button className="mt-4" onClick={() => { toast.success("Report card sedang disiapkan"); setTimeout(() => window.print(), 400); }}>
                      <FileDown className="mr-1 h-4 w-4" />Download Report Card
                    </Button>
                  </CardContent>
                </Card>
              </>
            );
          })()}
        </TabsContent>

        <TabsContent value="attendance" className="mt-6">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="font-display text-lg font-semibold">Attendance 96%</h2>
              <p className="mt-1 text-xs text-muted-foreground">46 dari 48 sesi tahun ini</p>
              <div className="mt-6 grid grid-cols-12 gap-1">
                {Array.from({ length: 48 }).map((_, i) => {
                  const miss = i === 12 || i === 31;
                  return <div key={i} className={`aspect-square rounded ${miss ? "bg-amber-300" : "bg-primary"}`} />;
                })}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">Hijau = Hadir · Kuning = Izin</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="flex items-center gap-2"><Award className="h-5 w-5 text-primary" /><h2 className="font-display text-lg font-semibold">Achievements</h2></div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[...child.achievements, "Perfect Week", "Team Player", "MVP Latihan Mei"].map((a) => (
                  <div key={a} className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary-soft p-4">
                    <Star className="h-5 w-5 text-primary" />
                    <div><p className="text-sm font-semibold">{a}</p><p className="text-xs text-muted-foreground">Diraih bulan ini</p></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <Card className="border-border/70">
            <CardContent className="p-6 space-y-3">
              {[
                { d: "3 Jun 2026", c: "Coach Rangga", n: child.note },
                { d: "1 Jun 2026", c: "Coach Rangga", n: "Komunikasi di lapangan semakin matang." },
                { d: "29 Mei 2026", c: "Coach Andre", n: "Stamina prima, pertahankan rutinitas." },
              ].map((f, i) => (
                <div key={i} className="rounded-xl border border-border bg-secondary/30 p-4">
                  <div className="flex items-center justify-between"><p className="text-sm font-semibold text-primary">{f.c}</p><Badge variant="secondary">{f.d}</Badge></div>
                  <p className="mt-2 text-sm">{f.n}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
