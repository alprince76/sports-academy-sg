import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { SKILL_CATEGORIES } from "@/lib/assessment-data";
import { useAssessmentDetail } from "@/lib/queries";

export const Route = createFileRoute("/assessment/$assessmentId")({
  head: () => ({ meta: [{ title: "Detail Assessment — SportAcademy" }] }),
  component: AssessmentDetailPage,
  notFoundComponent: () => (
    <DashboardLayout title="Assessment tidak ditemukan">
      <Button asChild><Link to="/assessment">Kembali</Link></Button>
    </DashboardLayout>
  ),
});

const STATUS_STYLE: Record<string, string> = {
  Draft: "bg-secondary text-muted-foreground",
  Reviewed: "bg-amber-100 text-amber-800",
  Published: "bg-primary-soft text-primary",
};

function AssessmentDetailPage() {
  const { assessmentId } = Route.useParams();
  const { data: a, isLoading } = useAssessmentDetail(assessmentId);

  if (isLoading) {
    return (
      <DashboardLayout title="Memuat...">
        <Card><CardContent className="p-12 text-center text-sm text-muted-foreground">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
          Memuat assessment...
        </CardContent></Card>
      </DashboardLayout>
    );
  }
  if (!a) throw notFound();

  const scores = (a.scores ?? {}) as Record<string, number>;
  const prev = (a.previous_scores ?? {}) as Record<string, number>;
  const delta = (a.delta ?? 0) as number;

  return (
    <DashboardLayout
      title={`${a.athletes?.name ?? "Atlet"} — ${a.period}`}
      subtitle={`Assessment ${a.status} · Avg ${a.avg?.toFixed(1) ?? "—"} · ${delta >= 0 ? "▲" : "▼"} ${Math.abs(delta)} vs periode sebelumnya`}
      actions={<Button asChild variant="outline"><Link to="/assessment"><ArrowLeft className="mr-1 h-4 w-4" /> Kembali</Link></Button>}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/70 lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Informasi</h2>
              <Badge variant="secondary" className={STATUS_STYLE[a.status]}>{a.status}</Badge>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <InfoRow label="Atlet" value={a.athletes?.name ?? "—"} />
              <InfoRow label="Periode" value={a.period} />
              <InfoRow label="Rata-rata" value={a.avg?.toFixed(1) ?? "—"} />
              <InfoRow label="Delta" value={`${delta >= 0 ? "▲" : "▼"} ${Math.abs(delta)}`} positive={delta >= 0} />
              <InfoRow label="Status" value={a.status} />
            </div>
            {a.coach_note && (
              <div className="mt-4 rounded-lg bg-secondary/40 p-3">
                <p className="text-[10px] uppercase text-muted-foreground">Catatan Coach</p>
                <p className="mt-1 text-sm leading-relaxed">{a.coach_note}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="font-display text-lg font-semibold">Skor per Skill</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {SKILL_CATEGORIES.map((c) => {
                const cur = scores[c] ?? 0;
                const prevV = prev[c] ?? 0;
                const diff = prevV ? cur - prevV : 0;
                return (
                  <div key={c} className="rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{c}</span>
                      {diff !== 0 && (
                        <span className={`flex items-center gap-0.5 text-xs font-semibold ${diff > 0 ? "text-primary" : "text-destructive"}`}>
                          {diff > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {diff > 0 ? "+" : ""}{diff}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${(cur / 5) * 100}%` }} />
                      </div>
                      <span className="font-display text-lg font-bold text-primary">{cur || "—"}</span>
                      <span className="text-xs text-muted-foreground">/5</span>
                    </div>
                    {prevV > 0 && <p className="mt-1 text-[10px] text-muted-foreground">Sebelumnya: {prevV}</p>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function InfoRow({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${positive === undefined ? "" : positive ? "text-primary" : "text-destructive"}`}>{value}</span>
    </div>
  );
}
