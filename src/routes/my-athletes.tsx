import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, TrendingUp, Trophy } from "lucide-react";
import { useAthletes, useProgressTrend, useMatchSummary, useCreateProgress } from "@/lib/queries";

export const Route = createFileRoute("/my-athletes")({
  head: () => ({ meta: [{ title: "My Athletes — SportAcademy" }] }),
  component: MyAthletesPage,
});

function MyAthletesPage() {
  const { data: athletes = [], isLoading, isError } = useAthletes();
  const [selected, setSelected] = useState<string | null>(athletes[0]?.id ?? null);
  const [note, setNote] = useState("");
  const createProgress = useCreateProgress();

  // sync selected saat data load
  const current = athletes.find((x) => x.id === selected) ?? athletes[0];

  const { data: trend } = useProgressTrend(current?.id ?? "");
  const { data: matchSum } = useMatchSummary(current?.id ?? "");

  const saveNote = () => {
    if (!current || !note.trim()) return;
    createProgress.mutate(
      { athlete_id: current.id, overall: current.progress ?? 0, note: note.trim() },
      {
        onSuccess: () => { toast.success("Catatan tersimpan ke riwayat progress"); setNote(""); },
        onError: (e: any) => toast.error(e?.message ?? "Gagal menyimpan"),
      }
    );
  };

  const skills = (current?.skills ?? []) as { name: string; value: number }[];

  return (
    <DashboardLayout title="My Athletes" subtitle="Atlet di bawah bimbingan Anda — data asli dari backend">
      {isLoading && (
        <Card className="border-dashed"><CardContent className="flex flex-col items-center gap-3 p-12 text-center text-sm text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" /> Memuat atlet...
        </CardContent></Card>
      )}
      {isError && (
        <Card className="border-dashed"><CardContent className="p-12 text-center text-sm text-muted-foreground">
          Gagal memuat data dari backend. Pastikan backend :8081 jalan.
        </CardContent></Card>
      )}

      {current && (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Card className="border-border/70">
            <CardContent className="p-3">
              <div className="space-y-1">
                {athletes.map((x) => (
                  <button key={x.id} onClick={() => setSelected(x.id)} className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition ${current.id === x.id ? "bg-primary-soft" : "hover:bg-secondary/50"}`}>
                    <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary-soft text-xs text-primary">{x.name.split(" ").map(p=>p[0]).join("").slice(0,2)}</AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{x.name}</p>
                      <p className="text-xs text-muted-foreground">{x.team ?? "—"} · {x.position ?? "—"}</p>
                    </div>
                    <span className="font-display text-sm font-bold text-primary">{x.progress ?? 0}</span>
                  </button>
                ))}
                {athletes.length === 0 && (
                  <p className="p-6 text-center text-sm text-muted-foreground">Belum ada atlet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-border/70">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center gap-4">
                  <Avatar className="h-14 w-14"><AvatarFallback className="bg-primary text-primary-foreground">{current.name.split(" ").map(p=>p[0]).join("").slice(0,2)}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <h2 className="font-display text-xl font-bold">{current.name}</h2>
                    <p className="text-sm text-muted-foreground">{current.age_group ?? "—"} · {current.position ?? "—"} · {current.team ?? "—"}</p>
                  </div>
                  <Badge variant="secondary" className="bg-primary-soft text-primary">{current.status ?? "Aktif"}</Badge>
                  <Button asChild variant="outline"><Link to="/athletes/$athleteId" params={{ athleteId: current.id }}>Full Profile</Link></Button>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-semibold">Performance Trend</h3>
                    {trend && trend.trend.length > 0 ? (
                      <div className="mt-3">
                        <div className="flex h-24 items-end gap-1.5">
                          {trend.trend.map((t, i) => (
                            <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-primary to-emerald-400" style={{ height: `${t.overall}%` }} title={`${t.date}: ${t.overall}`} />
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {trend.delta >= 0 ? "▲" : "▼"} {Math.abs(trend.delta)} poin sejak awal ({trend.trend.length} catatan)
                        </p>
                      </div>
                    ) : (
                      <p className="mt-3 rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">Belum ada riwayat progress.</p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Skills</h3>
                    {skills.length > 0 ? (
                      <div className="mt-3 space-y-2">
                        {skills.map((s) => (
                          <div key={s.name}>
                            <div className="mb-1 flex justify-between text-xs"><span>{s.name}</span><span className="font-semibold">{s.value}</span></div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${s.value}%` }} /></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">Belum ada data skill.</p>
                    )}
                  </div>
                </div>

                {matchSum && matchSum.games > 0 && (
                  <div className="mt-6 rounded-xl bg-secondary/40 p-4">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold">Match Performance</h3>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                      <div><p className="font-display text-lg font-bold text-primary">{matchSum.games}</p><p className="text-[10px] text-muted-foreground">Games</p></div>
                      <div><p className="font-display text-lg font-bold text-primary">{matchSum.avg_pir}</p><p className="text-[10px] text-muted-foreground">Avg PIR</p></div>
                      <div><p className="font-display text-lg font-bold text-primary">{matchSum.avg_pts}</p><p className="text-[10px] text-muted-foreground">Avg PTS</p></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardContent className="p-6">
                <h3 className="font-display text-lg font-semibold">Catatan Coach</h3>
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tulis observasi atau evaluasi singkat — tersimpan ke riwayat progress atlet..." className="mt-3 min-h-24" />
                <div className="mt-3 flex justify-end">
                  <Button onClick={saveNote} disabled={!note.trim() || createProgress.isPending} className="gap-1">
                    {createProgress.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <TrendingUp className="h-3.5 w-3.5" /> Simpan Catatan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
