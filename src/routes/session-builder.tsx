import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Copy, X, Plus, Clock, GripVertical } from "lucide-react";
import { toast } from "sonner";
import {
  SESSION_TEMPLATES, DRILLS, DRILL_CATEGORIES, BLOCK_META,
  type SessionTemplate, type DrillCategory,
} from "@/lib/training-data";

export const Route = createFileRoute("/session-builder")({
  head: () => ({ meta: [{ title: "Session Builder — SportAcademy" }] }),
  component: SessionBuilderPage,
});

function SessionBuilderPage() {
  const [templateId, setTemplateId] = useState(SESSION_TEMPLATES[0].id);
  const template = SESSION_TEMPLATES.find((t) => t.id === templateId)!;
  const [blocks, setBlocks] = useState(template.blocks);

  const drillById = (id: string) => DRILLS.find((d) => d.id === id);
  const blockMinutes = (bId: DrillCategory) =>
    (blocks.find((b) => b.id === bId)?.drillIds ?? [])
      .map((d) => drillById(d)?.duration ?? 0)
      .reduce((a, b) => a + b, 0);
  const total = DRILL_CATEGORIES.reduce((s, c) => s + blockMinutes(c), 0);

  const removeDrill = (block: DrillCategory, id: string) => {
    setBlocks((prev) => prev.map((b) => b.id === block ? { ...b, drillIds: b.drillIds.filter((x) => x !== id) } : b));
  };

  const addDrillToBlock = (block: DrillCategory, id: string) => {
    setBlocks((prev) => prev.map((b) => b.id === block ? { ...b, drillIds: [...b.drillIds, id] } : b));
    toast.success("Drill ditambahkan");
  };

  const switchTemplate = (id: string) => {
    setTemplateId(id);
    const t = SESSION_TEMPLATES.find((x) => x.id === id)!;
    setBlocks(t.blocks);
  };

  return (
    <DashboardLayout
      title="Session Builder"
      subtitle="Susun template sesi latihan reusable. Drag-friendly block dari Warm Up sampai Cool Down."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.success("Session duplicated")}><Copy className="mr-1 h-4 w-4" />Duplicate</Button>
          <Button onClick={() => toast.success("Template saved", { description: template.name })}><Save className="mr-1 h-4 w-4" />Save Template</Button>
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select value={templateId} onValueChange={switchTemplate}>
          <SelectTrigger className="w-72"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SESSION_TEMPLATES.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Badge variant="secondary" className="bg-primary-soft text-primary">{template.ageGroup}</Badge>
        <Badge variant="secondary">Focus: {template.focus}</Badge>
        <Badge variant="secondary">Intensity: {template.intensity}</Badge>
        <Badge variant="secondary" className="ml-auto"><Clock className="mr-1 h-3 w-3" />{total} / {template.totalMinutes} min</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {DRILL_CATEGORIES.map((cat) => {
            const block = blocks.find((b) => b.id === cat);
            const meta = BLOCK_META[cat];
            const mins = blockMinutes(cat);
            return (
              <Card key={cat} className="border-border/70">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={meta.color}>{cat}</Badge>
                      <p className="text-xs text-muted-foreground">{meta.description}</p>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {mins} / {block?.targetMinutes ?? 0} min
                    </span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {block?.drillIds.map((did) => {
                      const d = drillById(did);
                      if (!d) return null;
                      return (
                        <div key={did} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-semibold">{d.title}</p>
                            <p className="text-xs text-muted-foreground">{d.skillFocus} · {d.difficulty} · {d.duration} min</p>
                          </div>
                          <Button size="icon" variant="ghost" onClick={() => removeDrill(cat, did)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                    {block?.drillIds.length === 0 && (
                      <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                        Belum ada drill. Klik "+" di panel drill library untuk menambah.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-border/70 lg:sticky lg:top-20 lg:self-start">
          <CardContent className="p-4">
            <h3 className="font-display text-sm font-semibold">Drill Library</h3>
            <p className="text-xs text-muted-foreground">Klik + untuk masukkan ke block.</p>
            <div className="mt-3 max-h-[70vh] space-y-2 overflow-y-auto pr-1">
              {DRILLS.map((d) => (
                <div key={d.id} className="rounded-lg border border-border p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">{d.title}</p>
                      <p className="text-[10px] text-muted-foreground">{d.skillFocus} · {d.duration}m</p>
                    </div>
                    <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => addDrillToBlock(d.category, d.id)}>
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Badge variant="secondary" className={`mt-1.5 text-[10px] ${BLOCK_META[d.category].color}`}>
                    {d.category}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// silence unused import warning if needed
export type _T = SessionTemplate;
