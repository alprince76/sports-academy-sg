import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadarChart } from "@/components/site/RadarChart";
import { SKILL_CATEGORIES, SKILL_SCALE } from "@/lib/assessment-data";
import { Save, FileCheck2, Target, Send, Eye, ScanLine, Trash2, Pencil, Loader2, Layers3 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { apiData } from "@/lib/api";
import { confirmAction, notifySuccess, notifyError } from "@/lib/confirm";
import { useAthletes, useAssessments, useCreateAssessment, useUpdateAssessment, useDeleteAssessment, type Assessment } from "@/lib/queries";

export const Route = createFileRoute("/assessment/")({
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
  const [athleteId, setAthleteId] = useState<string>("");
  const athlete = athletes.find((a) => a.id === athleteId) ?? athletes[0];
  const { data: assessments = [], isLoading, isError } = useAssessments(athlete?.id ?? "");
  const updateStatus = useUpdateAssessment();
  const remove = useDeleteAssessment();
  const navigate = Route.useNavigate();
  const [editing, setEditing] = useState<Assessment | null>(null);
  const [batchOpen, setBatchOpen] = useState(false);

  // set default atlet pertama saat data siap
  useEffect(() => {
    if (!athleteId && athletes.length > 0) setAthleteId(athletes[0].id);
  }, [athletes, athleteId]);

  const changeStatus = async (a: Assessment, status: "Reviewed" | "Published") => {
    const confirmed = await confirmAction({ title: "Ubah status?", text: `Ubah status ${a.athletes?.name ?? "Atlet"} menjadi ${status}?`, confirmText: "Ya, Ubah", danger: false });
    if (!confirmed) return;
    updateStatus.mutate({ id: a.id, status }, {
      onSuccess: () => notifySuccess({ title: "Status diperbarui", text: `${a.athletes?.name ?? "Atlet"} → ${status}` }),
      onError: (e: any) => notifyError({ title: "Gagal mengubah status", text: e?.message }),
    });
  };

  const deleteAssessment = async (a: Assessment) => {
    const confirmed = await confirmAction({ title: "Hapus assessment?", text: "Data assessment dihapus permanen.", confirmText: "Ya, Hapus", danger: true });
    if (!confirmed) return;
    remove.mutate(a.id, {
      onSuccess: () => notifySuccess({ title: "Terhapus", text: "Assessment dihapus" }),
      onError: (e: any) => notifyError({ title: "Gagal menghapus", text: e?.message }),
    });
  };

  return (
    <DashboardLayout
      title="Skill Assessment"
      subtitle="Assessment periodik 4–6 minggu. Hanya status 'Published' yang tampil ke orang tua."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Atlet:</span>
            <Select value={athlete?.id ?? ""} onValueChange={setAthleteId}>
              <SelectTrigger className="w-52"><SelectValue placeholder="Pilih atlet" /></SelectTrigger>
              <SelectContent>
                {athletes.map((a) => <SelectItem key={a.id} value={a.id}>{a.name} · {a.team ?? "—"}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={() => setBatchOpen(true)}><Layers3 className="mr-1 h-4 w-4" />Batch Koreksi</Button>
          <Button asChild><Link to="/assessment/import"><ScanLine className="mr-1 h-4 w-4" />Import from Scan (OCR)</Link></Button>
        </div>
      }
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
                      <Link to="/assessment/$assessmentId" params={{ assessmentId: p.id }} className="block">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary-soft text-xs text-primary">{(p.athletes?.name ?? "A").split(" ").map(s=>s[0]).join("").slice(0,2)}</AvatarFallback></Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-semibold group-hover:text-primary">{p.athletes?.name ?? "Atlet"}</p>
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
                      </Link>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {p.status === "Draft" && (
                          <Button size="sm" variant="secondary" className="text-xs" onClick={() => changeStatus(p, "Reviewed")}>
                            <Eye className="mr-1 h-3 w-3" />Send for Review
                          </Button>
                        )}
                        {p.status === "Reviewed" && (
                          <Button size="sm" className="text-xs" onClick={() => changeStatus(p, "Published")}>
                            <Send className="mr-1 h-3 w-3" />Publish
                          </Button>
                        )}
                        {p.status === "Published" && (
                          <Badge variant="secondary" className="bg-primary-soft text-[10px] text-primary">Visible ke orang tua</Badge>
                        )}
                        <Button size="sm" variant="ghost" className="text-xs" onClick={() => setEditing(p)}>
                          <Pencil className="mr-1 h-3 w-3" />Edit
                        </Button>
                        <Button size="sm" variant="ghost" className="ml-auto text-xs text-destructive hover:text-destructive" onClick={() => deleteAssessment(p)}>
                          <Trash2 className="mr-1 h-3 w-3" />Hapus
                        </Button>
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

      <EditAssessmentDialog assessment={editing} onClose={() => setEditing(null)} />
      <BatchEditDialog open={batchOpen} onClose={() => setBatchOpen(false)} />
    </DashboardLayout>
  );
}

/** Batch koreksi — tampilkan semua assessment Draft lintas atlet, checkbox, ubah skor/catatan sekali untuk semua terpilih. */
function BatchEditDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: athletes = [] } = useAthletes();
  const update = useUpdateAssessment();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(SKILL_CATEGORIES.map((c) => [c, 3]))
  );
  const [note, setNote] = useState("");
  const [loaded, setLoaded] = useState<Record<string, { id: string; name: string }>>({});
  const [saving, setSaving] = useState(false);

  // fetch semua assessment Draft lintas atlet (agregasi)
  useEffect(() => {
    if (!open || !athletes.length) return;
    let cancelled = false;
    (async () => {
      const map: Record<string, { id: string; name: string }> = {};
      for (const a of athletes) {
        try {
          const list = await apiData<Assessment[]>(`/assessments?athlete_id=${a.id}`);
          const draft = list.find((x) => x.status === "Draft");
          if (draft) map[draft.id] = { id: draft.id, name: a.name };
        } catch { /* skip */ }
      }
      if (!cancelled) setLoaded(map);
    })();
    return () => { cancelled = true; };
  }, [open, athletes]);

  const ids = Object.keys(loaded);
  const selIds = ids.filter((id) => selected[id]);

  const applyToAll = async () => {
    if (selIds.length === 0) { toast.info("Pilih minimal 1 assessment"); return; }
    const confirmed = await confirmAction({ title: "Terapkan koreksi?", text: `Perbarui ${selIds.length} assessment terpilih?`, confirmText: "Ya, Terapkan", danger: false });
    if (!confirmed) return;
    setSaving(true);
    Promise.all(selIds.map((id) =>
      update.mutateAsync({ id, scores, coach_note: note.trim() || null } as any)
        .then(() => true).catch(() => false)
    )).then((res) => {
      const ok = res.filter(Boolean).length;
      setSaving(false);
      notifySuccess({ title: "Batch selesai", text: `${ok}/${selIds.length} assessment diperbarui` });
      setSelected({});
      setNote("");
      qc.invalidateQueries({ queryKey: ["assessments"] });
      onClose();
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Batch Koreksi Assessment</DialogTitle></DialogHeader>
        <p className="text-xs text-muted-foreground">
          Centang assessment Draft yang mau dikoreksi, lalu set skor/catatan — berlaku untuk semua yang terpilih sekaligus.
        </p>

        {/* daftar assessment draft lintas atlet */}
        <div className="mt-3 max-h-60 space-y-1.5 overflow-y-auto rounded-lg border border-border p-2">
          {ids.length === 0 && !Object.keys(loaded).length && (
            <p className="p-3 text-center text-xs text-muted-foreground">Tidak ada assessment Draft.</p>
          )}
          {ids.map((id) => (
            <label key={id} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-secondary/50">
              <Checkbox
                checked={!!selected[id]}
                onCheckedChange={(v) => setSelected({ ...selected, [id]: !!v })}
              />
              <span className="flex-1 text-sm font-medium">{loaded[id]?.name ?? "Atlet"}</span>
              <Badge variant="secondary" className="text-[10px]">{loaded[id]?.id?.slice(0, 8)}</Badge>
            </label>
          ))}
          {ids.length > 0 && (
            <button className="mt-1 w-full rounded-md border border-dashed py-1 text-[11px] font-medium text-primary hover:bg-primary/5"
              onClick={() => setSelected(Object.fromEntries(ids.map((id) => [id, true])))}>
              Pilih semua ({ids.length})
            </button>
          )}
        </div>

        {/* skor & catatan untuk batch */}
        <div className="mt-3 space-y-4">
          {SKILL_CATEGORIES.map((c) => (
            <div key={c}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium">{c}</span>
                <span className="font-display text-base font-bold text-primary">{scores[c]} · {SKILL_SCALE[scores[c] - 1]?.label}</span>
              </div>
              <Slider value={[scores[c]]} min={1} max={5} step={1} onValueChange={([v]) => setScores({ ...scores, [c]: v })} />
            </div>
          ))}
          <div>
            <p className="mb-1.5 text-sm font-medium">Coach Note (semua terpilih)</p>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} className="min-h-20" placeholder="Catatan yang sama untuk semua atlet terpilih (opsional)" />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Batal</Button>
          <Button onClick={applyToAll} disabled={saving || selIds.length === 0}>
            {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Layers3 className="mr-1 h-4 w-4" />}
            Terapkan ke {selIds.length} terpilih
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Modal edit assessment — koreksi skor & catatan sebelum final (Draft/Reviewed). */
function EditAssessmentDialog({ assessment, onClose }: { assessment: Assessment | null; onClose: () => void }) {
  const update = useUpdateAssessment();
  const [scores, setScores] = useState<Record<string, number>>(() => ({ ...(assessment?.scores ?? {}) }));
  const [note, setNote] = useState(assessment?.coach_note ?? "");
  const [saving, setSaving] = useState(false);

  // sync saat berganti assessment
  const [prevId, setPrevId] = useState<string | null>(null);
  if (assessment && assessment.id !== prevId) {
    setPrevId(assessment.id);
    setScores({ ...(assessment.scores ?? {}) });
    setNote(assessment.coach_note ?? "");
  }

  const saveDraft = async (status: "Draft" | "Reviewed" | "Published") => {
    if (!assessment) return;
    const confirmed = await confirmAction({ title: "Simpan perubahan?", text: "Simpan perubahan assessment?", confirmText: "Ya, Simpan", danger: false });
    if (!confirmed) return;
    setSaving(true);
    update.mutate({
      id: assessment.id,
      scores,
      coach_note: note.trim() || null,
      status,
    } as any, {
      onSuccess: () => { notifySuccess({ title: "Tersimpan", text: "Assessment diperbarui" }); setSaving(false); onClose(); },
      onError: (e: any) => { notifyError({ title: "Gagal menyimpan", text: e?.message }); setSaving(false); },
    });
  };

  return (
    <Dialog open={!!assessment} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Edit Assessment</DialogTitle></DialogHeader>
        <p className="text-xs text-muted-foreground">Koreksi skor bila ada human error sebelum final. Skala 1–5.</p>
        <div className="mt-2 space-y-4">
          {SKILL_CATEGORIES.map((c) => (
            <div key={c}>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium">{c}</span>
                <span className="font-display text-base font-bold text-primary">{scores[c] ?? 3} · {SKILL_SCALE[(scores[c] ?? 3) - 1]?.label}</span>
              </div>
              <Slider value={[scores[c] ?? 3]} min={1} max={5} step={1} onValueChange={([v]) => setScores({ ...scores, [c]: v })} />
            </div>
          ))}
          <div>
            <p className="mb-2 text-sm font-medium">Coach Note</p>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} className="min-h-20" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Batal</Button>
          <Button variant="outline" onClick={() => saveDraft("Reviewed")} disabled={saving}>
            {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <FileCheck2 className="mr-1 h-4 w-4" />}Simpan & Review
          </Button>
          <Button onClick={() => saveDraft("Draft")} disabled={saving}>
            {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewAssessmentForm({ athleteId, athleteName, team }: { athleteId: string; athleteName: string; team: string }) {
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(SKILL_CATEGORIES.map((c) => [c, 3]))
  );
  const [note, setNote] = useState("");
  const create = useCreateAssessment();

  const submit = async (status: "Draft" | "Reviewed" | "Published") => {
    if (!athleteId) { toast.error("Belum ada atlet"); return; }
    const confirmed = await confirmAction({ title: "Simpan perubahan?", text: `Simpan assessment sebagai ${status}?`, confirmText: "Ya, Simpan", danger: false });
    if (!confirmed) return;
    create.mutate({
      athlete_id: athleteId,
      period: new Date().toISOString().slice(0, 7),
      status,
      scores,
      coach_note: note || null,
      recommendations: [],
    }, {
      onSuccess: () => notifySuccess({ title: "Tersimpan", text: `Assessment ${status === "Published" ? "dipublish" : status.toLowerCase()}` }),
      onError: (e: any) => notifyError({ title: "Gagal menyimpan", text: e?.message }),
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
