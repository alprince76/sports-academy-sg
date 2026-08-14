import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare } from "lucide-react";
import { useAthletes, useCoachFeedback } from "@/lib/queries";

export const Route = createFileRoute("/coach-feedback")({
  head: () => ({ meta: [{ title: "Coach Feedback — SportAcademy" }] }),
  component: CoachFeedbackPage,
});

function CoachFeedbackPage() {
  const { data: athletes = [] } = useAthletes();
  const child = athletes.find((a) => a.name === "Aldi Setiawan") ?? athletes[0];
  const { data: feedback = [], isLoading, isError } = useCoachFeedback(child?.id ?? "");

  const childName = child?.name ?? "—";

  return (
    <DashboardLayout title="Coach Feedback" subtitle={`Catatan & evaluasi pelatih untuk ${childName}`}>
      {isLoading && (
        <Card className="border-dashed"><CardContent className="p-12 text-center text-sm text-muted-foreground">Memuat feedback...</CardContent></Card>
      )}
      {isError && (
        <Card className="border-dashed"><CardContent className="p-12 text-center text-sm text-muted-foreground">
          Gagal memuat data dari backend. Pastikan backend :8081 jalan.
        </CardContent></Card>
      )}
      <div className="space-y-4">
        {feedback.map((f) => (
          <Card key={f.id} className="border-border/70 transition hover:shadow-elevated">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-start gap-4">
                <Avatar className="h-11 w-11"><AvatarFallback className="bg-primary text-primary-foreground">{(f.profiles?.full_name ?? "Coach").split(" ").map(p=>p[0]).join("").slice(0,2)}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{f.profiles?.full_name ?? "Coach"}</p>
                    <Badge variant="secondary" className="bg-primary-soft text-primary">{f.topic}</Badge>
                    <span className="ml-auto text-xs text-muted-foreground">{new Date(f.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed">{f.content}</p>
                  <div className="mt-4 flex items-center gap-2 text-xs">
                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Skor sesi:</span>
                    <span className="font-display text-base font-bold text-primary">{f.score}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {feedback.length === 0 && !isLoading && !isError && (
          <Card className="border-dashed"><CardContent className="p-12 text-center text-sm text-muted-foreground">
            Belum ada feedback untuk {childName}.
          </CardContent></Card>
        )}
      </div>
    </DashboardLayout>
  );
}
