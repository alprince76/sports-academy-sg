import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { AddCoachDialog } from "@/components/site/AddCoachDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Plus, Trophy } from "lucide-react";
import { toast } from "sonner";
import { COACHES } from "@/lib/ops-data";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — SportAcademy" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [addCoachOpen, setAddCoachOpen] = useState(false);
  const save = () => toast.success("Pengaturan tersimpan");

  return (
    <DashboardLayout title="Settings" subtitle="Kelola profil akademi basket, pelatih, dan preferensi sistem">
      <Tabs defaultValue="academy">
        <TabsList>
          <TabsTrigger value="academy">Akademi</TabsTrigger>
          <TabsTrigger value="coaches">Pelatih</TabsTrigger>
          <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="academy" className="mt-4">
          <Card className="border-border/70">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <Trophy className="h-8 w-8" />
                </div>
                <div>
                  <Button variant="outline" onClick={() => toast.success("Upload logo (demo)")}>
                    <Upload className="mr-1 h-4 w-4" />Upload Logo
                  </Button>
                  <p className="mt-1 text-xs text-muted-foreground">PNG/SVG, maks 2MB</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nama Akademi" defaultValue="Garuda Elite Academy" />
                <Field label="Email Kontak" defaultValue="admin@garudaelite.id" />
                <Field label="Telepon" defaultValue="+62 21-1234-5678" />
                <Field label="Kota" defaultValue="Jakarta" />
              </div>
              <div className="grid gap-2">
                <Label>Deskripsi</Label>
                <Textarea defaultValue="Akademi basket untuk anak usia 8–18 tahun dengan pendekatan skill development modern, assessment periodik, dan transparansi untuk orang tua." />
              </div>
              <SaveBar onSave={save} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coaches" className="mt-4">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">Tim Pelatih</h2>
                <Button onClick={() => setAddCoachOpen(true)}>
                  <Plus className="mr-1 h-4 w-4" />Tambah Pelatih
                </Button>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {COACHES.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 rounded-xl border border-border p-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary-soft text-primary">
                        {c.name.split(" ").map((x) => x[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.role} · {c.phone}</p>
                    </div>
                    <Badge variant="secondary" className="bg-primary-soft text-primary">Aktif</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card className="border-border/70">
            <CardContent className="space-y-1 p-6">
              <ToggleRow label="Email reminder jadwal latihan" desc="Kirim email H-1 ke orang tua" defaultChecked />
              <ToggleRow label="WhatsApp pengumuman" desc="Broadcast info pertandingan & libur" defaultChecked />
              <ToggleRow label="Notifikasi pembayaran" desc="Kirim invoice otomatis di awal bulan" defaultChecked />
              <ToggleRow label="Laporan progres mingguan" desc="Rangkuman performa anak tiap Senin" />
              <ToggleRow label="Push notification mobile" desc="Notifikasi langsung ke aplikasi parent" defaultChecked />
              <div className="pt-2"><SaveBar onSave={save} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-4">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-gradient-to-br from-primary-soft to-card p-5">
                <div>
                  <Badge variant="secondary" className="bg-primary text-primary-foreground">Pro Plan</Badge>
                  <p className="mt-2 font-display text-2xl font-bold">Rp 499.000 / bulan</p>
                  <p className="text-xs text-muted-foreground">Renew otomatis 1 Juli 2026</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => toast.success("Pilih plan (demo)")}>Ubah Plan</Button>
                  <Button onClick={() => toast.success("Metode pembayaran diperbarui")}>Update Pembayaran</Button>
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Field label="Nama di kartu" defaultValue="Bayu Aditya" />
                <Field label="Nomor kartu" defaultValue="•••• •••• •••• 4242" />
                <Field label="Expiry" defaultValue="12/28" />
                <Field label="CVC" defaultValue="•••" />
              </div>
              <SaveBar onSave={save} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <AddCoachDialog open={addCoachOpen} onOpenChange={setAddCoachOpen} />
    </DashboardLayout>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue?: string }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Input defaultValue={defaultValue} />
    </div>
  );
}

function ToggleRow({ label, desc, defaultChecked }: { label: string; desc: string; defaultChecked?: boolean }) {
  const [v, setV] = useState(!!defaultChecked);
  return (
    <div className="flex items-center justify-between border-b border-border py-4 last:border-0">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={v} onCheckedChange={setV} />
    </div>
  );
}

function SaveBar({ onSave }: { onSave: () => void }) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <Button variant="outline">Batal</Button>
      <Button onClick={onSave}>Simpan Perubahan</Button>
    </div>
  );
}
