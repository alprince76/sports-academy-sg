import { useSyncExternalStore } from "react";

export type Role = "superadmin" | "owner" | "admin" | "coach" | "parent";

export const ROLE_USERS: Record<Role, { name: string; title: string; initials: string }> = {
  superadmin: { name: "Super Admin", title: "Super Administrator", initials: "SA" },
  owner: { name: "Budi Santoso", title: "Academy Owner", initials: "BS" },
  admin: { name: "Sarah Wijaya", title: "Academy Admin", initials: "SW" },
  coach: { name: "Coach Rangga", title: "Head Coach", initials: "CR" },
  parent: { name: "Andi Setiawan", title: "Parent of Aldi", initials: "AS" },
};

export const ROLE_LABEL: Record<Role, string> = {
  superadmin: "Super Admin",
  owner: "Academy Owner",
  admin: "Academy Admin",
  coach: "Coach",
  parent: "Parent",
};

const KEY = "sportacademy.role";
const EVT = "sportacademy:role-change";

export function getRole(): Role | null {
  if (typeof window === "undefined") return null;
  const r = window.localStorage.getItem(KEY) as Role | null;
  return r && r in ROLE_USERS ? r : null;
}

export function setRole(role: Role) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, role);
  window.dispatchEvent(new Event(EVT));
}

export function clearRole() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useRole(): Role {
  const role = useSyncExternalStore<Role>(
    subscribe,
    () => (getRole() ?? "admin") as Role,
    () => "admin" as Role
  );
  return role;
}
