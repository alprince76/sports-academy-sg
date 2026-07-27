import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Calendar, LayoutTemplate, Target } from "lucide-react";
import { TRAINING_PROGRAMS, SESSION_TEMPLATES } from "@/lib/training-data";

export const Route = createFileRoute("/programs/$programId")({
  head: () => ({ meta: [{ title: "Program Detail — SportAcademy" }] }),
  component: ProgramDetailPage,
});

function ProgramDetailPage() {
  const { programId } = Route.useParams();
  const program = TRAINING_PROGRAMS.find((p) => p.id === programId) ?? TRAINING_PROGRAMS[0];
  const templates = SESSION_TEMPLATES.filter((t) => program.sessionTemplateIds.includes(t.id));

  return (
    <DashboardLayout
      title={program.name}
      subtitle={`${program.coach} · ${program.ageCategory} · ${program.durationWeeks} minggu`}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link to="/programs"><ArrowLeft className="mr-1 h-4 w-4" />Kembali</Link>
          </Button>
          <Button asChild>
            <Link to="/session-builder"><LayoutTemplate className="mr-1 h-4 w-4" />Open Session Builder</Link>
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/70 lg:col-span-2">
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="bg-primary-soft text-primary">{program.ageCategory}</Badge>
              <Badge
                variant="secondary"
                className={
                  program.status === "Active"
                    ? "bg-primary-soft text-primary"
                    : program.status === "Draft"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-secondary text-muted-foreground"
                }
              >
                {program.status}
              </Badge>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-muted-foreground">Progress program</span>
                <span className="font-semibold text-primary">{program.progress}%</span>
              </div>
              <Progress value={program.progress} className="h-2" />
            </div>

            <div>
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                <Target className="h-4 w-4 text-primary" /> Objectives
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                {program.objectives.map((o) => (
                  <li key={o} className="flex gap-2 rounded-lg border border-border p-3">
                    <span className="text-primary">•</span>
                    {o}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                <LayoutTemplate className="h-4 w-4 text-primary" /> Linked Session Templates
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {templates.map((t) => (
                  <div key={t.id} className="rounded-xl border border-border p-4">
                    <p className="font-semibold">{t.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t.focus} · {t.intensity} · {t.totalMinutes} menit
                    </p>
                    <p className="mt-2 text-[10px] text-muted-foreground">Updated {t.updatedAt}</p>
                  </div>
                ))}
                {templates.length === 0 && (
                  <p className="text-sm text-muted-foreground">Belum ada template terhubung.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardContent className="space-y-4 p-6">
            <h2 className="font-display text-lg font-semibold">Ringkasan</h2>
            <Row icon={Calendar} label="Durasi" value={`${program.durationWeeks} minggu`} />
            <Row icon={LayoutTemplate} label="Total sesi" value={String(program.totalSessions)} />
            <Row icon={Target} label="Templates" value={String(program.sessionTemplateIds.length)} />
            <Row icon={Target} label="Coach" value={program.coach} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
      <Icon className="h-4 w-4 text-primary" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
