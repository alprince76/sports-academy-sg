export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8081";

/** Key session yang ditulis login melalui backend (useAuth). */
const SESSION_KEY = "sportacademy.session";

/**
 * Ambil access token dari localStorage (di-set oleh login via backend).
 * FE TIDAK menghubungi Supabase langsung — token semata disimpan di sini.
 */
export function getAuthToken(): string | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.access_token ?? null;
  } catch {
    return null;
  }
}

/** Simpan session (dipakai login backend & manajemen sesi). */
export function setAuthToken(accessToken: string, refreshToken: string, meta?: Record<string, unknown>) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ access_token: accessToken, refresh_token: refreshToken, ...meta }));
}
export function getRefreshToken(): string | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.refresh_token ?? null;
  } catch {
    return null;
  }
}

export function clearAuthToken() {
  localStorage.removeItem(SESSION_KEY);
}

/** Ambil user_id dari session (localStorage di-set login via backend). */
export function getUserIdFromSession(): string | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.user_id ?? parsed?.user?.id ?? null;
  } catch {
    return null;
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface ApiOptions extends RequestInit {
  auth?: boolean;
}

let refreshing: Promise<boolean> | null = null;

/** Refresh access token via backend (POST /auth/refresh). Tunggu single-flight. */
export async function refreshAuthToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  if (refreshing) return refreshing;
  refreshing = (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) return false;
      const json = await res.json();
      const d = json?.data;
      if (!d?.access_token || !d?.refresh_token) return false;
      // pertahankan meta user (user_id/email) yang sudah tersimpan
      const prev = (() => { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "{}"); } catch { return {}; } })();
      setAuthToken(d.access_token, d.refresh_token, { user_id: prev?.user_id, email: prev?.email });
      return true;
    } catch {
      return false;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

/**
 * Fetch wrapper ke backend Hono. Default: attach Bearer token (dari localStorage,
 * bukan dari Supabase). Auto-refresh saat 401 (sekali retry). Throw ApiError untuk caller.
 */
export async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { auth = true, headers, ...rest } = options;

  const h = new Headers(headers);
  h.set("Content-Type", "application/json");
  if (auth) {
    const token = getAuthToken();
    if (token) h.set("Authorization", `Bearer ${token}`);
  }

  let res = await fetch(`${API_URL}${path}`, { ...rest, headers: h });

  // Auto-refresh sekali saat 401 (token kedaluwarsa) — kecuali untuk endpoint auth itu sendiri
  if (res.status === 401 && auth && !path.startsWith("/auth/log")) {
    const ok = await refreshAuthToken();
    if (ok) {
      const fresh = getAuthToken();
      if (fresh) {
        const h2 = new Headers(headers);
        h2.set("Content-Type", "application/json");
        if (auth) h2.set("Authorization", `Bearer ${fresh}`);
        res = await fetch(`${API_URL}${path}`, { ...rest, headers: h2 });
      }
    }
  }

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
      if (body?.issues?.length) msg = `${msg}: ${body.issues.map((i: any) => i.message).join(", ")}`;
    } catch { /* non-JSON */ }
    throw new ApiError(msg, res.status);
  }

  const body = await res.json();
  return body as T;
}

/** Response shape backend: { data: T } — unwrap sekali di sini. */
export async function apiData<T = unknown>(path: string, options?: ApiOptions): Promise<T> {
  const r = await api<{ data: T }>(path, options);
  return r?.data;
}
