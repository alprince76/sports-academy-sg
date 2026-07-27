import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { toast } from "sonner";
import { ATHLETES } from "@/lib/demo-data";
import { PARENT_ATTENDANCE, PARENT_CHILD_NAME, SESSIONS } from "@/lib/ops-data";
import { useRole } from "@/lib/role";

export const Route = createFileRoute("/attendance")({
  head: () => ({ meta: [{ title: "Attendance — SportAcademy" }] }),
  component: AttendancePage,
});

function AttendancePage() {
  const role = useRole();
  const isCoach = role === "coach";
  const isParent = role === "parent";

  const roster = ATHLETES.filter((a) => a.team === "Garuda Elite").slice(0, 6);
  const session = SESSIONS[0];
  const [present, setPresent] = useState<Record<string, boolean>>(
    Object.fromEntries(roster.map((a) => [a.id, true]))
  );

  if (isParent) {
    return (
      <DashboardLayout title="Attendance" subtitle={`Riwayat kehadiran ${PARENT_CHILD_NAME}`}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat l="Total Sesi" v="48" />
          <Stat l="Hadir" v="46 (96%)" />
          <Stat l="Izin / Absen" v="2" />
        </div>
        <Card className="mt-6 border-border/70">
          <CardContent className="p-6">
            <h2 className="font-display text-lg font-semibold">Riwayat Terbaru</h2>
            <div className="mt-4 space-y-2">
              {PARENT_ATTENDANCE.map((r, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">{r.t}</p>
                    <p className="text-xs text-muted-foreground">{r.d}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={r.s === "Hadir" ? "bg-primary-soft text-primary" : "bg-amber-100 text-amber-800"}
                  >
                    {r.s}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Take Attendance"
      subtitle={`Sesi: ${session.title} — ${session.date} ${session.time.split(" - ")[0]}`}
      actions={
        <Button
          onClick={() =>
            toast.success("Absensi disimpan", {
              description: `${Object.values(present).filter(Boolean).length} hadir, ${roster.length - Object.values(present).filter(Boolean).length} absen`,
            })
          }
        >
          Simpan
        </Button>
      }
    >
      <Card className="border-border/70">
        <CardContent className="p-3">
          {roster.map((a, i) => (
            <div
              key={a.id}
              className={`flex items-center gap-3 p-3 ${i !== roster.length - 1 ? "border-b border-border" : ""}`}
            >
              <Checkbox
                checked={present[a.id]}
                onCheckedChange={(v) => setPresent({ ...present, [a.id]: !!v })}
              />
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary-soft text-xs text-primary">
                  {a.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">{a.name}</p>
                <p className="text-xs text-muted-foreground">{a.team} · {a.position}</p>
              </div>
              <Badge
                variant="secondary"
                className={present[a.id] ? "bg-primary-soft text-primary" : "bg-secondary text-muted-foreground"}
              >
                {present[a.id] ? "Hadir" : "Absen"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
      {!isCoach && (
        <p className="mt-4 text-xs text-muted-foreground">
          Tip: Coach role memiliki akses lengkap untuk input skor evaluasi di Training Sessions.
        </p>
      )}
    </DashboardLayout>
  );
}

function Stat({ l, v }: { l: string; v: string }) {
  return (
    <Card className="border-border/70">
      <CardContent className="p-6">
        <p className="text-xs text-muted-foreground">{l}</p>
        <p className="mt-2 font-display text-2xl font-bold">{v}</p>
      </CardContent>
    </Card>
  );
}
