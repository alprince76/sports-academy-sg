// Ops demo seed — coaches, sessions, payments, schedule, feedback.
// Presentation-only; mutations stay toast-only (no persistence).

import { TEAMS } from "@/lib/demo-data";

export type Coach = {
  id: string;
  name: string;
  role: string;
  teams: string;
  athletes: number;
  rating: number;
  phone: string;
  email: string;
};

export type TrainingSession = {
  id: string;
  title: string;
  coach: string;
  team: string;
  date: string;
  time: string;
  attendees: number;
  category: string;
};

export type Payment = {
  id: string;
  athlete: string;
  team: string;
  plan: string;
  amount: string;
  status: "Lunas" | "Tertunda" | "Overdue";
  date: string;
};

export type ScheduleEvent = {
  day: number;
  time: string;
  title: string;
  team: string;
  type: "training" | "match" | "meeting";
  venue: string;
};

export type CoachFeedbackItem = {
  d: string;
  c: string;
  topic: string;
  n: string;
  score: number;
};

export const COACH_ROLES = [
  "Head Coach",
  "Assistant Coach",
  "Skills Coach",
  "Strength & Conditioning",
  "Youth Development",
] as const;

export const SESSION_CATEGORIES = [
  "Technical",
  "Physical",
  "Tactical",
  "Match",
  "Specialist",
] as const;

export const PAYMENT_PLANS = ["Bulanan", "Trimester", "Semester", "Tahunan"] as const;

export const COACHES: Coach[] = [
  {
    id: "c1",
    name: "Coach Rangga",
    role: "Head Coach",
    teams: "Young Warriors, Garuda Elite",
    athletes: 32,
    rating: 4.9,
    phone: "+62 812-1010-0001",
    email: "rangga@garudaelite.id",
  },
  {
    id: "c2",
    name: "Coach Bayu",
    role: "Skills Coach",
    teams: "Garuda Elite",
    athletes: 18,
    rating: 4.8,
    phone: "+62 812-1010-0002",
    email: "bayu@garudaelite.id",
  },
  {
    id: "c3",
    name: "Coach Andre",
    role: "Strength & Conditioning",
    teams: "Falcons Blue",
    athletes: 16,
    rating: 4.7,
    phone: "+62 812-1010-0003",
    email: "andre@garudaelite.id",
  },
  {
    id: "c4",
    name: "Coach Dito",
    role: "Skills Coach",
    teams: "Phoenix Academy",
    athletes: 12,
    rating: 4.9,
    phone: "+62 812-1010-0004",
    email: "dito@garudaelite.id",
  },
  {
    id: "c5",
    name: "Coach Maya",
    role: "Youth Development",
    teams: "Young Warriors",
    athletes: 14,
    rating: 4.8,
    phone: "+62 812-1010-0005",
    email: "maya@garudaelite.id",
  },
  {
    id: "c6",
    name: "Coach Yoga",
    role: "Assistant Coach",
    teams: "Falcons Blue",
    athletes: 16,
    rating: 4.6,
    phone: "+62 812-1010-0006",
    email: "yoga@garudaelite.id",
  },
];

export const SESSIONS: TrainingSession[] = [
  {
    id: "1",
    title: "Ball Handling & Form Shooting — Garuda Elite",
    coach: "Coach Bayu",
    team: "Garuda Elite",
    date: "Hari ini",
    time: "16:00 - 18:00",
    attendees: 18,
    category: "Technical",
  },
  {
    id: "2",
    title: "Conditioning & Footwork — Falcons Blue",
    coach: "Coach Andre",
    team: "Falcons Blue",
    date: "Hari ini",
    time: "17:30 - 19:00",
    attendees: 16,
    category: "Physical",
  },
  {
    id: "3",
    title: "Friendly Match vs Pelita Hoops",
    coach: "All Teams",
    team: "Garuda Elite / Falcons Blue",
    date: "Besok",
    time: "09:00 - 11:00",
    attendees: 32,
    category: "Match",
  },
  {
    id: "4",
    title: "Game Situational — Young Warriors",
    coach: "Coach Rangga",
    team: "Young Warriors",
    date: "Rabu",
    time: "16:00 - 17:30",
    attendees: 14,
    category: "Tactical",
  },
  {
    id: "5",
    title: "Shooting Form Lab — Phoenix Academy",
    coach: "Coach Dito",
    team: "Phoenix Academy",
    date: "Kamis",
    time: "15:30 - 17:00",
    attendees: 6,
    category: "Specialist",
  },
];

