import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, MapPin, Clock, Trash2, Pencil, Save, Loader2, CalendarRange, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { toast } from "sonner";
import { useSchedules, useCreateSchedule, useUpdateSchedule, useDeleteSchedule, useSessions, usePrograms, type Schedule, type Session } from "@/lib/queries";
import { getRole } from "@/lib/role";

export const Route = createFileRoute("/schedule")({
  head: () => ({ meta: [{ title: "Jadwal & Kalender — SportAcademy" }] }),
  component: SchedulePage,
});

const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const DATES = ["3", "4", "5", "6", "7", "8", "9"];

function SchedulePage() {
  const role = getRole();
  if (role === "coach") return <CoachScheduleView />;
  return <GenericScheduleView />;
}

/** KALENDER COACH — mengikuti jadwal Training Session (program + tanggal + jam). */
function CoachScheduleView() {
  const { data: sessions = [], isLoading, isError } = useSessions();
  const { data: programs = [] } = usePrograms();
  const [weekOffset, setWeekOffset] = useState(0);

  const progName = (pid: string | null) => programs.find((p) => p.id === pid)?.title ?? "Tanpa Program";
  const progCoach = (pid: string | null) => {
    const p = programs.find((x) => x.id === pid);
    return p?.head_coach ?? p?.coach ?? "—";
  };

  // Minggu ini (Sen–Min) berdasarkan offset
  const start = new Date();
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7) + weekOffset * 7); // Senin
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
  const weekLabel = `${weekDays[0].slice(8)} ${weekDays[0].slice(5, 7)} – ${weekDays[6].slice(8)} ${weekDays[6].slice(5, 7)}`;

  const fmt = (t: string | null) => (t ? t.slice(0, 5) : "—");

  return (
    <DashboardLayout
      title="Jadwal & Kalender"
      subtitle={`Training Session — minggu ${weekLabel}`}
      actions={
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(weekOffset - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>Minggu Ini</Button>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(weekOffset + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      }
    >
      {isLoading && (
        <Card className="border-dashed"><CardContent className="p-12 text-center text-sm text-muted-foreground">Memuat jadwal...</CardContent></Card>
      )}
      {isError && (
        <Card className="border-dashed"><CardContent className="p-12 text-center text-sm text-muted-foreground">
          Gagal memuat data dari backend. Pastikan backend :8081 jalan.
        </CardContent></Card>
      )}
      <Card className="border-border/70">
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b border-border bg-secondary/50">
            {DAYS.map((d, i) => {
              const today = new Date().toISOString().slice(0, 10);
              const isToday = weekDays[i] === today;
              return (
                <div key={d} className={`border-r border-border p-3 text-center last:border-r-0 ${isToday ? "bg-emerald-50" : ""}`}>
                  <p className="text-xs uppercase text-muted-foreground">{d}</p>
                  <p className={`font-display text-lg font-bold ${isToday ? "text-emerald-600" : ""}`}>{weekDays[i].slice(8)}</p>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-7 min-h-[480px]">
            {weekDays.map((date, dayIdx) => {
              const dayEvents = sessions
                .filter((s) => s.session_date === date)
                .sort((a, b) => (a.start_time || "00:00").localeCompare(b.start_time || "00:00"));
              return (
                <div key={dayIdx} className="space-y-1.5 border-r border-border p-2 last:border-r-0">
                  {dayEvents.length === 0 && (
                    <p className="rounded-md border border-dashed border-border/60 p-2 text-center text-[10px] text-muted-foreground/50">—</p>
                  )}
                  {dayEvents.map((s: Session) => (
                    <div key={s.id} className="rounded-md border border-primary/30 bg-primary/5 p-2">
                      <p className="truncate text-[11px] font-bold text-primary">{fmt(s.start_time)}</p>
                      <p className="mt-0.5 truncate text-[10px] font-semibold text-foreground">{s.title}</p>
                      <p className="truncate text-[9px] text-muted-foreground">{progName(s.program_id)}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-[9px] text-muted-foreground">
                        <Users className="h-2.5 w-2.5" /> {progCoach(s.program_id)}
                      </p>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Ringkasan sesi per program */}
      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {programs.filter((p) => sessions.some((s) => s.program_id === p.id)).map((p) => {
          const pSessions = sessions.filter((s) => s.program_id === p.id);
          const upcoming = pSessions.filter((s) => (s.session_date ?? "") >= new Date().toISOString().slice(0, 10)).length;
          return (
            <Card key={p.id} className="border-border/70">
              <CardContent className="p-3">
                <p className="truncate text-sm font-bold">{p.title}</p>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="h-3 w-3" /> {pSessions.length} sesi · {upcoming} mendatang
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}

/** JADWAL GENERIK (parent/admin/owner) — tabel schedules. */
function GenericScheduleView() {
  const [selected, setSelected] = useState<Schedule | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Schedule | null>(null);
  const [delOpen, setDelOpen] = useState(false);
  const { data: events = [], isLoading, isError } = useSchedules();

  return (
    <DashboardLayout
      title="Jadwal & Kalender"
      subtitle="Minggu 3 - 9 Juni 2026"
      actions={<Button onClick={() => setAddOpen(true)}><Plus className="mr-1 h-4 w-4" />Tambah Jadwal</Button>}
    >
      {isLoading && (
        <Card className="border-dashed"><CardContent className="p-12 text-center text-sm text-muted-foreground">Memuat jadwal...</CardContent></Card>
      )}
      {isError && (
        <Card className="border-dashed"><CardContent className="p-12 text-center text-sm text-muted-foreground">
          Gagal memuat data dari backend. Pastikan backend :8081 jalan.
        </CardContent></Card>
      )}
      <Card className="border-border/70">
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b border-border bg-secondary/50">
            {DAYS.map((d, i) => (
              <div key={d} className="border-r border-border p-3 text-center last:border-r-0">
                <p className="text-xs uppercase text-muted-foreground">{d}</p>
                <p className="font-display text-lg font-bold">{DATES[i]}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 min-h-[420px]">
            {DAYS.map((_, dayIdx) => (
              <div key={dayIdx} className="space-y-2 border-r border-border p-2 last:border-r-0">
                {events.filter((e) => e.day === dayIdx + 1).map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setSelected(e)}
                    className={`w-full rounded-md border p-2 text-left transition hover:shadow-sm ${e.type === "match" ? "border-amber-300 bg-amber-50" : e.type === "meeting" ? "border-purple-300 bg-purple-50" : "border-primary/30 bg-primary/5"}`}
                  >
                    <p className="flex items-center gap-1 text-[11px] font-bold">{e.time?.slice(0, 5)} <Clock className="h-3 w-3" /></p>
                    <p className="mt-0.5 truncate text-[11px] font-semibold">{e.title}</p>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {e.venue || "—"}
                    </p>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <DeleteScheduleDialog open={delOpen} onOpenChange={setDelOpen} schedule={selected} onDeleted={() => setSelected(null)} />
      <ScheduleFormDialog open={addOpen} onOpenChange={setAddOpen} schedule={null} />
      <ScheduleFormDialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)} schedule={editing} />
      {selected && (
        <Dialog open onOpenChange={() => setSelected(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>{selected.title}</DialogTitle></DialogHeader>
            <div className="space-y-1 text-sm">
              <p><Badge variant="secondary">{selected.type}</Badge></p>
              <p className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /> {selected.time}</p>
              <p className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> {selected.venue || "—"}</p>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => { setEditing(selected); setSelected(null); }}><Pencil className="mr-1 h-4 w-4" />Edit</Button>
              <Button variant="destructive" onClick={() => { setDelOpen(true); setSelected(null); }}><Trash2 className="mr-1 h-4 w-4" />Hapus</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
}

function DeleteScheduleDialog({ open, onOpenChange, schedule, onDeleted }: {
  open: boolean; onOpenChange: (v: boolean) => void; schedule: Schedule | null; onDeleted: () => void;
}) {
  const remove = useDeleteSchedule();
  if (!open || !schedule) return null;
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Hapus Jadwal</DialogTitle></DialogHeader>
        <p className="text-sm">Yakin ingin menghapus <span className="font-semibold">{schedule.title}</span>?</p>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button variant="destructive" onClick={() => remove.mutate(schedule.id, { onSuccess: () => { toast.success("Jadwal dihapus"); onOpenChange(false); onDeleted(); } })}>
            <Trash2 className="mr-1 h-4 w-4" />Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Dialog tambah/edit jadwal — kalau `schedule` ada → mode edit (prefill + PATCH) */
function ScheduleFormDialog({ open, onOpenChange, schedule }: {
  open: boolean; onOpenChange: (v: boolean) => void; schedule: Schedule | null;
}) {
  const create = useCreateSchedule();
  const update = useUpdateSchedule();
  const [title, setTitle] = useState(schedule?.title ?? "");
  const [day, setDay] = useState(String(schedule?.day ?? 1));
  const [time, setTime] = useState(schedule?.time ?? "16:00");
  const [type, setType] = useState<"training" | "match" | "meeting">(schedule?.type ?? "training");
  const [venue, setVenue] = useState(schedule?.venue ?? "");
  const [saving, setSaving] = useState(false);
  const isEdit = !!schedule;

  // sync saat berganti jadwal (edit target berubah)
  const [prevId, setPrevId] = useState<string | null>(null);
  if (schedule && schedule.id !== prevId) {
    setPrevId(schedule.id);
    setTitle(schedule.title);
    setDay(String(schedule.day));
    setTime(schedule.time ?? "16:00");
    setType(schedule.type ?? "training");
    setVenue(schedule.venue ?? "");
  }

  const save = () => {
    if (!title.trim()) { toast.error("Judul wajib diisi"); return; }
    setSaving(true);
    const payload = { title, day: Number(day), time, type, venue: venue || null } as any;
    const onSuccess = () => { toast.success(isEdit ? "Jadwal diperbarui" : "Jadwal ditambahkan"); setSaving(false); onOpenChange(false); };
    const onError = (e: any) => { toast.error(e?.message ?? "Gagal simpan"); setSaving(false); };
    if (isEdit && schedule) update.mutate({ id: schedule.id, ...payload } as any, { onSuccess, onError });
    else create.mutate(payload, { onSuccess, onError });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !saving) onOpenChange(false); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{isEdit ? "Edit Jadwal" : "Tambah Jadwal"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="mb-1 block text-xs font-medium">Judul</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="mis. Latihan Dribbling" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1 block text-xs font-medium">Hari</Label>
              <Select value={day} onValueChange={setDay}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DAYS.map((d, i) => <SelectItem key={d} value={String(i + 1)}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block text-xs font-medium">Jam</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="mb-1 block text-xs font-medium">Tipe</Label>
            <Select value={type} onValueChange={(v) => setType(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="match">Match</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1 block text-xs font-medium">Venue</Label>
            <Input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="mis. GOR Garuda" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Batal</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
            {isEdit ? "Simpan Perubahan" : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
