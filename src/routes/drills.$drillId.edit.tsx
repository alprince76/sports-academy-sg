import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useDrills, useUpdateDrill } from "@/lib/queries";
import { DrillForm, toDrillForm, fromDrillForm, type DrillFormValue } from "@/components/site/DrillForm";
import { confirmAction, notifySuccess, notifyError } from "@/lib/confirm";

export const Route = createFileRoute("/drills/$drillId/edit")({
  head: () => ({ meta: [{ title: "Edit Drill — SportAcademy" }] }),
  component: EditDrillPage,
});

function EditDrillPage() {
  const { drillId } = Route.useParams();
  const { data: drills = [], isLoading } = useDrills();
  const update = useUpdateDrill();
  const navigate = useNavigate();

  const drill = drills.find((d) => d.id === drillId);

  if (isLoading) {
    return (
      <DashboardLayout title="Memuat...">
        <Card><CardContent className="flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Memuat drill...
        </CardContent></Card>
      </DashboardLayout>
    );
  }
  if (!drill) throw notFound();

  const save = async (form: DrillFormValue) => {
    const ok = await confirmAction({ title: "Simpan perubahan?", text: "Perubahan drill akan disimpan.", danger: false });
    if (!ok) return;
    update.mutate({ id: drill.id, ...fromDrillForm(form) } as any, {
      onSuccess: () => {
        notifySuccess({ title: "Tersimpan", text: "Drill diperbarui" });
        navigate({ to: "/drills/$drillId", params: { drillId: drill.id } });
      },
      onError: (e: any) => notifyError({ title: "Gagal menyimpan", text: e?.message }),
    });
  };

  return (
    <DashboardLayout
      title={`Edit Drill: ${drill.title}`}
      subtitle={`${drill.category} · ${drill.difficulty} · ${drill.intensity}`}
      actions={<Button asChild variant="outline"><Link to="/drills/$drillId" params={{ drillId: drill.id }}><ArrowLeft className="mr-1 h-4 w-4" />Kembali</Link></Button>}
    >
      <DrillForm initial={toDrillForm(drill)} onSave={save} saving={update.isPending} />
    </DashboardLayout>
  );
}
