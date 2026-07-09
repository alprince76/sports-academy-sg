export type HealthStatus = "Healthy" | "Minor Injury" | "Recovery" | "Not Available";

export type Athlete = {
  id: string;
  name: string;
  age: number;
  ageGroup: string;
  position: string;
  team: string;
  progress: number;
  attendance: number;
  status: "Great" | "Good" | "Needs Focus";
  note: string;
  parent: { name: string; phone: string };
  skills: { name: string; value: number }[];
  achievements: string[];
  health: {
    status: HealthStatus;
    note?: string;
    updatedAt: string;
    expectedReturn?: string;
  };
};

export const ATHLETES: Athlete[] = [
  {
    id: "1", name: "Rafi Pratama", age: 12, ageGroup: "KU-12", position: "Shooting Guard", team: "Garuda Elite",
    progress: 86, attendance: 94, status: "Great",
    note: "Jump shot semakin konsisten, perlu kerja pada off-ball movement dan closeout defense.",
    parent: { name: "Bp. Andi Pratama", phone: "+62 812-1111-1111" },
    skills: [
      { name: "Shooting", value: 90 }, { name: "Ball Handling", value: 82 },
      { name: "Defense", value: 74 }, { name: "Athleticism", value: 84 },
    ],
    achievements: ["Top Scorer KU-12 League", "MVP Friendly Cup"],
    health: { status: "Healthy", updatedAt: "3 Jun 2026" },
  },
  {
    id: "2", name: "Dimas Saputra", age: 11, ageGroup: "KU-12", position: "Point Guard", team: "Garuda Elite",
    progress: 78, attendance: 88, status: "Good",
    note: "Court vision di atas rata-rata, perlu peningkatan finishing di paint dan pull-up jumper.",
    parent: { name: "Ibu Siti Rahayu", phone: "+62 812-2222-2222" },
    skills: [
      { name: "Ball Handling", value: 88 }, { name: "Basketball IQ", value: 84 },
      { name: "Shooting", value: 70 }, { name: "Athleticism", value: 76 },
    ],
    achievements: ["Best Playmaker KU-12"],
    health: { status: "Minor Injury", note: "Ankle sprain ringan (grade 1) saat scrimmage", updatedAt: "2 Jun 2026", expectedReturn: "10 Jun 2026" },
  },
  {
    id: "3", name: "Aldi Setiawan", age: 13, ageGroup: "KU-14", position: "Power Forward", team: "Falcons Blue",
    progress: 91, attendance: 96, status: "Great",
    note: "Leader di post, rebounding & rim protection sangat baik. Perlu tambah range shot.",
    parent: { name: "Bp. Hendro Setiawan", phone: "+62 812-3333-3333" },
    skills: [
      { name: "Defense", value: 94 }, { name: "Athleticism", value: 90 },
      { name: "Teamwork", value: 92 }, { name: "Shooting", value: 72 },
    ],
    achievements: ["Captain KU-14", "Iron Wall Award"],
    health: { status: "Healthy", updatedAt: "3 Jun 2026" },
  },
  {
    id: "4", name: "Bagas Kurniawan", age: 10, ageGroup: "KU-10", position: "Center", team: "Young Warriors",
    progress: 72, attendance: 82, status: "Good",
    note: "Frame besar, footwork post masih perlu drill. Free throw perlu latihan rutin.",
    parent: { name: "Ibu Lestari", phone: "+62 812-4444-4444" },
    skills: [
      { name: "Athleticism", value: 78 }, { name: "Defense", value: 70 },
      { name: "Shooting", value: 60 }, { name: "Teamwork", value: 74 },
    ],
    achievements: ["Best Rebounder of the Month"],
    health: { status: "Recovery", note: "Kembali dari knee tendinitis, load management aktif", updatedAt: "1 Jun 2026", expectedReturn: "15 Jun 2026" },
  },
  {
    id: "5", name: "Reza Maulana", age: 13, ageGroup: "KU-14", position: "Small Forward", team: "Falcons Blue",
    progress: 88, attendance: 93, status: "Great",
    note: "Slasher explosive, finishing tangan kiri perlu diasah. Defensive rotation makin bagus.",
    parent: { name: "Bp. Maulana", phone: "+62 812-5555-5555" },
    skills: [
      { name: "Athleticism", value: 92 }, { name: "Ball Handling", value: 84 },
      { name: "Shooting", value: 82 }, { name: "Defense", value: 80 },
    ],
    achievements: ["Top Assist KU-14"],
    health: { status: "Healthy", updatedAt: "3 Jun 2026" },
  },
  {
    id: "6", name: "Fajar Nugroho", age: 11, ageGroup: "KU-12", position: "Shooting Guard", team: "Phoenix Academy",
    progress: 68, attendance: 74, status: "Needs Focus",
    note: "Attendance menurun, effort inkonsisten. Butuh sesi 1-on-1 dan komitmen dari orang tua.",
    parent: { name: "Ibu Wulan", phone: "+62 812-6666-6666" },
    skills: [
      { name: "Shooting", value: 70 }, { name: "Ball Handling", value: 65 },
      { name: "Defense", value: 58 }, { name: "Basketball IQ", value: 62 },
    ],
    achievements: [],
    health: { status: "Not Available", note: "Izin akademik 2 minggu", updatedAt: "28 Mei 2026", expectedReturn: "12 Jun 2026" },
  },
  {
    id: "7", name: "Iqbal Hakim", age: 14, ageGroup: "KU-14", position: "Point Guard", team: "Falcons Blue",
    progress: 84, attendance: 91, status: "Great",
    note: "Combo guard modern, pick-and-roll reads bagus. Perlu turunkan turnover rate.",
    parent: { name: "Bp. Hakim", phone: "+62 812-7777-7777" },
    skills: [
      { name: "Basketball IQ", value: 88 }, { name: "Ball Handling", value: 90 },
      { name: "Shooting", value: 80 }, { name: "Teamwork", value: 86 },
    ],
    achievements: ["Best Floor General KU-14"],
    health: { status: "Healthy", updatedAt: "3 Jun 2026" },
  },
  {
    id: "8", name: "Yoga Pratama", age: 10, ageGroup: "KU-10", position: "Small Forward", team: "Young Warriors",
    progress: 75, attendance: 86, status: "Good",
    note: "Berbakat, learning speed tinggi. Disiplin help defense perlu dibangun.",
    parent: { name: "Ibu Maya", phone: "+62 812-8888-8888" },
    skills: [
      { name: "Athleticism", value: 82 }, { name: "Shooting", value: 76 },
      { name: "Ball Handling", value: 74 }, { name: "Basketball IQ", value: 70 },
    ],
    achievements: ["Rookie of the Month"],
    health: { status: "Healthy", updatedAt: "3 Jun 2026" },
  },
];

