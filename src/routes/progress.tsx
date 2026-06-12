import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ATHLETES } from "@/lib/demo-data";
import { Award, Star } from "lucide-react";

export const Route = createFileRoute("/progress")({
  head: () => ({ meta: [{ title: "Progress — SportAcademy" }] }),
  component: ProgressPage,
});

function ProgressPage() {
  const child = ATHLETES.find((a) => a.name === "Aldi Setiawan")!;
  const trend = [72, 78, 75, 82, 80, 86, child.progress];
  const skills = [
    { name: "Passing", value: 85 },
    { name: "Shooting", value: 72 },
    { name: "Speed", value: 88 },
    { name: "Stamina", value: 90 },
    { name: "Teamwork", value: 92 },
  ];

  return (
    <DashboardLayout title={`${child.name}`} subtitle={`${child.age} thn · ${child.team} · ${child.position}`}>
      <Tabs defaultValue="progress">
        <TabsList>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="notes">Coach Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="font-display text-lg font-semibold">Performance Trend</h2>
              <p className="mt-1 text-xs text-muted-foreground">7 minggu terakhir</p>
              <div className="mt-6 flex h-40 items-end gap-2">
                {trend.map((v, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-xs font-semibold">{v}</span>
                    <div className="w-full rounded-t bg-gradient-to-t from-primary to-emerald-400" style={{ height: `${v}%` }} />
                    <span className="text-xs text-muted-foreground">W{i + 22}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="font-display text-lg font-semibold">Skill Development</h2>
              <div className="mt-4 space-y-3">
                {skills.map((s) => (
                  <div key={s.name}>
                    <div className="mb-1 flex justify-between text-sm"><span>{s.name}</span><span className="font-semibold text-primary">{s.value}</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400" style={{ width: `${s.value}%` }} /></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="mt-6">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="font-display text-lg font-semibold">Attendance 96%</h2>
              <p className="mt-1 text-xs text-muted-foreground">46 dari 48 sesi tahun ini</p>
              <div className="mt-6 grid grid-cols-12 gap-1">
                {Array.from({ length: 48 }).map((_, i) => {
                  const miss = i === 12 || i === 31;
                  return <div key={i} className={`aspect-square rounded ${miss ? "bg-amber-300" : "bg-primary"}`} />;
                })}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">Hijau = Hadir · Kuning = Izin</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="flex items-center gap-2"><Award className="h-5 w-5 text-primary" /><h2 className="font-display text-lg font-semibold">Achievements</h2></div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[...child.achievements, "Perfect Week", "Team Player", "MVP Latihan Mei"].map((a) => (
                  <div key={a} className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary-soft p-4">
                    <Star className="h-5 w-5 text-primary" />
                    <div><p className="text-sm font-semibold">{a}</p><p className="text-xs text-muted-foreground">Diraih bulan ini</p></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <Card className="border-border/70">
            <CardContent className="p-6 space-y-3">
              {[
                { d: "3 Jun 2026", c: "Coach Rangga", n: child.note },
                { d: "1 Jun 2026", c: "Coach Rangga", n: "Komunikasi di lapangan semakin matang." },
                { d: "29 Mei 2026", c: "Coach Andre", n: "Stamina prima, pertahankan rutinitas." },
              ].map((f, i) => (
                <div key={i} className="rounded-xl border border-border bg-secondary/30 p-4">
                  <div className="flex items-center justify-between"><p className="text-sm font-semibold text-primary">{f.c}</p><Badge variant="secondary">{f.d}</Badge></div>
                  <p className="mt-2 text-sm">{f.n}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
