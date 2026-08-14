import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadarChart } from "@/components/site/RadarChart";
import { Award, Star, FileDown, TrendingUp, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAthletes, useProgressTrend, useAssessments, useCoachFeedback } from "@/lib/queries";

export const Route = createFileRoute("/progress")({
  head: () => ({ meta: [{ title: "Progress — SportAcademy" }] }),
  component: ProgressPage,
});

function ProgressPage() {
  const { data: athletes = [] } = useAthletes();
  const child = athletes.find((a) => a.name === "Aldi Setiawan") ?? athletes[0];
  const childId = child?.id ?? "";

  const { data: trendData } = useProgressTrend(childId);
  const { data: assessments = [] } = useAssessments(childId);
  const { data: feedback = [] } = useCoachFeedback(childId);

  if (!child) {
    return (
      <DashboardLayout title="Progress" subtitle="Belum ada data atlet">
        <Card className="border-dashed"><CardContent className="p-12 text-center text-sm text-muted-foreground">
          Belum ada atlet terdaftar. Tambahkan atlet dulu.
        </CardContent></Card>
      </DashboardLayout>
    );
  }

  const trend = trendData?.trend?.length ? trendData.trend : [];
  const ageMatch = (child.age_group ?? "").match(/(\d+)/);
  const age = ageMatch ? `${ageMatch[1]} thn` : "—";
  const latest = assessments[0];
  const skills = latest?.scores ? Object.entries(latest.scores).map(([name, value]) => ({ name, value })) : [];

  return (
    <DashboardLayout title={`${child.name}`} subtitle={`${age} · ${child.team ?? "—"} · ${child.position ?? "—"}`}>
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
              <p className="mt-1 text-xs text-muted-foreground">{trend.length} titik data terakhir</p>
              {trend.length > 0 ? (
                <div className="mt-6 flex h-40 items-end gap-2">
                  {trend.map((p, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-2">
                      <span className="text-xs font-semibold">{p.overall}</span>
                      <div className="w-full rounded-t bg-gradient-to-t from-primary to-emerald-400" style={{ height: `${p.overall}%` }} />
                      <span className="text-xs text-muted-foreground">{p.date.slice(5)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-sm text-muted-foreground">Belum ada data progres. Coach dapat mengisi via API /progress.</p>
              )}
            </CardContent>
          </Card>
          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="font-display text-lg font-semibold">Skill Development</h2>
              {skills.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {skills.map((s) => (
                    <div key={s.name}>
                      <div className="mb-1 flex justify-between text-sm"><span>{s.name}</span><span className="font-semibold text-primary">{s.value}</span></div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400" style={{ width: `${s.value * 20}%` }} /></div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-sm text-muted-foreground">Belum ada assessment untuk skill radar.</p>
              )}
            </CardContent>
          </Card>

          {latest && (
            <>
              <Card className="border-border/70">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-lg font-semibold">Latest Assessment</h2>
                    <Badge variant="secondary" className="bg-primary-soft text-primary">{latest.period}</Badge>
                  </div>
                  <div className="mt-4 flex items-end gap-4">
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground">Overall</p>
                      <p className="font-display text-4xl font-bold text-primary">{latest.avg?.toFixed(1) ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">dari 5.00</p>
                    </div>
                    {latest.delta !== undefined && (
                      <Badge variant="secondary" className="bg-primary-soft text-primary"><TrendingUp className="mr-1 h-3 w-3" />{latest.delta >= 0 ? "+" : ""}{latest.delta} vs sebelumnya</Badge>
                    )}
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {Object.entries(latest.scores ?? {}).map(([cat, val]) => (
                      <div key={cat} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-xs">
                        <span>{cat}</span>
                        <span className="font-display font-bold text-primary">{val}/5</span>
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
                      axes={Object.keys(latest.scores ?? {})}
                      series={[
                        { label: "Previous", color: "#94a3b8", values: Object.values(latest.previous_scores ?? {}) },
                        { label: "Current", color: "hsl(var(--primary))", values: Object.values(latest.scores ?? {}) },
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/70 lg:col-span-2">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><h2 className="font-display text-lg font-semibold">Coach Recommendations</h2></div>
                  {latest.recommendations?.length > 0 ? (
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                      {latest.recommendations.map((r) => <li key={r}>{r}</li>)}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">{latest.coach_note ?? "Belum ada rekomendasi."}</p>
                  )}
                  <Button className="mt-4" onClick={() => { toast.success("Report card sedang disiapkan"); setTimeout(() => window.print(), 400); }}>
                    <FileDown className="mr-1 h-4 w-4" />Download Report Card
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="attendance" className="mt-6">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="font-display text-lg font-semibold">Attendance {child.attendance}%</h2>
              <p className="mt-1 text-xs text-muted-foreground">Data terakhir dari profil atlet</p>
              <p className="mt-4 text-xs text-muted-foreground">Kehadiran keseluruhan: {child.attendance}%</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="flex items-center gap-2"><Award className="h-5 w-5 text-primary" /><h2 className="font-display text-lg font-semibold">Achievements</h2></div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {child.achievements?.length > 0 ? child.achievements.map((a) => (
                  <div key={a} className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary-soft p-4">
                    <Star className="h-5 w-5 text-primary" />
                    <div><p className="text-sm font-semibold">{a}</p><p className="text-xs text-muted-foreground">Diraih bulan ini</p></div>
                  </div>
                )) : (
                  <p className="col-span-full text-sm text-muted-foreground">Belum ada pencapaian tercatat.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <Card className="border-border/70">
            <CardContent className="p-6 space-y-3">
              {feedback.length > 0 ? feedback.map((f) => (
                <div key={f.id} className="rounded-xl border border-border bg-secondary/30 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-primary">{f.profiles?.full_name ?? "Coach"}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{f.topic}</Badge>
                      <Badge variant="secondary" className="bg-primary-soft text-primary">Skor {f.score}</Badge>
                    </div>
                  </div>
                  <p className="mt-2 text-sm">{f.content}</p>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">Belum ada catatan pelatih.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
