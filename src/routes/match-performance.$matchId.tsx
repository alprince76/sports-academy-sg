import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Trophy, Loader2, Pencil, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { useMatchDetail, useUpdateMatchStat, useDeleteMatchStat } from "@/lib/queries";

export const Route = createFileRoute("/match-performance/$matchId")({
  head: () => ({ meta: [{ title: "Detail Match — SportAcademy" }] }),
  component: MatchDetailPage,
  notFoundComponent: () => (
    <DashboardLayout title="Match tidak ditemukan">
      <Button asChild><Link to="/match-performance">Kembali</Link></Button>
    </DashboardLayout>
  ),
});

function MatchDetailPage() {
  const { matchId } = Route.useParams();
  const { data: m, isLoading } = useMatchDetail(matchId);
  const [editOpen, setEditOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const remove = useDeleteMatchStat();

  if (isLoading) {
    return (
      <DashboardLayout title="Memuat...">
        <Card><CardContent className="p-12 text-center text-sm text-muted-foreground">Memuat data match...</CardContent></Card>
      </DashboardLayout>
    );
  }
  if (!m) throw notFound();

  return (
    <DashboardLayout
      title={`vs ${m.opponent ?? "—"}`}
      subtitle={`${m.match_date} · ${m.athletes?.name ?? "Atlet"} · ${m.athletes?.team ?? "—"} · PIR ${m.pir}`}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-1 h-4 w-4" /> Edit
          </Button>
          <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setDelOpen(true)}>
            <Trash2 className="mr-1 h-4 w-4" /> Hapus
          </Button>
          <Button asChild variant="outline"><Link to="/match-performance"><ArrowLeft className="mr-1 h-4 w-4" /> Kembali</Link></Button>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/70 lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">Ringkasan</h2>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Stat label="PIR" value={String(m.pir)} highlight />
              <Stat label="PTS" value={String(m.pts)} />
              <Stat label="REB" value={String(m.reb)} />
              <Stat label="AST" value={String(m.ast)} />
              <Stat label="STL" value={String(m.stl)} />
              <Stat label="BLK" value={String(m.blk)} />
              <Stat label="TO" value={String(m.to)} />
              <Stat label="FOUL" value={String(m.foul)} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="font-display text-lg font-semibold">Box Score Lengkap</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <BoxRow label="Menit Bermain" value={`${m.min} min`} />
              <BoxRow label="Field Goal" value={`${m.fgm}/${m.fga}`} pct={m.fga ? Math.round((m.fgm / m.fga) * 100) + "%" : "—"} />
              <BoxRow label="Free Throw" value={`${m.ftm}/${m.fta}`} pct={m.fta ? Math.round((m.ftm / m.fta) * 100) + "%" : "—"} />
              <BoxRow label="Fouls Drawn" value={String(m.fouls_drawn)} />
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold">Perhitungan PIR (FIBA)</h3>
              <p className="mt-2 rounded-lg bg-secondary/40 p-4 font-mono text-xs leading-relaxed text-muted-foreground">
                {m.pts} + {m.reb} + {m.ast} + {m.stl} + {m.blk} + {m.fouls_drawn} − ({m.fga}−{m.fgm}) − ({m.fta}−{m.ftm}) − {m.to} − {m.foul} = <span className="font-bold text-primary">{m.pir}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <EditMatchDialog match={m} open={editOpen} onClose={() => setEditOpen(false)} />
      <DeleteMatchDialog match={m} open={delOpen} onClose={() => setDelOpen(false)} />
    </DashboardLayout>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 text-center ${highlight ? "bg-primary-soft" : "bg-secondary/40"}`}>
      <p className="font-display text-2xl font-bold text-primary">{value}</p>
      <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
    </div>
  );
}

function BoxRow({ label, value, pct }: { label: string; value: string; pct?: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value} {pct && <span className="ml-1 text-xs text-muted-foreground">({pct})</span>}</span>
    </div>
  );
}

const NUM_FIELDS: { key: string; label: string }[] = [
  { key: "pts", label: "PTS" }, { key: "reb", label: "REB" }, { key: "ast", label: "AST" },
  { key: "stl", label: "STL" }, { key: "blk", label: "BLK" }, { key: "to", label: "TO" },
  { key: "foul", label: "FOUL" }, { key: "fouls_drawn", label: "Fouls Drawn" },
  { key: "fgm", label: "FG Made" }, { key: "fga", label: "FG Attempt" },
  { key: "ftm", label: "FT Made" }, { key: "fta", label: "FT Attempt" },
];

function EditMatchDialog({ match, open, onClose }: { match: any; open: boolean; onClose: () => void }) {
  const [vals, setVals] = useState<Record<string, string>>(
    Object.fromEntries(NUM_FIELDS.map((f) => [f.key, String(match[f.key] ?? 0)]))
  );
  const [min, setMin] = useState(String(match.min ?? 0));
  const [opponent, setOpponent] = useState(match.opponent ?? "");
  const update = useUpdateMatchStat();

  const submit = () => {
    const payload: Record<string, any> = { opponent: opponent || null, min: Number(min) || 0 };
    for (const f of NUM_FIELDS) payload[f.key] = Number(vals[f.key]) || 0;
    update.mutate({ id: match.id, ...payload }, {
      onSuccess: () => { toast.success("Statistik match diperbarui (PIR auto-hitung)"); onClose(); },
      onError: (e: any) => toast.error(e?.message ?? "Gagal memperbarui"),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit Statistik Match</DialogTitle></DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid gap-2"><Label>Lawan</Label><Input value={opponent} onChange={(e) => setOpponent(e.target.value)} placeholder="Pelita BC" /></div>
          <div className="grid gap-2"><Label>Menit Bermain</Label><Input type="number" min={0} value={min} onChange={(e) => setMin(e.target.value)} /></div>
          <div className="grid grid-cols-3 gap-3">
            {NUM_FIELDS.map((f) => (
              <div key={f.key} className="grid gap-1">
                <Label className="text-[10px]">{f.label}</Label>
                <Input type="number" min={0} value={vals[f.key]} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })} />
              </div>
            ))}
          </div>
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

function DeleteMatchDialog({ match, open, onClose }: { match: any; open: boolean; onClose: () => void }) {
  const navigate = Route.useNavigate();
  const remove = useDeleteMatchStat();

  const confirm = () => {
    remove.mutate(match.id, {
      onSuccess: () => {
        toast.success("Match dihapus");
        navigate({ to: "/match-performance" });
      },
      onError: (e: any) => toast.error(e?.message ?? "Gagal menghapus"),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Hapus Match</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">
          Yakin ingin menghapus match vs <span className="font-semibold text-foreground">{match.opponent ?? "—"}</span>?
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
