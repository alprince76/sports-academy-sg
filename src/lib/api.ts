import { supabase } from "@/integrations/supabase/client";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8081";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Ambil access token Supabase (dari session aktif). */
async function getToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

interface ApiOptions extends RequestInit {
  auth?: boolean;
}

/**
 * Fetch wrapper ke backend Hono. Default: attach Bearer token Supabase.
 * Throw ApiError dengan status untuk di-handle caller.
 */
export async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { auth = true, headers, ...rest } = options;

  const h = new Headers(headers);
  h.set("Content-Type", "application/json");
  if (auth) {
    const token = await getToken();
    if (token) h.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${path}`, { ...rest, headers: h });

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
