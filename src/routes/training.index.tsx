import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, CalendarClock, Play } from "lucide-react";
import { useSessions, usePrograms, type Session } from "@/lib/queries";

export const Route = createFileRoute("/training/")({
  head: () => ({ meta: [{ title: "Training Session — SportAcademy" }] }),
  component: TrainingPage,
});

/** Kompatibilitas: halaman detail sesi membaca dari sini (client-side). */
export function useSessionList() {
  return useSessions();
}
export type SessionListItem = Session;

type Zone = "past" | "now" | "next";

function classifySession(s: Session, now: Date): Zone {
  if (!s.session_date) return "next";
  const [y, m, d] = s.session_date.split("-").map(Number);
  const dateOnly = new Date(y, m - 1, d);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (dateOnly.getTime() < today.getTime()) return "past";
  if (dateOnly.getTime() === today.getTime()) {
    if (s.start_time && s.end_time) {
      const [sh, sm] = s.start_time.split(":").map(Number);
      const [eh, em] = s.end_time.split(":").map(Number);
      const startMs = new Date(y, m - 1, d, sh, sm).getTime();
      const endMs = new Date(y, m - 1, d, eh, em).getTime();
      const nowMs = now.getTime();
      if (nowMs >= startMs && nowMs <= endMs) return "now";
      if (nowMs < startMs) return "next";
      return "past";
    }
    return "now";
  }
  return "next";
}

function formatJam(s: Session): string {
  if (s.start_time && s.end_time) return `${s.start_time.slice(0, 5)} – ${s.end_time.slice(0, 5)}`;
  if (s.start_time) return s.start_time.slice(0, 5);
  return "";
}

function formatTanggal(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" });
}

