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
import { Plus, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";
import { SCHEDULE_EVENTS, type ScheduleEvent } from "@/lib/ops-data";
import { TEAMS } from "@/lib/demo-data";
import { useRole } from "@/lib/role";

export const Route = createFileRoute("/schedule")({
  head: () => ({ meta: [{ title: "Schedule — SportAcademy" }] }),
  component: SchedulePage,
});

const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const DATES = ["3", "4", "5", "6", "7", "8", "9"];

function SchedulePage() {
  const role = useRole();
  const isParent = role === "parent";
  const events = isParent
    ? SCHEDULE_EVENTS.filter((e) => e.team.includes("Falcons") || e.type === "match" || e.team === "All")
    : SCHEDULE_EVENTS;

  const [selected, setSelected] = useState<ScheduleEvent | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    team: TEAMS[0] as string,
    type: "training" as ScheduleEvent["type"],
    date: "",
    time: "16:00",
    venue: "Court A",
  });

  const submit = () => {
    if (!form.title.trim()) {
      toast.error("Judul jadwal wajib diisi");
      return;
    }
    toast.success("Jadwal ditambahkan", {
      description: `${form.title} · ${form.team} · ${form.venue}`,
    });
    setAddOpen(false);
    setForm({ title: "", team: TEAMS[0], type: "training", date: "", time: "16:00", venue: "Court A" });
  };

  return (
    <DashboardLayout
      title="Jadwal & Kalender"
      subtitle={isParent ? "Jadwal Falcons Blue & pertandingan — minggu 3–9 Juni 2026" : "Minggu 3 - 9 Juni 2026"}
      actions={
        !isParent ? (
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />Tambah Jadwal
          </Button>
        ) : undefined
      }
    >
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
          <div className="grid min-h-[420px] grid-cols-7">
            {DAYS.map((_, dayIdx) => (
              <div key={dayIdx} className="space-y-2 border-r border-border p-2 last:border-r-0">
                {events.filter((e) => e.day === dayIdx).map((e, i) => (
                  <button
                    key={i}
                    onClick={() => setSelected(e)}
                    className={`w-full rounded-lg border p-2 text-left text-xs transition-all hover:shadow-card ${
                      e.type === "match"
                        ? "border-warning/40 bg-warning/10"
                        : e.type === "meeting"
                          ? "border-border bg-secondary"
                          : "border-primary/30 bg-primary-soft/60"
                    }`}
                  >
                    <p className="font-semibold">{e.time}</p>
                    <p className="mt-0.5 line-clamp-2">{e.title}</p>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {events.slice(0, 3).map((e, i) => (
          <Card key={i} className="border-border/70">
            <CardContent className="p-5">
              <Badge variant="secondary" className="bg-primary-soft text-primary capitalize">{e.type}</Badge>
              <p className="mt-2 font-display font-semibold">{e.title}</p>
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {DAYS[e.day]}, {e.time}</p>
                <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {e.venue}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader><DialogTitle>{selected.title}</DialogTitle></DialogHeader>
              <div className="space-y-2 text-sm">
                <Badge variant="secondary" className="bg-primary-soft text-primary capitalize">{selected.type}</Badge>
                <p><span className="text-muted-foreground">Tim:</span> {selected.team}</p>
                <p><span className="text-muted-foreground">Waktu:</span> {DAYS[selected.day]}, {selected.time}</p>
                <p><span className="text-muted-foreground">Lokasi:</span> {selected.venue}</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelected(null)}>Tutup</Button>
                {!isParent && (
                  <Button onClick={() => { toast.success("Pengingat dikirim ke atlet & orang tua"); setSelected(null); }}>
                    Kirim Reminder
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tambah Jadwal Baru</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label>Judul *</Label>
              <Input
                placeholder="Mis. Latihan Garuda Elite"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Tipe</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as ScheduleEvent["type"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="match">Match</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Tim</Label>
                <Select value={form.team} onValueChange={(v) => setForm({ ...form, team: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TEAMS.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Tanggal</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Waktu</Label>
                <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Lokasi</Label>
              <Input
                placeholder="Court A"
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Batal</Button>
            <Button onClick={submit}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
