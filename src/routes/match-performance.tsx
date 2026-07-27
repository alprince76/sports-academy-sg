import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MATCH_STATS, calcPIR } from "@/lib/assessment-data";
import { ATHLETES } from "@/lib/demo-data";
import { Plus, Trophy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/match-performance")({
  head: () => ({ meta: [{ title: "Match Performance (PIR) — SportAcademy" }] }),
  component: MatchPerformancePage,
});

function MatchPerformancePage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    athlete: ATHLETES[0].name,
    opponent: "",
    date: "",
    min: "24",
    pts: "0",
    reb: "0",
    ast: "0",
    stl: "0",
    blk: "0",
    to: "0",
    pm: "0",
  });

  const submit = () => {
    if (!form.opponent.trim()) {
      toast.error("Nama lawan wajib diisi");
      return;
    }
    toast.success("Match stats ditambahkan", {
      description: `${form.athlete} vs ${form.opponent} · ${form.pts} PTS`,
    });
    setOpen(false);
    setForm({
      athlete: ATHLETES[0].name,
      opponent: "",
      date: "",
      min: "24",
      pts: "0",
      reb: "0",
      ast: "0",
      stl: "0",
      blk: "0",
      to: "0",
      pm: "0",
    });
  };

  return (
    <DashboardLayout
      title="Match Performance (PIR)"
      subtitle="Statistik pertandingan resmi + Performance Index Rating (FIBA)."
      actions={
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />Add Match Stats
        </Button>
      }
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
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              KU-12 ke atas · terpisah dari Session Evaluation
            </Badge>
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
                    <TableCell className={s.pm >= 0 ? "text-primary" : "text-destructive"}>
                      {s.pm > 0 ? `+${s.pm}` : s.pm}
                    </TableCell>
                    <TableCell className="text-right font-display font-bold text-primary">{calcPIR(s)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Match Stats</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label>Atlet</Label>
              <Select value={form.athlete} onValueChange={(v) => setForm({ ...form, athlete: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ATHLETES.map((a) => (
                    <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Opponent *</Label>
                <Input
                  placeholder="Pelita Hoops"
                  value={form.opponent}
                  onChange={(e) => setForm({ ...form, opponent: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  ["min", "MIN"],
                  ["pts", "PTS"],
                  ["reb", "REB"],
                  ["ast", "AST"],
                  ["stl", "STL"],
                  ["blk", "BLK"],
                  ["to", "TO"],
                  ["pm", "+/−"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="grid gap-1">
                  <Label className="text-xs">{label}</Label>
                  <Input
                    type="number"
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={submit}>Simpan Stats</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
