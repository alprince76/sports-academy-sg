import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Clock, Dumbbell, Zap, Pencil, Trash2, Save, Loader2, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { useDrills, useUpdateDrill, useDeleteDrill } from "@/lib/queries";

export const Route = createFileRoute("/drills/$drillId")({
  head: () => ({ meta: [{ title: "Detail Drill — SportAcademy" }] }),
  component: DrillDetailPage,
  notFoundComponent: () => (
    <DashboardLayout title="Drill tidak ditemukan">
      <Button asChild><Link to="/drills">Kembali</Link></Button>
    </DashboardLayout>
  ),
});

const DIFF_COLOR: Record<string, string> = {
  Beginner: "bg-primary-soft text-primary",
  Intermediate: "bg-amber-100 text-amber-800",
  Advanced: "bg-rose-100 text-rose-700",
};
const INTENSITY_COLOR: Record<string, string> = {
  Low: "bg-secondary text-muted-foreground",
  Medium: "bg-primary-soft text-primary",
  High: "bg-rose-100 text-rose-700",
};

function DrillDetailPage() {
  const { drillId } = Route.useParams();
  const { data: drills = [], isLoading } = useDrills();
  const [editOpen, setEditOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const remove = useDeleteDrill();

  const drill = drills.find((d) => d.id === drillId);

  if (isLoading) {
    return (
      <DashboardLayout title="Memuat...">
        <Card><CardContent className="p-12 text-center text-sm text-muted-foreground">Memuat drill...</CardContent></Card>
      </DashboardLayout>
    );
  }
  if (!drill) throw notFound();

  return (
    <DashboardLayout
      title={drill.title}
      subtitle={`${drill.category} · ${drill.difficulty} · ${drill.intensity}`}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-1 h-4 w-4" /> Edit
          </Button>
          <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setDelOpen(true)}>
            <Trash2 className="mr-1 h-4 w-4" /> Hapus
          </Button>
          <Button asChild variant="outline"><Link to="/drills"><ArrowLeft className="mr-1 h-4 w-4" /> Kembali</Link></Button>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/70 lg:col-span-1">
          <CardContent className="p-6">
            <h2 className="font-display text-lg font-semibold">Detail Drill</h2>
            <div className="mt-4 space-y-3 text-sm">
              <InfoRow label="Kategori" value={drill.category} />
              <InfoRow label="Difficulty" value={drill.difficulty} badge={DIFF_COLOR[drill.difficulty]} />
              <InfoRow label="Intensity" value={drill.intensity} badge={INTENSITY_COLOR[drill.intensity]} />
              <InfoRow label="Durasi" value={`${drill.duration ?? "—"} menit`} />
              <InfoRow label="Focus" value={drill.focus ?? "—"} />
              <InfoRow label="Equipment" value={drill.equipment ?? "—"} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">Cara Melakukan</h2>
            </div>
            <p className="mt-4 rounded-lg bg-secondary/40 p-4 text-sm leading-relaxed text-muted-foreground">
              {drill.focus
                ? `Fokus latihan: ${drill.focus}. Drill kategori ${drill.category} dengan intensitas ${drill.intensity} selama ${drill.duration ?? "—"} menit.`
                : "Belum ada deskripsi langkah untuk drill ini. Gunakan tombol Edit untuk menambahkan."}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Durasi" value={`${drill.duration ?? "—"}m`} icon={<Clock className="h-4 w-4" />} />
              <Stat label="Difficulty" value={drill.difficulty} icon={<Zap className="h-4 w-4" />} />
              <Stat label="Kategori" value={drill.category} icon={<Dumbbell className="h-4 w-4" />} />
              <Stat label="Equipment" value={drill.equipment ? "Ya" : "Tanpa"} icon={<Dumbbell className="h-4 w-4" />} />
            </div>
          </CardContent>
        </Card>
      </div>

      <EditDrillDialog drill={drill} open={editOpen} onClose={() => setEditOpen(false)} />
      <DeleteDrillDialog drill={drill} open={delOpen} onClose={() => setDelOpen(false)} />
    </DashboardLayout>
  );
}

function InfoRow({ label, value, badge }: { label: string; value: string; badge?: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      {badge ? <Badge variant="secondary" className={badge}>{value}</Badge> : <span className="font-medium">{value}</span>}
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-secondary/40 p-4 text-center">
      <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary">{icon}</div>
      <p className="mt-2 font-display text-lg font-bold text-primary">{value}</p>
      <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
    </div>
  );
}

function EditDrillDialog({ drill, open, onClose }: { drill: any; open: boolean; onClose: () => void }) {
  const [title, setTitle] = useState(drill.title);
  const [category, setCategory] = useState(drill.category);
  const [difficulty, setDifficulty] = useState(drill.difficulty);
  const [intensity, setIntensity] = useState(drill.intensity);
  const [duration, setDuration] = useState(String(drill.duration ?? 10));
  const [focus, setFocus] = useState(drill.focus ?? "");
  const [equipment, setEquipment] = useState(drill.equipment ?? "");
  const update = useUpdateDrill();

  const submit = () => {
    if (!title.trim() || !category.trim()) { toast.error("Nama & kategori wajib diisi"); return; }
    update.mutate({
      id: drill.id,
      title: title.trim(),
      category: category.trim(),
      difficulty,
      intensity,
      duration: Number(duration) || 10,
      focus: focus || null,
      equipment: equipment || null,
    }, {
      onSuccess: () => { toast.success("Drill diperbarui"); onClose(); },
      onError: (e: any) => toast.error(e?.message ?? "Gagal memperbarui"),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Drill</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2"><Label>Nama Drill</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="grid gap-2"><Label>Kategori</Label><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ball Handling" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Beginner", "Intermediate", "Advanced"].map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Intensity</Label>
              <Select value={intensity} onValueChange={setIntensity}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Low", "Medium", "High"].map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2"><Label>Durasi (menit)</Label><Input type="number" min={1} value={duration} onChange={(e) => setDuration(e.target.value)} /></div>
          <div className="grid gap-2"><Label>Focus</Label><Input value={focus} onChange={(e) => setFocus(e.target.value)} /></div>
          <div className="grid gap-2"><Label>Equipment</Label><Input value={equipment} onChange={(e) => setEquipment(e.target.value)} placeholder="Bola, cone..." /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={submit} disabled={update.isPending}>
            {update.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            <Save className="mr-1 h-4 w-4" /> Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDrillDialog({ drill, open, onClose }: { drill: any; open: boolean; onClose: () => void }) {
  const navigate = Route.useNavigate();
  const remove = useDeleteDrill();

  const confirm = () => {
    remove.mutate(drill.id, {
      onSuccess: () => {
        toast.success(`Drill "${drill.title}" dihapus`);
        navigate({ to: "/drills" });
      },
      onError: (e: any) => toast.error(e?.message ?? "Gagal menghapus"),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Hapus Drill</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">
          Yakin ingin menghapus <span className="font-semibold text-foreground">{drill.title}</span>?
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button variant="destructive" onClick={confirm} disabled={remove.isPending}>
            {remove.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            <Trash2 className="mr-1 h-4 w-4" /> Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
