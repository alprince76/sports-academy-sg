import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Star, Copy, Clock, Dumbbell, Zap, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useDrills } from "@/lib/queries";
import { DRILL_CATEGORIES } from "@/lib/training-data";

export const Route = createFileRoute("/drills/")({
  head: () => ({ meta: [{ title: "Drill Library — SportAcademy" }] }),
  component: DrillsPage,
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

function DrillsPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const { data: drills = [], isLoading, isError } = useDrills();

  const filtered = drills.filter((d) =>
    (cat === "all" || d.category === cat) &&
    (d.title.toLowerCase().includes(q.toLowerCase()) || (d.focus ?? "").toLowerCase().includes(q.toLowerCase()))
  );

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
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua kategori</SelectItem>
            {DRILL_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Badge variant="secondary">{filtered.length} drill</Badge>
      </div>

      {isLoading && (
        <Card className="border-dashed"><CardContent className="p-12 text-center text-sm text-muted-foreground">Memuat drill...</CardContent></Card>
      )}
      {isError && (
        <Card className="border-dashed"><CardContent className="p-12 text-center text-sm text-muted-foreground">
          Gagal memuat data dari backend. Pastikan backend :8081 jalan.
        </CardContent></Card>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((d) => (
          <Link key={d.id} to="/drills/$drillId" params={{ drillId: d.id }} className="group">
            <Card className="h-full border-border/70 transition-all group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-elevated">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <Badge variant="secondary" className="bg-primary-soft text-primary">{d.category}</Badge>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.preventDefault(); toast.success("Ditambahkan ke Favorites"); }}>
                      <Star className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.preventDefault(); toast.success("Drill diduplikasi"); }}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <h3 className="mt-3 font-display text-base font-semibold leading-tight group-hover:text-primary">{d.title}</h3>
                {d.focus && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{d.focus}</p>}

                <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
                  <Badge variant="secondary" className={DIFF_COLOR[d.difficulty]}>{d.difficulty}</Badge>
                  <Badge variant="secondary" className={`gap-1 ${INTENSITY_COLOR[d.intensity]}`}><Zap className="h-3 w-3" />{d.intensity}</Badge>
                  <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />{d.duration}m</Badge>
                  {d.equipment && <Badge variant="secondary" className="gap-1"><Dumbbell className="h-3 w-3" />{d.equipment}</Badge>}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && !isLoading && !isError && (
          <Card className="col-span-full border-dashed">
            <CardContent className="flex flex-col items-center gap-2 p-12 text-center text-sm text-muted-foreground">
              <AlertCircle className="h-6 w-6" />
              Belum ada drill yang cocok.
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
