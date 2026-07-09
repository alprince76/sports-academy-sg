import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PERIODIC_ASSESSMENTS, SKILL_CATEGORIES, type SkillCategory } from "@/lib/assessment-data";
import { ATHLETES, TEAMS, AGE_GROUPS } from "@/lib/demo-data";
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

type TimeFilter = "month" | "quarter" | "year";

function InsightsPage() {
  const [time, setTime] = useState<TimeFilter>("quarter");
  const [team, setTeam] = useState<string>("all");
  const [ageGroup, setAgeGroup] = useState<string>("all");
  const [skill, setSkill] = useState<SkillCategory | "all">("all");

  const filtered = useMemo(() => {
    const athleteById = new Map(ATHLETES.map((a) => [a.id, a]));
    return PERIODIC_ASSESSMENTS.filter((p) => {
      const a = athleteById.get(p.athleteId);
      if (!a) return false;
      if (team !== "all" && a.team !== team) return false;
      if (ageGroup !== "all" && a.ageGroup !== ageGroup) return false;
      return true;
    });
  }, [team, ageGroup]);

  // Time-window dampener: month = latest snapshot only; quarter = +modest gain; year = full.
  const timeFactor = time === "month" ? 0.4 : time === "quarter" ? 0.75 : 1;

  const teamAvg = filtered.length
    ? (filtered.reduce((s, p) => s + Object.values(p.current).reduce((a, b) => a + b, 0) / 6, 0) / filtered.length).toFixed(2)
    : "0.00";

  const skillDistribution = SKILL_CATEGORIES
    .filter((c) => skill === "all" || c === skill)
    .map((c) => {
      const avg = filtered.length ? filtered.reduce((s, p) => s + p.current[c], 0) / filtered.length : 0;
      const prevAvg = filtered.length ? filtered.reduce((s, p) => s + p.previous[c], 0) / filtered.length : 0;
      const delta = (avg - prevAvg) * timeFactor;
      return { name: c, avg, delta };
    });

  const withAvg = filtered.map((p) => ({
    ...p,
    avg: Object.values(p.current).reduce((a, b) => a + b, 0) / 6,
    delta: (Object.values(p.current).reduce((a, b) => a + b, 0) - Object.values(p.previous).reduce((a, b) => a + b, 0)),
  }));

  const needsAttention = [...withAvg].sort((a, b) => a.avg - b.avg).slice(0, 3);
  const topImprovers = [...withAvg].sort((a, b) => b.delta - a.delta).slice(0, 3);

  const insights = buildInsights({ time, team, ageGroup, skill, filtered, skillDistribution });

  return (
    <DashboardLayout title="Assessment Insights" subtitle="Analitik perkembangan tim & atlet">
      <Card className="border-border/70">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <span className="text-xs font-semibold uppercase text-muted-foreground">Filter</span>
          <Select value={time} onValueChange={(v) => setTime(v as TimeFilter)}>
            <SelectTrigger className="h-9 w-[130px]"><SelectValue placeholder="Periode" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Bulan Ini</SelectItem>
              <SelectItem value="quarter">Kuartal</SelectItem>
              <SelectItem value="year">Tahun</SelectItem>
            </SelectContent>
          </Select>
          <Select value={team} onValueChange={setTeam}>
            <SelectTrigger className="h-9 w-[160px]"><SelectValue placeholder="Tim" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tim</SelectItem>
              {TEAMS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={ageGroup} onValueChange={setAgeGroup}>
            <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Kelompok Umur" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Umur</SelectItem>
              {AGE_GROUPS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={skill} onValueChange={(v) => setSkill(v as SkillCategory | "all")}>
            <SelectTrigger className="h-9 w-[160px]"><SelectValue placeholder="Skill" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Skill</SelectItem>
              {SKILL_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="ml-auto bg-primary-soft text-primary">{filtered.length} atlet</Badge>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Team Average Score" value={teamAvg} hint="dari 5.00" tone="up" />
        <Kpi label="Assessment Completion" value="87%" hint={`${filtered.length} atlet difilter`} tone="up" />
        <Kpi label="Improvement Trend" value={`+${(0.4 * timeFactor).toFixed(2)}`} hint={`periode ${time}`} tone="up" />
        <Kpi label="Attendance Correlation" value="0.78" hint="hadir tinggi = skor naik" tone="up" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70">
          <CardContent className="p-6">
            <h2 className="font-display text-lg font-semibold">Skill Distribution</h2>
            <p className="mt-1 text-xs text-muted-foreground">Rata-rata tim per kategori · periode {time}</p>
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
            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><h2 className="font-display text-lg font-semibold">AI Recommendations</h2></div>
            <p className="mt-1 text-xs text-muted-foreground">Diperbarui berdasar filter aktif</p>
            <div className="mt-4 space-y-3">
              {insights.map((t) => (
                <div key={t} className="rounded-xl border border-primary/20 bg-primary-soft/60 p-3 text-sm">{t}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-border/70">
        <CardContent className="p-6">
          <h2 className="font-display text-lg font-semibold">Heat Map — Athletes × Skills</h2>
          <p className="mt-1 text-xs text-muted-foreground">Klik atlet untuk membuka detail assessment.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-3">Atlet</th>
                  {SKILL_CATEGORIES
                    .filter((c) => skill === "all" || c === skill)
                    .map((c) => <th key={c} className="px-2 py-2 text-center">{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.athleteId} className="border-t border-border transition hover:bg-secondary/40">
                    <td className="py-2 pr-3 font-medium">
                      <Link to="/athletes/$athleteId" params={{ athleteId: p.athleteId }} className="text-primary hover:underline">
                        {p.athleteName}
                      </Link>
                      <p className="text-[11px] text-muted-foreground">{p.team}</p>
                    </td>
                    {SKILL_CATEGORIES
                      .filter((c) => skill === "all" || c === skill)
                      .map((c) => (
                        <td key={c} className="px-1 py-1">
                          <Link to="/athletes/$athleteId" params={{ athleteId: p.athleteId }}>
                            <div className={`mx-auto flex h-9 w-9 items-center justify-center rounded-md font-display text-sm font-bold transition hover:ring-2 hover:ring-primary ${heatColor(p.current[c])}`}>
                              {p.current[c]}
                            </div>
                          </Link>
                        </td>
                      ))}
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={SKILL_CATEGORIES.length + 1} className="py-8 text-center text-xs text-muted-foreground">Tidak ada atlet pada filter aktif.</td></tr>
                )}
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
                <Link key={a.athleteId} to="/athletes/$athleteId" params={{ athleteId: a.athleteId }} className="flex items-center justify-between rounded-lg border border-border p-3 transition hover:bg-secondary/50">
                  <div><p className="text-sm font-medium">{a.athleteName}</p><p className="text-xs text-muted-foreground">{a.team}</p></div>
                  <Badge variant="secondary" className="bg-red-100 text-red-700">avg {a.avg.toFixed(1)}</Badge>
                </Link>
              ))}
              {needsAttention.length === 0 && <p className="text-xs text-muted-foreground">Tidak ada data.</p>}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardContent className="p-6">
            <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /><h2 className="font-display text-lg font-semibold">Top Improvements</h2></div>
            <div className="mt-4 space-y-2">
              {topImprovers.map((a) => (
                <Link key={a.athleteId} to="/athletes/$athleteId" params={{ athleteId: a.athleteId }} className="flex items-center justify-between rounded-lg border border-border p-3 transition hover:bg-secondary/50">
                  <div><p className="text-sm font-medium">{a.athleteName}</p><p className="text-xs text-muted-foreground">{a.team}</p></div>
                  <Badge variant="secondary" className="bg-primary-soft text-primary">+{a.delta} pts</Badge>
                </Link>
              ))}
              {topImprovers.length === 0 && <p className="text-xs text-muted-foreground">Tidak ada data.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function buildInsights(args: {
  time: TimeFilter;
  team: string;
  ageGroup: string;
  skill: SkillCategory | "all";
  filtered: typeof PERIODIC_ASSESSMENTS;
  skillDistribution: { name: SkillCategory; avg: number; delta: number }[];
}) {
  const { time, team, ageGroup, skill, filtered, skillDistribution } = args;
  const scope = [
    team !== "all" ? team : null,
    ageGroup !== "all" ? ageGroup : null,
  ].filter(Boolean).join(" · ") || "seluruh akademi";
  const period = time === "month" ? "bulan ini" : time === "quarter" ? "kuartal ini" : "tahun ini";
  const improving = skillDistribution.filter((s) => s.delta > 0).sort((a, b) => b.delta - a.delta)[0];
  const declining = [...skillDistribution].sort((a, b) => a.delta - b.delta)[0];
  const list: string[] = [];
  list.push(`${filtered.length} atlet dianalisis pada ${scope} (${period}).`);
  if (improving) list.push(`Skill ${improving.name} naik ${improving.delta.toFixed(2)} — pertahankan drill terkait.`);
  if (declining && declining.delta < 0) list.push(`${declining.name} turun ${Math.abs(declining.delta).toFixed(2)} — jadikan fokus 2 minggu ke depan.`);
  if (skill !== "all") list.push(`Filter aktif ${skill}: fokuskan segmen individual coaching untuk atlet <3.0.`);
  list.push(`Atlet dengan attendance >85% menunjukkan pertumbuhan skill ~2× lebih cepat.`);
  return list;
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
