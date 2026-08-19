import { createFileRoute } from "@tanstack/react-router";
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
import { Users, Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import { confirmAction, notifySuccess, notifyError } from "@/lib/confirm";
import { useTeams, useCreateTeam, useUpdateTeam, useDeleteTeam } from "@/lib/queries";
import { useRole } from "@/lib/role";

export const Route = createFileRoute("/teams")({
  head: () => ({ meta: [{ title: "Tim — SportAcademy" }] }),
  component: TeamsPage,
});

const AGE_GROUPS = ["KU-8", "KU-10", "KU-12", "KU-14", "KU-16", "KU-18"];

function TeamsPage() {
  const { data: teams = [], isLoading } = useTeams();
  const role = useRole();
  const canManage = role === "owner" || role === "admin";
  const [createOpen, setCreateOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<any>(null);
  const [delTeam, setDelTeam] = useState<any>(null);

  return (
    <DashboardLayout
      title="Tim (Teams)"
      subtitle="Kelola skuad/tim di akademi — tambah tim, lihat jumlah atlet, dan kelola anggota."
      actions={
        canManage ? (
          <Button onClick={() => setCreateOpen(true)}><Plus className="mr-1 h-4 w-4" />Tambah Tim</Button>
        ) : undefined
      }
    >
      {isLoading ? (
        <Card><CardContent className="flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Memuat tim...
        </CardContent></Card>
      ) : teams.length === 0 ? (
        <Card className="border-dashed"><CardContent className="p-12 text-center text-sm text-muted-foreground">
          Belum ada tim. {canManage ? "Klik Tambah Tim untuk membuat tim pertama." : ""}
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => (
            <Card key={t.id} className="border-border/70">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Users className="h-5 w-5" />
                  </div>
                  {canManage && (
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditTeam(t)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setDelTeam(t)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  )}
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold">{t.name}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {t.age_group && <Badge variant="secondary">{t.age_group}</Badge>}
                  <Badge variant="secondary" className="gap-1 bg-primary-soft text-primary">
                    <Users className="h-3 w-3" /> {t.athlete_count ?? 0} atlet
                  </Badge>
                </div>
                {t.description && <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateTeamDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <EditTeamDialog team={editTeam} onClose={() => setEditTeam(null)} />
      <DeleteTeamDialog team={delTeam} onClose={() => setDelTeam(null)} />
    </DashboardLayout>
  );
}

function CreateTeamDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateTeam();
  const [name, setName] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [desc, setDesc] = useState("");

  const submit = async () => {
    if (!name.trim()) { notifyError({ title: "Nama tim wajib diisi" }); return; }
    const ok = await confirmAction({ title: "Simpan perubahan?", text: "Tim baru akan dibuat.", danger: false });
    if (!ok) return;
    create.mutate({ name: name.trim(), age_group: ageGroup || null, description: desc || null } as any, {
      onSuccess: () => { notifySuccess({ title: "Tersimpan", text: "Tim dibuat" }); setName(""); setAgeGroup(""); setDesc(""); onClose(); },
      onError: (e: any) => notifyError({ title: "Gagal menyimpan", text: e?.message ?? "Gagal membuat tim" }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Tambah Tim Baru</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2"><Label>Nama Tim</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Garuda Elite U-12" /></div>
          <div className="grid gap-2">
            <Label>Kelompok Umur</Label>
            <Select value={ageGroup} onValueChange={setAgeGroup}>
              <SelectTrigger><SelectValue placeholder="Pilih (opsional)" /></SelectTrigger>
              <SelectContent>{AGE_GROUPS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-2"><Label>Deskripsi</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="min-h-20" placeholder="Tujuan / deskripsi tim..." /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={submit} disabled={create.isPending}>{create.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditTeamDialog({ team, onClose }: { team: any; onClose: () => void }) {
  const update = useUpdateTeam();
  const [name, setName] = useState(team?.name ?? "");
  const [ageGroup, setAgeGroup] = useState(team?.age_group ?? "");
  const [desc, setDesc] = useState(team?.description ?? "");

  // sync saat team berubah
  const [prevKey, setPrevKey] = useState(team?.id);
  if (team && team.id !== prevKey) {
    setPrevKey(team.id); setName(team.name); setAgeGroup(team.age_group ?? ""); setDesc(team.description ?? "");
  }

  const submit = async () => {
    if (!name.trim()) { notifyError({ title: "Nama tim wajib diisi" }); return; }
    const ok = await confirmAction({ title: "Simpan perubahan?", text: "Perubahan data tim akan disimpan.", danger: false });
    if (!ok) return;
    update.mutate({ id: team.id, name: name.trim(), age_group: ageGroup || null, description: desc || null } as any, {
      onSuccess: () => { notifySuccess({ title: "Tersimpan", text: "Tim diperbarui" }); onClose(); },
      onError: (e: any) => notifyError({ title: "Gagal menyimpan", text: e?.message ?? "Gagal memperbarui" }),
    });
  };

  return (
    <Dialog open={!!team} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Tim</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2"><Label>Nama Tim</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="grid gap-2">
            <Label>Kelompok Umur</Label>
            <Select value={ageGroup} onValueChange={setAgeGroup}>
              <SelectTrigger><SelectValue placeholder="Pilih (opsional)" /></SelectTrigger>
              <SelectContent>{AGE_GROUPS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-2"><Label>Deskripsi</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="min-h-20" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={submit} disabled={update.isPending}>{update.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteTeamDialog({ team, onClose }: { team: any; onClose: () => void }) {
  const remove = useDeleteTeam();
  const confirm = async () => {
    const ok = await confirmAction({ title: "Hapus tim ini?", text: "Data tim dihapus permanen. Atlet dalam tim akan menjadi tanpa tim.", confirmText: "Ya, Hapus", danger: true });
    if (!ok) return;
    remove.mutate(team.id, {
      onSuccess: () => { notifySuccess({ title: "Terhapus", text: `Tim "${team.name}" dihapus` }); onClose(); },
      onError: (e: any) => notifyError({ title: "Gagal menghapus", text: e?.message ?? "Gagal menghapus" }),
    });
  };
  return (
    <Dialog open={!!team} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Hapus Tim</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">
          Yakin ingin menghapus <span className="font-semibold text-foreground">{team?.name}</span>? Atlet dalam tim akan menjadi tanpa tim.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button variant="destructive" onClick={confirm} disabled={remove.isPending}>{remove.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Hapus</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
