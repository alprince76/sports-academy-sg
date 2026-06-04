import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/schedule")({
  head: () => ({ meta: [{ title: "Schedule — SportAcademy" }] }),
  component: SchedulePage,
});

type Event = { day: number; time: string; title: string; team: string; type: "training" | "match" | "meeting"; venue: string };

const EVENTS: Event[] = [
  { day: 1, time: "16:00", title: "Latihan U-12 A", team: "U-12 A", type: "training", venue: "Lapangan A" },
  { day: 1, time: "17:30", title: "Latihan U-14 B", team: "U-14 B", type: "training", venue: "Lapangan B" },
  { day: 2, time: "09:00", title: "Match vs Pelita", team: "U-12/14", type: "match", venue: "Stadion Mini" },
  { day: 3, time: "16:00", title: "Latihan U-10", team: "U-10", type: "training", venue: "Lapangan A" },
  { day: 4, time: "15:30", title: "GK Specific", team: "All GK", type: "training", venue: "Lapangan C" },
  { day: 5, time: "19:00", title: "Coach Meeting", team: "Staff", type: "meeting", venue: "Ruang Klub" },
  { day: 6, time: "08:00", title: "Open Training", team: "All", type: "training", venue: "Lapangan A" },
];

const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const DATES = ["3", "4", "5", "6", "7", "8", "9"];

function SchedulePage() {
  const [selected, setSelected] = useState<Event | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <DashboardLayout
      title="Jadwal & Kalender"
      subtitle="Minggu 3 - 9 Juni 2026"
      actions={<Button onClick={() => setAddOpen(true)}><Plus className="mr-1 h-4 w-4" />Tambah Jadwal</Button>}
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
          <div className="grid grid-cols-7 min-h-[420px]">
            {DAYS.map((_, dayIdx) => (
              <div key={dayIdx} className="space-y-2 border-r border-border p-2 last:border-r-0">
                {EVENTS.filter((e) => e.day === dayIdx).map((e, i) => (
                  <button
                    key={i}
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
        {EVENTS.slice(0, 3).map((e, i) => (
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
                <Button onClick={() => { toast.success("Pengingat dikirim ke pemain"); setSelected(null); }}>Kirim Reminder</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tambah Jadwal Baru</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-2"><Label>Judul</Label><Input placeholder="Mis. Latihan U-12 A" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2"><Label>Tanggal</Label><Input type="date" /></div>
              <div className="grid gap-2"><Label>Waktu</Label><Input type="time" /></div>
            </div>
            <div className="grid gap-2"><Label>Lokasi</Label><Input placeholder="Lapangan A" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Batal</Button>
            <Button onClick={() => { setAddOpen(false); toast.success("Jadwal ditambahkan"); }}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
