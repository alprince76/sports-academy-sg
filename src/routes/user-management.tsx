import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { UserCog, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { confirmAction, notifySuccess, notifyError } from "@/lib/confirm";
import { useAdminUsers, useAssignUserRole, useCreateAdminUser, useDeleteAdminUser } from "@/lib/queries";

export const Route = createFileRoute("/user-management")({
  head: () => ({ meta: [{ title: "User Management — SportAcademy" }] }),
  component: UserManagementPage,
});

const ROLE_LABELS: Record<string, string> = {
  superadmin: "Super Admin",
  owner: "Academy Owner",
  admin: "Admin",
  coach: "Coach",
  parent: "Parent",
};

const ROLE_COLOR: Record<string, string> = {
  superadmin: "bg-rose-100 text-rose-700",
  owner: "bg-amber-100 text-amber-800",
  admin: "bg-blue-100 text-blue-800",
  coach: "bg-emerald-100 text-emerald-700",
  parent: "bg-purple-100 text-purple-700",
};

function UserManagementPage() {
  const { data: users = [], isLoading, isError } = useAdminUsers();
  const assign = useAssignUserRole();
  const remove = useDeleteAdminUser();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <DashboardLayout
      title="User Management"
      subtitle="Kelola user & assign role akses"
      actions={<Button onClick={() => setAddOpen(true)}><Plus className="mr-1 h-4 w-4" />Tambah User</Button>}
    >
      {isLoading && (
        <Card className="border-dashed"><CardContent className="p-12 text-center text-sm text-muted-foreground">Memuat user...</CardContent></Card>
      )}
      {isError && (
        <Card className="border-dashed"><CardContent className="p-12 text-center text-sm text-muted-foreground">
          Gagal memuat data. Pastikan backend :8081 jalan dan akun punya akses superadmin.
        </CardContent></Card>
      )}

      <Card className="border-border/70">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Bergabung</th>
                  <th className="px-5 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 last:border-0">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary-soft text-xs text-primary">
                            {u.full_name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{u.full_name}</p>
                          <p className="font-mono text-[11px] text-muted-foreground">{u.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <RoleSelect
                        value={u.role}
                        onChange={async (role) => {
                          const confirmed = await confirmAction({ title: "Ganti role?", text: `Ubah role ${u.full_name} menjadi ${ROLE_LABELS[role] ?? role}?`, confirmText: "Ya, Ganti", danger: false });
                          if (!confirmed) return;
                          assign.mutate({ userId: u.id, role }, {
                            onSuccess: () => notifySuccess({ title: "Role diperbarui", text: `${u.full_name} → ${ROLE_LABELS[role] ?? role}` }),
                            onError: (e: any) => notifyError({ title: "Gagal ganti role", text: e?.message }),
                          });
                        }}
                      />
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={async () => {
                          const confirmed = await confirmAction({ title: `Hapus user ${u.full_name}?`, text: "Data user dihapus permanen.", confirmText: "Ya, Hapus", danger: true });
                          if (!confirmed) return;
                          remove.mutate(u.id, {
                            onSuccess: () => notifySuccess({ title: "Terhapus", text: "User dihapus" }),
                            onError: (e: any) => notifyError({ title: "Gagal hapus", text: e?.message }),
                          });
                        }}
                        disabled={u.role === "superadmin" || remove.isPending}
                        title={u.role === "superadmin" ? "Superadmin tidak bisa dihapus" : "Hapus user"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && !isLoading && !isError && (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-muted-foreground">Belum ada user.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AddUserDialog open={addOpen} onOpenChange={setAddOpen} />
    </DashboardLayout>
  );
}

function RoleSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(ROLE_LABELS).map(([r, label]) => (
          <SelectItem key={r} value={r}>{label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function AddUserDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("parent");
  const create = useCreateAdminUser();

  const submit = async () => {
    if (!email.trim() || !fullName.trim() || password.length < 8) {
      toast.error("Email, nama wajib diisi & password min 8 karakter");
      return;
    }
    const confirmed = await confirmAction({ title: "Buat user?", text: `Buat user ${email} sebagai ${ROLE_LABELS[role]}?`, confirmText: "Ya, Buat", danger: false });
    if (!confirmed) return;
    create.mutate({ email: email.trim(), password, full_name: fullName.trim(), role }, {
      onSuccess: () => {
        notifySuccess({ title: "User dibuat", text: `User ${email} dibuat sebagai ${ROLE_LABELS[role]}` });
        onOpenChange(false);
        setEmail(""); setPassword(""); setFullName(""); setRole("parent");
      },
      onError: (e: any) => notifyError({ title: "Gagal membuat user", text: e?.message }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-primary" /> Tambah User Baru
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2"><Label>Nama Lengkap</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Mis. Rina Kartika" /></div>
          <div className="grid gap-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="rina@akademi.id" /></div>
          <div className="grid gap-2"><Label>Password (min 8)</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></div>
          <div className="grid gap-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_LABELS).map(([r, label]) => (
                  <SelectItem key={r} value={r}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={submit} disabled={create.isPending}>
            {create.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            Buat User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
