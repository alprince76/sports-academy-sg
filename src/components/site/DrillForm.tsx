import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Loader2, ImagePlus } from "lucide-react";
import { toast } from "sonner";

export const DRILL_CATS = ["Mobility", "Ball Handling", "Shooting", "Finishing", "Defense", "Conditioning"];
export const AGE_GROUPS = ["KU-8", "KU-10", "KU-12", "KU-14", "KU-16", "KU-18"];
export const DIFFICULTY = ["Beginner", "Intermediate", "Advanced"];
export const INTENSITY = ["Low", "Medium", "High"];

export interface DrillFormValue {
  title: string;
  category: string;
  focus: string;
  age_group: string;
  difficulty: string;
  intensity: string;
  duration: string;
  equipment: string;
  objective: string;
  instructions: string;
  tips: string;
  common_mistakes: string;
  safety: string;
  tags: string;
}

export function toDrillForm(d: any): DrillFormValue {
  return {
    title: d.title ?? "",
    category: d.category ?? "Ball Handling",
    focus: d.focus ?? "",
    age_group: d.age_group ?? "KU-12",
    difficulty: d.difficulty ?? "Beginner",
    intensity: d.intensity ?? "Medium",
    duration: String(d.duration ?? 10),
    equipment: d.equipment ?? "",
    objective: d.objective ?? "",
    instructions: d.instructions ?? "",
    tips: d.tips ?? "",
    common_mistakes: d.common_mistakes ?? "",
    safety: d.safety ?? "",
    tags: d.tags ?? "",
  };
}

export function fromDrillForm(f: DrillFormValue) {
  return {
    title: f.title.trim(),
    category: f.category,
    difficulty: f.difficulty as any,
    intensity: f.intensity as any,
    duration: Number(f.duration) || 10,
    focus: f.focus || f.category,
    equipment: f.equipment || null,
    age_group: f.age_group || null,
    objective: f.objective || null,
    instructions: f.instructions || null,
    tips: f.tips || null,
    common_mistakes: f.common_mistakes || null,
    safety: f.safety || null,
    tags: f.tags || null,
  };
}

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <Label className="mb-1.5 block text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}

export function DrillForm({
  initial,
  onSave,
  saving,
}: {
  initial: DrillFormValue;
  onSave: (form: DrillFormValue) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<DrillFormValue>(initial);
  const set = (k: keyof DrillFormValue, v: string) => setForm({ ...form, [k]: v });

  const submit = () => {
    if (!form.title.trim()) { toast.error("Drill Name wajib diisi"); return; }
    onSave(form);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="border-border/70">
        <CardContent className="space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Drill Name"><Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Contoh: Two-ball dribble" /></Field>
            <Field label="Skill Focus"><Input value={form.focus} onChange={(e) => set("focus", e.target.value)} placeholder="Ball Handling / Shooting / Defense..." /></Field>
            <Field label="Category">
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DRILL_CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Age Category">
              <Select value={form.age_group} onValueChange={(v) => set("age_group", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{AGE_GROUPS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Difficulty">
              <Select value={form.difficulty} onValueChange={(v) => set("difficulty", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DIFFICULTY.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Intensity">
              <Select value={form.intensity} onValueChange={(v) => set("intensity", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{INTENSITY.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Duration (menit)"><Input type="number" value={form.duration} onChange={(e) => set("duration", e.target.value)} /></Field>
            <Field label="Equipment (comma-separated)" wide><Input value={form.equipment} onChange={(e) => set("equipment", e.target.value)} placeholder="Bola, Cone, Ring..." /></Field>
          </div>

          <Field label="Objective"><Textarea value={form.objective} onChange={(e) => set("objective", e.target.value)} className="min-h-20" /></Field>
          <Field label="Instructions"><Textarea value={form.instructions} onChange={(e) => set("instructions", e.target.value)} className="min-h-24" placeholder="Deskripsi langkah drill secara berurutan..." /></Field>
          <Field label="Coaching Tips"><Textarea value={form.tips} onChange={(e) => set("tips", e.target.value)} className="min-h-20" placeholder="Kunci coaching yang perlu ditekankan..." /></Field>
          <Field label="Common Mistakes"><Textarea value={form.common_mistakes} onChange={(e) => set("common_mistakes", e.target.value)} className="min-h-20" /></Field>
          <Field label="Safety Notes"><Textarea value={form.safety} onChange={(e) => set("safety", e.target.value)} className="min-h-16" /></Field>
          <Field label="Tags (comma-separated)"><Input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="dribble, warmup, coordination" /></Field>

          <div className="flex justify-end gap-2">
            <Button onClick={submit} disabled={saving}>{saving ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" />Menyimpan...</> : <><Save className="mr-1 h-4 w-4" />Save Drill</>}</Button>
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
  );
}
