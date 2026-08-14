import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { toast } from "sonner";
import { useAthletes, useAttendance } from "@/lib/queries";
import { useRole } from "@/lib/role";

export const Route = createFileRoute("/attendance")({
  head: () => ({ meta: [{ title: "Attendance — SportAcademy" }] }),
  component: AttendancePage,
});

function AttendancePage() {
  const role = useRole();
  const isParent = role === "parent";

  const { data: athletes = [] } = useAthletes();
  const child = athletes.find((a) => a.name === "Aldi Setiawan") ?? athletes[0];
  const month = new Date().toISOString().slice(0, 7);
  const { data: attendance = [] } = useAttendance(child?.id ?? "", month);

  if (isParent) {
    const total = attendance.length;
    const hadir = attendance.filter((a) => a.status === "present").length;
    const rate = total ? Math.round((hadir / total) * 100) : 0;
    return (
      <DashboardLayout title="Attendance" subtitle={`Riwayat kehadiran ${child?.name ?? "anak"}`}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat l="Total Sesi (bulan ini)" v={String(total)} />
          <Stat l="Hadir" v={`${hadir} (${rate}%)`} />
          <Stat l="Izin / Absen" v={String(total - hadir)} />
        </div>
        <Card className="mt-6 border-border/70">
          <CardContent className="p-6">
            <h2 className="font-display text-lg font-semibold">Riwayat Terbaru</h2>
            <div className="mt-4 space-y-2">
              {attendance.slice(0, 10).map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div><p className="text-sm font-medium">Sesi {r.session_date}</p></div>
                  <Badge variant="secondary" className={r.status === "present" ? "bg-primary-soft text-primary" : "bg-amber-100 text-amber-800"}>
                    {r.status === "present" ? "Hadir" : r.status}
                  </Badge>
                </div>
              ))}
              {attendance.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Belum ada data absensi bulan ini.</p>}
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  // Coach / Admin take attendance
  const roster = athletes.slice(0, 12);
  const [present, setPresent] = useState<Record<string, boolean>>(
    Object.fromEntries(roster.map((a) => [a.id, true]))
  );

  return (
    <DashboardLayout
      title="Take Attendance"
      subtitle="Sesi: Latihan U-12 A — Hari ini 16:00"
      actions={<Button onClick={() => toast.success("Absensi disimpan", { description: `${Object.values(present).filter(Boolean).length} hadir, ${roster.length - Object.values(present).filter(Boolean).length} absen` })}>Simpan</Button>}
    >
      <Card className="border-border/70">
        <CardContent className="p-3">
          {roster.map((a, i) => (
            <div key={a.id} className={`flex items-center gap-3 p-3 ${i !== roster.length - 1 ? "border-b border-border" : ""}`}>
              <Checkbox checked={present[a.id]} onCheckedChange={(v) => setPresent({ ...present, [a.id]: !!v })} />
              <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary-soft text-xs text-primary">{a.name.split(" ").map(p=>p[0]).join("").slice(0,2)}</AvatarFallback></Avatar>
              <div className="flex-1"><p className="text-sm font-medium">{a.name}</p><p className="text-xs text-muted-foreground">{a.team ?? "—"} · {a.position ?? "—"}</p></div>
              <Badge variant="secondary" className={present[a.id] ? "bg-primary-soft text-primary" : "bg-secondary text-muted-foreground"}>{present[a.id] ? "Hadir" : "Absen"}</Badge>
            </div>
          ))}
          {roster.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Belum ada atlet terdaftar.</p>}
        </CardContent>
      </Card>
      {role === "coach" && <p className="mt-4 text-xs text-muted-foreground">Tip: Coach role memiliki akses lengkap untuk input skor evaluasi.</p>}
    </DashboardLayout>
  );
}

function Stat({ l, v }: { l: string; v: string }) {
  return (
    <Card className="border-border/70"><CardContent className="p-6"><p className="text-xs text-muted-foreground">{l}</p><p className="mt-2 font-display text-2xl font-bold">{v}</p></CardContent></Card>
  );
}
