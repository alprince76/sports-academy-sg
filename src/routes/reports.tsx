import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileDown, TrendingUp, Trophy, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useReports, getAcademyId } from "@/lib/queries";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — SportAcademy" }] }),
  component: ReportsPage,
});

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function ReportsPage() {
  const { data: r, isLoading, isError } = useReports();

  const handleExport = () => {
    const token = JSON.parse(localStorage.getItem("sb-127-auth-token") ?? "{}")?.access_token;
    if (!token) { toast.error("Sesi tidak valid"); return; }
    // buka URL export CSV dengan token di header — pakai fetch + blob download
    fetch(`http://localhost:8081/reports/export`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `athletes-report-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Laporan CSV berhasil diunduh");
      })
      .catch(() => toast.error("Gagal mengunduh laporan"));
  };

  return (
    <DashboardLayout
      title="Reports & Analytics"
      subtitle="Insight performa, kehadiran, dan finansial — dari data backend"
      actions={
        <>
          <Button variant="outline" onClick={handleExport}><Download className="mr-1 h-4 w-4" />Export CSV</Button>
          <Button onClick={() => toast.info("Gunakan Export CSV untuk data lengkap")}>
            <FileDown className="mr-1 h-4 w-4" />Download PDF
          </Button>
        </>
      }
    >
      {isLoading && (
        <Card className="border-dashed"><CardContent className="flex flex-col items-center gap-3 p-12 text-center text-sm text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" /> Menyusun laporan...
        </CardContent></Card>
      )}
      {isError && (
        <Card className="border-dashed"><CardContent className="p-12 text-center text-sm text-muted-foreground">
          Gagal memuat laporan. Pastikan backend :8081 jalan.
        </CardContent></Card>
      )}

      {r && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Atlet" value={String(r.total_athletes)} sub={`${r.active_athletes} aktif`} />
            <StatCard label="Attendance Avg" value={`${r.avg_attendance}%`} sub="rata-rata" />
            <StatCard label="Performance Avg" value={String(r.avg_progress)} sub="progress rata-rata" />
            <StatCard
              label="Revenue YTD"
              value={r.revenue ? formatRupiah(r.revenue.total_paid) : "—"}
              sub={r.revenue ? `${formatRupiah(r.revenue.outstanding)} outstanding` : "khusus owner/admin"}
            />
          </div>

          <Tabs defaultValue="performance" className="mt-8">
            <TabsList>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="growth">Komposisi</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="mt-4">
              <Card className="border-border/70">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    <h2 className="font-display text-lg font-semibold">Top Athletes</h2>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">5 atlet dengan progress tertinggi.</p>
                  <div className="mt-4 space-y-2">
                    {r.top_athletes.map((a, i) => (
                      <div key={a.name + i} className="flex items-center gap-3 rounded-lg border border-border p-3">
                        <span className="font-display text-lg font-bold text-primary">#{i + 1}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{a.name}</p>
                          <p className="text-xs text-muted-foreground">{a.team ?? "—"}</p>
                        </div>
                        <Badge variant="secondary" className={a.progress >= 70 ? "bg-primary-soft text-primary" : "bg-amber-100 text-amber-800"}>
                          <TrendingUp className="mr-1 h-3 w-3" />{a.progress}%
                        </Badge>
                      </div>
                    ))}
                    {r.top_athletes.length === 0 && (
                      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">Belum ada data atlet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="growth" className="mt-4">
              <Card className="border-border/70">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <h2 className="font-display text-lg font-semibold">Komposisi Kelompok Umur</h2>
                  </div>
                  <div className="mt-4 space-y-3">
                    {Object.entries(r.age_groups).map(([g, n]) => {
                      const pct = r.total_athletes ? Math.round((n / r.total_athletes) * 100) : 0;
                      return (
                        <div key={g} className="flex items-center gap-3">
                          <span className="w-20 text-xs font-medium">{g}</span>
                          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-8 text-right text-xs font-semibold">{n}</span>
                        </div>
                      );
                    })}
                    {Object.keys(r.age_groups).length === 0 && (
                      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">Belum ada data.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="revenue" className="mt-4">
              <Card className="border-border/70">
                <CardContent className="p-6">
                  <h2 className="font-display text-lg font-semibold">Ringkasan Revenue</h2>
                  {r.revenue ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <RevenueBox label="Total Ditagih" value={formatRupiah(r.revenue.total_invoiced)} />
                      <RevenueBox label="Terbayar (Lunas)" value={formatRupiah(r.revenue.total_paid)} highlight />
                      <RevenueBox label="Outstanding" value={formatRupiah(r.revenue.outstanding)} />
                    </div>
                  ) : (
                    <p className="mt-4 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                      Revenue hanya tampil untuk role owner/admin.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </DashboardLayout>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="border-border/70">
      <CardContent className="p-6">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-3 font-display text-2xl font-bold">{value}</p>
        {sub && <p className="mt-1 text-[10px] text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function RevenueBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-5 text-center ${highlight ? "bg-primary-soft" : "bg-secondary/40"}`}>
      <p className="font-display text-xl font-bold text-primary">{value}</p>
      <p className="mt-1 text-[10px] uppercase text-muted-foreground">{label}</p>
    </div>
  );
}
