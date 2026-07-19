import { ATHLETES } from "./demo-data";

export const SKILL_CATEGORIES = [
  "Shooting",
  "Ball Handling",
  "Defense",
  "Athleticism",
  "Basketball IQ",
  "Teamwork",
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export const SKILL_SCALE = [
  { v: 1, label: "Beginner" },
  { v: 2, label: "Developing" },
  { v: 3, label: "Fairly Consistent" },
  { v: 4, label: "Good & Consistent" },
  { v: 5, label: "Advanced" },
];

export type AssessmentStatus = "Draft" | "Reviewed" | "Published";

export type PeriodicAssessment = {
  athleteId: string;
  athleteName: string;
  team: string;
  date: string;
  current: Record<SkillCategory, number>;
  previous: Record<SkillCategory, number>;
  recommendations: string[];
  coachNote: string;
  status: AssessmentStatus;
};

const mk = (
  s: number, b: number, d: number, a: number, iq: number, t: number,
): Record<SkillCategory, number> => ({
  Shooting: s,
  "Ball Handling": b,
  Defense: d,
  Athleticism: a,
  "Basketball IQ": iq,
  Teamwork: t,
});

export const PERIODIC_ASSESSMENTS: PeriodicAssessment[] = ATHLETES.map((a, i) => {
  const base = [
    mk(4, 4, 3, 4, 3, 4),
    mk(3, 4, 3, 3, 4, 4),
    mk(3, 3, 5, 4, 4, 5),
    mk(2, 3, 3, 3, 3, 4),
    mk(4, 5, 3, 5, 4, 4),
    mk(2, 3, 2, 3, 2, 3),
    mk(3, 3, 5, 4, 4, 4),
    mk(3, 4, 3, 4, 3, 3),
  ][i % 8];
  const prev = Object.fromEntries(
    Object.entries(base).map(([k, v]) => [k, Math.max(1, v - (i % 2 === 0 ? 1 : 0))])
  ) as Record<SkillCategory, number>;
  return {
    athleteId: a.id,
    athleteName: a.name,
    team: a.team,
    date: "1 Jun 2026",
    current: base,
    previous: prev,
    recommendations: [
      "Fokus latihan finishing tangan lemah 2x/minggu.",
      "Tambah drill defensive slide 10 menit per sesi.",
      "Tingkatkan komunikasi saat transisi defense.",
    ],
    coachNote: a.note,
    status: i % 5 === 0 ? "Draft" : "Final",
  };
});

export type MatchStat = {
  id: string;
  athleteId: string;
  athleteName: string;
  opponent: string;
  date: string;
  min: number;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  to: number;
  foul: number;
  foulsDrawn: number;
  fgm: number; fga: number;
  ftm: number; fta: number;
  pm: number;
};

export const MATCH_STATS: MatchStat[] = ATHLETES.slice(0, 6).map((a, i) => ({
  id: `m${i + 1}`,
  athleteId: a.id,
  athleteName: a.name,
  opponent: ["Pelita BC", "Garuda BC", "Citra Hoops", "Satria Muda Jr"][i % 4],
  date: ["3 Jun 2026", "27 Mei 2026", "20 Mei 2026", "13 Mei 2026"][i % 4],
  min: 22 + (i % 6),
  pts: 12 + (i * 3) % 18,
  reb: 4 + (i % 7),
  ast: 2 + (i % 5),
  stl: 1 + (i % 3),
  blk: i % 3,
  to: 2 + (i % 3),
  foul: 1 + (i % 4),
  foulsDrawn: 2 + (i % 3),
  fgm: 5 + (i % 4),
  fga: 10 + (i % 5),
  ftm: 2 + (i % 3),
  fta: 4 + (i % 3),
  pm: [-2, 5, 11, -4, 8, 3][i],
}));

export function calcPIR(s: MatchStat) {
  return (
    s.pts + s.reb + s.ast + s.stl + s.blk + s.foulsDrawn -
    (s.fga - s.fgm) - (s.fta - s.ftm) - s.to - s.foul
  );
}

/* ---------- Per-athlete session evaluation (basketball skill categories) ---------- */

export type SessionSkillEvaluation = Record<SkillCategory, number>;

export const DEFAULT_SESSION_EVAL: SessionSkillEvaluation = {
  Shooting: 3, "Ball Handling": 3, Defense: 3, Athleticism: 3, "Basketball IQ": 3, Teamwork: 3,
};

/* ---------- Evaluation timeline logs ---------- */

export type EvaluationLog = {
  id: string;
  athleteId: string;
  date: string;                  // ISO date
  dateLabel: string;             // display
  sessionTitle: string;
  coach: string;
  category: SkillCategory;
  score: number;                 // 1-5
  note: string;
};

const COACHES = ["Coach Bayu", "Coach Andre", "Coach Rangga", "Coach Dito"];

function seededScore(seed: number, min = 2, max = 5) {
  const r = Math.sin(seed) * 10000;
  const f = r - Math.floor(r);
  return Math.min(max, Math.max(min, Math.round(min + f * (max - min))));
}

export const EVALUATION_LOGS: EvaluationLog[] = (() => {
  const out: EvaluationLog[] = [];
  const dates = [
    { iso: "2026-06-03", label: "3 Jun 2026", title: "Latihan Teknik", month: "Jun" },
    { iso: "2026-05-27", label: "27 Mei 2026", title: "Skrimej Internal", month: "Mei" },
    { iso: "2026-05-20", label: "20 Mei 2026", title: "Half-court Sets", month: "Mei" },
    { iso: "2026-05-13", label: "13 Mei 2026", title: "Shooting Drills", month: "Mei" },
    { iso: "2026-04-29", label: "29 Apr 2026", title: "Conditioning", month: "Apr" },
    { iso: "2026-04-15", label: "15 Apr 2026", title: "Defense Fundamentals", month: "Apr" },
  ];
  let id = 1;
  ATHLETES.forEach((a, ai) => {
    dates.forEach((d, di) => {
      SKILL_CATEGORIES.forEach((c, ci) => {
        out.push({
          id: `ev${id++}`,
          athleteId: a.id,
          date: d.iso,
          dateLabel: d.label,
          sessionTitle: d.title,
          coach: COACHES[(ai + di) % COACHES.length],
          category: c,
          score: seededScore(ai * 31 + di * 7 + ci * 3),
          note: [
            "Eksekusi teknik semakin bersih",
            "Perlu fokus pada footwork",
            "Konsistensi meningkat dari sesi lalu",
            "Effort sangat baik hari ini",
            "Butuh drill tambahan minggu depan",
          ][(ai + ci + di) % 5],
        });
      });
    });
  });
  return out;
})();

export function getAthleteEvaluations(athleteId: string) {
  return EVALUATION_LOGS.filter((e) => e.athleteId === athleteId);
}

/* Legacy — kept for backwards compat in case anything imports it */
export type SessionEvaluation = {
  effort: number; technique: number; consistency: number; focus: number; attitude: number;
};

export const SESSION_EVAL_FIELDS: { key: keyof SessionEvaluation; label: string }[] = [
  { key: "effort", label: "Effort" },
  { key: "technique", label: "Technique" },
  { key: "consistency", label: "Consistency" },
  { key: "focus", label: "Focus" },
  { key: "attitude", label: "Attitude" },
];
