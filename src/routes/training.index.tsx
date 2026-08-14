import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Clock, Users } from "lucide-react";
import { useSessions, type Session } from "@/lib/queries";

export const Route = createFileRoute("/training/")({
  head: () => ({ meta: [{ title: "Training — SportAcademy" }] }),
  component: TrainingPage,
});

/** Kompatibilitas: halaman detail sesi membaca dari sini (client-side). */
export function useSessionList() {
  return useSessions();
}
export type SessionListItem = Session;

function TrainingPage() {
  const { data: sessions = [], isLoading, isError } = useSessions();

  return (
    <DashboardLayout
      title="Training Sessions"
      subtitle="Kelola sesi latihan, evaluasi, dan absensi"
      actions={<Button><Plus className="mr-1 h-4 w-4" /> Buat Sesi</Button>}
    >
      {isLoading && (
        <Card className="border-dashed"><CardContent className="p-12 text-center text-sm text-muted-foreground">Memuat sesi...</CardContent></Card>
      )}
      {isError && (
        <Card className="border-dashed"><CardContent className="p-12 text-center text-sm text-muted-foreground">
          Gagal memuat data dari backend. Pastikan backend :8081 jalan.
        </CardContent></Card>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sessions.map((s) => (
          <Link key={s.id} to="/training/$sessionId" params={{ sessionId: s.id }}>
            <Card className="group h-full border-border/70 transition-all hover:-translate-y-0.5 hover:shadow-elevated">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <Badge variant="secondary" className="bg-primary-soft text-primary">{s.programs?.title ?? "Umum"}</Badge>
                  <span className="text-xs font-medium text-muted-foreground">{s.session_date}</span>
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold leading-tight">{s.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{s.focus ?? "—"}</p>
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {s.session_date}</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {s.blocks?.length ?? 0} blok drill</span>
                </div>
                <Button variant="secondary" size="sm" className="mt-4 w-full">Mulai Evaluasi</Button>
              </CardContent>
            </Card>
          </Link>
        ))}
        {sessions.length === 0 && !isLoading && !isError && (
          <Card className="col-span-full border-dashed">
            <CardContent className="p-12 text-center text-sm text-muted-foreground">
              Belum ada sesi latihan. Buat lewat Session Builder.
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
