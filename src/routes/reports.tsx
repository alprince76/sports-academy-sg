import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileDown, TrendingUp, Trophy } from "lucide-react";
import { toast } from "sonner";
import { ATHLETES } from "@/lib/demo-data";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — SportAcademy" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const [exporting, setExporting] = useState(false);
  const top = [...ATHLETES].sort((a, b) => b.progress - a.progress).slice(0, 5);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => { setExporting(false); toast.success("Laporan PDF berhasil diunduh"); }, 1100);
  };

  return (
    <DashboardLayout
      title="Reports & Analytics"
      subtitle="Insight performa, kehadiran, dan finansial akademi"
      actions={
        <>
          <Button variant="outline" onClick={() => toast.success("Laporan CSV berhasil diunduh")}><Download className="mr-1 h-4 w-4" />Export CSV</Button>
          <Button onClick={handleExport} disabled={exporting}>
            <FileDown className="mr-1 h-4 w-4" />{exporting ? "Generating..." : "Download PDF"}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { l: "Total Atlet", v: "128", c: "+12%" },
          { l: "Attendance Avg", v: "92%", c: "+4%" },
          { l: "Performance Avg", v: "82", c: "+6" },
          { l: "Revenue YTD", v: "Rp 248jt", c: "+24%" },
        ].map((s) => (
          <Card key={s.l} className="border-border/70">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{s.l}</p>
                <Badge variant="secondary" className="bg-primary-soft text-primary gap-1"><TrendingUp className="h-3 w-3" />{s.c}</Badge>
              </div>
              <p className="mt-3 font-display text-2xl font-bold">{s.v}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="performance" className="mt-8">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="growth">Academy Growth</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="mt-4 grid gap-6 lg:grid-cols-3">
          <Card className="border-border/70 lg:col-span-2">
            <CardContent className="p-6">
              <h2 className="font-display text-lg font-semibold">Tren Performa Atlet</h2>
              <p className="mt-1 text-xs text-muted-foreground">Rata-rata skor evaluasi per bulan</p>
              <LineChart data={[72, 74, 76, 78, 80, 82]} labels={["Jan","Feb","Mar","Apr","Mei","Jun"]} />
            </CardContent>
          </Card>
          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-semibold">Top Performers</h2>
              </div>
              <div className="mt-5 space-y-3">
                {top.map((a, i) => (
                  <div key={a.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                    <span className="font-display text-lg font-bold text-muted-foreground">#{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.team}</p>
                    </div>
                    <span className="font-display text-lg font-bold text-primary">{a.progress}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="mt-4">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="font-display text-lg font-semibold">Attendance per Tim</h2>
              <div className="mt-5 space-y-4">
                {[
                  { t: "Young Warriors", v: 88 }, { t: "Garuda Elite", v: 94 }, { t: "Phoenix Academy", v: 81 },
                  { t: "Falcons Blue", v: 93 },
                ].map((r) => (
                  <div key={r.t}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{r.t}</span>
                      <span className="font-semibold">{r.v}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400" style={{ width: `${r.v}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth" className="mt-4">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="font-display text-lg font-semibold">Pertumbuhan Atlet</h2>
              <LineChart data={[78, 84, 92, 100, 116, 128]} labels={["Jan","Feb","Mar","Apr","Mei","Jun"]} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="mt-4">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="font-display text-lg font-semibold">Revenue per Bulan (juta)</h2>
              <div className="mt-6 flex h-48 items-end gap-3">
                {[28, 32, 38, 42, 40, 48].map((v, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-xs font-semibold">{v}</span>
                    <div className="w-full rounded-t-md bg-gradient-to-t from-primary to-emerald-400" style={{ height: `${v * 1.6}%` }} />
                    <span className="text-xs text-muted-foreground">{["Jan","Feb","Mar","Apr","Mei","Jun"][i]}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

function LineChart({ data, labels }: { data: number[]; labels: string[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 80 - 10}`).join(" ");
  return (
    <div className="mt-6">
      <div className="relative h-48">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
          <defs>
            <linearGradient id="ln" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.62 0.18 145)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="oklch(0.62 0.18 145)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline fill="none" stroke="oklch(0.62 0.18 145)" strokeWidth="0.8" points={points} />
          <polygon fill="url(#ln)" points={`0,100 ${points} 100,100`} />
        </svg>
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        {labels.map((l) => <span key={l}>{l}</span>)}
      </div>
    </div>
  );
}
