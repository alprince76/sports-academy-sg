import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy } from "lucide-react";
import { useAthletes, useMatchStats } from "@/lib/queries";

export const Route = createFileRoute("/match-performance")({
  head: () => ({ meta: [{ title: "Match Performance (PIR) — SportAcademy" }] }),
  component: MatchPerformancePage,
});

function MatchPerformancePage() {
  const { data: athletes = [] } = useAthletes();
  // Tampilkan stats untuk atlet pertama yang punya data (atau semua atlet — backend per-athlete)
  const athlete = athletes.find((a) => a.name === "Aldi Setiawan") ?? athletes[0];
  const { data: stats = [], isLoading, isError } = useMatchStats(athlete?.id ?? "");

  return (
    <DashboardLayout
      title="Match Performance (PIR)"
      subtitle={`Statistik pertandingan resmi + Performance Index Rating (FIBA) — ${athlete?.name ?? "—"}`}
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
            <Badge variant="secondary" className="bg-accent text-accent-foreground">PIR dihitung di backend</Badge>
          </div>

          {isLoading && (
            <p className="mt-6 text-center text-sm text-muted-foreground">Memuat statistik...</p>
          )}
          {isError && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Gagal memuat data dari backend. Pastikan backend :8081 jalan.
            </p>
          )}

          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Opponent</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>MIN</TableHead>
                  <TableHead>PTS</TableHead>
                  <TableHead>REB</TableHead>
                  <TableHead>AST</TableHead>
                  <TableHead>STL</TableHead>
                  <TableHead>BLK</TableHead>
                  <TableHead>TO</TableHead>
                  <TableHead>FG</TableHead>
                  <TableHead className="text-right">PIR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.opponent ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{s.match_date}</TableCell>
                    <TableCell>{s.min}</TableCell>
                    <TableCell>{s.pts}</TableCell>
                    <TableCell>{s.reb}</TableCell>
                    <TableCell>{s.ast}</TableCell>
                    <TableCell>{s.stl}</TableCell>
                    <TableCell>{s.blk}</TableCell>
                    <TableCell>{s.to}</TableCell>
                    <TableCell className="text-muted-foreground">{s.fgm}/{s.fga}</TableCell>
                    <TableCell className="text-right font-display font-bold text-primary">{s.pir}</TableCell>
                  </TableRow>
                ))}
                {stats.length === 0 && !isLoading && !isError && (
                  <TableRow>
                    <TableCell colSpan={11} className="py-10 text-center text-sm text-muted-foreground">
                      Belum ada data pertandingan untuk {athlete?.name ?? "atlet"}.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