export const TEAMS = ["Garuda Elite", "Falcons Blue", "Young Warriors", "Phoenix Academy"] as const;
export const AGE_GROUPS = ["KU-8", "KU-10", "KU-12", "KU-14", "KU-16", "KU-18"] as const;
export const POSITIONS = ["Point Guard", "Shooting Guard", "Small Forward", "Power Forward", "Center"] as const;

export const HEALTH_STATUSES: HealthStatus[] = ["Healthy", "Minor Injury", "Recovery", "Not Available"];

export function healthStatusColor(s: HealthStatus) {
  if (s === "Healthy") return "bg-primary-soft text-primary";
  if (s === "Minor Injury") return "bg-amber-100 text-amber-800";
  if (s === "Recovery") return "bg-blue-100 text-blue-800";
  return "bg-red-100 text-red-700";
}

export function getInjurySummary(athletes: Athlete[] = ATHLETES) {
  const counts: Record<HealthStatus, number> = {
    Healthy: 0, "Minor Injury": 0, Recovery: 0, "Not Available": 0,
  };
  for (const a of athletes) counts[a.health.status]++;
  const total = athletes.length;
  const availabilityRate = total === 0 ? 0 : Math.round((counts.Healthy / total) * 100);
  return { counts, total, availabilityRate };
}