function TrainingPage() {
  const { data: sessions = [], isLoading, isError } = useSessions();
  const { data: programs = [] } = usePrograms();
  const now = new Date();

  const byProgram = new Map<string | null, Session[]>();
  for (const s of sessions) {
    if (!byProgram.has(s.program_id)) byProgram.set(s.program_id, []);
    byProgram.get(s.program_id)!.push(s);
  }

  const allProgramKeys: (string | null)[] = [
    ...programs.map((p) => p.id),
    ...Array.from(byProgram.keys()).filter((k) => k && !programs.some((p) => p.id === k)),
  ];
  const programName = (pid: string | null) => pid ? (programs.find((p) => p.id === pid)?.title ?? "Program") : "Tanpa Program";

  return (
    <DashboardLayout
      title="Training Session"
      subtitle="Semua program — sesi Hari Ini untuk dievaluasi, plus yang sebelum & sesudah."
      actions={<Button asChild><Link to="/programs"><CalendarClock className="mr-1 h-4 w-4" /> Atur Sesi</Link></Button>}
    >
      {isLoading && (
        <Card className="border-dashed"><CardContent className="p-12 text-center text-sm text-muted-foreground">Memuat sesi...</CardContent></Card>
      )}
      {isError && (
        <Card className="border-dashed"><CardContent className="p-12 text-center text-sm text-muted-foreground">
          Gagal memuat data dari backend. Pastikan backend :8081 jalan.
        </CardContent></Card>
      )}
      {!isLoading && !isError && allProgramKeys.length === 0 && (
        <Card className="border-dashed"><CardContent className="p-12 text-center text-sm text-muted-foreground">
          Belum ada program atau sesi. Buat program dulu, lalu tambah sesi lewat halaman Program.
        </CardContent></Card>
      )}

      {/* Grid program — 3 program per baris di layar lebar */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {allProgramKeys.map((pid) => {
          const pSessions = byProgram.get(pid) ?? [];
          const zones: Record<Zone, Session[]> = { past: [], now: [], next: [] };
          for (const s of pSessions) zones[classifySession(s, now)].push(s);
          zones.now.sort((a, b) => (a.start_time || "00:00").localeCompare(b.start_time || "00:00"));
          zones.next.sort((a, b) => (a.session_date || "").localeCompare(b.session_date || ""));
          zones.past.sort((a, b) => (b.session_date || "").localeCompare(a.session_date || ""));

          const now_s = zones.now[0] ?? null;
          const next_s = zones.next[0] ?? null;
          const past_s = zones.past[0] ?? null;

          return (
            <Card key={pid ?? "nogroup"} className="border-border/70">
              <CardContent className="p-3">
                <div className="mb-2 flex items-center justify-between">
                  <Badge variant="secondary" className="bg-primary-soft text-primary">{programName(pid)}</Badge>
                  <span className="text-[10px] text-muted-foreground">{pSessions.length} sesi</span>
                </div>

                {/* Info program: coach, kelompok umur, jumlah atlet */}
                {(() => {
                  const prog = programs.find((p) => p.id === pid);
                  return (
                    <div className="mb-2 grid grid-cols-3 gap-1.5 text-[10px]">
                      <div className="rounded-md bg-secondary/40 px-2 py-1">
                        <p className="text-muted-foreground">Pelatih</p>
                        <p className="truncate font-semibold">{prog?.head_coach || "—"}</p>
                      </div>
                      <div className="rounded-md bg-secondary/40 px-2 py-1">
                        <p className="text-muted-foreground">Kelompok</p>
                        <p className="truncate font-semibold">{prog?.age_group || "—"}</p>
                      </div>
                      <div className="rounded-md bg-secondary/40 px-2 py-1">
                        <p className="text-muted-foreground">Atlet</p>
                        <p className="truncate font-semibold">{prog?.athlete_count ?? 0} org</p>
                      </div>
                    </div>
                  );
                })()}

                {/* List vertikal: Hari Ini → Selanjutnya → Sebelumnya */}
                <div className="space-y-2">
                  {/* HARI INI — CTA Mulai Evaluasi */}
                  <div className="rounded-lg border-2 border-emerald-400 bg-emerald-50/60 p-2.5">
                    <p className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                      <Play className="h-3 w-3" /> Hari Ini
                    </p>
                    {now_s ? (
                      <>
                        <p className="truncate text-sm font-bold">{now_s.title}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" /> {formatTanggal(now_s.session_date)} · {formatJam(now_s)}
                        </p>
                        <Button asChild size="sm" className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700">
                          <Link to="/training/$sessionId" params={{ sessionId: now_s.id }}>
                            <Play className="mr-1 h-3.5 w-3.5" /> Mulai Evaluasi
                          </Link>
                        </Button>
                      </>
                    ) : (
                      <p className="text-[11px] text-muted-foreground/70">Tidak ada sesi hari ini.</p>
                    )}
                  </div>

                  {/* SELANJUTNYA */}
                  <div className="rounded-lg border border-border p-2.5">
                    <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      <CalendarClock className="h-3 w-3" /> Selanjutnya
                    </p>
                    {next_s ? (
                      <Link to="/training/$sessionId" params={{ sessionId: next_s.id }} className="block">
                        <p className="truncate text-xs font-semibold">{next_s.title}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" /> {formatTanggal(next_s.session_date)} · {formatJam(next_s)}
                        </p>
                      </Link>
                    ) : (
                      <p className="text-[11px] text-muted-foreground/60">—</p>
                    )}
                  </div>

                  {/* SEBELUMNYA */}
                  <div className="rounded-lg border border-border p-2.5">
                    <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3" /> Sebelumnya
                    </p>
                    {past_s ? (
                      <Link to="/training/$sessionId" params={{ sessionId: past_s.id }} className="block">
                        <p className="truncate text-xs font-semibold">{past_s.title}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" /> {formatTanggal(past_s.session_date)} · {formatJam(past_s)}
                        </p>
                      </Link>
                    ) : (
                      <p className="text-[11px] text-muted-foreground/60">—</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
