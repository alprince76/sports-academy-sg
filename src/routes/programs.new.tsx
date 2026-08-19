import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { confirmAction, notifySuccess, notifyError } from "@/lib/confirm";
import { ProgramForm, emptyForm } from "@/components/site/ProgramForm";
import { useCreateProgram, getAcademyId } from "@/lib/queries";

export const Route = createFileRoute("/programs/new")({
  head: () => ({ meta: [{ title: "Create Training Program — SportAcademy" }] }),
  component: NewProgramPage,
});

function NewProgramPage() {
  const navigate = useNavigate();
  const create = useCreateProgram();

  const submit = (payload: Record<string, unknown>) => {
    return new Promise<void>(async (resolve, reject) => {
      const ok = await confirmAction({ title: "Simpan perubahan?", text: "Program baru akan disimpan ke backend.", danger: false });
      if (!ok) { resolve(); return; }
      create.mutate(payload as any, {
        onSuccess: () => {
          notifySuccess({ title: "Tersimpan", text: "Program tersimpan ke backend" });
          setTimeout(() => navigate({ to: "/programs" }), 600);
          resolve();
        },
        onError: (e: any) => { notifyError({ title: "Gagal menyimpan", text: e?.message ?? "Gagal menyimpan program" }); reject(e); },
      });
    });
  };

  return (
    <DashboardLayout
      title="Create Training Program"
      subtitle="Rencanakan program pengembangan atlet secara komprehensif."
      actions={<Button asChild variant="outline"><Link to="/programs"><ArrowLeft className="mr-1 h-4 w-4" />Kembali</Link></Button>}
    >
      <ProgramForm initial={emptyForm()} onSubmit={submit} submitLabel="Save Program" academyId={getAcademyId()} />
    </DashboardLayout>
  );
}
