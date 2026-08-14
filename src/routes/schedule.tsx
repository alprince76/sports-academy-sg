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
import { useSchedules, useCreateSchedule, type Schedule } from "@/lib/queries";

export const Route = createFileRoute("/schedule")({
  head: () => ({ meta: [{ title: "Schedule — SportAcademy" }] }),
  component: SchedulePage,
});

const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const DATES = ["3", "4", "5", "6", "7", "8", "9"];

function SchedulePage() {
  const [selected, setSelected] = useState<Schedule | null>(null);
  const [addOpen, setAddOpen] = useState(false);
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
                    className={`w-full rounded-lg border p-2 text-left text-xs transition-all hover:shadow-card ${
                      e.type === "match" ? "border-warning/40 bg-warning/10"
                      : e.type === "meeting" ? "border-border bg-secondary"
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
        {events.slice(0, 3).map((e) => (
          <Card key={e.id} className="border-border/70">
            <CardContent className="p-5">
              <Badge variant="secondary" className="bg-primary-soft text-primary capitalize">{e.type}</Badge>
              <p className="mt-2 font-display font-semibold">{e.title}</p>
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {DAYS[e.day - 1]}, {e.time}</p>
                <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {e.venue ?? "—"}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        {events.length === 0 && !isLoading && !isError && (
          <Card className="col-span-full border-dashed">
            <CardContent className="p-10 text-center text-sm text-muted-foreground">Belum ada jadwal minggu ini.</CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader><DialogTitle>{selected.title}</DialogTitle></DialogHeader>
              <div className="space-y-2 text-sm">
                <Badge variant="secondary" className="bg-primary-soft text-primary capitalize">{selected.type}</Badge>
                <p><span className="text-muted-foreground">Tim:</span> {selected.team ?? "—"}</p>
                <p><span className="text-muted-foreground">Waktu:</span> {DAYS[selected.day - 1]}, {selected.time}</p>
                <p><span className="text-muted-foreground">Lokasi:</span> {selected.venue ?? "—"}</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelected(null)}>Tutup</Button>
                <Button onClick={() => { toast.success("Pengingat dikirim ke pemain"); setSelected(null); }}>Kirim Reminder</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AddScheduleDialog open={addOpen} onOpenChange={setAddOpen} />
    </DashboardLayout>
  );
}

function AddScheduleDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [title, setTitle] = useState("");
  const [day, setDay] = useState("1");
  const [time, setTime] = useState("16:00");
  const [type, setType] = useState<"training" | "match" | "meeting">("training");
  const [venue, setVenue] = useState("");
  const create = useCreateSchedule();

  const submit = () => {
    if (!title.trim()) { toast.error("Judul wajib diisi"); return; }
    create.mutate({ title: title.trim(), day: Number(day), time, type, venue: venue || null, team: null }, {
      onSuccess: () => { toast.success("Jadwal ditambahkan"); onOpenChange(false); setTitle(""); setVenue(""); },
      onError: (e: any) => toast.error(e?.message ?? "Gagal menambah jadwal"),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Tambah Jadwal Baru</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-2"><Label>Judul</Label><Input placeholder="Mis. Latihan U-12 A" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Hari</Label>
              <Select value={day} onValueChange={setDay}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DAYS.map((d, i) => <SelectItem key={i + 1} value={String(i + 1)}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2"><Label>Waktu</Label><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Jenis</Label>
              <Select value={type} onValueChange={(v) => setType(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="match">Match</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2"><Label>Lokasi</Label><Input placeholder="Lapangan A" value={venue} onChange={(e) => setVenue(e.target.value)} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={submit} disabled={create.isPending}>{create.isPending ? "Menyimpan..." : "Simpan"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
