import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, Users, CalendarCheck, Loader2 } from "lucide-react";
import { RadarChart } from "@/components/site/RadarChart";
import { useInsights } from "@/lib/queries";

export const Route = createFileRoute("/insights")({
  head: () => ({ meta: [{ title: "Assessment Insights — SportAcademy" }] }),
  component: InsightsPage,
});

function InsightsPage() {
  const { data: ins, isLoading, isError } = useInsights();

  return (
    <DashboardLayout
      title="Assessment Insights"
      subtitle="Agregasi performa dari assessment, progress, dan PIR — dihitung backend secara real-time."
    >
      {isLoading && (
        <Card className="border-dashed"><CardContent className="flex flex-col items-center gap-3 p-12 text-center text-sm text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          Menghitung insights dari data backend...
        </CardContent></Card>
      )}
      {isError && (
        <Card className="border-dashed"><CardContent className="p-12 text-center text-sm text-muted-foreground">
          Gagal memuat insights. Pastikan backend :8081 jalan.
        </CardContent></Card>
      )}

      {ins && (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard icon={<Users className="h-5 w-5" />} label="Total Atlet" value={String(ins.total_athletes)} />
            <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Rata-rata Progress" value={`${ins.avg_progress}%`} />
            <StatCard icon={<CalendarCheck className="h-5 w-5" />} label="Rata-rata Kehadiran" value={`${ins.avg_attendance}%`} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Skill radar */}
            <Card className="border-border/70">
              <CardContent className="p-6">
                <h2 className="font-display text-lg font-semibold">Skill Radar Rata-rata</h2>
                <p className="mt-1 text-xs text-muted-foreground">Dari assessment terbaru semua atlet.</p>
                {ins.skill_radar && Object.keys(ins.skill_radar).length > 0 ? (
                  <div className="mt-4">
                    <RadarChart
                      axes={Object.keys(ins.skill_radar)}
                      series={[{ label: "Rata-rata", color: "#ff6529", values: Object.values(ins.skill_radar) }]}
                      max={5}
                    />
                  </div>
                ) : (
                  <p className="mt-6 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    Belum ada data assessment untuk radar.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* PIR trend */}
            <Card className="border-border/70">
              <CardContent className="p-6">
                <h2 className="font-display text-lg font-semibold">Tren PIR Rata-rata</h2>
                <p className="mt-1 text-xs text-muted-foreground">Rata-rata Performance Index Rating per pertandingan.</p>
                {ins.pir_trend.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    {ins.pir_trend.map((t) => (
                      <div key={t.date} className="flex items-center gap-3 rounded-lg border border-border p-3">
                        <span className="w-28 text-xs font-medium">{t.date}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min((t.avg_pir / 60) * 100, 100)}%` }} />
                        </div>
                        <span className="font-display text-sm font-bold text-primary">{t.avg_pir}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-6 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    Belum ada data pertandingan untuk tren PIR.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Athlete table */}
          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="font-display text-lg font-semibold">Ringkasan Atlet</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Atlet</th>
                      <th className="px-3 py-2 font-medium">Tim</th>
                      <th className="px-3 py-2 font-medium">Kelompok</th>
                      <th className="px-3 py-2 font-medium">Progress</th>
                      <th className="px-3 py-2 font-medium">Kehadiran</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ins.athlete_summary.map((a) => (
                      <tr key={a.id} className="border-b border-border/50 last:border-0">
                        <td className="px-3 py-2.5 font-medium">{a.name}</td>
                        <td className="px-3 py-2.5">{a.team ?? "—"}</td>
                        <td className="px-3 py-2.5">{a.age_group ?? "—"}</td>
                        <td className="px-3 py-2.5">
                          <Badge variant="secondary" className={a.progress >= 70 ? "bg-primary-soft text-primary" : "bg-amber-100 text-amber-800"}>{a.progress}%</Badge>
                        </td>
                        <td className="px-3 py-2.5">{a.attendance}%</td>
                      </tr>
                    ))}
                    {ins.athlete_summary.length === 0 && (
                      <tr><td colSpan={5} className="px-3 py-8 text-center text-sm text-muted-foreground">Belum ada atlet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="border-border/70">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">{icon}</div>
        <div>
          <p className="font-display text-2xl font-bold text-primary">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
