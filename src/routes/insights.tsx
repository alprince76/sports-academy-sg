import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PERIODIC_ASSESSMENTS, SKILL_CATEGORIES } from "@/lib/assessment-data";
import { TrendingUp, TrendingDown, AlertTriangle, Sparkles } from "lucide-react";

export const Route = createFileRoute("/insights")({
  head: () => ({ meta: [{ title: "Assessment Insights — SportAcademy" }] }),
  component: InsightsPage,
});

function heatColor(v: number) {
  if (v >= 4) return "bg-primary text-primary-foreground";
  if (v >= 3) return "bg-amber-200 text-amber-900";
  return "bg-red-200 text-red-900";
}

function InsightsPage() {
  const teamAvg = (
    PERIODIC_ASSESSMENTS.reduce((sum, p) =>
      sum + Object.values(p.current).reduce((a, b) => a + b, 0) / 6, 0
    ) / PERIODIC_ASSESSMENTS.length
  ).toFixed(2);

  const skillDistribution = SKILL_CATEGORIES.map((c) => {
    const avg = PERIODIC_ASSESSMENTS.reduce((s, p) => s + p.current[c], 0) / PERIODIC_ASSESSMENTS.length;
    const prev = PERIODIC_ASSESSMENTS.reduce((s, p) => s + p.previous[c], 0) / PERIODIC_ASSESSMENTS.length;
    return { name: c, avg, delta: avg - prev };
  });

  const needsAttention = PERIODIC_ASSESSMENTS
    .map((p) => ({ ...p, avg: Object.values(p.current).reduce((a, b) => a + b, 0) / 6 }))
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 3);

  const topImprovers = PERIODIC_ASSESSMENTS
    .map((p) => {
      const delta = Object.values(p.current).reduce((a, b) => a + b, 0) - Object.values(p.previous).reduce((a, b) => a + b, 0);
      return { ...p, delta };
    })
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 3);

  return (
    <DashboardLayout title="Assessment Insights" subtitle="Analitik perkembangan tim & atlet">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Team Average Score" value={teamAvg} hint="dari 5.00" tone="up" />
        <Kpi label="Assessment Completion" value="87%" hint="13 dari 15 atlet" tone="up" />
        <Kpi label="Improvement Trend" value="+0.4" hint="vs periode lalu" tone="up" />
        <Kpi label="Attendance Correlation" value="0.78" hint="hadir tinggi = skor naik" tone="up" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70">
          <CardContent className="p-6">
            <h2 className="font-display text-lg font-semibold">Skill Distribution</h2>
            <p className="mt-1 text-xs text-muted-foreground">Rata-rata tim per kategori skill</p>
            <div className="mt-5 space-y-3">
              {skillDistribution.map((s) => (
                <div key={s.name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{s.name}</span>
                    <span className="font-semibold">
                      {s.avg.toFixed(2)}
                      <span className={`ml-2 text-xs ${s.delta >= 0 ? "text-primary" : "text-destructive"}`}>
                        {s.delta >= 0 ? "▲" : "▼"} {Math.abs(s.delta).toFixed(2)}
                      </span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400" style={{ width: `${(s.avg / 5) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardContent className="p-6">
            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><h2 className="font-display text-lg font-semibold">Automatic Insights</h2></div>
            <div className="mt-4 space-y-3">
              {[
                "7 atlet meningkatkan Ball Handling bulan ini.",
                "Defense rata-rata turun 8% — perlu fokus drill defensif.",
                "Atlet dengan attendance >85% memiliki skill growth 2x lebih cepat.",
                "5 atlet siap naik dari Developing ke Fairly Consistent.",
              ].map((t) => (
                <div key={t} className="rounded-xl border border-primary/20 bg-primary-soft/60 p-3 text-sm">{t}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-border/70">
        <CardContent className="p-6">
          <h2 className="font-display text-lg font-semibold">Heat Map — Athletes × Skills</h2>
          <p className="mt-1 text-xs text-muted-foreground">Hijau: kuat · Kuning: rata-rata · Merah: perlu peningkatan</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-3">Atlet</th>
                  {SKILL_CATEGORIES.map((c) => <th key={c} className="px-2 py-2 text-center">{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {PERIODIC_ASSESSMENTS.map((p) => (
                  <tr key={p.athleteId} className="border-t border-border">
                    <td className="py-2 pr-3 font-medium">{p.athleteName}</td>
                    {SKILL_CATEGORIES.map((c) => (
                      <td key={c} className="px-1 py-1">
                        <div className={`mx-auto flex h-9 w-9 items-center justify-center rounded-md font-display text-sm font-bold ${heatColor(p.current[c])}`}>
                          {p.current[c]}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70">
          <CardContent className="p-6">
            <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-600" /><h2 className="font-display text-lg font-semibold">Athletes Needing Attention</h2></div>
            <div className="mt-4 space-y-2">
              {needsAttention.map((a) => (
                <div key={a.athleteId} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div><p className="text-sm font-medium">{a.athleteName}</p><p className="text-xs text-muted-foreground">{a.team}</p></div>
                  <Badge variant="secondary" className="bg-red-100 text-red-700">avg {a.avg.toFixed(1)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardContent className="p-6">
            <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /><h2 className="font-display text-lg font-semibold">Top Improvements</h2></div>
            <div className="mt-4 space-y-2">
              {topImprovers.map((a) => (
                <div key={a.athleteId} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div><p className="text-sm font-medium">{a.athleteName}</p><p className="text-xs text-muted-foreground">{a.team}</p></div>
                  <Badge variant="secondary" className="bg-primary-soft text-primary">+{a.delta} pts</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function Kpi({ label, value, hint, tone }: { label: string; value: string; hint: string; tone: "up" | "down" }) {
  const Icon = tone === "up" ? TrendingUp : TrendingDown;
  return (
    <Card className="border-border/70">
      <CardContent className="p-5">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className="mt-2 flex items-end justify-between">
          <p className="font-display text-2xl font-bold">{value}</p>
          <Icon className={`h-4 w-4 ${tone === "up" ? "text-primary" : "text-destructive"}`} />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
