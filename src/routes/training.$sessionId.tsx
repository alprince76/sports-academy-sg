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
import { ArrowLeft, Check, Save, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { ATHLETES } from "@/lib/demo-data";
import { SESSIONS } from "./training.index";
import { SESSION_EVAL_FIELDS, type SessionEvaluation } from "@/lib/assessment-data";

export const Route = createFileRoute("/training/$sessionId")({
  head: () => ({ meta: [{ title: "Training Session — SportAcademy" }] }),
  component: SessionPage,
});

function SessionPage() {
  const { sessionId } = Route.useParams();
  const session = SESSIONS.find((s) => s.id === sessionId) ?? SESSIONS[0];
  const roster = ATHLETES.slice(0, 6);

  const [present, setPresent] = useState<Record<string, boolean>>(
    Object.fromEntries(roster.map((a) => [a.id, true]))
  );
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(roster.map((a) => [a.id, 75]))
  );
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      toast.success("Evaluasi tersimpan", { description: `${roster.length} atlet dievaluasi` });
      setTimeout(() => setSaved(false), 2000);
    }, 900);
  };

  return (
    <DashboardLayout
      title={session.title}
      subtitle={`${session.coach} · ${session.team} · ${session.date}, ${session.time}`}
      actions={<Button asChild variant="outline"><Link to="/training"><ArrowLeft className="mr-1 h-4 w-4" />Kembali</Link></Button>}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/70 lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="font-display text-lg font-semibold">Roster & Evaluasi</h2>
            <p className="mt-1 text-xs text-muted-foreground">Tandai kehadiran lalu beri skor performa per atlet.</p>
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
                    <Badge variant="secondary" className={present[a.id] ? "bg-primary-soft text-primary" : "bg-secondary text-muted-foreground"}>
                      {present[a.id] ? "Hadir" : "Absen"}
                    </Badge>
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
            <h2 className="font-display text-lg font-semibold">Catatan Pelatih</h2>
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
              {saved ? <><Check className="mr-1 h-4 w-4" />Tersimpan</> : saving ? "Menyimpan..." : <><Save className="mr-1 h-4 w-4" />Simpan Evaluasi</>}
            </Button>
          </CardContent>
        </Card>
      </div>
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
