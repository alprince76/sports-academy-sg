import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { RadarChart } from "@/components/site/RadarChart";
import { SKILL_CATEGORIES, SKILL_SCALE } from "@/lib/assessment-data";
import { Save, FileCheck2, Target, Send, Eye, ScanLine } from "lucide-react";
import { toast } from "sonner";
import { useAthletes, useAssessments, useCreateAssessment, type Assessment } from "@/lib/queries";

export const Route = createFileRoute("/assessment")({
  head: () => ({ meta: [{ title: "Skill Assessment — SportAcademy" }] }),
  component: AssessmentPage,
});

const STATUS_STYLE: Record<string, string> = {
  Draft: "bg-amber-100 text-amber-800",
  Reviewed: "bg-blue-100 text-blue-800",
  Published: "bg-primary-soft text-primary",
};

function AssessmentPage() {
  const { data: athletes = [] } = useAthletes();
  const athlete = athletes.find((a) => a.name === "Aldi Setiawan") ?? athletes[0];
  const { data: assessments = [], isLoading, isError } = useAssessments(athlete?.id ?? "");

  return (
    <DashboardLayout
      title="Skill Assessment"
      subtitle="Assessment periodik 4–6 minggu. Hanya status 'Published' yang tampil ke orang tua."
      actions={<Button asChild><Link to="/assessment/import"><ScanLine className="mr-1 h-4 w-4" />Import from Scan (OCR)</Link></Button>}
    >
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Assessment Management</TabsTrigger>
          <TabsTrigger value="new">New / Edit Assessment</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-semibold">Periodic Skill Assessments</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Sumber input: Session Evaluation history + Attendance + PIR (KU-12+).
                  </p>
                </div>
                <div className="flex gap-2 text-xs">
                  {(["Draft", "Reviewed", "Published"] as const).map((s) => (
                    <Badge key={s} variant="secondary" className={STATUS_STYLE[s]}>
                      {assessments.filter((p) => p.status === s).length} {s}
                    </Badge>
                  ))}
                </div>
              </div>

              {isLoading && <p className="mt-6 text-center text-sm text-muted-foreground">Memuat assessment...</p>}
              {isError && <p className="mt-6 text-center text-sm text-muted-foreground">Gagal memuat data dari backend. Pastikan backend :8081 jalan.</p>}

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {assessments.map((p) => {
                  const avg = p.avg?.toFixed(1) ?? "—";
                  const delta = p.delta ?? 0;
                  return (
                    <div key={p.id} className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary-soft text-xs text-primary">{(p.athletes?.name ?? "A").split(" ").map(s=>s[0]).join("").slice(0,2)}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-semibold">{p.athletes?.name ?? "Atlet"}</p>
                          <p className="text-xs text-muted-foreground">{p.period}</p>
                        </div>
                        <Badge variant="secondary" className={STATUS_STYLE[p.status]}>{p.status}</Badge>
                      </div>
                      <div className="mt-3 flex items-end justify-between">
                        <div>
                          <p className="text-[10px] uppercase text-muted-foreground">Avg Score</p>
                          <p className="font-display text-2xl font-bold text-primary">{avg}</p>
                        </div>
                        <span className={`text-xs font-semibold ${delta >= 0 ? "text-primary" : "text-destructive"}`}>
                          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)} vs prev
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {p.status === "Draft" && (
                          <Button size="sm" variant="secondary" className="text-xs" onClick={() => toast.success(`${p.athletes?.name} → Reviewed`)}>
                            <Eye className="mr-1 h-3 w-3" />Send for Review
                          </Button>
                        )}
                        {p.status === "Reviewed" && (
                          <Button size="sm" className="text-xs" onClick={() => toast.success(`${p.athletes?.name} → Published`, { description: "Visible di Parent Portal" })}>
                            <Send className="mr-1 h-3 w-3" />Publish
                          </Button>
                        )}
                        {p.status === "Published" && (
                          <Badge variant="secondary" className="bg-primary-soft text-[10px] text-primary">Visible ke orang tua</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
                {assessments.length === 0 && !isLoading && !isError && (
                  <p className="col-span-full text-center text-sm text-muted-foreground">
                    Belum ada assessment untuk {athlete?.name ?? "atlet"}. Buat di tab "New / Edit Assessment".
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new" className="mt-6">
          <NewAssessmentForm athleteId={athlete?.id ?? ""} athleteName={athlete?.name ?? "Atlet"} team={athlete?.team ?? "—"} />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

function NewAssessmentForm({ athleteId, athleteName, team }: { athleteId: string; athleteName: string; team: string }) {
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(SKILL_CATEGORIES.map((c) => [c, 3]))
  );
  const [note, setNote] = useState("");
  const create = useCreateAssessment();

  const submit = (status: "Draft" | "Reviewed" | "Published") => {
    if (!athleteId) { toast.error("Belum ada atlet"); return; }
    create.mutate({
      athlete_id: athleteId,
      period: new Date().toISOString().slice(0, 7),
      status,
      scores,
      coach_note: note || null,
      recommendations: [],
    }, {
      onSuccess: () => toast.success(`Assessment ${status === "Published" ? "dipublish" : status.toLowerCase()}`),
      onError: (e: any) => toast.error(e?.message ?? "Gagal menyimpan"),
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="border-border/70">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-primary" />
            <div>
              <h2 className="font-display text-lg font-semibold">Periodic Skill Assessment</h2>
              <p className="text-xs text-muted-foreground">Atlet: {athleteName} · {team}</p>
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
            <Button variant="outline" onClick={() => submit("Draft")} disabled={create.isPending}><Save className="mr-1 h-4 w-4" />Save Draft</Button>
            <Button variant="outline" onClick={() => submit("Reviewed")} disabled={create.isPending}><FileCheck2 className="mr-1 h-4 w-4" />Mark Reviewed</Button>
            <Button onClick={() => submit("Published")} disabled={create.isPending}>
              <Send className="mr-1 h-4 w-4" />Publish to Parent
            </Button>
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
                { label: "Previous", color: "#94a3b8", values: SKILL_CATEGORIES.map(() => 3) },
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
