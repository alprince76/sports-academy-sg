import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, CalendarClock, Clock, Target, Users, Loader2, Pencil, Trash2, Save, Plus } from "lucide-react";
import { confirmAction, notifySuccess, notifyError } from "@/lib/confirm";
import { useProgramDetail, useDeleteProgram } from "@/lib/queries";
import { SessionBuilderModal } from "@/components/site/SessionBuilderModal";

export const Route = createFileRoute("/programs/$programId/")({
  head: () => ({ meta: [{ title: "Detail Program — SportAcademy" }] }),
  component: ProgramDetailPage,
  notFoundComponent: () => (
    <DashboardLayout title="Program tidak ditemukan">
      <Button asChild><Link to="/programs">Kembali</Link></Button>
    </DashboardLayout>
  ),
});

function ProgramDetailPage() {
  const { programId } = Route.useParams();
  const { data: program, isLoading } = useProgramDetail(programId);
  const [delOpen, setDelOpen] = useState(false);
  const [sessOpen, setSessOpen] = useState(false);
  const [editSession, setEditSession] = useState<any | null>(null);
  const remove = useDeleteProgram();

  const openNew = () => { setEditSession(null); setSessOpen(true); };
  const openEdit = (s: any) => { setEditSession(s); setSessOpen(true); };

  if (isLoading) {
    return (
      <DashboardLayout title="Memuat...">
        <Card><CardContent className="p-12 text-center text-sm text-muted-foreground">Memuat detail program...</CardContent></Card>
      </DashboardLayout>
    );
  }
  if (!program) throw notFound();

  const sessions = program.sessions ?? [];
  const totalBlocks = sessions.reduce((s, x) => s + (x.blocks?.length ?? 0), 0);

  return (
    <DashboardLayout
      title={program.title}
      subtitle={`${program.category ?? "Program"} · ${program.sessions_per_week ?? "—"}x/minggu · ${program.active ? "Berjalan" : "Nonaktif"}`}
      actions={
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/programs/$programId/edit" params={{ programId: program.id }}>
              <Pencil className="mr-1 h-4 w-4" /> Edit
            </Link>
          </Button>
          <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setDelOpen(true)}>
            <Trash2 className="mr-1 h-4 w-4" /> Hapus
          </Button>
          <Button asChild variant="outline"><Link to="/programs"><ArrowLeft className="mr-1 h-4 w-4" /> Kembali</Link></Button>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Info program */}
        <Card className="border-border/70 lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">Informasi Program</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between rounded-lg border border-border px-3 py-2">
                <span className="text-muted-foreground">Kategori</span>
                <span className="font-medium">{program.category ?? "—"}</span>
              </div>
              <div className="flex justify-between rounded-lg border border-border px-3 py-2">
                <span className="text-muted-foreground">Sesi / minggu</span>
                <span className="font-medium">{program.sessions_per_week ?? "—"}x</span>
              </div>
              <div className="flex justify-between rounded-lg border border-border px-3 py-2">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="secondary" className={program.active ? "bg-primary-soft text-primary" : "bg-secondary text-muted-foreground"}>
                  {program.active ? "Berjalan" : "Nonaktif"}
                </Badge>
              </div>
            </div>
            {program.description && (
              <p className="mt-4 rounded-lg bg-secondary/40 p-3 text-sm leading-relaxed text-muted-foreground">
                {program.description}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Sesi latihan */}
        <div className="space-y-4 lg:col-span-2">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-lg font-semibold">Sesi Latihan</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{sessions.length} sesi · {totalBlocks} blok drill</Badge>
                  <Button onClick={openNew}>
                    <Plus className="mr-1 h-4 w-4" /> Tambah Sesi
                  </Button>
                </div>
              </div>

              {sessions.length === 0 ? (
                <p className="mt-6 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Belum ada sesi latihan untuk program ini. Klik <span className="font-semibold text-primary">Tambah Sesi</span> untuk mulai.
                </p>
              ) : (
                <div className="mt-4 space-y-2">
                  {sessions.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-soft">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{s.title}</p>
                        <p className="text-xs text-muted-foreground">{s.session_date} · {s.focus ?? "—"} · {s.blocks?.length ?? 0} blok</p>
                      </div>
                      <Link to="/training/$sessionId" params={{ sessionId: s.id }}>
                        <Button size="sm" variant="secondary">Detail</Button>
                      </Link>
                      <Button size="sm" variant="outline" onClick={() => openEdit(s)}>
                        <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-semibold">Ringkasan</h2>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatBox label="Sesi Terjadwal" value={String(sessions.length)} />
                <StatBox label="Blok Drill" value={String(totalBlocks)} />
                <StatBox label="Sesi / Minggu" value={String(program.sessions_per_week ?? "—")} />
                <StatBox label="Status" value={program.active ? "Aktif" : "Nonaktif"} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <DeleteProgramDialog program={program} open={delOpen} onClose={() => setDelOpen(false)} />
      <SessionBuilderModal
        open={sessOpen}
        onOpenChange={(o) => { setSessOpen(o); if (!o) setEditSession(null); }}
        programId={program.id}
        programTitle={program.title}
        editSession={editSession}
      />
    </DashboardLayout>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/40 p-4 text-center">
      <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-primary">{value}</p>
    </div>
  );
}

function DeleteProgramDialog({ program, open, onClose }: { program: any; open: boolean; onClose: () => void }) {
  const navigate = Route.useNavigate();
  const remove = useDeleteProgram();

  const confirm = async () => {
    const ok = await confirmAction({ title: "Hapus program ini?", text: "Program dan sesi latihan terkait dihapus permanen.", confirmText: "Ya, Hapus", danger: true });
    if (!ok) return;
    remove.mutate(program.id, {
      onSuccess: () => {
        notifySuccess({ title: "Terhapus", text: `Program "${program.title}" dihapus` });
        navigate({ to: "/programs" });
      },
      onError: (e: any) => notifyError({ title: "Gagal menghapus", text: e?.message ?? "Gagal menghapus" }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Hapus Program</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">
          Yakin ingin menghapus <span className="font-semibold text-foreground">{program.title}</span>? Sesi latihan terkait ikut terhapus.
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
