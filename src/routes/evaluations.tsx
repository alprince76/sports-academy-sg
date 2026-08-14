import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAthletes, useEvaluations } from "@/lib/queries";

export const Route = createFileRoute("/evaluations")({
  head: () => ({ meta: [{ title: "Evaluations — SportAcademy" }] }),
  component: EvaluationsPage,
});

function EvaluationsPage() {
  const { data: athletes = [] } = useAthletes();
  const athlete = athletes.find((a) => a.name === "Aldi Setiawan") ?? athletes[0];
  const { data: evals = [], isLoading, isError } = useEvaluations(athlete?.id ?? "");

  // Recent: dari backend (evaluasi terbaru)
  const recent = evals.slice(0, 4).map((e) => {
    const avg = Math.round((e.passing + e.dribbling + e.shooting + e.stamina + e.teamwork + e.attitude) / 6);
    return { n: athlete?.name ?? "Atlet", d: e.session_date, s: avg };
  });

  return (
    <DashboardLayout title="Evaluations" subtitle="Evaluasi atlet yang menunggu & riwayat terbaru">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Pending Evaluations</h2>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">{athletes.length} atlet</Badge>
            </div>
            <div className="mt-4 space-y-2">
              {athletes.slice(0, 6).map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary-soft text-xs text-primary">{a.name.split(" ").map(p=>p[0]).join("").slice(0,2)}</AvatarFallback></Avatar>
                  <div className="flex-1"><p className="text-sm font-medium">{a.name}</p><p className="text-xs text-muted-foreground">Tim: {a.team ?? "—"}</p></div>
                  <Button asChild size="sm"><Link to="/training/$sessionId" params={{ sessionId: "1" }}>Evaluasi</Link></Button>
                </div>
              ))}
              {athletes.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Belum ada atlet.</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardContent className="p-6">
            <h2 className="font-display text-lg font-semibold">Recent Evaluations</h2>
            {isLoading && <p className="mt-4 text-center text-sm text-muted-foreground">Memuat...</p>}
            {isError && <p className="mt-4 text-center text-sm text-muted-foreground">Gagal memuat dari backend.</p>}
            <div className="mt-4 space-y-2">
              {recent.map((e, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div><p className="text-sm font-medium">{e.n}</p><p className="text-xs text-muted-foreground">Submitted {e.d}</p></div>
                  <span className="font-display text-lg font-bold text-primary">{e.s}</span>
                </div>
              ))}
              {recent.length === 0 && !isLoading && !isError && (
                <p className="py-6 text-center text-sm text-muted-foreground">Belum ada evaluasi tercatat.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
