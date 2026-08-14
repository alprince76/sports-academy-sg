import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Phone, Mail } from "lucide-react";
import { useCoaches } from "@/lib/queries";

export const Route = createFileRoute("/coaches")({
  head: () => ({ meta: [{ title: "Coaches — SportAcademy" }] }),
  component: CoachesPage,
});

function CoachesPage() {
  const { data: coaches = [], isLoading, isError } = useCoaches();

  return (
    <DashboardLayout
      title="Coaches"
      subtitle={`${coaches.length} pelatih terdaftar`}
      actions={<Button><Plus className="mr-1 h-4 w-4" /> Add Coach</Button>}
    >
      {isLoading && (
        <Card className="border-dashed"><CardContent className="p-12 text-center text-sm text-muted-foreground">Memuat data pelatih...</CardContent></Card>
      )}
      {isError && (
        <Card className="border-dashed"><CardContent className="p-12 text-center text-sm text-muted-foreground">
          Gagal memuat data dari backend. Pastikan backend :8081 jalan.
        </CardContent></Card>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {coaches.map((c) => (
          <Card key={c.id} className="border-border/70 transition hover:shadow-elevated">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12"><AvatarFallback className="bg-primary text-primary-foreground">{c.name.split(" ").map(p=>p[0]).join("").slice(0,2)}</AvatarFallback></Avatar>
                <div className="flex-1">
                  <p className="font-display font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.title}</p>
                </div>
                {c.specialization && <Badge variant="secondary" className="bg-primary-soft text-primary">{c.specialization}</Badge>}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-secondary/50 p-2"><p className="text-muted-foreground">Athletes</p><p className="font-semibold">{c.athletes_count}</p></div>
                <div className="rounded-lg bg-secondary/50 p-2"><p className="text-muted-foreground">Status</p><p className="font-semibold">Aktif</p></div>
              </div>
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-2"><Mail className="h-3 w-3" /> {c.name.toLowerCase().replace(" ", ".")}@ssbgaruda.id</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
