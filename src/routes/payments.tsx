import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, CreditCard, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useInvoices } from "@/lib/queries";

export const Route = createFileRoute("/payments")({
  head: () => ({ meta: [{ title: "Payments — SportAcademy" }] }),
  component: PaymentsPage,
});

const STATUS_STYLE: Record<string, string> = {
  Lunas: "bg-primary-soft text-primary",
  Tertunda: "bg-amber-100 text-amber-800",
  Overdue: "bg-rose-100 text-rose-700",
};

const formatRupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");

function PaymentsPage() {
  const [filter, setFilter] = useState("all");
  const { data: invoices = [], isLoading, isError } = useInvoices();
  const filtered = invoices.filter((p) => filter === "all" || p.status === filter);
  const total = invoices.reduce((s, i) => s + Number(i.amount), 0);
  const lunas = invoices.filter((i) => i.status === "Lunas").length;

  return (
    <DashboardLayout
      title="Pembayaran & Membership"
      subtitle="Kelola tagihan dan keanggotaan akademi"
      actions={<Button variant="outline" onClick={() => toast.success("Revenue report exported (demo)")}><Download className="mr-1 h-4 w-4" />Export</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/70"><CardContent className="p-6">
          <p className="text-xs text-muted-foreground">Total Tagihan</p>
          <p className="mt-1 font-display text-2xl font-bold">{formatRupiah(total)}</p>
        </CardContent></Card>
        <Card className="border-border/70"><CardContent className="p-6">
          <p className="text-xs text-muted-foreground">Lunas</p>
          <p className="mt-1 font-display text-2xl font-bold">{lunas}/{invoices.length}</p>
        </CardContent></Card>
        <Card className="border-border/70"><CardContent className="p-6">
          <p className="text-xs text-muted-foreground">Outstanding</p>
          <p className="mt-1 font-display text-2xl font-bold">{invoices.length - lunas}</p>
        </CardContent></Card>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="Lunas">Lunas</SelectItem>
            <SelectItem value="Tertunda">Tertunda</SelectItem>
            <SelectItem value="Overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="secondary">{filtered.length} invoice</Badge>
      </div>

      {isLoading && (
        <Card className="mt-6 border-dashed"><CardContent className="p-12 text-center text-sm text-muted-foreground">Memuat invoice...</CardContent></Card>
      )}
      {isError && (
        <Card className="mt-6 border-dashed"><CardContent className="p-12 text-center text-sm text-muted-foreground">
          Gagal memuat data dari backend. Pastikan backend :8081 jalan.
        </CardContent></Card>
      )}

      <Card className="mt-6 border-border/70">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Invoice</th>
                  <th className="px-5 py-3 font-medium">Atlet</th>
                  <th className="px-5 py-3 font-medium">Plan</th>
                  <th className="px-5 py-3 font-medium">Jumlah</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 last:border-0">
                    <td className="px-5 py-3.5 font-mono text-xs">{p.invoice_no}</td>
                    <td className="px-5 py-3.5 font-medium">{p.athletes?.name ?? "—"}</td>
                    <td className="px-5 py-3.5">{p.plan}</td>
                    <td className="px-5 py-3.5 font-medium">{formatRupiah(Number(p.amount))}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant="secondary" className={STATUS_STYLE[p.status]}>{p.status}</Badge>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && !isLoading && !isError && (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">Tidak ada invoice.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