export const PAYMENTS: Payment[] = [
  { id: "INV-1001", athlete: "Rafi Pratama", team: "Garuda Elite", plan: "Bulanan", amount: "Rp 450.000", status: "Lunas", date: "1 Jun 2026" },
  { id: "INV-1002", athlete: "Dimas Saputra", team: "Garuda Elite", plan: "Bulanan", amount: "Rp 450.000", status: "Lunas", date: "2 Jun 2026" },
  { id: "INV-1003", athlete: "Aldi Setiawan", team: "Falcons Blue", plan: "Bulanan", amount: "Rp 500.000", status: "Tertunda", date: "5 Jun 2026" },
  { id: "INV-1004", athlete: "Bagas Kurniawan", team: "Young Warriors", plan: "Bulanan", amount: "Rp 400.000", status: "Lunas", date: "3 Jun 2026" },
  { id: "INV-1005", athlete: "Reza Maulana", team: "Falcons Blue", plan: "Trimester", amount: "Rp 1.350.000", status: "Lunas", date: "1 Jun 2026" },
  { id: "INV-1006", athlete: "Fajar Nugroho", team: "Phoenix Academy", plan: "Bulanan", amount: "Rp 450.000", status: "Overdue", date: "25 Mei 2026" },
  { id: "INV-1007", athlete: "Iqbal Hakim", team: "Falcons Blue", plan: "Bulanan", amount: "Rp 500.000", status: "Lunas", date: "2 Jun 2026" },
  { id: "INV-1008", athlete: "Yoga Pratama", team: "Young Warriors", plan: "Bulanan", amount: "Rp 400.000", status: "Tertunda", date: "6 Jun 2026" },
];

export const SCHEDULE_EVENTS: ScheduleEvent[] = [
  { day: 1, time: "16:00", title: "Latihan Garuda Elite", team: "Garuda Elite", type: "training", venue: "Court A" },
  { day: 1, time: "17:30", title: "Latihan Falcons Blue", team: "Falcons Blue", type: "training", venue: "Court B" },
  { day: 2, time: "09:00", title: "Match vs Pelita Hoops", team: "Garuda Elite / Falcons Blue", type: "match", venue: "Indoor Arena" },
  { day: 3, time: "16:00", title: "Latihan Young Warriors", team: "Young Warriors", type: "training", venue: "Court A" },
  { day: 4, time: "15:30", title: "Shooting Form Lab", team: "Phoenix Academy", type: "training", venue: "Court C" },
  { day: 5, time: "19:00", title: "Coach Meeting", team: "Staff", type: "meeting", venue: "Ruang Klub" },
  { day: 6, time: "08:00", title: "Open Training", team: "All", type: "training", venue: "Court A" },
];

/** Parent demo child: Aldi Setiawan (id "3") */
export const PARENT_CHILD_NAME = "Aldi Setiawan";

export const PARENT_FEEDBACK: CoachFeedbackItem[] = [
  {
    d: "3 Jun 2026",
    c: "Coach Rangga",
    topic: "Evaluasi Latihan",
    n: "Aldi menunjukkan kepemimpinan kuat di paint. Komunikasi help-side defense dan box-out terus meningkat. Pertahankan!",
    score: 91,
  },
  {
    d: "1 Jun 2026",
    c: "Coach Rangga",
    topic: "Skill Update",
    n: "Rebounding & rim protection sangat baik. Mulai latihan mid-range jumper agar skor lebih bervariasi dari low post.",
    score: 89,
  },
  {
    d: "29 Mei 2026",
    c: "Coach Andre",
    topic: "Kondisi Fisik",
    n: "Vertical leap dan lateral quickness naik. Recovery setelah scrimmage lebih cepat dibanding bulan lalu.",
    score: 88,
  },
  {
    d: "27 Mei 2026",
    c: "Coach Rangga",
    topic: "Match Report",
    n: "Tampil sebagai best defender vs Pelita Hoops. +8 rebound dan solid rim protection sepanjang 28 menit.",
    score: 92,
  },
];

export const PARENT_ATTENDANCE = [
  { d: "10 Jun 2026", t: "Latihan Falcons Blue", s: "Hadir" as const },
  { d: "8 Jun 2026", t: "Latihan Falcons Blue", s: "Hadir" as const },
  { d: "5 Jun 2026", t: "Match vs Pelita Hoops", s: "Hadir" as const },
  { d: "3 Jun 2026", t: "Latihan Falcons Blue", s: "Izin" as const },
  { d: "1 Jun 2026", t: "Latihan Falcons Blue", s: "Hadir" as const },
];
