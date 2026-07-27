import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Star, Archive, Copy, Clock, Dumbbell } from "lucide-react";
import { toast } from "sonner";
import { DRILLS, DRILL_CATEGORIES, BLOCK_META, type DrillCategory } from "@/lib/training-data";

export const Route = createFileRoute("/drills/")({
  head: () => ({ meta: [{ title: "Drill Library — SportAcademy" }] }),
  component: DrillsPage,
});

function DrillsPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"all" | DrillCategory>("all");
  const filtered = DRILLS.filter((d) => (cat === "all" || d.category === cat) &&
    (d.title.toLowerCase().includes(q.toLowerCase()) || d.skillFocus.toLowerCase().includes(q.toLowerCase())));

  return (
    <DashboardLayout
      title="Drill Library"
      subtitle="Kumpulan drill terstruktur — dipakai di Session Builder & Training Session."
      actions={<Button asChild><Link to="/drills/new"><Plus className="mr-1 h-4 w-4" />Create Drill</Link></Button>}
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari drill atau skill focus..." className="pl-9" />
        </div>
        <Select value={cat} onValueChange={(v) => setCat(v as any)}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua kategori</SelectItem>
            {DRILL_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Badge variant="secondary">{filtered.length} drill</Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((d) => (
          <Card key={d.id} className="border-border/70 transition hover:shadow-elevated">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <Badge variant="secondary" className={BLOCK_META[d.category].color}>{d.category}</Badge>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toast.success("Ditambahkan ke Favorites")}>
                    <Star className={`h-4 w-4 ${d.favorite ? "fill-amber-400 text-amber-400" : ""}`} />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toast.success("Drill diduplikasi")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toast.success("Drill diarsipkan")}>
                    <Archive className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Link to="/drills/$drillId" params={{ drillId: d.id }} className="mt-3 block">
                <h3 className="font-display text-base font-semibold leading-tight hover:text-primary">{d.title}</h3>
              </Link>
              <p className="mt-1 text-xs text-muted-foreground">{d.objective}</p>

              <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
                <Badge variant="secondary" className="bg-primary-soft text-primary">{d.ageGroup}</Badge>
                <Badge variant="secondary">{d.difficulty}</Badge>
                <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />{d.duration}m</Badge>
                <Badge variant="secondary" className="gap-1"><Dumbbell className="h-3 w-3" />{d.skillFocus}</Badge>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {d.tags.map((t) => (
                  <span key={t} className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">#{t}</span>
                ))}
              </div>

              <Button asChild variant="secondary" size="sm" className="mt-4 w-full">
                <Link to="/drills/$drillId" params={{ drillId: d.id }}>Lihat Detail</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
