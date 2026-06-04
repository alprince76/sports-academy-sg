import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Clock, Users } from "lucide-react";

export const Route = createFileRoute("/training/")({
  head: () => ({ meta: [{ title: "Training — SportAcademy" }] }),
  component: TrainingPage,
});

export const SESSIONS = [
  { id: "1", title: "Latihan Teknik Dasar U-12 A", coach: "Coach Bayu", team: "U-12 A", date: "Hari ini", time: "16:00 - 18:00", attendees: 18, category: "Technical" },
  { id: "2", title: "Sesi Kondisi Fisik U-14 B", coach: "Coach Andre", team: "U-14 B", date: "Hari ini", time: "17:30 - 19:00", attendees: 16, category: "Physical" },
  { id: "3", title: "Friendly Match vs SSB Pelita", coach: "All Teams", team: "U-12 / U-14", date: "Besok", time: "09:00 - 11:00", attendees: 32, category: "Match" },
  { id: "4", title: "Game Situational U-10", coach: "Coach Rangga", team: "U-10", date: "Rabu", time: "16:00 - 17:30", attendees: 14, category: "Tactical" },
  { id: "5", title: "Goalkeeper Specific Training", coach: "Coach Dito", team: "All GK", date: "Kamis", time: "15:30 - 17:00", attendees: 6, category: "Specialist" },
];

function TrainingPage() {
  return (
    <DashboardLayout
      title="Training Sessions"
      subtitle="Kelola sesi latihan, evaluasi, dan absensi"
      actions={<Button><Plus className="mr-1 h-4 w-4" /> Buat Sesi</Button>}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SESSIONS.map((s) => (
          <Link key={s.id} to="/training/$sessionId" params={{ sessionId: s.id }}>
            <Card className="group h-full border-border/70 transition-all hover:-translate-y-0.5 hover:shadow-elevated">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <Badge variant="secondary" className="bg-primary-soft text-primary">{s.category}</Badge>
                  <span className="text-xs font-medium text-muted-foreground">{s.date}</span>
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold leading-tight">{s.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{s.coach} · {s.team}</p>
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {s.time}</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {s.attendees} atlet</span>
                </div>
                <Button variant="secondary" size="sm" className="mt-4 w-full">Mulai Evaluasi</Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}
