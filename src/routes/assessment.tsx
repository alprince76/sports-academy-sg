import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RadarChart } from "@/components/site/RadarChart";
import {
  PERIODIC_ASSESSMENTS, MATCH_STATS, SKILL_CATEGORIES, SKILL_SCALE, calcPIR,
} from "@/lib/assessment-data";
import { Save, FileCheck2, Target } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/assessment")({
  head: () => ({ meta: [{ title: "Athlete Assessment — SportAcademy" }] }),
  component: AssessmentPage,
});

function AssessmentPage() {
  return (
    <DashboardLayout
      title="Athlete Assessment"
      subtitle="Evaluasi performa pertandingan (PIR/FIBA) dan perkembangan skill atlet"
    >
      <Tabs defaultValue="skill">
        <TabsList>
          <TabsTrigger value="skill">Skill Assessment</TabsTrigger>
          <TabsTrigger value="match">Match Statistics (PIR)</TabsTrigger>
          <TabsTrigger value="new">New Periodic Assessment</TabsTrigger>
        </TabsList>

        <TabsContent value="skill" className="mt-6">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-semibold">Periodic Skill Assessments</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Penilaian resmi setiap 4–6 minggu. Skala 1–5.</p>
                </div>
                <Badge variant="secondary" className="bg-primary-soft text-primary">{PERIODIC_ASSESSMENTS.length} atlet</Badge>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {PERIODIC_ASSESSMENTS.map((p) => {
                  const avg = (Object.values(p.current).reduce((a, b) => a + b, 0) / 6).toFixed(1);
                  const prev = (Object.values(p.previous).reduce((a, b) => a + b, 0) / 6).toFixed(1);
                  const delta = (parseFloat(avg) - parseFloat(prev)).toFixed(1);
                  return (
                    <div key={p.athleteId} className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary-soft text-xs text-primary">{p.athleteName.split(" ").map(s=>s[0]).join("").slice(0,2)}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-semibold">{p.athleteName}</p>
                          <p className="text-xs text-muted-foreground">{p.team} · {p.date}</p>
                        </div>
                        <Badge variant="secondary" className={p.status === "Final" ? "bg-primary-soft text-primary" : "bg-amber-100 text-amber-800"}>{p.status}</Badge>
                      </div>
                      <div className="mt-3 flex items-end justify-between">
                        <div>
                          <p className="text-[10px] uppercase text-muted-foreground">Avg Score</p>
                          <p className="font-display text-2xl font-bold text-primary">{avg}</p>
                        </div>
                        <span className={`text-xs font-semibold ${parseFloat(delta) >= 0 ? "text-primary" : "text-destructive"}`}>
                          {parseFloat(delta) >= 0 ? "▲" : "▼"} {Math.abs(parseFloat(delta))} vs prev
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="match" className="mt-6 space-y-6">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-semibold">Match Statistics (PIR/FIBA)</h2>
                  <p className="mt-1 text-xs text-muted-foreground">PIR = PTS + REB + AST + STL + BLK + Fouls Drawn − Missed FG − Missed FT − TO − Fouls</p>
                </div>
                <Badge variant="secondary" className="bg-accent text-accent-foreground">KU-12 ke atas</Badge>
              </div>
              <div className="mt-4 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Atlet</TableHead>
                      <TableHead>Opponent</TableHead>
                      <TableHead>MIN</TableHead>
                      <TableHead>PTS</TableHead>
                      <TableHead>REB</TableHead>
                      <TableHead>AST</TableHead>
                      <TableHead>STL</TableHead>
                      <TableHead>BLK</TableHead>
                      <TableHead>TO</TableHead>
                      <TableHead>+/−</TableHead>
                      <TableHead className="text-right">PIR</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MATCH_STATS.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.athleteName}</TableCell>
                        <TableCell className="text-muted-foreground">{s.opponent}</TableCell>
                        <TableCell>{s.min}</TableCell>
                        <TableCell>{s.pts}</TableCell>
                        <TableCell>{s.reb}</TableCell>
                        <TableCell>{s.ast}</TableCell>
                        <TableCell>{s.stl}</TableCell>
                        <TableCell>{s.blk}</TableCell>
                        <TableCell>{s.to}</TableCell>
                        <TableCell className={s.pm >= 0 ? "text-primary" : "text-destructive"}>{s.pm > 0 ? `+${s.pm}` : s.pm}</TableCell>
                        <TableCell className="text-right font-display font-bold text-primary">{calcPIR(s)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new" className="mt-6">
          <NewAssessmentForm />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

function NewAssessmentForm() {
  const athlete = PERIODIC_ASSESSMENTS[0];
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(SKILL_CATEGORIES.map((c) => [c, athlete.current[c]]))
  );
  const [note, setNote] = useState(athlete.coachNote);

  const handleFinalize = () => toast.success("Assessment finalized", { description: `${athlete.athleteName} — visible to parent` });
  const handleDraft = () => toast.success("Draft saved");

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="border-border/70">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-primary" />
            <div>
              <h2 className="font-display text-lg font-semibold">Periodic Skill Assessment</h2>
              <p className="text-xs text-muted-foreground">Atlet: {athlete.athleteName} · {athlete.team}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Skala: {SKILL_SCALE.map((s) => `${s.v}=${s.label}`).join(" · ")}
          </p>
          <div className="mt-5 space-y-5">
            {SKILL_CATEGORIES.map((c) => (
              <div key={c}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium">{c}</span>
                  <span className="font-display text-base font-bold text-primary">{scores[c]} · {SKILL_SCALE[scores[c] - 1]?.label}</span>
                </div>
                <Slider value={[scores[c]]} min={1} max={5} step={1} onValueChange={([v]) => setScores({ ...scores, [c]: v })} />
              </div>
            ))}
          </div>
          <div className="mt-6">
            <p className="mb-2 text-sm font-medium">Coach Note & Recommendations</p>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} className="min-h-28" />
          </div>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={handleDraft}><Save className="mr-1 h-4 w-4" />Save Draft</Button>
            <Button onClick={handleFinalize}><FileCheck2 className="mr-1 h-4 w-4" />Finalize Assessment</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardContent className="p-6">
          <h3 className="font-display text-lg font-semibold">Live Radar Preview</h3>
          <p className="mt-1 text-xs text-muted-foreground">Current vs Previous Period</p>
          <div className="mt-4 flex justify-center">
            <RadarChart
              axes={[...SKILL_CATEGORIES]}
              series={[
                { label: "Previous", color: "#94a3b8", values: SKILL_CATEGORIES.map((c) => athlete.previous[c]) },
                { label: "Current", color: "hsl(var(--primary))", values: SKILL_CATEGORIES.map((c) => scores[c]) },
              ]}
            />
          </div>
          <div className="mt-3 flex items-center justify-center gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-400" />Previous</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" />Current</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
