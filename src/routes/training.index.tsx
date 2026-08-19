import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, CalendarClock, Play, ChevronDown, ChevronUp } from "lucide-react";
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
  if (dateOnly.getTime() === today.getTime()) return "now";
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

  return (
    <DashboardLayout
      title="Training Session"
      subtitle="Semua program — sesi Hari Ini untuk dievaluasi, plus sesi mendatang & sebelumnya."
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
        {allProgramKeys.map((pid) => (
          <ProgramCard
            key={pid ?? "nogroup"}
            pid={pid}
            sessions={byProgram.get(pid) ?? []}
            programs={programs}
            now={now}
          />
        ))}
      </div>
    </DashboardLayout>
  );
}

function ProgramCard({ pid, sessions, programs, now }: {
  pid: string | null;
  sessions: Session[];
  programs: ReturnType<typeof usePrograms>["data"] extends (infer T)[] | undefined ? T[] : never;
  now: Date;
}) {
  const [expandNext, setExpandNext] = useState(false);
  const [expandPast, setExpandPast] = useState(false);

  const prog = programs.find((p) => p.id === pid);
  const programName = pid ? (prog?.title ?? "Program") : "Tanpa Program";

  const zones: Record<Zone, Session[]> = { past: [], now: [], next: [] };
  for (const s of sessions) zones[classifySession(s, now)].push(s);
  zones.now.sort((a, b) => (a.start_time || "00:00").localeCompare(b.start_time || "00:00"));
  zones.next.sort((a, b) => (a.session_date || "").localeCompare(b.session_date || "") || (a.start_time || "00:00").localeCompare(b.start_time || "00:00"));
  zones.past.sort((a, b) => (b.session_date || "").localeCompare(a.session_date || "") || (b.start_time || "00:00").localeCompare(a.start_time || "00:00"));

  const nextVisible = expandNext ? zones.next : zones.next.slice(0, 2);
  const pastVisible = expandPast ? zones.past : zones.past.slice(0, 2);

  return (
    <Card className="border-border/70">
      <CardContent className="p-4">
        {/* Nama program / tim */}
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="truncate font-display text-base font-bold text-foreground">{programName}</h3>
          <Badge variant="secondary">{sessions.length} sesi</Badge>
        </div>

        {/* Info program: Pelatih sendiri, Kelompok+Atlet 1 baris */}
        {(() => {
          const prog = programs.find((p) => p.id === pid);
          return (
            <div className="mb-3 space-y-1 text-sm">
              <p className="text-muted-foreground">
                Pelatih: <span className="font-semibold text-foreground">{prog?.head_coach || prog?.coach || "—"}</span>
              </p>
              <p className="text-muted-foreground">
                Kelompok: <span className="font-semibold text-foreground">{prog?.age_group || "—"}</span>
                <span className="mx-1.5">·</span>
                Atlet: <span className="font-semibold text-foreground">{prog?.athlete_count ?? 0} org</span>
              </p>
            </div>
          );
        })()}

        {/* List vertikal: Hari Ini → Sesi Mendatang → Sesi Sebelumnya */}
        <div className="space-y-2.5">
          {/* HARI INI — semua sesi hari ini, CTA Mulai Evaluasi */}
          <div className="rounded-lg border-2 border-emerald-400 bg-emerald-50/60 p-3">
            <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
              <Play className="h-3.5 w-3.5" /> Hari Ini {zones.now.length > 1 && <Badge variant="secondary" className="text-[9px]">{zones.now.length} sesi</Badge>}
            </p>
            {zones.now.length === 0 ? (
              <p className="text-[11px] text-muted-foreground/70">Tidak ada sesi hari ini.</p>
            ) : (
              <div className="space-y-2">
                {zones.now.map((s) => (
                  <div key={s.id} className="rounded-md bg-white/70 p-2">
                    <p className="truncate text-sm font-bold">{s.title}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" /> {formatTanggal(s.session_date)} · {formatJam(s)}
                    </p>
                    <Button asChild size="sm" className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700">
                      <Link to="/training/$sessionId" params={{ sessionId: s.id }}>
                        <Play className="mr-1 h-3.5 w-3.5" /> Mulai Evaluasi
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SESI MENDATANG */}
          <div className="rounded-lg border border-border p-3">
            <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-primary">
              <CalendarClock className="h-3.5 w-3.5" /> Sesi Mendatang
              {zones.next.length > 0 && <Badge variant="secondary" className="text-[9px]">{zones.next.length}</Badge>}
            </p>
            {zones.next.length === 0 ? (
              <p className="text-[11px] text-muted-foreground/60">—</p>
            ) : (
              <div className="space-y-1.5">
                {nextVisible.map((s) => (
                  <Link key={s.id} to="/training/$sessionId" params={{ sessionId: s.id }} className="block rounded-md px-1.5 py-1 hover:bg-secondary/50">
                    <p className="truncate text-xs font-semibold">{s.title}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" /> {formatTanggal(s.session_date)} · {formatJam(s)}
                    </p>
                  </Link>
                ))}
                {zones.next.length > 2 && (
                  <button onClick={() => setExpandNext(!expandNext)} className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed py-1 text-[11px] font-medium text-primary hover:bg-primary/5">
                    {expandNext ? (<><ChevronUp className="h-3 w-3" /> Tutup</>) : (<><ChevronDown className="h-3 w-3" /> Lihat semua ({zones.next.length})</>)}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* SESI SEBELUMNYA */}
          <div className="rounded-lg border border-border p-3">
            <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" /> Sesi Sebelumnya
              {zones.past.length > 0 && <Badge variant="secondary" className="text-[9px]">{zones.past.length}</Badge>}
            </p>
            {zones.past.length === 0 ? (
              <p className="text-[11px] text-muted-foreground/60">—</p>
            ) : (
              <div className="space-y-1.5">
                {pastVisible.map((s) => (
                  <Link key={s.id} to="/training/$sessionId" params={{ sessionId: s.id }} className="block rounded-md px-1.5 py-1 hover:bg-secondary/50">
                    <p className="truncate text-xs font-semibold">{s.title}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" /> {formatTanggal(s.session_date)} · {formatJam(s)}
                    </p>
                  </Link>
                ))}
                {zones.past.length > 2 && (
                  <button onClick={() => setExpandPast(!expandPast)} className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed py-1 text-[11px] font-medium text-primary hover:bg-primary/5">
                    {expandPast ? (<><ChevronUp className="h-3 w-3" /> Tutup</>) : (<><ChevronDown className="h-3 w-3" /> Lihat semua ({zones.past.length})</>)}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
