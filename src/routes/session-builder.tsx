import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X, Plus, Clock, Loader2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { BLOCK_META } from "@/lib/training-data";
import { useDrills, useCreateSession, usePrograms } from "@/lib/queries";

export const Route = createFileRoute("/session-builder")({
  head: () => ({ meta: [{ title: "Session Builder — SportAcademy" }] }),
  component: SessionBuilderPage,
});

/** Kategori blok: Warm Up → Cool Down */
const BLOCK_ORDER = ["Warm Up", "Fundamental", "Skill Development", "Small Side Game", "Cool Down"] as const;
type BlockId = typeof BLOCK_ORDER[number];

/** Mapping kategori drill → blok default */
const CATEGORY_TO_BLOCK: Record<string, BlockId> = {
  Mobility: "Warm Up",
  "Ball Handling": "Fundamental",
  Shooting: "Skill Development",
  Finishing: "Skill Development",
  Defense: "Small Side Game",
};

const DEFAULT_BLOCKS = (): Record<BlockId, string[]> => ({
  "Warm Up": [],
  Fundamental: [],
  "Skill Development": [],
  "Small Side Game": [],
  "Cool Down": [],
});

function SessionBuilderPage() {
  const { data: drills = [] } = useDrills();
  const { data: programs = [] } = usePrograms();
  const createSession = useCreateSession();

  const [blocks, setBlocks] = useState<Record<BlockId, string[]>>(DEFAULT_BLOCKS());
  const [sessionTitle, setSessionTitle] = useState("");
  const [programId, setProgramId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState<BlockId | null>(null);

  const drillById = (id: string) => drills.find((d) => d.id === id);

  const blockMinutes = (bId: BlockId) =>
    (blocks[bId] ?? [])
      .map((d) => drillById(d)?.duration ?? 0)
      .reduce((a, b) => a + b, 0);
  const total = BLOCK_ORDER.reduce((s, c) => s + blockMinutes(c), 0);
  const totalDrills = BLOCK_ORDER.reduce((s, c) => s + (blocks[c] ?? []).length, 0);

  // ── Drag & Drop (HTML5 native) ──
  const handleDrillDragStart = (e: React.DragEvent, drillId: string) => {
    e.dataTransfer.setData("text/drill-id", drillId);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleBlockDrop = (e: React.DragEvent, block: BlockId) => {
    e.preventDefault();
    setDragOver(null);
    const id = e.dataTransfer.getData("text/drill-id");
    if (!id) return;
    if ((blocks[block] ?? []).includes(id)) { toast.info("Drill sudah ada di blok ini"); return; }
    setBlocks((prev) => ({ ...prev, [block]: [...(prev[block] ?? []), id] }));
    toast.success(`Drill ditambahkan ke ${block}`);
  };

  const handleBlockDragOver = (e: React.DragEvent, block: BlockId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setDragOver(block);
  };

  const handleBlockDragLeave = () => setDragOver(null);

  const addToBlockByCategory = (category: string, id: string) => {
    const block = CATEGORY_TO_BLOCK[category] ?? "Fundamental";
    if ((blocks[block] ?? []).includes(id)) { toast.info("Drill sudah ada di blok ini"); return; }
    setBlocks((prev) => ({ ...prev, [block]: [...(prev[block] ?? []), id] }));
    toast.success(`Drill ditambahkan ke ${block}`);
  };

  const removeDrill = (block: BlockId, id: string) => {
    setBlocks((prev) => ({ ...prev, [block]: (prev[block] ?? []).filter((x) => x !== id) }));
  };

  const resetForm = () => {
    setBlocks(DEFAULT_BLOCKS());
    setSessionTitle("");
  };

  const saveSession = () => {
    if (totalDrills === 0) { toast.error("Tambahkan minimal 1 drill dulu"); return; }
    if (!programId) { toast.error("Wajib pilih program"); return; }
    setSaving(true);
    const validBlocks = BLOCK_ORDER.filter((b) => (blocks[b] ?? []).length > 0).map((b) => ({
      category: b,
      targetMinutes: Math.max(blockMinutes(b), 5),
      drillIds: blocks[b] ?? [],
    }));
    createSession.mutate({
      program_id: programId,
      title: sessionTitle.trim() || "Sesi Latihan",
      session_date: new Date().toISOString().slice(0, 10),
      focus: totalDrills ? (drillById((blocks[BLOCK_ORDER[1]] ?? [])[0] ?? "")?.category ?? null) : null,
      blocks: validBlocks,
    } as any, {
      onSuccess: () => {
        toast.success("Sesi tersimpan");
        setSaving(false);
        resetForm();
      },
      onError: (e: any) => { toast.error(e?.message ?? "Gagal simpan"); setSaving(false); },
    });
  };

  return (
    <DashboardLayout
      title="Session Builder"
      subtitle="Susun sesi latihan langsung: drag drill dari library ke blok Warm Up sampai Cool Down, lalu Simpan Sesi."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetForm}><X className="mr-1 h-4 w-4" />Reset</Button>
          <Button variant="outline" asChild><Link to="/programs">Programs</Link></Button>
          <Button onClick={saveSession} disabled={saving}>
            {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
            Simpan Sesi
          </Button>
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          value={sessionTitle}
          onChange={(e) => setSessionTitle(e.target.value)}
          placeholder="Judul sesi (mis. Latihan U-12 Fokus Dribbling)"
          className="max-w-md font-medium"
        />
        <Select value={programId} onValueChange={setProgramId}>
          <SelectTrigger className="w-64"><SelectValue placeholder="Pilih program (wajib)" /></SelectTrigger>
          <SelectContent>
            {programs.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
          </SelectContent>
        </Select>
        <Badge variant="secondary" className="ml-auto"><Clock className="mr-1 h-3 w-3" />{total} min · {totalDrills} drill</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* Blocks: Warm Up → Cool Down */}
        <div className="space-y-3">
          {BLOCK_ORDER.map((cat) => {
            const meta = BLOCK_META[cat] ?? { color: "bg-secondary text-foreground", description: "" };
            const items = blocks[cat] ?? [];
            const mins = blockMinutes(cat);
            return (
              <div
                key={cat}
                onDragOver={(e) => handleBlockDragOver(e, cat)}
                onDragLeave={handleBlockDragLeave}
                onDrop={(e) => handleBlockDrop(e, cat)}
                className={`rounded-xl transition ${dragOver === cat ? "ring-2 ring-primary/50 ring-offset-2" : ""}`}
              >
                <Card className="border-border/70">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={meta.color}>{cat}</Badge>
                        <p className="text-xs text-muted-foreground">{meta.description}</p>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">{mins} min · {items.length} drill</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {items.map((did) => {
                        const d = drillById(did);
                        if (!d) return null;
                        return (
                          <div key={did} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                            <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-sm font-semibold">{d.title}</p>
                              <p className="text-xs text-muted-foreground">{d.focus ?? d.category} · {d.difficulty} · {d.duration} min</p>
                            </div>
                            <Button size="icon" variant="ghost" onClick={() => removeDrill(cat, did)}><X className="h-4 w-4" /></Button>
                          </div>
                        );
                      })}
                      {items.length === 0 && (
                        <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                          Drag drill ke sini (atau klik + di library).
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Drill Library (draggable) */}
        <Card className="border-border/70 lg:sticky lg:top-20 lg:self-start">
          <CardContent className="p-4">
            <h3 className="font-display text-sm font-semibold">Drill Library</h3>
            <p className="text-xs text-muted-foreground">Drag ke blok, atau klik +.</p>
            <div className="mt-3 max-h-[75vh] space-y-2 overflow-y-auto pr-1">
              {drills.map((d) => (
                <div
                  key={d.id}
                  draggable
                  onDragStart={(e) => handleDrillDragStart(e, d.id)}
                  className="cursor-grab rounded-lg border border-border p-2.5 active:cursor-grabbing"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">{d.title}</p>
                      <p className="text-[10px] text-muted-foreground">{d.focus ?? d.category} · {d.duration}m</p>
                    </div>
                    <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => addToBlockByCategory(d.category, d.id)}>
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Badge variant="secondary" className={`mt-1.5 text-[10px] ${BLOCK_META[CATEGORY_TO_BLOCK[d.category] ?? "Fundamental"]?.color ?? "bg-secondary"}`}>{d.category}</Badge>
                </div>
              ))}
              {drills.length === 0 && (
                <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">Belum ada drill. Tambah lewat API /drills.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
