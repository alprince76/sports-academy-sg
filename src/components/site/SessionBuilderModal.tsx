import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, X, Plus, Clock, Loader2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { DndContext, useDraggable, useDroppable, type DragEndEvent } from "@dnd-kit/core";
import { BLOCK_META } from "@/lib/training-data";
import { useDrills, useCreateSession, useUpdateSession } from "@/lib/queries";

/** Kategori blok: Warm Up → Cool Down */
const BLOCK_ORDER = ["Warm Up", "Fundamental", "Skill Development", "Small Side Game", "Cool Down"] as const;
type BlockId = typeof BLOCK_ORDER[number];

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

export function SessionBuilderModal({
  open,
  onOpenChange,
  programId,
  programTitle,
  editSession = null,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  programId: string;
  programTitle: string;
  /** Sesi yang sedang diedit (null = buat baru). */
  editSession?: any | null;
}) {
  const { data: drills = [] } = useDrills();
  const createSession = useCreateSession();
  const updateSession = useUpdateSession();
  const qc = useQueryClient();
  const isEdit = !!editSession;

  const [blocks, setBlocks] = useState<Record<BlockId, string[]>>(DEFAULT_BLOCKS());
  const [sessionTitle, setSessionTitle] = useState("");
  const [startTime, setStartTime] = useState("16:00");
  const [endTime, setEndTime] = useState("17:30");
  const [saving, setSaving] = useState(false);

  // sync state saat dibuka / pindah sesi
  const [prevKey, setPrevKey] = useState<string | null>(null);
  const openKey = open ? (editSession?.id ?? "new") : "";
  if (open && openKey !== prevKey) {
    setPrevKey(openKey);
    if (editSession) {
      setSessionTitle(editSession.title ?? "");
      setStartTime(editSession.start_time?.slice(0, 5) ?? "16:00");
      setEndTime(editSession.end_time?.slice(0, 5) ?? "17:30");
      const next = DEFAULT_BLOCKS();
      for (const b of (editSession.blocks ?? []) as any[]) {
        if (b && b.category && b.drillIds) next[b.category as BlockId] = [...(b.drillIds ?? [])];
      }
      setBlocks(next);
    } else {
      setBlocks(DEFAULT_BLOCKS());
      setSessionTitle("");
      setStartTime("16:00");
      setEndTime("17:30");
    }
  }

  const drillById = (id: string) => drills.find((d) => d.id === id);
  const blockMinutes = (bId: BlockId) => (blocks[bId] ?? []).map((d) => drillById(d)?.duration ?? 0).reduce((a, b) => a + b, 0);
  const total = BLOCK_ORDER.reduce((s, c) => s + blockMinutes(c), 0);
  const totalDrills = BLOCK_ORDER.reduce((s, c) => s + (blocks[c] ?? []).length, 0);

  const resetForm = () => {
    setBlocks(DEFAULT_BLOCKS());
    setSessionTitle("");
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;
    const targetBlock = over.id as BlockId;
    if (!BLOCK_ORDER.includes(targetBlock)) return;

    const src = String(active?.id);
    // Format id: "drill:<block>:<drillId>" (drill di dalam blok) atau "lib:<drillId>" (dari library)
    const srcIsInBlock = src.startsWith("drill:");
    const [_, ...restParts] = src.includes(":") ? src.split(":") : ["", src];
    const drillId = String(restParts.join(":"));

    if (srcIsInBlock) {
      // Draggable dari dalam blok → pindah antar kategori
      const sourceBlock = src.split(":")[1] as BlockId;
      if (sourceBlock === targetBlock) return; // sudah di blok itu
      if ((blocks[targetBlock] ?? []).includes(drillId)) { toast.info("Drill sudah ada di blok ini"); return; }
      setBlocks((prev) => ({
        ...prev,
        [sourceBlock]: (prev[sourceBlock] ?? []).filter((x) => x !== drillId),
        [targetBlock]: [...(prev[targetBlock] ?? []), drillId],
      }));
      toast.success(`Drill dipindah ke ${targetBlock}`);
    } else {
      // Dari library → tambah ke blok
      if ((blocks[targetBlock] ?? []).includes(drillId)) { toast.info("Drill sudah ada di blok ini"); return; }
      setBlocks((prev) => ({ ...prev, [targetBlock]: [...(prev[targetBlock] ?? []), drillId] }));
      toast.success(`Drill ditambahkan ke ${targetBlock}`);
    }
  };

  const addByCategory = (category: string, id: string) => {
    const block = CATEGORY_TO_BLOCK[category] ?? "Fundamental";
    if ((blocks[block] ?? []).includes(id)) { toast.info("Drill sudah ada di blok ini"); return; }
    setBlocks((prev) => ({ ...prev, [block]: [...(prev[block] ?? []), id] }));
    toast.success(`Drill ditambahkan ke ${block}`);
  };
  const removeDrill = (block: BlockId, id: string) => setBlocks((prev) => ({ ...prev, [block]: (prev[block] ?? []).filter((x) => x !== id) }));

  const saveSession = () => {
    if (!isEdit && totalDrills === 0) { toast.error("Tambahkan minimal 1 drill dulu"); return; }
    setSaving(true);
    const validBlocks = BLOCK_ORDER.filter((b) => (blocks[b] ?? []).length > 0).map((b) => ({
      category: b,
      targetMinutes: Math.max(blockMinutes(b), 5),
      drillIds: blocks[b] ?? [],
    }));
    const payload = {
      title: sessionTitle.trim() || `Sesi ${programTitle ?? ""}`.trim(),
      session_date: new Date().toISOString().slice(0, 10),
      start_time: startTime || null,
      end_time: endTime || null,
      focus: totalDrills ? (drillById((blocks[BLOCK_ORDER[1]] ?? [])[0] ?? "")?.category ?? null) : null,
      blocks: validBlocks,
    } as any;
    const onSuccess = () => {
      toast.success(isEdit ? "Sesi diperbarui" : "Sesi tersimpan");
      setSaving(false);
      resetForm();
      qc.invalidateQueries({ queryKey: ["program", programId] });
      qc.invalidateQueries({ queryKey: ["sessions"] });
      onOpenChange(false);
    };
    const onError = (e: any) => { toast.error(e?.message ?? "Gagal simpan"); setSaving(false); };

    if (isEdit && editSession?.id) {
      updateSession.mutate({ id: editSession.id, ...payload } as any, { onSuccess, onError });
    } else {
      createSession.mutate({ program_id: programId, ...payload } as any, { onSuccess, onError });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !saving) onOpenChange(false); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-2 border-b">
          <DialogTitle className="font-display text-xl">{isEdit ? "Edit Sesi Latihan" : "Tambah Sesi Baru"}</DialogTitle>
          <DialogDescription>
            Program: <span className="font-semibold text-primary">{programTitle}</span> — susun drill dari Warm Up sampai Cool Down.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b">
          <Input
            value={sessionTitle}
            onChange={(e) => setSessionTitle(e.target.value)}
            placeholder="Judul sesi (mis. Latihan Fokus Dribbling)"
            className="max-w-md"
          />
          <div className="flex items-center gap-1.5 text-sm">
            <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-24" />
            <span className="text-muted-foreground">–</span>
            <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-24" />
          </div>
          <Badge variant="secondary" className="ml-auto"><Clock className="mr-1 h-3 w-3" />{total} min · {totalDrills} drill</Badge>
        </div>

        <div className="grid gap-4 overflow-y-auto p-6 lg:grid-cols-[1fr_280px]">
          <DndContext onDragEnd={handleDragEnd}>
          {/* Blocks */}
          <div className="space-y-3">
            {BLOCK_ORDER.map((cat) => {
              const meta = BLOCK_META[cat] ?? { color: "bg-secondary text-foreground", description: "" };
              const items = blocks[cat] ?? [];
              const mins = blockMinutes(cat);
              return (
                <DroppableBlock key={cat} id={cat}>
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
                            <DraggableDrill key={did} id={`drill:${cat}:${did}`}>
                              <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                                <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
                                <div className="flex-1 min-w-0">
                                  <p className="truncate text-sm font-semibold">{d.title}</p>
                                  <p className="text-xs text-muted-foreground">{d.focus ?? d.category} · {d.difficulty} · {d.duration} min</p>
                                </div>
                                <Button size="icon" variant="ghost" onClick={() => removeDrill(cat, did)}><X className="h-4 w-4" /></Button>
                              </div>
                            </DraggableDrill>
                          );
                        })}
                        {items.length === 0 && (
                          <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                            Drag drill antar kategori, atau klik + di library.
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </DroppableBlock>
              );
            })}
          </div>

          {/* Drill library */}
          <Card className="border-border/70 lg:self-start">
            <CardContent className="p-4">
              <h3 className="font-display text-sm font-semibold">Drill Library</h3>
              <p className="text-xs text-muted-foreground">Drag ke blok, atau klik +.</p>
              <div className="mt-3 max-h-[55vh] space-y-2 overflow-y-auto pr-1">
                {drills.map((d) => (
                  <DraggableDrill key={d.id} id={d.id} className="rounded-lg border border-border p-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold">{d.title}</p>
                        <p className="text-[10px] text-muted-foreground">{d.focus ?? d.category} · {d.duration}m</p>
                      </div>
                      <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => addByCategory(d.category, d.id)}>
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <Badge variant="secondary" className={`mt-1.5 text-[10px] ${BLOCK_META[CATEGORY_TO_BLOCK[d.category] ?? "Fundamental"]?.color ?? "bg-secondary"}`}>{d.category}</Badge>
                  </DraggableDrill>
                ))}
                {drills.length === 0 && (
                  <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">Belum ada drill.</p>
                )}
              </div>
            </CardContent>
          </Card>
          </DndContext>
        </div>

        <DialogFooter className="px-6 py-4 border-t gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Batal</Button>
          <Button variant="outline" onClick={resetForm} disabled={saving}><X className="mr-1 h-4 w-4" />Reset</Button>
          <Button onClick={saveSession} disabled={saving || (!isEdit && totalDrills === 0)}>
            {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
            {isEdit ? "Simpan Perubahan" : "Simpan Sesi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Blok yang menerima drag (drop target) */
function DroppableBlock({ id, children }: { id: BlockId; children: React.ReactNode }) {
  const { setNodeRef, isOver: over } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl transition ${over ? "ring-2 ring-primary/50 ring-offset-2" : ""}`}
    >
      {children}
    </div>
  );
}

/** Item drill yang bisa diseret — wrapper minimal (drag listeners); styling di call-site. */
function DraggableDrill({ id, children, className = "" }: { id: string; children: React.ReactNode; className?: string }) {
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({ id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`cursor-grab active:cursor-grabbing ${isDragging ? "opacity-40" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
