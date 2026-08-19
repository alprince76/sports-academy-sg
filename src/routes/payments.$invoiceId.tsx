import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, CreditCard, Loader2, Trash2 } from "lucide-react";
import { useInvoiceDetail, useUpdateInvoice, useDeleteInvoice } from "@/lib/queries";
import { confirmAction, notifySuccess, notifyError } from "@/lib/confirm";

export const Route = createFileRoute("/payments/$invoiceId")({
  head: () => ({ meta: [{ title: "Detail Invoice — SportAcademy" }] }),
  component: InvoiceDetailPage,
  notFoundComponent: () => (
    <DashboardLayout title="Invoice tidak ditemukan">
      <Button asChild><Link to="/payments">Kembali</Link></Button>
    </DashboardLayout>
  ),
});

const STATUS_STYLE: Record<string, string> = {
  Lunas: "bg-primary-soft text-primary",
  Tertunda: "bg-amber-100 text-amber-800",
  Overdue: "bg-rose-100 text-rose-700",
};

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

function InvoiceDetailPage() {
  const { invoiceId } = Route.useParams();
  const { data: inv, isLoading } = useInvoiceDetail(invoiceId);
  const [status, setStatus] = useState<string | null>(null);
  const [delOpen, setDelOpen] = useState(false);
  const update = useUpdateInvoice();
  const remove = useDeleteInvoice();
  const navigate = Route.useNavigate();

  if (isLoading) {
    return (
      <DashboardLayout title="Memuat...">
        <Card><CardContent className="p-12 text-center text-sm text-muted-foreground">Memuat invoice...</CardContent></Card>
      </DashboardLayout>
    );
  }
  if (!inv) throw notFound();

  const changeStatus = async (s: string) => {
    const ok = await confirmAction({ title: "Simpan perubahan?", text: `Ubah status invoice menjadi ${s}?`, danger: false });
    if (!ok) return;
    setStatus(s);
    update.mutate({ id: inv.id, status: s as any }, {
      onSuccess: () => { notifySuccess({ title: "Tersimpan", text: `Status → ${s}` }); setStatus(null); },
      onError: (e: any) => notifyError({ title: "Gagal menyimpan", text: e?.message }),
    });
  };

  const confirmDelete = async () => {
    const ok = await confirmAction({ title: "Hapus invoice?", text: "Data dihapus permanen.", confirmText: "Ya, Hapus", danger: true });
    if (!ok) return;
    remove.mutate(inv.id, {
      onSuccess: () => { notifySuccess({ title: "Terhapus", text: "Invoice dihapus" }); navigate({ to: "/payments" }); },
      onError: (e: any) => notifyError({ title: "Gagal menghapus", text: e?.message }),
    });
  };

  return (
    <DashboardLayout
      title={inv.invoice_no}
      subtitle={`${inv.athletes?.name ?? "Atlet"} · ${inv.plan} · ${formatRupiah(Number(inv.amount))}`}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setDelOpen(true)}>
            <Trash2 className="mr-1 h-4 w-4" /> Hapus
          </Button>
          <Button asChild variant="outline"><Link to="/payments"><ArrowLeft className="mr-1 h-4 w-4" /> Kembali</Link></Button>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/70 lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">Informasi Tagihan</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <InfoRow label="Invoice" value={inv.invoice_no} />
              <InfoRow label="Atlet" value={inv.athletes?.name ?? "—"} />
              <InfoRow label="Team" value={inv.athletes?.team ?? "—"} />
              <InfoRow label="Plan" value={inv.plan} />
              <InfoRow label="Jumlah" value={formatRupiah(Number(inv.amount))} bold />
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="secondary" className={STATUS_STYLE[inv.status]}>{inv.status}</Badge>
              </div>
              {inv.due_date && <InfoRow label="Jatuh Tempo" value={inv.due_date} />}
              {inv.paid_at && <InfoRow label="Dibayar" value={inv.paid_at.slice(0, 10)} />}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="font-display text-lg font-semibold">Ubah Status Pembayaran</h2>
            <p className="mt-1 text-xs text-muted-foreground">Perbarui status tagihan untuk atlet ini.</p>
            <div className="mt-4 max-w-xs">
              <Select value={status ?? inv.status} onValueChange={changeStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lunas">Lunas</SelectItem>
                  <SelectItem value="Tertunda">Tertunda</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {update.isPending && <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Menyimpan...</p>}

            <div className="mt-8 rounded-xl bg-secondary/40 p-5">
              <p className="text-[10px] uppercase text-muted-foreground">Ringkasan</p>
              <div className="mt-2 grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="font-display text-xl font-bold text-primary">{formatRupiah(Number(inv.amount))}</p>
                  <p className="text-[10px] text-muted-foreground">Total Tagihan</p>
                </div>
                <div>
                  <p className="font-display text-xl font-bold">{inv.plan}</p>
                  <p className="text-[10px] text-muted-foreground">Paket</p>
                </div>
                <div>
                  <p className="font-display text-xl font-bold">{inv.athletes?.team ?? "—"}</p>
                  <p className="text-[10px] text-muted-foreground">Tim</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={delOpen} onOpenChange={setDelOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Hapus Invoice</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Yakin ingin menghapus invoice <span className="font-semibold text-foreground">{inv.invoice_no}</span>?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDelOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={remove.isPending}>
              {remove.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              <Trash2 className="mr-1 h-4 w-4" /> Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function InfoRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-display font-bold text-primary" : "font-medium"}>{value}</span>
    </div>
  );
}
