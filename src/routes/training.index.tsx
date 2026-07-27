import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import { SESSIONS, SESSION_CATEGORIES, COACHES } from "@/lib/ops-data";
import { TEAMS } from "@/lib/demo-data";

export const Route = createFileRoute("/training/")({
  head: () => ({ meta: [{ title: "Training — SportAcademy" }] }),
  component: TrainingPage,
});

function TrainingPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    coach: COACHES[0].name,
    team: TEAMS[0] as string,
    date: "",
    time: "16:00",
    category: "Technical",
  });

  const submit = () => {
    if (!form.title.trim()) {
      toast.error("Judul sesi wajib diisi");
      return;
    }
    toast.success("Sesi dibuat", {
      description: `${form.title} · ${form.team} · ${form.coach}`,
    });
    setForm({
      title: "",
      coach: COACHES[0].name,
      team: TEAMS[0],
      date: "",
      time: "16:00",
      category: "Technical",
    });
    setCreateOpen(false);
  };

  return (
    <DashboardLayout
      title="Training Sessions"
      subtitle="Kelola sesi latihan basket, evaluasi, dan absensi"
      actions={
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> Buat Sesi
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SESSIONS.map((s) => (
          <Link key={s.id} to="/training/$sessionId" params={{ sessionId: s.id }}>
            <Card className="group h-full border-border/70 transition-all hover:-translate-y-0.5 hover:shadow-elevated">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <Badge variant="secondary" className="bg-primary-soft text-primary">{s.category}</Badge>
                  <span className="text-xs font-medium text-muted-foreground">{s.date}</span>
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold leading-tight">{s.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{s.coach} · {s.team}</p>
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {s.time}</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {s.attendees} atlet</span>
                </div>
                <Button variant="secondary" size="sm" className="mt-4 w-full">Mulai Evaluasi</Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Sesi Latihan</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label>Judul *</Label>
              <Input
                placeholder="Mis. Ball Handling Focus — Garuda Elite"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Coach</Label>
                <Select value={form.coach} onValueChange={(v) => setForm({ ...form, coach: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COACHES.map((c) => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
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
                <Label>Waktu mulai</Label>
                <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Kategori</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SESSION_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Batal</Button>
            <Button onClick={submit}>Buat Sesi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
