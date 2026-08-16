import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateDrill } from "@/lib/queries";

export const Route = createFileRoute("/drills/new")({
  head: () => ({ meta: [{ title: "Create Drill — SportAcademy" }] }),
  component: CreateDrillPage,
});

const DRILL_CATS = ["Mobility", "Ball Handling", "Shooting", "Finishing", "Defense", "Conditioning"];

function CreateDrillPage() {
  const navigate = useNavigate();
  const create = useCreateDrill();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", category: "Ball Handling", focus: "", ageGroup: "KU-12",
    difficulty: "Beginner", intensity: "Medium", duration: "10", equipment: "",
    objective: "", instructions: "", tips: "", mistakes: "", safety: "", tags: "",
  });
  const set = (k: keyof typeof form, v: string) => setForm({ ...form, [k]: v });

  const save = () => {
    if (!form.name.trim()) { toast.error("Drill Name wajib diisi"); return; }
    setSaving(true);
    create.mutate({
      category: form.category,
      title: form.name.trim(),
      difficulty: form.difficulty as any,
      intensity: form.intensity as any,
      duration: Number(form.duration) || 10,
      focus: form.focus || form.category,
      equipment: form.equipment || null,
    }, {
      onSuccess: () => {
        toast.success("Drill tersimpan ke backend", { description: form.name });
        setTimeout(() => navigate({ to: "/drills" }), 600);
      },
      onError: (e: any) => { toast.error(e?.message ?? "Gagal menyimpan drill"); setSaving(false); },
    });
  };

  return (
    <DashboardLayout
      title="Create Drill"
      subtitle="Tambah drill baru ke library — bisa dipakai di Session Builder."
      actions={<Button asChild variant="outline"><Link to="/drills"><ArrowLeft className="mr-1 h-4 w-4" />Kembali</Link></Button>}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="border-border/70">
          <CardContent className="space-y-5 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Drill Name"><Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Contoh: Two-ball dribble" /></Field>
              <Field label="Skill Focus"><Input value={form.focus} onChange={(e) => set("focus", e.target.value)} placeholder="Ball Handling / Shooting / Defense..." /></Field>
              <Field label="Category">
                <Select value={form.category} onValueChange={(v) => set("category", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{DRILL_CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Age Category">
                <Select value={form.ageGroup} onValueChange={(v) => set("ageGroup", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["KU-8", "KU-10", "KU-12", "KU-14", "KU-16", "KU-18"].map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Difficulty">
                <Select value={form.difficulty} onValueChange={(v) => set("difficulty", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Beginner", "Intermediate", "Advanced"].map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Intensity">
                <Select value={form.intensity} onValueChange={(v) => set("intensity", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Low", "Medium", "High"].map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Duration (menit)"><Input type="number" value={form.duration} onChange={(e) => set("duration", e.target.value)} /></Field>
              <Field label="Equipment (comma-separated)" wide><Input value={form.equipment} onChange={(e) => set("equipment", e.target.value)} placeholder="Bola, Cone, Ring..." /></Field>
            </div>

            <Field label="Objective"><Textarea value={form.objective} onChange={(e) => set("objective", e.target.value)} className="min-h-20" /></Field>
            <Field label="Instructions"><Textarea value={form.instructions} onChange={(e) => set("instructions", e.target.value)} className="min-h-24" placeholder="Deskripsi langkah drill secara berurutan..." /></Field>
            <Field label="Coaching Tips"><Textarea value={form.tips} onChange={(e) => set("tips", e.target.value)} className="min-h-20" placeholder="Kunci coaching yang perlu ditekankan..." /></Field>
            <Field label="Common Mistakes"><Textarea value={form.mistakes} onChange={(e) => set("mistakes", e.target.value)} className="min-h-20" /></Field>
            <Field label="Safety Notes"><Textarea value={form.safety} onChange={(e) => set("safety", e.target.value)} className="min-h-16" /></Field>
            <Field label="Tags (comma-separated)"><Input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="dribble, warmup, coordination" /></Field>

            <div className="flex justify-end gap-2">
              <Button variant="outline" asChild><Link to="/drills">Batal</Link></Button>
              <Button onClick={save} disabled={saving}>{saving ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" />Menyimpan...</> : <><Save className="mr-1 h-4 w-4" />Save Drill</>}</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 lg:sticky lg:top-20 lg:self-start">
          <CardContent className="p-6">
            <h3 className="font-display text-sm font-semibold">Media Placeholder</h3>
            <div className="mt-3 flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-border text-muted-foreground">
              <div className="text-center">
                <ImagePlus className="mx-auto h-8 w-8" />
                <p className="mt-2 text-xs">Upload gambar / video demo</p>
              </div>
            </div>
            <p className="mt-3 text-[10px] text-muted-foreground">Format: JPG, PNG, MP4 (maks 20 MB).</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <Label className="mb-1.5 block text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}
