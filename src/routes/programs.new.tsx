import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
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
    return new Promise<void>((resolve, reject) => {
      create.mutate(payload as any, {
        onSuccess: () => {
          toast.success("Program tersimpan ke backend", { description: String(payload.title) });
          setTimeout(() => navigate({ to: "/programs" }), 600);
          resolve();
        },
        onError: (e: any) => reject(e),
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
