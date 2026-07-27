import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScanLine, Upload, FileImage, CheckCircle2, XCircle, Send, RefreshCw, AlertTriangle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ATHLETES } from "@/lib/demo-data";
import { SKILL_CATEGORIES, type SkillCategory } from "@/lib/assessment-data";

export const Route = createFileRoute("/assessment/import")({
  head: () => ({ meta: [{ title: "OCR Import — SportAcademy" }] }),
  component: OcrImportPage,
});

type Row = {
  athleteId: string;
  present: boolean;
  scores: Record<SkillCategory, number>;
  note: string;
  confidence: number;
  flagged: boolean;
};

const seedExtract = (): Row[] =>
  ATHLETES.slice(0, 6).map((a, i) => ({
    athleteId: a.id,
    present: i !== 4,
    scores: Object.fromEntries(SKILL_CATEGORIES.map((c, j) => [c, 2 + ((i + j) % 4)])) as Record<SkillCategory, number>,
    note: ["Konsisten shooting form", "Perlu tingkatkan defense stance", "Effort tinggi hari ini", "Coba lebih agresif rebound", "-", "Improve on decision making"][i],
    confidence: [96, 92, 88, 74, 60, 90][i],
    flagged: i === 3 || i === 4,
  }));

function OcrImportPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [stage, setStage] = useState<"upload" | "processing" | "review" | "saved">("upload");
  const [rows, setRows] = useState<Row[]>([]);
  const [session, setSession] = useState({
    coach: "Coach Bayu",
    date: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
    team: "Garuda Elite (KU-12)",
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const onPick = (f: File | null) => {
    if (!f) return;
    setFile(f);
    if (f.type.startsWith("image/")) setPreviewUrl(URL.createObjectURL(f));
    else setPreviewUrl(null);
  };

  const runOcr = () => {
    if (!file) { toast.error("Upload dulu assessment sheet-nya."); return; }
    setStage("processing");
    setTimeout(() => {
      setRows(seedExtract());
      setStage("review");
      toast.success("OCR selesai", { description: "6 atlet terdeteksi. Silakan review." });
    }, 1400);
  };

  const setScore = (id: string, cat: SkillCategory, v: number) =>
    setRows((r) => r.map((x) => x.athleteId === id ? { ...x, scores: { ...x.scores, [cat]: Math.max(1, Math.min(5, v)) } } : x));

  const flaggedCount = rows.filter((r) => r.flagged).length;

  const approve = () => {
    setStage("saved");
    toast.success("Assessment tersimpan", { description: `${rows.length} atlet — status Draft, siap direview.` });
  };

  const publish = () => {
    toast.success("Published ke Parent Portal", { description: "Semua parent akan menerima notifikasi." });
    navigate({ to: "/assessment" });
  };

  const reset = () => {
    setFile(null); setPreviewUrl(null); setRows([]); setStage("upload");
  };

  return (
    <DashboardLayout
      title="OCR Import — Assessment Sheet"
      subtitle="Upload lembar assessment yang sudah diisi manual di lapangan. Sistem akan mengekstrak nilai secara otomatis."
      actions={<Button asChild variant="outline"><Link to="/assessment">Kembali ke Skill Assessment</Link></Button>}
    >
      <div className="mb-4 rounded-xl border border-primary/20 bg-primary-soft/40 p-4">
        <div className="flex items-start gap-3">
          <ScanLine className="mt-0.5 h-5 w-5 text-primary" />
          <div className="text-xs text-primary">
            <p className="font-semibold">Alur baru — offline first</p>
            <p className="mt-1 text-primary/80">
              Print Assessment Sheet dari Training Session → coach mengisi manual di court → foto/scan → upload di sini → OCR & review → publish ke parent.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Left: source */}
        <Card className="border-border/70 lg:sticky lg:top-20 lg:self-start">
          <CardContent className="p-5">
            <h3 className="font-display text-sm font-semibold">1. Session Info</h3>
            <div className="mt-3 space-y-2 text-xs">
              <Field l="Coach"><Input value={session.coach} onChange={(e) => setSession({ ...session, coach: e.target.value })} className="h-8" /></Field>
              <Field l="Training Date"><Input value={session.date} onChange={(e) => setSession({ ...session, date: e.target.value })} className="h-8" /></Field>
              <Field l="Team"><Input value={session.team} onChange={(e) => setSession({ ...session, team: e.target.value })} className="h-8" /></Field>
            </div>

            <h3 className="mt-5 font-display text-sm font-semibold">2. Upload Sheet</h3>
            <p className="mt-1 text-[11px] text-muted-foreground">PDF, JPG, PNG · maks 20 MB</p>
            <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden"
              onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
            <button
              onClick={() => fileRef.current?.click()}
              className="mt-3 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-6 text-muted-foreground hover:border-primary/50 hover:text-primary"
            >
              {previewUrl ? (
                <img src={previewUrl} alt="scan" className="max-h-40 rounded-md object-contain" />
              ) : (
                <>
                  <Upload className="h-8 w-8" />
                  <span className="text-xs">Klik untuk pilih file scan / foto</span>
                </>
              )}
            </button>
            {file && (
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-border p-2 text-xs">
                <FileImage className="h-4 w-4 text-primary" />
                <span className="flex-1 truncate">{file.name}</span>
                <span className="text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</span>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <Button onClick={runOcr} disabled={!file || stage === "processing"} className="flex-1">
                {stage === "processing" ? <><RefreshCw className="mr-1 h-4 w-4 animate-spin" />Membaca...</> : <><Sparkles className="mr-1 h-4 w-4" />Run OCR</>}
              </Button>
              {stage !== "upload" && (
                <Button variant="outline" onClick={reset}>Reset</Button>
              )}
            </div>

            {previewUrl && stage !== "upload" && (
              <div className="mt-5">
                <p className="text-[11px] font-medium text-muted-foreground">Original Scan</p>
                <img src={previewUrl} alt="original" className="mt-2 rounded-lg border border-border" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: extracted data */}
        <div className="space-y-4">
          {stage === "upload" && (
            <Card className="border-border/70">
              <CardContent className="p-10 text-center text-sm text-muted-foreground">
                <ScanLine className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <p className="mt-3 font-medium">Belum ada data ekstrak</p>
                <p className="mt-1 text-xs">Upload sheet di kiri, lalu klik Run OCR.</p>
              </CardContent>
            </Card>
          )}

          {stage === "processing" && (
            <Card className="border-border/70">
              <CardContent className="p-10 text-center">
                <RefreshCw className="mx-auto h-10 w-10 animate-spin text-primary" />
                <p className="mt-3 font-display font-semibold">Membaca lembar assessment...</p>
                <p className="mt-1 text-xs text-muted-foreground">Mendeteksi nama, skor, catatan, kehadiran.</p>
              </CardContent>
            </Card>
          )}

          {(stage === "review" || stage === "saved") && (
            <>
              <Card className="border-border/70">
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-semibold">3. Review Extracted Data</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Coach memverifikasi dan mengedit nilai sebelum disimpan. Baris ber-flag ⚠️ butuh perhatian.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-primary-soft text-primary">
                        {rows.length} atlet terdeteksi
                      </Badge>
                      {flaggedCount > 0 && (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                          <AlertTriangle className="mr-1 h-3 w-3" />{flaggedCount} perlu review
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {rows.map((r) => {
                const athlete = ATHLETES.find((a) => a.id === r.athleteId)!;
                const confColor = r.confidence >= 90 ? "bg-primary-soft text-primary" : r.confidence >= 75 ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800";
                return (
                  <Card key={r.athleteId} className={`border ${r.flagged ? "border-amber-300 bg-amber-50/40" : "border-border/70"}`}>
                    <CardContent className="p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{athlete.name}</p>
                          <p className="text-[11px] text-muted-foreground">{athlete.position} · {athlete.team}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={confColor}>OCR {r.confidence}%</Badge>
                          <label className="flex items-center gap-1.5 text-xs">
                            <input type="checkbox" checked={r.present}
                              onChange={(e) => setRows((rs) => rs.map((x) => x.athleteId === r.athleteId ? { ...x, present: e.target.checked } : x))}
                            />
                            Hadir
                          </label>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
                        {SKILL_CATEGORIES.map((c) => (
                          <div key={c} className="rounded-lg border border-border bg-background p-2">
                            <p className="text-[10px] uppercase text-muted-foreground">{c}</p>
                            <div className="mt-1 flex items-center gap-1">
                              <Input type="number" min={1} max={5} value={r.scores[c]}
                                onChange={(e) => setScore(r.athleteId, c, parseInt(e.target.value) || 1)}
                                className="h-8 w-14 text-center font-display font-bold"
                              />
                              <span className="text-[10px] text-muted-foreground">/5</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3">
                        <p className="mb-1 text-[11px] font-medium text-muted-foreground">Coach Note (extracted)</p>
                        <Textarea value={r.note} className="min-h-14 text-xs"
                          onChange={(e) => setRows((rs) => rs.map((x) => x.athleteId === r.athleteId ? { ...x, note: e.target.value } : x))}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              <Card className="border-border/70">
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-muted-foreground">
                      {stage === "saved"
                        ? "Assessment tersimpan sebagai Draft. Publish untuk membuatnya visible ke parent."
                        : "Setelah approve, data masuk ke Skill Assessment (status Draft) dan Athlete Evaluation History."}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" onClick={() => toast.info("OCR ditolak — silakan upload ulang")}>
                        <XCircle className="mr-1 h-4 w-4" />Reject OCR
                      </Button>
                      {stage === "review" ? (
                        <Button onClick={approve}>
                          <CheckCircle2 className="mr-1 h-4 w-4" />Approve & Save Draft
                        </Button>
                      ) : (
                        <Button onClick={publish}>
                          <Send className="mr-1 h-4 w-4" />Publish to Parent
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function Field({ l, children }: { l: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[10px] uppercase text-muted-foreground">{l}</p>
      {children}
    </div>
  );
}
