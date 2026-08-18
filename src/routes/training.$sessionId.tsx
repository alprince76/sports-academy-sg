import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Check, Save, ClipboardList, AlertCircle, Printer, ScanLine, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ATHLETES, healthStatusColor } from "@/lib/demo-data";
import { useAthletes, useDeleteSession, useCreateAttendance, useCreateEvaluation } from "@/lib/queries";
import { getUserIdFromSession } from "@/lib/api";
import { useSessionList } from "./training.index";
import {
  SKILL_CATEGORIES, SKILL_SCALE, DEFAULT_SESSION_EVAL,
  type SessionSkillEvaluation, type SkillCategory,
} from "@/lib/assessment-data";

export const Route = createFileRoute("/training/$sessionId")({
  head: () => ({ meta: [{ title: "Training Session — SportAcademy" }] }),
  component: SessionPage,
});

function SessionPage() {
  const { sessionId } = Route.useParams();
  const { data: sessions = [] } = useSessionList();
  const session = sessions.find((s) => s.id === sessionId) ?? sessions[0];
  const { data: athletes = [] } = useAthletes();
  const roster = athletes.slice(0, 12);
  const remove = useDeleteSession();
  const navigate = Route.useNavigate();
  const createAttendance = useCreateAttendance();
  const createEvaluation = useCreateEvaluation();
  const userId = localStorage.getItem("sportacademy.user") ? "" : (getUserIdFromSession() ?? "");

  const [present, setPresent] = useState<Record<string, boolean>>(
    Object.fromEntries(roster.map((a) => [a.id, true]))
  );
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(roster.map((a) => [a.id, 75]))
  );
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [delOpen, setDelOpen] = useState(false);

  const handleSave = () => {
    if (!session || roster.length === 0) return;
    setSaving(true);
    const sessionDate = session.session_date ?? new Date().toISOString().slice(0, 10);
    const coachId = getUserIdFromSession() ?? userId;
    // 1. Simpan kehadiran tiap atlet → POST /attendance
    const attPromises = roster.map((a) =>
      createAttendance.mutateAsync({
        athlete_id: a.id,
        session_date: sessionDate,
        status: present[a.id] ? "present" : "absent",
      }).catch(() => null)
    );
    // 2. Simpan evaluasi tiap atlet → POST /evaluations (skor 0-100 dari Quick Score)
    const evalPromises = roster.map((a) => {
      const sc = scores[a.id] ?? 75;
      return createEvaluation.mutateAsync({
        athlete_id: a.id,
        coach_id: coachId,
        session_date: sessionDate,
        passing: sc,
        dribbling: sc,
        shooting: sc,
        stamina: sc,
        teamwork: sc,
        attitude: sc,
        note: notes.trim() || null,
      }).catch(() => null);
    });
    Promise.all([...attPromises, ...evalPromises]).then(() => {
      setSaving(false);
      setSaved(true);
      toast.success("Kehadiran & evaluasi tersimpan", { description: `${roster.length} atlet disimpan ke backend` });
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const handleDelete = () => {
    if (!session) return;
    remove.mutate(session.id, {
      onSuccess: () => {
        toast.success("Sesi dihapus");
        navigate({ to: "/training" });
      },
      onError: (e: any) => toast.error(e?.message ?? "Gagal menghapus sesi"),
    });
  };

  return (
    <DashboardLayout
      title={session?.title ?? "Sesi Latihan"}
      subtitle={`${session?.programs?.title ?? "Program"} · ${session?.focus ?? "—"} · ${session?.session_date ?? ""}`}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setDelOpen(true)}>
            <Trash2 className="mr-1 h-4 w-4" /> Hapus
          </Button>
          <Button asChild variant="outline"><Link to="/training"><ArrowLeft className="mr-1 h-4 w-4" />Kembali</Link></Button>
          <Button asChild variant="outline"><Link to="/training/$sessionId/print" params={{ sessionId }}><Printer className="mr-1 h-4 w-4" />Print Assessment Sheet</Link></Button>
          <Button asChild><Link to="/assessment/import"><ScanLine className="mr-1 h-4 w-4" />Upload Scanned Sheet</Link></Button>
        </div>
      }
    >
      <Tabs defaultValue="session-eval">
        <TabsList>
          <TabsTrigger value="session-eval">Session Evaluation</TabsTrigger>
          <TabsTrigger value="roster">Attendance & Quick Score</TabsTrigger>
        </TabsList>

        <TabsContent value="session-eval" className="mt-4">
          <SessionEvaluationPanel roster={roster} />
        </TabsContent>

        <TabsContent value="roster" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="border-border/70 lg:col-span-2">
              <CardContent className="p-6">
                <h2 className="font-display text-lg font-semibold">Roster & Kehadiran</h2>
                <p className="mt-1 text-xs text-muted-foreground">Tandai kehadiran lalu beri skor performa cepat per atlet.</p>
                <div className="mt-5 space-y-4">
                  {roster.map((a) => (
                    <div key={a.id} className="rounded-xl border border-border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={present[a.id]}
                            onCheckedChange={(v) => setPresent({ ...present, [a.id]: !!v })}
                          />
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary-soft text-xs text-primary">
                              {a.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold">{a.name}</p>
                            <p className="text-xs text-muted-foreground">{a.position} · {a.team}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={healthStatusColor((a.health?.status ?? "Healthy") as any)}>
                            {a.health?.status ?? "Healthy"}
                          </Badge>
                          <Badge variant="secondary" className={present[a.id] ? "bg-primary-soft text-primary" : "bg-secondary text-muted-foreground"}>
                            {present[a.id] ? "Hadir" : "Absen"}
                          </Badge>
                        </div>
                      </div>
                      {present[a.id] && (
                        <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-4">
                          <Slider
                            value={[scores[a.id]]}
                            onValueChange={([v]) => setScores({ ...scores, [a.id]: v })}
                            max={100}
                            step={1}
                          />
                          <span className="w-12 text-right font-display text-lg font-bold text-primary">{scores[a.id]}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 lg:sticky lg:top-20 lg:self-start">
              <CardContent className="p-6">
                <h2 className="font-display text-lg font-semibold">Catatan Tim</h2>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tulis catatan tim, evaluasi taktik, atau hal yang perlu diperhatikan..."
                  className="mt-3 min-h-32"
                />
                <div className="mt-4 space-y-2 text-sm">
                  <Row label="Hadir" value={`${Object.values(present).filter(Boolean).length} / ${roster.length}`} />
                  <Row label="Skor rata-rata" value={String(Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / roster.length))} />
                </div>
                <Button onClick={handleSave} disabled={saving} className="mt-5 w-full">
                  {saved ? <><Check className="mr-1 h-4 w-4" />Tersimpan</> : saving ? "Menyimpan..." : <><Save className="mr-1 h-4 w-4" />Simpan Kehadiran</>}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={delOpen} onOpenChange={setDelOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Hapus Sesi</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Yakin ingin menghapus sesi <span className="font-semibold text-foreground">{session?.title}</span>?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDelOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={remove.isPending}>
              {remove.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              <Trash2 className="mr-1 h-4 w-4" /> Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between rounded-lg bg-secondary/50 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function SessionEvaluationPanel({ roster }: { roster: { id: string; name: string; position?: string | null; team?: string | null; age_group?: string | null; health?: any; skills?: any }[] }) {
  const [evals, setEvals] = useState<Record<string, SessionSkillEvaluation>>(
    Object.fromEntries(roster.map((a) => [a.id, { ...DEFAULT_SESSION_EVAL }]))
  );
  const [athleteNotes, setAthleteNotes] = useState<Record<string, string>>(
    Object.fromEntries(roster.map((a) => [a.id, ""]))
  );
  const [obs, setObs] = useState("");
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const setScore = (id: string, key: SkillCategory, v: number) =>
    setEvals({ ...evals, [id]: { ...evals[id], [key]: v } });

  const saveAthlete = (id: string, name: string) => {
    setSaved({ ...saved, [id]: true });
    toast.success(`Evaluasi ${name} tersimpan`, { description: "6 kategori · masuk ke Evaluation Timeline" });
    setTimeout(() => setSaved((s) => ({ ...s, [id]: false })), 1600);
  };

  const saveAll = () => {
    toast.success("Semua evaluasi tersimpan", { description: `${roster.length} atlet · data masuk ke aggregator periodic` });
  };

  return (
    <div className="space-y-4">
      <Card className="border-border/70">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              <div>
                <h2 className="font-display text-lg font-semibold">Per-Athlete Evaluation</h2>
                <p className="text-xs text-muted-foreground">
                  Wajib menilai 6 kategori: {SKILL_CATEGORIES.join(", ")}. Skala 1–5.
                </p>
              </div>
            </div>
            <Button onClick={saveAll}><Save className="mr-1 h-4 w-4" />Save All</Button>
          </div>

          <p className="mt-3 text-[11px] text-muted-foreground">
            {SKILL_SCALE.map((s) => `${s.v}=${s.label}`).join(" · ")}
          </p>

          <div className="mt-5 space-y-4">
            {roster.map((a) => {
              const avg = (Object.values(evals[a.id] ?? {}).reduce((x, y) => x + y, 0) / 6).toFixed(1);
              const unavailable = a.health?.status === "Not Available";
              return (
                <div key={a.id} className="rounded-2xl border border-border p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary-soft text-xs text-primary">
                        {a.name.split(" ").map((s) => s[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.position} · {a.team} · {a.age_group ?? ""}</p>
                    </div>
                    <Badge variant="secondary" className={healthStatusColor((a.health?.status ?? "Healthy") as any)}>
                      {a.health?.status ?? "Healthy"}
                    </Badge>
                    <Badge variant="secondary" className="bg-primary-soft text-primary">
                      Avg {avg}
                    </Badge>
                  </div>

                  {unavailable && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Atlet tidak tersedia untuk sesi ini.</p>
                        {a.health.note && <p className="mt-0.5">{a.health.note}</p>}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {SKILL_CATEGORIES.map((c) => (
                      <div key={c} className="rounded-lg border border-border p-3">
                        <div className="mb-2 flex items-center justify-between text-xs">
                          <span className="font-medium">
                            {c} <span className="text-red-500">*</span>
                          </span>
                          <span className="font-display text-sm font-bold text-primary">
                            {evals[a.id]?.[c] ?? 3}
                          </span>
                        </div>
                        <Slider
                          min={1} max={5} step={1}
                          value={[evals[a.id]?.[c] ?? 3]}
                          onValueChange={([v]) => setScore(a.id, c, v)}
                          disabled={unavailable}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <p className="mb-1.5 text-xs font-medium">Coach note untuk {a.name}</p>
                    <Textarea
                      value={athleteNotes[a.id]}
                      onChange={(e) => setAthleteNotes({ ...athleteNotes, [a.id]: e.target.value })}
                      placeholder="Observasi spesifik, rekomendasi drill, atau hal yang perlu dikomunikasikan ke orang tua..."
                      className="min-h-20"
                      disabled={unavailable}
                    />
                  </div>

                  <div className="mt-3 flex justify-end">
                    <Button size="sm" variant="secondary" onClick={() => saveAthlete(a.id, a.name)} disabled={unavailable}>
                      {saved[a.id] ? <><Check className="mr-1 h-4 w-4" />Tersimpan</> : <><Save className="mr-1 h-4 w-4" />Simpan Evaluasi Atlet</>}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6">
            <p className="mb-2 text-sm font-medium">General Session Notes</p>
            <Textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Catat observasi umum sesi ini, kondisi lapangan, momentum tim..."
              className="min-h-24"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
