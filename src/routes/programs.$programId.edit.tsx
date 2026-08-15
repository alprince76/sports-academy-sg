import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ProgramForm, formFromProgram } from "@/components/site/ProgramForm";
import { useProgramDetail, useUpdateProgram } from "@/lib/queries";

export const Route = createFileRoute("/programs/$programId/edit")({
  head: () => ({ meta: [{ title: "Edit Program — SportAcademy" }] }),
  component: EditProgramPage,
  notFoundComponent: () => (
    <DashboardLayout title="Program tidak ditemukan">
      <Button asChild><Link to="/programs">Kembali</Link></Button>
    </DashboardLayout>
  ),
});

function EditProgramPage() {
  const { programId } = Route.useParams();
  const navigate = useNavigate();
  const { data: program, isLoading } = useProgramDetail(programId);
  const update = useUpdateProgram();

  if (isLoading) {
    return (
      <DashboardLayout title="Memuat...">
        <Card><CardContent className="p-12 text-center text-sm text-muted-foreground">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
          Memuat data program...
        </CardContent></Card>
      </DashboardLayout>
    );
  }
  if (!program) throw notFound();

  const submit = (payload: Record<string, unknown>) => {
    return new Promise<void>((resolve, reject) => {
      update.mutate({ id: program.id, ...payload } as any, {
        onSuccess: () => {
          toast.success("Program diperbarui", { description: String(payload.title) });
          setTimeout(() => navigate({ to: "/programs/$programId", params: { programId: program.id } }), 600);
          resolve();
        },
        onError: (e: any) => reject(e),
      });
    });
  };

  return (
    <DashboardLayout
      title={`Edit: ${program.title}`}
      subtitle="Perbarui detail program — semua field tersimpan di backend."
      actions={<Button asChild variant="outline"><Link to="/programs/$programId" params={{ programId: program.id }}><ArrowLeft className="mr-1 h-4 w-4" />Kembali</Link></Button>}
    >
      <ProgramForm initial={formFromProgram(program)} onSubmit={submit} submitLabel="Simpan Perubahan" academyId={program.academy_id} />
    </DashboardLayout>
  );
}
