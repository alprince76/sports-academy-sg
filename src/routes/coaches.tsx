import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Phone, Mail } from "lucide-react";

export const Route = createFileRoute("/coaches")({
  head: () => ({ meta: [{ title: "Coaches — SportAcademy" }] }),
  component: CoachesPage,
});

const COACHES = [
  { name: "Coach Rangga", role: "Head Coach", teams: "U-10, U-12 A", athletes: 32, rating: 4.9, phone: "+62 812-1010-0001", email: "rangga@ssbgaruda.id" },
  { name: "Coach Bayu", role: "Technical Coach", teams: "U-12 A", athletes: 18, rating: 4.8, phone: "+62 812-1010-0002", email: "bayu@ssbgaruda.id" },
  { name: "Coach Andre", role: "Physical Coach", teams: "U-14 B", athletes: 16, rating: 4.7, phone: "+62 812-1010-0003", email: "andre@ssbgaruda.id" },
  { name: "Coach Dito", role: "Goalkeeper Coach", teams: "All GK", athletes: 6, rating: 4.9, phone: "+62 812-1010-0004", email: "dito@ssbgaruda.id" },
  { name: "Coach Maya", role: "Youth Development", teams: "U-10", athletes: 14, rating: 4.8, phone: "+62 812-1010-0005", email: "maya@ssbgaruda.id" },
  { name: "Coach Yoga", role: "Assistant Coach", teams: "U-14 A", athletes: 16, rating: 4.6, phone: "+62 812-1010-0006", email: "yoga@ssbgaruda.id" },
];

function CoachesPage() {
  return (
    <DashboardLayout
      title="Coaches"
      subtitle="Kelola tim pelatih akademi"
      actions={<Button><Plus className="mr-1 h-4 w-4" /> Add Coach</Button>}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {COACHES.map((c) => (
          <Card key={c.name} className="border-border/70 transition hover:shadow-elevated">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12"><AvatarFallback className="bg-primary text-primary-foreground">{c.name.split(" ").map(p=>p[0]).join("").slice(0,2)}</AvatarFallback></Avatar>
                <div className="flex-1">
                  <p className="font-display font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.role}</p>
                </div>
                <Badge variant="secondary" className="bg-primary-soft text-primary">★ {c.rating}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-secondary/50 p-2"><p className="text-muted-foreground">Teams</p><p className="font-semibold">{c.teams}</p></div>
                <div className="rounded-lg bg-secondary/50 p-2"><p className="text-muted-foreground">Athletes</p><p className="font-semibold">{c.athletes}</p></div>
              </div>
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-2"><Phone className="h-3 w-3" /> {c.phone}</p>
                <p className="flex items-center gap-2"><Mail className="h-3 w-3" /> {c.email}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
