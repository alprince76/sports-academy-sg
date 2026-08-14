import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ShieldCheck, Save, Loader2, Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useAdminRoles, useUpdateRolePermissions, useCreateRole, useDeleteRole, type RoleInfo } from "@/lib/queries";

export const Route = createFileRoute("/role-management")({
  head: () => ({ meta: [{ title: "Role Management — SportAcademy" }] }),
  component: RoleManagementPage,
});

const ROLE_COLOR: Record<string, string> = {
  superadmin: "bg-rose-100 text-rose-700",
  owner: "bg-amber-100 text-amber-800",
  admin: "bg-blue-100 text-blue-800",
  coach: "bg-emerald-100 text-emerald-700",
  parent: "bg-purple-100 text-purple-700",
};

function RoleManagementPage() {
  const { data, isLoading, isError } = useAdminRoles();
  const [selectedRole, setSelectedRole] = useState<string>("owner");
  const [draft, setDraft] = useState<Set<string>>(new Set());
  const [editLabel, setEditLabel] = useState<string>("");
  const [editDesc, setEditDesc] = useState<string>("");
  const [createOpen, setCreateOpen] = useState(false);
  const update = useUpdateRolePermissions();
  const remove = useDeleteRole();

  const roles = data?.roles ?? [];
  const permissions = data?.permissions ?? [];
  const current = roles.find((r) => r.role === selectedRole);

  const selectRole = (role: string) => {
    setSelectedRole(role);
    const r = roles.find((x) => x.role === role);
    setDraft(new Set(r?.permissions ?? []));
    setEditLabel(r?.label ?? "");
    setEditDesc(r?.description ?? "");
  };

  const toggle = (code: string) => {
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const isDirty = current
    ? JSON.stringify([...draft].sort()) !== JSON.stringify([...(current.permissions ?? [])].sort())
      || editLabel !== current.label
      || editDesc !== (current.description ?? "")
    : false;

  const save = () => {
    if (!editLabel.trim()) { toast.error("Label wajib diisi"); return; }
    update.mutate({
      role: selectedRole,
      label: editLabel.trim(),
      description: editDesc || null,
      permissions: [...draft],
    }, {
      onSuccess: () => toast.success(`Role '${editLabel}' disimpan`),
      onError: (e: any) => toast.error(e?.message ?? "Gagal menyimpan"),
    });
  };

  const onDelete = (r: RoleInfo) => {
    if (!confirm(`Hapus role '${r.label}'? Semua permission & menu role ini ikut terhapus.`)) return;
    remove.mutate(r.role, {
      onSuccess: () => {
        toast.success(`Role '${r.label}' dihapus`);
        if (selectedRole === r.role) {
          const next = roles.find((x) => x.role !== r.role);
          if (next) selectRole(next.role);
        }
      },
      onError: (e: any) => toast.error(e?.message ?? "Gagal hapus role"),
    });
  };

  // group permissions by resource (prefix sebelum titik), urutkan 4 aksi: create/read/update/delete
  const ACTION_ORDER = ["create", "read", "update", "delete"];
  const resourceMap = new Map<string, Map<string, { code: string; label: string }>>();
  for (const p of permissions) {
    const idx = p.code.lastIndexOf(".");
    const resource = idx > 0 ? p.code.slice(0, idx) : p.code;
    const action = idx > 0 ? p.code.slice(idx + 1) : "view";
    if (!resourceMap.has(resource)) resourceMap.set(resource, new Map());
    resourceMap.get(resource)!.set(action, p);
  }
  const resources = [...resourceMap.entries()].map(([name, actions]) => ({
    name,
    actions: [...actions.entries()].sort(([a], [b]) => {
      const ia = ACTION_ORDER.indexOf(a); const ib = ACTION_ORDER.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    }),
  })).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <DashboardLayout
      title="Role Management"
      subtitle="Kelola role: buat, baca, update, hapus beserta permission & menu"
      actions={<Button onClick={() => setCreateOpen(true)}><Plus className="mr-1 h-4 w-4" />Buat Role</Button>}
    >
      {isLoading && (
        <Card className="border-dashed"><CardContent className="p-12 text-center text-sm text-muted-foreground">Memuat role...</CardContent></Card>
      )}
      {isError && (
        <Card className="border-dashed"><CardContent className="p-12 text-center text-sm text-muted-foreground">
          Gagal memuat data. Pastikan backend :8081 jalan dan akun punya akses superadmin.
        </CardContent></Card>
      )}

      {!isLoading && !isError && (
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Daftar role */}
          <div className="space-y-2">
            {roles.map((r) => (
              <div
                key={r.role}
                onClick={() => selectRole(r.role)}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all ${
                  selectedRole === r.role
                    ? "border-primary bg-primary-soft/60 shadow-sm"
                    : "border-border bg-card hover:bg-secondary/40"
                }`}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${ROLE_COLOR[r.role] ?? "bg-secondary"}`}>
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{r.label}</p>
                  <p className="truncate font-mono text-[11px] text-muted-foreground">{r.role}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="secondary">{r.permissions.length} perm</Badge>
                  {r.is_system ? (
                    <Badge variant="outline" className="text-[10px]">sistem</Badge>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(r); }}
                      disabled={remove.isPending}
                      className="text-[10px] text-muted-foreground hover:text-destructive"
                      title="Hapus role"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Editor role */}
          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Pencil className="h-4 w-4 text-primary" />
                    <input
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      className="w-56 rounded-lg border border-border bg-transparent px-2 py-1 font-display text-lg font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                      disabled={!current}
                    />
                    {current?.is_system && <Badge variant="outline" className="text-[10px]">role sistem</Badge>}
                  </div>
                  <input
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="Deskripsi role…"
                    className="mt-1 w-full max-w-md rounded-lg border border-transparent bg-transparent px-2 py-0.5 text-xs text-muted-foreground focus:border-border focus:outline-none"
                    disabled={!current}
                  />
                </div>
                <Button onClick={save} disabled={!isDirty || update.isPending}>
                  {update.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
                  Simpan Perubahan
                </Button>
              </div>

              <div className="mt-6 space-y-4">
                {resources.map((res) => (
                  <div key={res.name}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{res.name}</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {res.actions.map(([action, perm]) => (
                        <label
                          key={perm.code}
                          className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-xs transition ${
                            draft.has(perm.code)
                              ? "border-primary/40 bg-primary-soft/40"
                              : "border-border hover:bg-secondary/40"
                          }`}
                        >
                          <Checkbox checked={draft.has(perm.code)} onCheckedChange={() => toggle(perm.code)} />
                          <span className="capitalize font-medium">{action}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <CreateRoleDialog open={createOpen} onOpenChange={setCreateOpen} permissions={permissions} onCreated={(role) => selectRole(role)} />
    </DashboardLayout>
  );
}

function CreateRoleDialog({
  open, onOpenChange, permissions, onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  permissions: { code: string; label: string }[];
  onCreated: (role: string) => void;
}) {
  const [role, setRole] = useState("");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set(["dashboard.view"]));
  const create = useCreateRole();

  const submit = () => {
    if (!role.trim() || !label.trim()) { toast.error("Nama role & label wajib diisi"); return; }
    create.mutate({
      role: role.trim().toLowerCase().replace(/\s+/g, "_"),
      label: label.trim(),
      description: description || null,
      permissions: [...selected],
      menus: [{ label: "Dashboard", icon: "Home", path: "/dashboard", sort_order: 1 }],
    }, {
      onSuccess: (res: any) => {
        toast.success(`Role '${res?.data?.label ?? label}' dibuat`);
        onOpenChange(false);
        onCreated(res?.data?.role ?? role);
        setRole(""); setLabel(""); setDescription(""); setSelected(new Set(["dashboard.view"]));
      },
      onError: (e: any) => toast.error(e?.message ?? "Gagal membuat role"),
    });
  };

  const toggle = (code: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" /> Buat Role Baru
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Nama role (key)</Label>
              <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="mis. scout" />
              <p className="text-[11px] text-muted-foreground">huruf kecil, angka, underscore</p>
            </div>
            <div className="grid gap-2"><Label>Label</Label><Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="mis. Scout Tim" /></div>
          </div>
          <div className="grid gap-2"><Label>Deskripsi (opsional)</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Penjelasan singkat role" /></div>
          <div>
            <Label>Permission awal</Label>
            <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {permissions.map((p) => (
                <label key={p.code} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs ${selected.has(p.code) ? "border-primary/40 bg-primary-soft/40" : "border-border"}`}>
                  <Checkbox checked={selected.has(p.code)} onCheckedChange={() => toggle(p.code)} />
                  <span className="truncate font-mono">{p.code}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={submit} disabled={create.isPending}>
            {create.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            Buat Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
