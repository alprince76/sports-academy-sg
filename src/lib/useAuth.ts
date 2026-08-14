import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { apiData } from "@/lib/api";
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

/**
 * Auth asli via Supabase (local stack di dev).
 * Setelah login, ambil role + academy dari backend /auth/me lalu simpan
 * ke localStorage dengan key yang SAMA dengan role.tsx — jadi seluruh app
 * (DashboardLayout, halaman) tetap berfungsi tanpa rombak total.
 */
export function useAuth() {
  const [session, setSession] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<MeResponse | null>(null);

  const refreshMe = useCallback(async () => {
    try {
      const data = await apiData<MeResponse>("/auth/me");
      setMe(data);
      if (data.role) localStorage.setItem(ROLE_KEY, data.role);
      if (data.academy_id) localStorage.setItem(ACADEMY_KEY, data.academy_id);
      if (data.profile?.full_name) localStorage.setItem(USER_KEY, data.profile.full_name);
    } catch (e) {
      console.warn("[auth] /auth/me gagal:", e);
      // fallback: session ada tapi role belum di-assign di DB
      setMe(null);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(!!data.session);
      setLoading(false);
      if (data.session) refreshMe();
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_ev, sess) => {
      setSession(!!sess);
      if (sess) refreshMe();
      else {
        setMe(null);
        localStorage.removeItem(ROLE_KEY);
        localStorage.removeItem(ACADEMY_KEY);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [refreshMe]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await refreshMe();
  }, [refreshMe]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(ACADEMY_KEY);
    localStorage.removeItem(USER_KEY);
    // hapus cache menu semua role
    for (const r of ["owner", "admin", "coach", "parent"]) {
      localStorage.removeItem(`sportacademy.menus.${r}`);
    }
  }, []);

  return { session, loading, me, signIn, signOut, refreshMe };
}
