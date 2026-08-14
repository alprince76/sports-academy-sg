import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { ATHLETES } from "@/lib/demo-data";
import { useSessionList } from "./training.index";
import { SKILL_CATEGORIES } from "@/lib/assessment-data";

export const Route = createFileRoute("/training/$sessionId/print")({
  head: () => ({ meta: [{ title: "Print Assessment Sheet — SportAcademy" }] }),
  component: PrintSheetPage,
});

function PrintSheetPage() {
  const { sessionId } = Route.useParams();
  const { data: sessions = [] } = useSessionList();
  const session = sessions.find((s) => s.id === sessionId) ?? sessions[0];
  const roster = ATHLETES.slice(0, 12);

  useEffect(() => {
    document.body.classList.add("print-sheet-body");
    return () => document.body.classList.remove("print-sheet-body");
  }, []);

  return (
    <div className="min-h-screen bg-secondary/30 p-4 print:bg-white print:p-0">
      {/* Toolbar (hidden on print) */}
      <div className="mx-auto mb-4 flex max-w-[210mm] items-center justify-between print:hidden">
        <Button asChild variant="outline" size="sm">
          <Link to="/training/$sessionId" params={{ sessionId }}>
            <ArrowLeft className="mr-1 h-4 w-4" />Kembali
          </Link>
        </Button>
        <Button size="sm" onClick={() => window.print()}>
          <Printer className="mr-1 h-4 w-4" />Print / Save as PDF
        </Button>
      </div>

      {/* A4 Sheet */}
      <div className="mx-auto w-[210mm] bg-white p-8 shadow-sm print:shadow-none" style={{ minHeight: "297mm" }}>
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-black pb-3">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-tight">Basketball Skill Assessment Sheet</h1>
            <p className="mt-1 text-xs text-gray-700">SportAcademy · Offline Coaching Assessment</p>
          </div>
          <div className="text-right text-[11px]">
            <p>Sheet ID: <b>{sessionId.toUpperCase()}-{new Date().getFullYear()}</b></p>
            <p>Halaman 1 dari 1</p>
          </div>
        </div>

        {/* Session Info */}
        <div className="mt-4 grid grid-cols-4 gap-3 text-[11px]">
          <Info l="Program" v={session?.programs?.title ?? "—"} />
          <Info l="Focus" v={session?.focus ?? "—"} />
          <Info l="Training Date" v={session?.session_date ?? ""} />
          <Info l="Session" v={session?.title ?? "—"} />
        </div>

        {/* Scale legend */}
        <div className="mt-3 rounded border border-gray-300 bg-gray-50 p-2 text-[10px]">
          <b>Skala Penilaian:</b> 1 = Perlu Perbaikan · 2 = Cukup · 3 = Baik · 4 = Sangat Baik · 5 = Excellent
          &nbsp;·&nbsp; <b>Kehadiran:</b> ✓ Hadir · ✗ Absen
        </div>

        {/* Athletes table */}
        <table className="mt-4 w-full border-collapse text-[10px]">
          <thead>
            <tr className="bg-gray-100">
              <th className="w-6 border border-gray-400 p-1">#</th>
              <th className="border border-gray-400 p-1 text-left">Nama Atlet</th>
              <th className="w-10 border border-gray-400 p-1">Hadir</th>
              {SKILL_CATEGORIES.map((c) => (
                <th key={c} className="w-12 border border-gray-400 p-1 text-[9px]">{c}</th>
              ))}
              <th className="border border-gray-400 p-1 text-left">Catatan Coach</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((a, i) => (
              <tr key={a.id}>
                <td className="border border-gray-400 p-1 text-center">{i + 1}</td>
                <td className="border border-gray-400 p-1">
                  <div className="font-semibold">{a.name}</div>
                  <div className="text-[9px] text-gray-600">{a.position}</div>
                </td>
                <td className="border border-gray-400 p-1 text-center">☐</td>
                {SKILL_CATEGORIES.map((c) => (
                  <td key={c} className="h-10 border border-gray-400 p-1 text-center"> </td>
                ))}
                <td className="border border-gray-400 p-1"> </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Session notes */}
        <div className="mt-4">
          <p className="text-[11px] font-semibold">Catatan Umum Sesi:</p>
          <div className="mt-1 h-16 rounded border border-gray-400" />
        </div>

        {/* Signature */}
        <div className="mt-6 grid grid-cols-2 gap-8 text-[11px]">
          <div>
            <p>Tanggal: ______________________</p>
            <div className="mt-10 border-t border-gray-500 pt-1 text-center">
              Tanda Tangan Coach<br /><b>{session?.programs?.title ?? "Coach"}</b>
            </div>
          </div>
          <div>
            <p>Head Coach / Program Director</p>
            <div className="mt-10 border-t border-gray-500 pt-1 text-center">
              Approved by
            </div>
          </div>
        </div>

        <p className="mt-8 border-t border-gray-300 pt-2 text-center text-[9px] text-gray-500">
          Setelah diisi, foto atau scan lembar ini lalu upload di menu <b>OCR Import</b> untuk digitalisasi otomatis.
        </p>
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          .print-sheet-body { background: white !important; }
        }
      `}</style>
    </div>
  );
}

function Info({ l, v }: { l: string; v: string }) {
  return (
    <div className="rounded border border-gray-300 p-2">
      <p className="text-[9px] uppercase text-gray-600">{l}</p>
      <p className="mt-0.5 font-semibold">{v}</p>
    </div>
  );
}
