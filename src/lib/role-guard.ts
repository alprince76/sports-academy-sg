import type { Role } from "./role";

/**
 * Pemetaan halaman → role yang diizinkan (defense-in-depth / kunci UI).
 * Data tetap diamankan backend (requirePermission); guard ini mencegah user
 * membuka halaman yang tidak punya permission READ utk resource-nya.
 *
 * Diambil dari tabel role_permissions (permission .read):
 *   admin & superadmin & owner  → semua resource
 *   coach → assessment,athletes,attendance,coaches,dashboard,drills,evaluations,
 *           feedback,insights,match,my_athletes,programs,progress,schedule,sessions,teams
 *           (BUKAN payments,reports,revenue,roles,users,child)
 *   parent → attendance,child,dashboard,evaluations,feedback,match,payments,
 *            progress,revenue,schedule
 *
 * Path tanpa entry = semua role yang sudah login boleh (sesuai READ seluruh role).
 */
export const ROUTE_ROLE_GUARD: Record<string, Role[]> = {
  // Admin / user / settings — superadmin/owner/admin saja
  "/role-management": ["superadmin", "owner", "admin"],
  "/user-management": ["superadmin", "owner", "admin"],

  // Reports — superadmin/owner/admin (coach & parent tidak punya reports.read)
  "/reports": ["superadmin", "owner", "admin"],

  // Payments — punya payments.read: superadmin/owner/admin/parent (BUKAN coach)
  "/payments": ["superadmin", "owner", "admin", "parent"],

  // Coach pages — punya resource.read utk coach (parent tidak punya)
  "/teams": ["superadmin", "owner", "admin", "coach"],
  "/drills": ["superadmin", "owner", "admin", "coach"],
  "/programs": ["superadmin", "owner", "admin", "coach"],
  "/training": ["superadmin", "owner", "admin", "coach"],
  "/assessment": ["superadmin", "owner", "admin", "coach"],
  "/athletes": ["superadmin", "owner", "admin", "coach"],
  "/coach-feedback": ["superadmin", "owner", "admin", "coach", "parent"],
  "/insights": ["superadmin", "owner", "admin", "coach"],
  "/my-athletes": ["superadmin", "owner", "admin", "coach"],
};

/** Ambil entry guard yang paling spesifik utk suatu pathname (prefix terpanjang). */
export function guardForPath(pathname: string): { roles: Role[] } | null {
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
  if (!guard) return true; // tanpa entry = semua role login boleh
  return guard.roles.includes(role);
}
