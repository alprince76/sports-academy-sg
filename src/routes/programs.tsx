import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Calendar, Users, Target as TargetIcon } from "lucide-react";
import { TRAINING_PROGRAMS } from "@/lib/training-data";

export const Route = createFileRoute("/programs")({
  head: () => ({ meta: [{ title: "Training Programs — SportAcademy" }] }),
  component: ProgramsPage,
});

function ProgramsPage() {
  return (
    <DashboardLayout
      title="Training Programs"
      subtitle="Rencana pengembangan jangka panjang. Setiap program terdiri dari beberapa Session Builder."
      actions={<Button asChild><Link to="/programs/new"><Plus className="mr-1 h-4 w-4" />Buat Program</Link></Button>}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {TRAINING_PROGRAMS.map((p) => (
          <Card key={p.id} className="border-border/70">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <Badge variant="secondary" className="bg-primary-soft text-primary">{p.ageCategory}</Badge>
                <Badge variant="secondary" className={p.status === "Active" ? "bg-primary-soft text-primary" : p.status === "Draft" ? "bg-amber-100 text-amber-800" : "bg-secondary text-muted-foreground"}>
                  {p.status}
                </Badge>
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold leading-tight">{p.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{p.coach}</p>

              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg bg-secondary/50 p-2">
                  <p className="flex items-center gap-1 text-muted-foreground"><Calendar className="h-3 w-3" />Durasi</p>
                  <p className="mt-0.5 font-display font-bold">{p.durationWeeks}w</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-2">
                  <p className="flex items-center gap-1 text-muted-foreground"><Users className="h-3 w-3" />Sesi</p>
                  <p className="mt-0.5 font-display font-bold">{p.totalSessions}</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-2">
                  <p className="flex items-center gap-1 text-muted-foreground"><TargetIcon className="h-3 w-3" />Templates</p>
                  <p className="mt-0.5 font-display font-bold">{p.sessionTemplateIds.length}</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold text-primary">{p.progress}%</span>
                </div>
                <Progress value={p.progress} className="h-2" />
              </div>

              <div className="mt-4">
                <p className="text-[10px] uppercase text-muted-foreground">Objectives</p>
                <ul className="mt-1 space-y-0.5 text-xs">
                  {p.objectives.map((o) => (
                    <li key={o} className="flex gap-1.5"><span className="text-primary">•</span>{o}</li>
                  ))}
                </ul>
              </div>

              <Button asChild variant="secondary" size="sm" className="mt-4 w-full">
                <Link to="/session-builder">Open Session Builder</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
