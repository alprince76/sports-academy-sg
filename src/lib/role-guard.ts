import type { Role } from "./role";

/**
 * Pemetaan halaman → role yang diizinkan (defense-in-depth / kunci UI).
 * Data tetap diamankan backend; ini mencegah user membuka halaman kosong
 * yang bukan hak rol-nya. Path tanpa entry = semua role login boleh.
 */
export const ROUTE_ROLE_GUARD: Record<string, Role[]> = {
  // Admin & user management — khusus owner/admin (+superadmin via backend)
  "/role-management": ["superadmin", "owner", "admin"],
  "/user-management": ["superadmin", "owner", "admin"],

  // Payments — admin backbone (coach/parent read saja)
  "/payments": ["superadmin", "owner", "admin", "coach", "parent"],
};

/** Ambil entry guard yang paling spesifik utk suatu pathname. */
export function guardForPath(pathname: string): { roles: Role[] } | null {
  // cocokkan lewat prefix terpanjang
  const sorted = Object.keys(ROUTE_ROLE_GUARD).sort((a, b) => b.length - a.length);
  for (const p of sorted) {
    if (pathname === p || pathname.startsWith(p + "/")) {
      return { roles: ROUTE_ROLE_GUARD[p] };
    }
  }
  return null;
}

export function canAccess(pathname: string, role: Role | null): boolean {
  if (!role) return false;
  const guard = guardForPath(pathname);
  if (!guard) return true; // tanpa entry = semua login boleh
  return guard.roles.includes(role);
}
