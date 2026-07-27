import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Archive, ArrowLeft, Clock, Copy, Dumbbell, Star } from "lucide-react";
import { toast } from "sonner";
import { BLOCK_META, DRILLS } from "@/lib/training-data";

export const Route = createFileRoute("/drills/$drillId")({
  head: () => ({ meta: [{ title: "Drill Detail — SportAcademy" }] }),
  component: DrillDetailPage,
});

function DrillDetailPage() {
  const { drillId } = Route.useParams();
  const drill = DRILLS.find((d) => d.id === drillId) ?? DRILLS[0];

  return (
    <DashboardLayout
      title={drill.title}
      subtitle={`${drill.category} · ${drill.skillFocus} · ${drill.ageGroup}`}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link to="/drills"><ArrowLeft className="mr-1 h-4 w-4" />Kembali</Link>
          </Button>
          <Button variant="outline" onClick={() => toast.success("Ditambahkan ke Favorites")}>
            <Star className={`mr-1 h-4 w-4 ${drill.favorite ? "fill-amber-400 text-amber-400" : ""}`} />
            Favorite
          </Button>
          <Button variant="outline" onClick={() => toast.success("Drill diduplikasi")}>
            <Copy className="mr-1 h-4 w-4" />Duplicate
          </Button>
          <Button variant="secondary" onClick={() => toast.success("Drill diarsipkan")}>
            <Archive className="mr-1 h-4 w-4" />Archive
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/70 lg:col-span-2">
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className={BLOCK_META[drill.category].color}>{drill.category}</Badge>
              <Badge variant="secondary">{drill.difficulty}</Badge>
              <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />{drill.duration}m</Badge>
              <Badge variant="secondary" className="gap-1"><Dumbbell className="h-3 w-3" />{drill.skillFocus}</Badge>
            </div>

            <section>
              <h2 className="font-display text-lg font-semibold">Objective</h2>
              <p className="mt-2 text-sm text-muted-foreground">{drill.objective}</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold">Description</h2>
              <p className="mt-2 text-sm leading-relaxed">{drill.description}</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold">Coaching Points</h2>
              <ul className="mt-2 space-y-1.5 text-sm">
                {drill.coachingPoints.map((p) => (
                  <li key={p} className="flex gap-2"><span className="text-primary">•</span>{p}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold">Common Mistakes</h2>
              <ul className="mt-2 space-y-1.5 text-sm">
                {drill.commonMistakes.map((p) => (
                  <li key={p} className="flex gap-2"><span className="text-destructive">•</span>{p}</li>
                ))}
              </ul>
            </section>

            {drill.safetyNotes && (
              <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="font-semibold">Safety Notes</p>
                <p className="mt-1">{drill.safetyNotes}</p>
              </section>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardContent className="space-y-4 p-6">
            <h2 className="font-display text-lg font-semibold">Equipment</h2>
            <div className="flex flex-wrap gap-2">
              {drill.equipment.map((e) => (
                <Badge key={e} variant="secondary">{e}</Badge>
              ))}
            </div>
            <h2 className="pt-2 font-display text-lg font-semibold">Tags</h2>
            <div className="flex flex-wrap gap-1">
              {drill.tags.map((t) => (
                <span key={t} className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">#{t}</span>
              ))}
            </div>
            <Button asChild className="mt-4 w-full">
              <Link to="/session-builder">Pakai di Session Builder</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
