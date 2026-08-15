import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiData, api } from "@/lib/api";

/* ── Types (backend shape) ── */
export interface Athlete {
  id: string;
  academy_id: string;
  name: string;
  age_group: string | null;
  position: string | null;
  team: string | null;
  progress: number;
  attendance: number;
  status: "Great" | "Good" | "Needs Focus";
  note: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  skills: { name: string; value: number }[];
  achievements: string[];
  health: { status: string; note?: string; updatedAt?: string; expectedReturn?: string };
}

export interface Coach {
  id: string;
  academy_id: string;
  name: string;
  title: string;
  specialization: string | null;
  athletes_count: number;
}

export interface Program {
  id: string;
  academy_id: string;
  title: string;
  category: string | null;
  description: string | null;
  sessions_per_week: number;
  active: boolean;
}

export interface Drill {
  id: string;
  category: string;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  intensity: "Low" | "Medium" | "High";
  duration: number;
  focus: string | null;
  equipment: string | null;
}

export interface Invoice {
  id: string;
  invoice_no: string;
  athlete_id: string;
  plan: string;
  amount: number;
  status: "Lunas" | "Tertunda" | "Overdue";
  athletes?: { name: string; team: string | null } | null;
}

export interface DashboardSummary {
  role: string;
  total_athletes: number;
  active_athletes: number;
  attendance_rate: number;
  revenue?: { total_paid: number; invoices: number };
  can_view_revenue?: boolean;
}

/* ── Helper: academy id dari localStorage (di-set saat login) ── */
export function getAcademyId(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("sportacademy.academy") ?? "";
}

/* ── Queries ── */
export function useAthletes() {
  return useQuery({
    queryKey: ["athletes"],
    queryFn: () => apiData<Athlete[]>(`/athletes?academy_id=${getAcademyId()}`),
    staleTime: 30_000,
    enabled: !!getAcademyId(),
  });
}

export function useCoaches() {
  return useQuery({
    queryKey: ["coaches"],
    queryFn: () => apiData<Coach[]>(`/coaches?academy_id=${getAcademyId()}`),
    staleTime: 30_000,
    enabled: !!getAcademyId(),
  });
}

export function usePrograms() {
  return useQuery({
    queryKey: ["programs"],
    queryFn: () => apiData<Program[]>(`/programs?academy_id=${getAcademyId()}`),
    staleTime: 30_000,
    enabled: !!getAcademyId(),
  });
}

export function useDrills() {
  return useQuery({
    queryKey: ["drills"],
    queryFn: () => apiData<Drill[]>("/drills"),
    staleTime: 30_000,
  });
}

export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: () => apiData<Invoice[]>(`/invoices?academy_id=${getAcademyId()}`),
    staleTime: 30_000,
    enabled: !!getAcademyId(),
  });
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => apiData<DashboardSummary>("/dashboard/summary"),
    staleTime: 30_000,
  });
}

/* ── Mutations ── */
export function useCreateAthlete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Athlete>) => api<{ data: Athlete }>("/athletes", {
      method: "POST",
      body: JSON.stringify({ academy_id: getAcademyId(), ...input }),
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["athletes"] }),
  });
}

export function useUpdateAthlete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<Athlete> & { id: string }) =>
      api<{ data: Athlete }>(`/athletes/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["athletes"] }),
  });
}

export function useDeleteAthlete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<{ ok: boolean }>(`/athletes/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["athletes"] }),
  });
}

/* ═══════════ FASE 2 ═══════════ */

export interface Schedule {
  id: string;
  academy_id: string;
  day: number;
  time: string;
  title: string;
  team: string | null;
  type: "training" | "match" | "meeting";
  venue: string | null;
}

export interface ProgressPoint {
  id: string;
  athlete_id: string;
  recorded_at: string;
  overall: number;
  skills: Record<string, number>;
  note: string | null;
}

export interface ProgressTrend {
  trend: { date: string; overall: number }[];
  latest: { date: string; overall: number } | null;
  delta: number;
}

