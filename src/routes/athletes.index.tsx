import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAthletes, useCreateAthlete, useUpdateAthlete, useDeleteAthlete, useTeams, type Athlete } from "@/lib/queries";
import { TEAMS, POSITIONS } from "@/lib/demo-data";

export const Route = createFileRoute("/athletes/")({
  head: () => ({ meta: [{ title: "Athletes — SportAcademy" }] }),
  component: AthletesPage,
});

function AthletesPage() {
  const [q, setQ] = useState("");
  const [team, setTeam] = useState<string>("all");
  const [pos, setPos] = useState<string>("all");
  const [editing, setEditing] = useState<Athlete | null>(null);
  const [deleting, setDeleting] = useState<Athlete | null>(null);

  const { data: athletes = [], isLoading, isError } = useAthletes();

  const filtered = useMemo(() => athletes.filter((a) =>
    (team === "all" || a.team === team) &&
    (pos === "all" || a.position === pos) &&
    a.name.toLowerCase().includes(q.toLowerCase())
  ), [athletes, q, team, pos]);

  const ageOf = (a: { age_group: string | null }) => {
    const m = a.age_group?.match(/(\d+)/);
    return m ? `${m[1]}thn` : "—";
  };

  return (
    <DashboardLayout
      title="Manajemen Atlet"
      subtitle={`${athletes.length} atlet terdaftar di akademi`}
      actions={<AddAthleteDialog />}
    >
      <Card className="border-border/70">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari atlet..." className="pl-9" />
          </div>
          <Select value={team} onValueChange={setTeam}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Tim" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tim</SelectItem>
              {TEAMS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={pos} onValueChange={setPos}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Posisi" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Posisi</SelectItem>
              {POSITIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading && (
        <Card className="mt-6"><CardContent className="p-12 text-center text-sm text-muted-foreground">Memuat data atlet...</CardContent></Card>
      )}
      {isError && (
        <Card className="mt-6 border-dashed"><CardContent className="p-12 text-center text-sm text-muted-foreground">
          Gagal memuat data dari backend. Pastikan backend :8081 jalan.
        </CardContent></Card>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((a) => (
          <Card key={a.id} className="group h-full border-border/70 transition-all hover:-translate-y-0.5 hover:shadow-elevated">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <Link to="/athletes/$athleteId" params={{ athleteId: a.id }}>
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary-soft text-primary">
                      {a.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to="/athletes/$athleteId" params={{ athleteId: a.id }} className="truncate font-semibold hover:text-primary">
                    {a.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{ageOf(a)} · {a.position ?? "—"}</p>
                </div>
                <Badge variant="secondary" className="bg-primary-soft text-primary">{a.team ?? "—"}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Metric label="Performance" value={`${a.progress}`} />
                <Metric label="Attendance" value={`${a.attendance}%`} />
              </div>
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">{a.progress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400" style={{ width: `${a.progress}%` }} />
                </div>
              </div>
              {a.note && <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">"{a.note}"</p>}

              {/* Aksi: edit + hapus */}
              <div className="mt-4 flex gap-2 border-t border-border pt-3">
                <Button size="sm" variant="secondary" className="flex-1 text-xs" onClick={() => setEditing(a)}>
                  <Pencil className="mr-1 h-3 w-3" /> Edit
                </Button>
                <Button size="sm" variant="outline" className="flex-1 text-xs text-destructive hover:text-destructive" onClick={() => setDeleting(a)}>
                  <Trash2 className="mr-1 h-3 w-3" /> Hapus
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && !isLoading && !isError && (
          <Card className="col-span-full border-dashed">
            <CardContent className="p-12 text-center text-sm text-muted-foreground">
              Tidak ada atlet yang cocok dengan filter.
            </CardContent>
          </Card>
        )}
      </div>

      <EditAthleteDialog athlete={editing} onClose={() => setEditing(null)} />
      <DeleteAthleteDialog athlete={deleting} onClose={() => setDeleting(null)} />
    </DashboardLayout>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary/50 p-2">
      <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
      <p className="font-display text-lg font-bold">{value}</p>
    </div>
  );
}

function AddAthleteDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [teamId, setTeamId] = useState("");
  const { data: teams = [] } = useTeams();
  const create = useCreateAthlete();

  const submit = () => {
    if (!name.trim()) { toast.error("Nama wajib diisi"); return; }
    const t = teams.find((x) => x.id === teamId);
    create.mutate({ name: name.trim(), position: position || null, team: t?.name ?? null, team_id: teamId || null }, {
      onSuccess: () => { toast.success("Atlet berhasil ditambahkan"); setOpen(false); setName(""); setPosition(""); setTeamId(""); },
      onError: (e: any) => toast.error(e?.message ?? "Gagal menambah atlet"),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-1 h-4 w-4" /> Tambah Atlet</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Tambah Atlet Baru</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2"><Label>Nama Lengkap</Label><Input placeholder="Mis. Rafi Pratama" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Posisi</Label>
              <Select value={position} onValueChange={setPosition}>
                <SelectTrigger><SelectValue placeholder="Pilih posisi" /></SelectTrigger>
                <SelectContent>{POSITIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Tim</Label>
              <Select value={teamId} onValueChange={setTeamId}>
                <SelectTrigger><SelectValue placeholder="Pilih tim" /></SelectTrigger>
                <SelectContent>
                  {teams.length === 0 && <SelectItem value="__none">Belum ada tim</SelectItem>}
                  {teams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
          <Button onClick={submit} disabled={create.isPending}>{create.isPending ? "Menyimpan..." : "Simpan Atlet"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditAthleteDialog({ athlete, onClose }: { athlete: Athlete | null; onClose: () => void }) {
  const [name, setName] = useState(athlete?.name ?? "");
  const [position, setPosition] = useState(athlete?.position ?? "");
  const [teamId, setTeamId] = useState(athlete?.team_id ?? "");
  const { data: teams = [] } = useTeams();
  const update = useUpdateAthlete();

  // sync state saat athlete berubah (dialog dibuka dengan data berbeda)
  const [lastId, setLastId] = useState<string | null>(null);
  if (athlete && athlete.id !== lastId) {
    setLastId(athlete.id);
    setName(athlete.name);
    setPosition(athlete.position ?? "");
    setTeamId(athlete.team_id ?? "");
  }

  const submit = () => {
    if (!athlete) return;
    if (!name.trim()) { toast.error("Nama wajib diisi"); return; }
    const t = teams.find((x) => x.id === teamId);
    update.mutate({ id: athlete.id, name: name.trim(), position: position || null, team: t?.name ?? null, team_id: teamId || null }, {
      onSuccess: () => { toast.success("Atlet berhasil diperbarui"); onClose(); },
      onError: (e: any) => toast.error(e?.message ?? "Gagal memperbarui atlet"),
    });
  };

  return (
    <Dialog open={!!athlete} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Atlet</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2"><Label>Nama Lengkap</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Posisi</Label>
              <Select value={position} onValueChange={setPosition}>
                <SelectTrigger><SelectValue placeholder="Pilih posisi" /></SelectTrigger>
                <SelectContent>{POSITIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Tim</Label>
              <Select value={teamId} onValueChange={setTeamId}>
                <SelectTrigger><SelectValue placeholder="Pilih tim" /></SelectTrigger>
                <SelectContent>
                  {teams.length === 0 && <SelectItem value="__none">Belum ada tim</SelectItem>}
                  {teams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={submit} disabled={update.isPending}>{update.isPending ? "Menyimpan..." : "Simpan Perubahan"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteAthleteDialog({ athlete, onClose }: { athlete: Athlete | null; onClose: () => void }) {
  const remove = useDeleteAthlete();

  const confirm = () => {
    if (!athlete) return;
    remove.mutate(athlete.id, {
      onSuccess: () => { toast.success(`Atlet "${athlete.name}" dihapus`); onClose(); },
      onError: (e: any) => toast.error(e?.message ?? "Gagal menghapus atlet"),
    });
  };

  return (
    <Dialog open={!!athlete} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Hapus Atlet</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">
          Yakin ingin menghapus <span className="font-semibold text-foreground">{athlete?.name}</span>?
          Data evaluasi, absensi, dan pembayaran yang terkait ikut terhapus.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button variant="destructive" onClick={confirm} disabled={remove.isPending}>
            {remove.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Trash2 className="mr-1 h-4 w-4" />}
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
