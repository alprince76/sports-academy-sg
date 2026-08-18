import { useEffect, useState, useCallback } from "react";
import { apiData, getAuthToken, setAuthToken, clearAuthToken, API_URL } from "@/lib/api";
import type { Role } from "@/lib/role";

export interface MeResponse {
  id: string;
  role: Role;
  academy_id: string | null;
  permissions: string[];
  profile?: {
    full_name: string | null;
  } | null;
}

const ROLE_KEY = "sportacademy.role";
const ACADEMY_KEY = "sportacademy.academy";
const USER_KEY = "sportacademy.user";

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: { id: string; email: string };
  role: string | null;
  academy_id: string | null;
  full_name: string | null;
  permissions?: string[];
}

/**
 * Auth SEMUA via BACKEND — FE tidak pernah menyentuh Supabase langsung.
 * - login: POST /auth/login (backend sign-in, kembalikan token)
 * - token disimpan ke localStorage (key sportacademy.session) oleh setAuthToken
 * - /auth/me & /auth/menus dipanggil ke backend dgn Bearer dari localStorage
 */
export function useAuth() {
  const [session, setSession] = useState<boolean>(() => !!getAuthToken());
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<MeResponse | null>(null);

  const persistLocal = useCallback((role: string | null, academyId: string | null, fullName: string | null) => {
    if (role) localStorage.setItem(ROLE_KEY, role);
    if (academyId) localStorage.setItem(ACADEMY_KEY, academyId);
    if (fullName) localStorage.setItem(USER_KEY, fullName);
  }, []);

  const refreshMe = useCallback(async () => {
    try {
      const data = await apiData<MeResponse>("/auth/me");
      setMe(data);
      persistLocal(data.role, data.academy_id, data.profile?.full_name ?? null);
    } catch (e) {
      console.warn("[auth] /auth/me gagal:", e);
      setMe(null);
    }
  }, [persistLocal]);

  useEffect(() => {
    setLoading(false);
    if (getAuthToken()) refreshMe();
    // Tanpa onAuthStateChange — session dikelola manual via token localStorage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    // 1. login lewat BACKEND
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error ?? "Login gagal");
    const data: LoginResponse = json.data;

    // 2. simpan token ke localStorage (API baca dari sini)
    setAuthToken(data.access_token, data.refresh_token, { user_id: data.user.id, email: data.user.email });

    // 3. simpan role/academy secara lokal (langsung dari backend login)
    persistLocal(data.role, data.academy_id, data.full_name);
    if (data.permissions?.length) {
      localStorage.setItem("sportacademy.permissions", JSON.stringify(data.permissions));
    }

    setSession(true);

    // 4. refresh /auth/me untuk profil & permissions lengkap
    await refreshMe();
  }, [persistLocal, refreshMe]);

  const signOut = useCallback(async () => {
    clearAuthToken();
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(ACADEMY_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("sportacademy.permissions");
    for (const r of ["owner", "admin", "coach", "parent"]) {
      localStorage.removeItem(`sportacademy.menus.${r}`);
    }
    setSession(false);
    setMe(null);
  }, []);

  return { session, loading, me, signIn, signOut, refreshMe };
}