export interface CoachFeedback {
  id: string;
  athlete_id: string;
  coach_id: string;
  topic: string;
  content: string;
  score: number;
  created_at: string;
  athletes?: { name: string } | null;
  profiles?: { full_name: string | null } | null;
}

export interface MatchStat {
  id: string;
  athlete_id: string;
  match_date: string;
  opponent: string | null;
  min: number;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  to: number;
  foul: number;
  fouls_drawn: number;
  fgm: number;
  fga: number;
  ftm: number;
  fta: number;
  pir: number;
  athletes?: { name: string } | null;
}

export interface MatchSummary {
  games: number;
  avg_pts: number;
  avg_pir: number;
  avg_reb: number;
  avg_ast: number;
  best_game: { opponent: string | null; date: string; pir: number; pts: number } | null;
  trend: { date: string; pir: number; pts: number }[];
}

export interface Assessment {
  id: string;
  athlete_id: string;
  period: string;
  status: "Draft" | "Reviewed" | "Published";
  scores: Record<string, number>;
  previous_scores: Record<string, number>;
  recommendations: string[];
  coach_note: string | null;
  avg?: number;
  previous_avg?: number;
  delta?: number;
  athletes?: { name: string; team: string | null } | null;
}

export interface Session {
  id: string;
  program_id: string | null;
  title: string;
  session_date: string;
  focus: string | null;
  blocks: Record<string, unknown>[];
  programs?: { title: string } | null;
}

export interface Evaluation {
  id: string;
  athlete_id: string;
  coach_id: string;
  session_date: string;
  passing: number;
  dribbling: number;
  shooting: number;
  stamina: number;
  teamwork: number;
  attitude: number;
  note: string | null;
}

export interface AttendanceRecord {
  id: string;
  athlete_id: string;
  session_date: string;
  status: "present" | "absent" | "late" | "excused";
  note: string | null;
}

/* ── Queries fase 2 ── */
export function useSchedules() {
  return useQuery({
    queryKey: ["schedules"],
    queryFn: () => apiData<Schedule[]>(`/schedules?academy_id=${getAcademyId()}`),
    staleTime: 30_000,
    enabled: !!getAcademyId(),
  });
}

export function useProgress(athleteId: string) {
  return useQuery({
    queryKey: ["progress", athleteId],
    queryFn: () => apiData<ProgressPoint[]>(`/progress?athlete_id=${athleteId}`),
    staleTime: 30_000,
    enabled: !!athleteId,
  });
}

export function useProgressTrend(athleteId: string) {
  return useQuery({
    queryKey: ["progress-trend", athleteId],
    queryFn: () => apiData<ProgressTrend>(`/progress/${athleteId}/trend`),
    staleTime: 30_000,
    enabled: !!athleteId,
  });
}

export function useCoachFeedback(athleteId: string) {
  return useQuery({
    queryKey: ["coach-feedback", athleteId],
    queryFn: () => apiData<CoachFeedback[]>(`/coach-feedback?athlete_id=${athleteId}`),
    staleTime: 30_000,
    enabled: !!athleteId,
  });
}

export function useMatchStats(athleteId: string) {
  return useQuery({
    queryKey: ["match-stats", athleteId],
    queryFn: () => apiData<MatchStat[]>(`/match-stats?athlete_id=${athleteId}`),
    staleTime: 30_000,
    enabled: !!athleteId,
  });
}

export function useMatchSummary(athleteId: string) {
  return useQuery({
    queryKey: ["match-summary", athleteId],
    queryFn: () => apiData<MatchSummary>(`/match-stats/${athleteId}/summary`),
    staleTime: 30_000,
    enabled: !!athleteId,
  });
}

export function useAssessments(athleteId: string) {
  return useQuery({
    queryKey: ["assessments", athleteId],
    queryFn: () => apiData<Assessment[]>(`/assessments?athlete_id=${athleteId}`),
    staleTime: 30_000,
    enabled: !!athleteId,
  });
}

