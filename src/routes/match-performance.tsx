import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MATCH_STATS, calcPIR } from "@/lib/assessment-data";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/match-performance")({
  head: () => ({ meta: [{ title: "Match Performance (PIR) — SportAcademy" }] }),
  component: MatchPerformancePage,
});

function MatchPerformancePage() {
  return (
    <DashboardLayout
      title="Match Performance (PIR)"
      subtitle="Statistik pertandingan resmi + Performance Index Rating (FIBA)."
    >
      <Card className="border-border/70">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <div>
                <h2 className="font-display text-lg font-semibold">Match Statistics</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  PIR = PTS + REB + AST + STL + BLK + Fouls Drawn − Missed FG − Missed FT − TO − Fouls
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-accent text-accent-foreground">KU-12 ke atas · terpisah dari Session Evaluation</Badge>
          </div>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Atlet</TableHead>
                  <TableHead>Opponent</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>MIN</TableHead>
                  <TableHead>PTS</TableHead>
                  <TableHead>REB</TableHead>
                  <TableHead>AST</TableHead>
                  <TableHead>STL</TableHead>
                  <TableHead>BLK</TableHead>
                  <TableHead>TO</TableHead>
                  <TableHead>+/−</TableHead>
                  <TableHead className="text-right">PIR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MATCH_STATS.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.athleteName}</TableCell>
                    <TableCell className="text-muted-foreground">{s.opponent}</TableCell>
                    <TableCell className="text-muted-foreground">{s.date}</TableCell>
                    <TableCell>{s.min}</TableCell>
                    <TableCell>{s.pts}</TableCell>
                    <TableCell>{s.reb}</TableCell>
                    <TableCell>{s.ast}</TableCell>
                    <TableCell>{s.stl}</TableCell>
                    <TableCell>{s.blk}</TableCell>
                    <TableCell>{s.to}</TableCell>
                    <TableCell className={s.pm >= 0 ? "text-primary" : "text-destructive"}>{s.pm > 0 ? `+${s.pm}` : s.pm}</TableCell>
                    <TableCell className="text-right font-display font-bold text-primary">{calcPIR(s)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
