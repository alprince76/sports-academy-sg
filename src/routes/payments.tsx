import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, CreditCard, TrendingUp, Plus } from "lucide-react";
import { toast } from "sonner";
import { PAYMENTS, PAYMENT_PLANS, PARENT_CHILD_NAME, type Payment } from "@/lib/ops-data";
import { ATHLETES, TEAMS } from "@/lib/demo-data";
import { useRole } from "@/lib/role";

export const Route = createFileRoute("/payments")({
  head: () => ({ meta: [{ title: "Payments — SportAcademy" }] }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const role = useRole();
  const isParent = role === "parent";
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState<Payment | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    athlete: ATHLETES[0].name,
    team: ATHLETES[0].team,
    plan: "Bulanan",
    amount: "450000",
    due: "",
  });

  const source = isParent
    ? PAYMENTS.filter((p) => p.athlete === PARENT_CHILD_NAME)
    : PAYMENTS;
  const filtered = source.filter((p) => filter === "all" || p.status === filter);

  const submitInvoice = () => {
    if (!form.amount.trim()) {
      toast.error("Nominal wajib diisi");
      return;
    }
    toast.success("Invoice dibuat", {
      description: `${form.athlete} · ${form.plan} · Rp ${Number(form.amount).toLocaleString("id-ID")}`,
    });
    setCreateOpen(false);
  };

  return (
    <DashboardLayout
      title="Pembayaran & Membership"
      subtitle={isParent ? `Tagihan membership ${PARENT_CHILD_NAME}` : "Kelola tagihan dan keanggotaan akademi basket"}
      actions={
        <div className="flex flex-wrap gap-2">
          {!isParent && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />Tambah Invoice
            </Button>
          )}
          <Button variant="outline" onClick={() => toast.success("Export CSV dimulai (demo)")}>
            <Download className="mr-1 h-4 w-4" />Export
          </Button>
        </div>
      }
    >
      {!isParent && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Revenue Bulan Ini" value="Rp 48.2jt" change="+18%" />
          <StatCard label="Membership Aktif" value="112" change="+8" />
          <StatCard label="Pembayaran Tertunda" value="9" change="-2" />
          <StatCard label="Overdue" value="3" change="-1" tone="warn" />
        </div>
      )}

      <div className={`grid gap-6 lg:grid-cols-3 ${isParent ? "" : "mt-6"}`}>
        <Card className="border-border/70 lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-semibold">Transaksi Terbaru</h2>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua status</SelectItem>
                  <SelectItem value="Lunas">Lunas</SelectItem>
                  <SelectItem value="Tertunda">Tertunda</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-5 overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Invoice</th>
                    <th className="px-4 py-3 text-left font-medium">Atlet</th>
                    <th className="px-4 py-3 text-left font-medium">Jumlah</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                      <td className="px-4 py-3 font-mono text-xs">{p.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-primary-soft text-[10px] text-primary">
                              {p.athlete.split(" ").map((x) => x[0]).join("").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{p.athlete}</p>
                            <p className="text-xs text-muted-foreground">{p.team} · {p.plan}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold">{p.amount}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="secondary"
                          className={
                            p.status === "Lunas"
                              ? "bg-primary-soft text-primary"
                              : p.status === "Tertunda"
                                ? "bg-warning/15 text-warning"
                                : "bg-destructive/15 text-destructive"
                          }
                        >
                          {p.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => setOpen(p)}>Detail</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {!isParent && (
          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="font-display text-lg font-semibold">Revenue Trend</h2>
              <p className="mt-1 text-xs text-muted-foreground">6 bulan terakhir</p>
              <div className="mt-6 flex h-40 items-end gap-2">
                {[28, 32, 38, 42, 40, 48].map((v, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <div className="w-full rounded-t-md bg-gradient-to-t from-primary to-emerald-400" style={{ height: `${v * 1.6}%` }} />
                    <span className="text-xs text-muted-foreground">{["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"][i]}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl bg-primary-soft/60 p-4">
                <p className="text-xs text-muted-foreground">Pertumbuhan</p>
                <p className="font-display text-2xl font-bold text-primary">+71%</p>
                <p className="text-xs text-muted-foreground">vs Januari 2026</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent>
          {open && (
            <>
              <DialogHeader><DialogTitle>Invoice {open.id}</DialogTitle></DialogHeader>
              <div className="space-y-3 rounded-xl border border-border p-4 text-sm">
                <Row label="Atlet" value={open.athlete} />
                <Row label="Tim" value={open.team} />
                <Row label="Plan" value={open.plan} />
                <Row label="Tanggal" value={open.date} />
                <Row label="Status" value={open.status} />
                <div className="border-t border-border pt-3">
                  <Row label="Total" value={open.amount} bold />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(null)}>Tutup</Button>
                {!isParent && (
                  <Button onClick={() => { toast.success("Tagihan diteruskan ke orang tua"); setOpen(null); }}>
                    Kirim Reminder
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tambah Invoice</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label>Atlet</Label>
              <Select
                value={form.athlete}
                onValueChange={(v) => {
                  const a = ATHLETES.find((x) => x.name === v);
                  setForm({ ...form, athlete: v, team: a?.team ?? form.team });
                }}
              >
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
                <Label>Tim</Label>
                <Select value={form.team} onValueChange={(v) => setForm({ ...form, team: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TEAMS.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Plan</Label>
                <Select value={form.plan} onValueChange={(v) => setForm({ ...form, plan: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_PLANS.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Nominal (Rp)</Label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Jatuh tempo</Label>
                <Input type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Batal</Button>
            <Button onClick={submitInvoice}>Buat Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-display text-lg font-bold" : "font-medium"}>{value}</span>
    </div>
  );
}

function StatCard({ label, value, change, tone }: { label: string; value: string; change: string; tone?: "warn" }) {
  return (
    <Card className="border-border/70">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone === "warn" ? "bg-destructive/10 text-destructive" : "bg-primary-soft text-primary"}`}>
            {tone === "warn" ? <CreditCard className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
          </div>
          <Badge variant="secondary" className="bg-primary-soft text-primary">{change}</Badge>
        </div>
        <p className="mt-5 text-xs text-muted-foreground">{label}</p>
        <p className="font-display text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
