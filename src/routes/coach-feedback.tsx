import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare } from "lucide-react";
import { PARENT_FEEDBACK, PARENT_CHILD_NAME } from "@/lib/ops-data";

export const Route = createFileRoute("/coach-feedback")({
  head: () => ({ meta: [{ title: "Coach Feedback — SportAcademy" }] }),
  component: CoachFeedbackPage,
});

function CoachFeedbackPage() {
  return (
    <DashboardLayout title="Coach Feedback" subtitle={`Catatan & evaluasi pelatih basket untuk ${PARENT_CHILD_NAME}`}>
      <div className="space-y-4">
        {PARENT_FEEDBACK.map((f, i) => (
          <Card key={i} className="border-border/70 transition hover:shadow-elevated">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-start gap-4">
                <Avatar className="h-11 w-11">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {f.c.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{f.c}</p>
                    <Badge variant="secondary" className="bg-primary-soft text-primary">{f.topic}</Badge>
                    <span className="ml-auto text-xs text-muted-foreground">{f.d}</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed">{f.n}</p>
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
      </div>
    </DashboardLayout>
  );
}