export function useSessions(programId?: string) {
  return useQuery({
    queryKey: ["sessions", programId ?? "all"],
    queryFn: () => apiData<Session[]>(programId ? `/sessions?program_id=${programId}` : "/sessions"),
    staleTime: 30_000,
  });
}

export function useEvaluations(athleteId: string) {
  return useQuery({
    queryKey: ["evaluations", athleteId],
    queryFn: () => apiData<Evaluation[]>(`/evaluations?athlete_id=${athleteId}`),
    staleTime: 30_000,
    enabled: !!athleteId,
  });
}

export function useAttendance(athleteId: string, month: string) {
  return useQuery({
    queryKey: ["attendance", athleteId, month],
    queryFn: () => apiData<AttendanceRecord[]>(`/attendance?athlete_id=${athleteId}&month=${month}`),
    staleTime: 30_000,
    enabled: !!athleteId,
  });
}

/* ── Mutations fase 2 ── */
export function useCreateSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Schedule>) => api<{ data: Schedule }>("/schedules", {
      method: "POST",
      body: JSON.stringify({ academy_id: getAcademyId(), ...input }),
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["schedules"] }),
  });
}

export function useCreateProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { athlete_id: string; overall: number; skills?: Record<string, number>; note?: string }) =>
      api<{ data: ProgressPoint }>("/progress", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["progress"] }),
  });
}

export function useCreateFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { athlete_id: string; coach_id: string; topic: string; content: string; score: number }) =>
      api<{ data: CoachFeedback }>("/coach-feedback", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coach-feedback"] }),
  });
}

export function useCreateMatchStat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<MatchStat>) => api<{ data: MatchStat }>("/match-stats", {
      method: "POST",
      body: JSON.stringify(input),
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["match-stats"] }),
  });
}

export function useCreateAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Assessment>) => api<{ data: Assessment }>("/assessments", {
      method: "POST",
      body: JSON.stringify(input),
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assessments"] }),
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Session>) => api<{ data: Session }>("/sessions", {
      method: "POST",
      body: JSON.stringify(input),
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
}

/* ═══════════ SUPERADMIN / ADMIN PANEL ═══════════ */

export interface RoleInfo {
  role: string;
  label: string;
  description: string | null;
  is_system: boolean;
  permissions: string[];
}

export interface PermissionInfo {
  code: string;
  label: string;
}

export interface MenuItemInput {
  label: string;
  icon: string;
  path: string;
  sort_order: number;
}

export interface AdminUser {
  id: string;
  full_name: string;
  role: string;
  academy_id: string | null;
  created_at: string;
}

export function useAdminRoles() {
  return useQuery({
    queryKey: ["admin-roles"],
    queryFn: () => apiData<{ roles: RoleInfo[]; permissions: PermissionInfo[] }>("/admin/roles"),
    staleTime: 30_000,
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: () => apiData<AdminUser[]>("/admin/users"),
    staleTime: 30_000,
  });
}

export function useUpdateRolePermissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ role, permissions, label, description }: { role: string; permissions: string[]; label?: string; description?: string | null }) =>
      api<{ data: RoleInfo }>(`/admin/roles/${role}`, {
        method: "PUT",
        body: JSON.stringify({ role, permissions, label, description }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-roles"] }),
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { role: string; label: string; description?: string | null; permissions: string[]; menus?: MenuItemInput[] }) =>
      api<{ data: RoleInfo }>("/admin/roles", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-roles"] }),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (role: string) => api<{ ok: boolean }>(`/admin/roles/${role}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-roles"] }),
  });
}

export function useAssignUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      api<{ data: { user_id: string; role: string } }>(`/admin/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ role }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
}

export function useCreateAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; password: string; full_name: string; role: string }) =>
      api<{ data: AdminUser }>("/admin/users", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
}

export function useDeleteAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api<{ ok: boolean }>(`/admin/users/${userId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
}
