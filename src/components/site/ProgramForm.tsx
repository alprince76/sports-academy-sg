import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, Info, Target, Settings2, ClipboardList, StickyNote } from "lucide-react";
import { toast } from "sonner";
import type { Program } from "@/lib/queries";
import { useTeams, useCoaches } from "@/lib/queries";

export const FOCUS_OPTIONS = ["Fundamental", "Shooting", "Defense", "Ball Handling", "Conditioning", "Tactical"];
export const SKILL_OPTIONS = ["Shooting", "Ball Handling", "Defense", "Teamwork", "Basketball IQ", "Athleticism"];

export interface ProgramFormValues {
  name: string;
  description: string;
  ageGroup: string;
  team: string;
  season: string;
  coach: string;
  assistant: string;
  startDate: string;
  endDate: string;
  primaryObj: string;
  secondaryObj: string;
  expected: string;
  sessionsPerWeek: string;
  totalSessions: string;
  sessionDuration: string;
  intensity: string;
  focus: string[];
  targetSkills: string[];
  method: "skill" | "pir" | "both";
  frequency: string;
  equipment: string;
  instructions: string;
  medical: string;
  notes: string;
}

export function emptyForm(): ProgramFormValues {
  return {
    name: "", description: "", ageGroup: "KU-12", team: "Garuda Elite",
    season: "Season 2026", coach: "Coach Bayu", assistant: "",
    startDate: "", endDate: "",
    primaryObj: "", secondaryObj: "", expected: "",
    sessionsPerWeek: "3", totalSessions: "24", sessionDuration: "90",
    intensity: "Medium",
    focus: [], targetSkills: [],
    method: "both", frequency: "Monthly",
    equipment: "", instructions: "", medical: "", notes: "",
  };
}

/** Konversi data program (backend) → nilai form */
export function formFromProgram(p: Program): ProgramFormValues {
  return {
    name: p.title ?? "",
    description: p.description ?? "",
    ageGroup: p.age_group ?? "KU-12",
    team: p.team ?? "",
    season: p.season ?? "",
    coach: p.head_coach ?? "",
    assistant: p.assistant_coach ?? "",
    startDate: p.start_date ?? "",
    endDate: p.end_date ?? "",
    primaryObj: p.primary_objective ?? "",
    secondaryObj: p.secondary_objective ?? "",
    expected: p.expected_outcomes ?? "",
    sessionsPerWeek: String(p.sessions_per_week ?? 3),
    totalSessions: String(p.total_sessions ?? ""),
    sessionDuration: String(p.session_duration ?? ""),
    intensity: p.intensity ?? "Medium",
    focus: (p.focus as string[] | null) ?? [],
    targetSkills: (p.target_skills as string[] | null) ?? [],
    method: (p.evaluation_method as ProgramFormValues["method"]) ?? "both",
    frequency: p.review_frequency ?? "Monthly",
    equipment: p.equipment ?? "",
    instructions: p.instructions ?? "",
    medical: p.medical ?? "",
    notes: p.notes ?? "",
  };
}

/** Konversi nilai form → payload backend (PATCH/POST) */
export function formToPayload(f: ProgramFormValues, academyId: string) {
  return {
    academy_id: academyId,
    title: f.name,
    description: f.description || null,
    category: f.focus[0] ?? f.ageGroup,
    sessions_per_week: Number(f.sessionsPerWeek) || 3,
    active: true,
    age_group: f.ageGroup || null,
    team: f.team && f.team !== "__none" ? f.team : null,
    season: f.season || null,
    head_coach: f.coach && f.coach !== "__none" ? f.coach : null,
    assistant_coach: f.assistant || null,
    start_date: f.startDate || null,
    end_date: f.endDate || null,
    primary_objective: f.primaryObj || null,
    secondary_objective: f.secondaryObj || null,
    expected_outcomes: f.expected || null,
    total_sessions: Number(f.totalSessions) || null,
    session_duration: Number(f.sessionDuration) || null,
    intensity: f.intensity || null,
    focus: f.focus,
    target_skills: f.targetSkills,
    evaluation_method: f.method,
    review_frequency: f.frequency,
    equipment: f.equipment || null,
    instructions: f.instructions || null,
    medical: f.medical || null,
    notes: f.notes || null,
  };
}

/**
 * Form program lengkap — dipakai oleh /programs/new (create) dan halaman edit.
 */
