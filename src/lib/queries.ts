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
