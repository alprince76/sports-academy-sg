import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ATHLETES } from "@/lib/demo-data";

export const Route = createFileRoute("/evaluations")({
  head: () => ({ meta: [{ title: "Evaluations — SportAcademy" }] }),
  component: EvaluationsPage,
});

function EvaluationsPage() {
  return (
    <DashboardLayout title="Evaluations" subtitle="Evaluasi atlet yang menunggu & riwayat terbaru">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Pending Evaluations</h2>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">6 menunggu</Badge>
            </div>
            <div className="mt-4 space-y-2">
              {ATHLETES.slice(0, 6).map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary-soft text-xs text-primary">{a.name.split(" ").map(p=>p[0]).join("").slice(0,2)}</AvatarFallback></Avatar>
                  <div className="flex-1"><p className="text-sm font-medium">{a.name}</p><p className="text-xs text-muted-foreground">Sesi: {a.team} — kemarin</p></div>
                  <Button asChild size="sm"><Link to="/training/$sessionId" params={{ sessionId: "1" }}>Evaluasi</Link></Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardContent className="p-6">
            <h2 className="font-display text-lg font-semibold">Recent Evaluations</h2>
            <div className="mt-4 space-y-2">
              {[
                { n: "Rafi Pratama", d: "3 Jun", s: 88 },
                { n: "Aldi Setiawan", d: "3 Jun", s: 91 },
                { n: "Reza Maulana", d: "2 Jun", s: 87 },
                { n: "Dimas Saputra", d: "1 Jun", s: 78 },
              ].map((e) => (
                <div key={e.n} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div><p className="text-sm font-medium">{e.n}</p><p className="text-xs text-muted-foreground">Submitted {e.d}</p></div>
                  <span className="font-display text-lg font-bold text-primary">{e.s}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
