import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Users, Target as TargetIcon } from "lucide-react";
import { usePrograms } from "@/lib/queries";

export const Route = createFileRoute("/programs")({
  head: () => ({ meta: [{ title: "Training Programs — SportAcademy" }] }),
  component: ProgramsPage,
});

function ProgramsPage() {
  const { data: programs = [], isLoading, isError } = usePrograms();

  return (
    <DashboardLayout
      title="Training Programs"
      subtitle="Rencana pengembangan jangka panjang. Setiap program terdiri dari beberapa Session Builder."
      actions={<Button asChild><Link to="/programs/new"><Plus className="mr-1 h-4 w-4" />Buat Program</Link></Button>}
    >
      {isLoading && (
        <Card className="border-dashed"><CardContent className="p-12 text-center text-sm text-muted-foreground">Memuat program...</CardContent></Card>
      )}
      {isError && (
        <Card className="border-dashed"><CardContent className="p-12 text-center text-sm text-muted-foreground">
          Gagal memuat data dari backend. Pastikan backend :8081 jalan.
        </CardContent></Card>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {programs.map((p) => (
          <Card key={p.id} className="border-border/70">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <Badge variant="secondary" className="bg-primary-soft text-primary">{p.category ?? "Umum"}</Badge>
                <Badge variant="secondary" className={p.active ? "bg-primary-soft text-primary" : "bg-secondary text-muted-foreground"}>
                  {p.active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold leading-tight">{p.title}</h3>
              {p.description && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.description}</p>}

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-secondary/50 p-2">
                  <p className="flex items-center gap-1 text-muted-foreground"><Calendar className="h-3 w-3" />Sesi/minggu</p>
                  <p className="mt-0.5 font-display font-bold">{p.sessions_per_week}x</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-2">
                  <p className="flex items-center gap-1 text-muted-foreground"><Users className="h-3 w-3" />Status</p>
                  <p className="mt-0.5 font-display font-bold">{p.active ? "Berjalan" : "Nonaktif"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {programs.length === 0 && !isLoading && !isError && (
          <Card className="col-span-full border-dashed">
            <CardContent className="p-12 text-center text-sm text-muted-foreground">
              Belum ada program. Klik "Buat Program" untuk memulai.
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
