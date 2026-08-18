import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useCreateDrill } from "@/lib/queries";
import { DrillForm, toDrillForm, fromDrillForm, type DrillFormValue } from "@/components/site/DrillForm";

export const Route = createFileRoute("/drills/new")({
  head: () => ({ meta: [{ title: "Create Drill — SportAcademy" }] }),
  component: CreateDrillPage,
});

function CreateDrillPage() {
  const navigate = useNavigate();
  const create = useCreateDrill();

  const save = (form: DrillFormValue) => {
    create.mutate(fromDrillForm(form) as any, {
      onSuccess: () => {
        toast.success("Drill tersimpan ke backend", { description: form.title });
        setTimeout(() => navigate({ to: "/drills" }), 600);
      },
      onError: (e: any) => toast.error(e?.message ?? "Gagal menyimpan drill"),
    });
  };

  return (
    <DashboardLayout
      title="Create Drill"
      subtitle="Tambah drill baru ke library — bisa dipakai di Session Builder."
      actions={<Button asChild variant="outline"><Link to="/drills"><ArrowLeft className="mr-1 h-4 w-4" />Kembali</Link></Button>}
    >
      <DrillForm initial={toDrillForm({})} onSave={save} saving={create.isPending} />
    </DashboardLayout>
  );
}
