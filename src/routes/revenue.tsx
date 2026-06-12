import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Download, Wallet, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/revenue")({
  head: () => ({ meta: [{ title: "Revenue — SportAcademy" }] }),
  component: RevenuePage,
});

const MONTHS = [
  { m: "Jan", v: 32 }, { m: "Feb", v: 35 }, { m: "Mar", v: 38 },
  { m: "Apr", v: 41 }, { m: "Mei", v: 44 }, { m: "Jun", v: 48.2 },
];

function RevenuePage() {
  const max = 60;
  return (
    <DashboardLayout
      title="Revenue Analytics"
      subtitle="Performa keuangan akademi 6 bulan terakhir"
      actions={<Button variant="outline" onClick={() => toast.success("Revenue report exported (demo)")}><Download className="mr-1 h-4 w-4" /> Export</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { l: "Total Revenue (MTD)", v: "Rp 48,2jt", c: "+18%", i: Wallet },
          { l: "Avg per Athlete", v: "Rp 377rb", c: "+5%", i: TrendingUp },
          { l: "Active Members", v: "112", c: "+12", i: Users },
          { l: "Outstanding", v: "Rp 3,4jt", c: "-12%", i: Wallet },
        ].map((s) => (
          <Card key={s.l} className="border-border/70">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary"><s.i className="h-5 w-5" /></div>
                <Badge variant="secondary" className="gap-1 bg-primary-soft text-primary"><ArrowUpRight className="h-3 w-3" />{s.c}</Badge>
              </div>
              <p className="mt-5 text-xs text-muted-foreground">{s.l}</p>
              <p className="font-display text-2xl font-bold">{s.v}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 border-border/70">
        <CardContent className="p-6">
          <h2 className="font-display text-lg font-semibold">Revenue Trend (Rp jt)</h2>
          <div className="mt-6 flex h-48 items-end justify-between gap-3">
            {MONTHS.map((d) => (
              <div key={d.m} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-semibold text-primary">{d.v}</span>
                <div className="w-full rounded-t-md bg-gradient-to-t from-primary to-emerald-400" style={{ height: `${(d.v / max) * 100}%` }} />
                <span className="text-xs text-muted-foreground">{d.m}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card className="border-border/70">
          <CardContent className="p-6">
            <h2 className="font-display text-lg font-semibold">Revenue by Program</h2>
            <div className="mt-4 space-y-3">
              {[
                { l: "Membership Bulanan", v: 32.5, pct: 67 },
                { l: "Private Coaching", v: 8.4, pct: 17 },
                { l: "Merchandise", v: 4.3, pct: 9 },
                { l: "Tournament Fee", v: 3.0, pct: 7 },
              ].map((r) => (
                <div key={r.l}>
                  <div className="mb-1 flex justify-between text-sm"><span>{r.l}</span><span className="font-semibold">Rp {r.v}jt</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${r.pct}%` }} /></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardContent className="p-6">
            <h2 className="font-display text-lg font-semibold">Recent Transactions</h2>
            <div className="mt-4 space-y-2">
              {[
                { n: "Rafi Pratama", t: "Membership Juni", a: "Rp 450rb" },
                { n: "Aldi Setiawan", t: "Private Coaching", a: "Rp 750rb" },
                { n: "Dimas Saputra", t: "Membership Juni", a: "Rp 450rb" },
                { n: "Reza Maulana", t: "Tournament Reg", a: "Rp 300rb" },
              ].map((tx, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div><p className="text-sm font-medium">{tx.n}</p><p className="text-xs text-muted-foreground">{tx.t}</p></div>
                  <span className="font-display font-bold text-primary">{tx.a}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