export function ProgramForm({
  initial,
  onSubmit,
  submitLabel = "Save Program",
  academyId,
}: {
  initial: ProgramFormValues;
  onSubmit: (payload: Record<string, unknown>) => Promise<void> | void;
  submitLabel?: string;
  academyId: string;
}) {
  const [form, setForm] = useState<ProgramFormValues>(initial);
  const [saving, setSaving] = useState(false);
  const { data: teams = [] } = useTeams();
  const { data: coaches = [] } = useCoaches();
  const set = (k: keyof ProgramFormValues, v: string | string[]) => setForm({ ...form, [k]: v as never });
  const toggle = (arr: string[], v: string) => arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const save = async () => {
    if (!form.name.trim()) { toast.error("Program Name wajib diisi"); return; }
    setSaving(true);
    try {
      await onSubmit(formToPayload(form, academyId));
    } catch (e: any) {
      toast.error(e?.message ?? "Gagal menyimpan program");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Section icon={Info} title="General Information">
        <div className="grid gap-4 sm:grid-cols-2">
          <F label="Program Name *"><Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="U-12 Ball Handling Foundation" /></F>
          <F label="Age Group (KU)">
            <Select value={form.ageGroup} onValueChange={(v) => set("ageGroup", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["KU-8", "KU-10", "KU-12", "KU-14", "KU-16", "KU-18"].map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
            </Select>
          </F>
          <F wide label="Program Description"><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} className="min-h-20" placeholder="Ringkasan program, filosofi, pendekatan pelatihan..." /></F>
          <F label="Team">
            <Select value={form.team} onValueChange={(v) => set("team", v)}>
              <SelectTrigger><SelectValue placeholder="Pilih tim" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">— Tanpa tim —</SelectItem>
                {teams.map((t) => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </F>
          <F label="Season"><Input value={form.season} onChange={(e) => set("season", e.target.value)} /></F>
          <F label="Head Coach">
            <Select value={form.coach} onValueChange={(v) => set("coach", v)}>
              <SelectTrigger><SelectValue placeholder="Pilih coach" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">— Tanpa coach —</SelectItem>
                {coaches.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </F>
          <F label="Assistant Coach"><Input value={form.assistant} onChange={(e) => set("assistant", e.target.value)} placeholder="Opsional" /></F>
          <F label="Start Date"><Input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} /></F>
          <F label="End Date"><Input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} /></F>
        </div>
      </Section>

      <Section icon={Target} title="Training Objectives">
        <div className="space-y-4">
          <F label="Primary Objective"><Textarea value={form.primaryObj} onChange={(e) => set("primaryObj", e.target.value)} className="min-h-16" placeholder="Contoh: Meningkatkan konsistensi ball handling di bawah tekanan defensif." /></F>
          <F label="Secondary Objective"><Textarea value={form.secondaryObj} onChange={(e) => set("secondaryObj", e.target.value)} className="min-h-16" /></F>
          <div>
            <Label className="mb-1.5 block text-xs font-medium">Target Skills</Label>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((s) => {
                const active = form.targetSkills.includes(s);
                return (
                  <button key={s} type="button" onClick={() => set("targetSkills", toggle(form.targetSkills, s))}
                    className={`rounded-full border px-3 py-1 text-xs transition ${active ? "border-primary bg-primary-soft text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
          <F label="Expected Outcomes"><Textarea value={form.expected} onChange={(e) => set("expected", e.target.value)} className="min-h-16" placeholder="Kriteria sukses program pada akhir periode." /></F>
        </div>
      </Section>

      <Section icon={Settings2} title="Training Configuration">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <F label="Sessions per Week"><Input type="number" value={form.sessionsPerWeek} onChange={(e) => set("sessionsPerWeek", e.target.value)} /></F>
          <F label="Total Sessions (est.)"><Input type="number" value={form.totalSessions} onChange={(e) => set("totalSessions", e.target.value)} /></F>
          <F label="Avg Session Duration (min)"><Input type="number" value={form.sessionDuration} onChange={(e) => set("sessionDuration", e.target.value)} /></F>
          <F label="Intensity">
            <Select value={form.intensity} onValueChange={(v) => set("intensity", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Low", "Medium", "High"].map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
            </Select>
          </F>
        </div>
        <div className="mt-4">
          <Label className="mb-1.5 block text-xs font-medium">Training Focus</Label>
          <div className="flex flex-wrap gap-2">
            {FOCUS_OPTIONS.map((s) => {
              const active = form.focus.includes(s);
              return (
                <button key={s} type="button" onClick={() => set("focus", toggle(form.focus, s))}
                  className={`rounded-full border px-3 py-1 text-xs transition ${active ? "border-primary bg-primary-soft text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      </Section>

      <Section icon={ClipboardList} title="Assessment Configuration">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-xs font-medium">Assessment Method</Label>
            <div className="space-y-2">
              {[
                { v: "skill", l: "Skill Assessment" },
                { v: "pir", l: "Match Performance (PIR)" },
                { v: "both", l: "Both" },
              ].map((o) => (
                <label key={o.v} className="flex items-center gap-2 rounded-lg border border-border p-2.5 text-sm">
                  <Checkbox checked={form.method === o.v} onCheckedChange={() => set("method", o.v)} />
                  {o.l}
                </label>
              ))}
            </div>
          </div>
          <F label="Assessment Frequency">
            <Select value={form.frequency} onValueChange={(v) => set("frequency", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Weekly", "Monthly", "End of Program"].map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
            </Select>
          </F>
        </div>
      </Section>

      <Section icon={StickyNote} title="Additional Notes">
        <div className="grid gap-4">
          <F label="Equipment Needed"><Textarea value={form.equipment} onChange={(e) => set("equipment", e.target.value)} className="min-h-16" placeholder="Bola, cone, ring portable, resistance band..." /></F>
          <F label="Special Instructions"><Textarea value={form.instructions} onChange={(e) => set("instructions", e.target.value)} className="min-h-16" /></F>
          <F label="Medical Considerations"><Textarea value={form.medical} onChange={(e) => set("medical", e.target.value)} className="min-h-16" placeholder="Riwayat cedera, kondisi khusus, restriksi latihan..." /></F>
          <F label="Coach Notes"><Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} className="min-h-16" /></F>
        </div>
      </Section>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => {}}>Batal</Button>
        <Button type="button" onClick={save} disabled={saving}>{saving ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" />Menyimpan...</> : <><Save className="mr-1 h-4 w-4" />{submitLabel}</>}</Button>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: typeof Info; title: string; children: React.ReactNode }) {
  return (
    <Card className="border-border/70">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-semibold">{title}</h2>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function F({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <Label className="mb-1.5 block text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}
