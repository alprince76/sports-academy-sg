import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { ATHLETES } from "@/lib/demo-data";

export const Route = createFileRoute("/my-athletes")({
  head: () => ({ meta: [{ title: "My Athletes — SportAcademy" }] }),
  component: MyAthletesPage,
});

function MyAthletesPage() {
  const [selected, setSelected] = useState(ATHLETES[0].id);
  const a = ATHLETES.find((x) => x.id === selected)!;
  const [note, setNote] = useState("");

  return (
    <DashboardLayout title="My Athletes" subtitle="Atlet yang berada di bawah bimbingan Anda">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="border-border/70">
          <CardContent className="p-3">
            <div className="space-y-1">
              {ATHLETES.slice(0, 6).map((x) => (
                <button key={x.id} onClick={() => setSelected(x.id)} className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition ${selected === x.id ? "bg-primary-soft" : "hover:bg-secondary/50"}`}>
                  <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary-soft text-xs text-primary">{x.name.split(" ").map(p=>p[0]).join("").slice(0,2)}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{x.name}</p>
                    <p className="text-xs text-muted-foreground">{x.team} · {x.position}</p>
                  </div>
                  <span className="font-display text-sm font-bold text-primary">{x.progress}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-4">
                <Avatar className="h-14 w-14"><AvatarFallback className="bg-primary text-primary-foreground">{a.name.split(" ").map(p=>p[0]).join("").slice(0,2)}</AvatarFallback></Avatar>
                <div className="flex-1">
                  <h2 className="font-display text-xl font-bold">{a.name}</h2>
                  <p className="text-sm text-muted-foreground">{a.age} thn · {a.position} · {a.team}</p>
                </div>
                <Badge variant="secondary" className="bg-primary-soft text-primary">{a.status}</Badge>
                <Button asChild variant="outline"><Link to="/athletes/$athleteId" params={{ athleteId: a.id }}>Full Profile</Link></Button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold">Performance Trend</h3>
                  <div className="mt-3 flex h-24 items-end gap-1.5">
                    {[72, 78, 75, 82, 80, 86, a.progress].map((v, i) => (
                      <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-primary to-emerald-400" style={{ height: `${v}%` }} />
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Skills</h3>
                  <div className="mt-3 space-y-2">
                    {a.skills.map((s) => (
                      <div key={s.name}>
                        <div className="mb-1 flex justify-between text-xs"><span>{s.name}</span><span className="font-semibold">{s.value}</span></div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${s.value}%` }} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardContent className="p-6">
              <h3 className="font-display text-lg font-semibold">Add Coach Note</h3>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tulis observasi atau evaluasi singkat..." className="mt-3 min-h-24" />
              <div className="mt-3 flex justify-end">
                <Button onClick={() => { toast.success("Catatan disimpan"); setNote(""); }} disabled={!note}>Simpan Catatan</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
