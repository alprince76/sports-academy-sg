// Training Programs, Session Builder templates, and Drill Library
// Presentation-only demo data for MVP.

export type AgeCategory = "KU-8" | "KU-10" | "KU-12" | "KU-14" | "KU-16" | "KU-18";
export type Difficulty = "Beginner" | "Intermediate" | "Advanced";
export type Intensity = "Low" | "Medium" | "High";
export type DrillCategory =
  | "Warm Up"
  | "Fundamental"
  | "Skill Development"
  | "Small Side Game"
  | "Conditioning"
  | "Cool Down";

export const DRILL_CATEGORIES: DrillCategory[] = [
  "Warm Up",
  "Fundamental",
  "Skill Development",
  "Small Side Game",
  "Conditioning",
  "Cool Down",
];

export type Drill = {
  id: string;
  title: string;
  category: DrillCategory;
  skillFocus: string;
  ageGroup: AgeCategory;
  difficulty: Difficulty;
  duration: number; // minutes
  equipment: string[];
  objective: string;
  description: string;
  coachingPoints: string[];
  commonMistakes: string[];
  safetyNotes?: string;
  tags: string[];
  media?: string;
  favorite?: boolean;
  archived?: boolean;
};

export const DRILLS: Drill[] = [
  {
    id: "d1",
    title: "Two-Ball Stationary Dribble",
    category: "Warm Up",
    skillFocus: "Ball Handling",
    ageGroup: "KU-12",
    difficulty: "Beginner",
    duration: 8,
    equipment: ["2 Bola", "Cone"],
    objective: "Meningkatkan koordinasi tangan kanan-kiri dan kontrol bola stasioner.",
    description: "Atlet berdiri kaki selebar bahu, dribble dua bola bersamaan (parallel, alternating, high-low).",
    coachingPoints: [
      "Gunakan ujung jari, bukan telapak tangan",
      "Kepala tetap tegak, jangan lihat bola",
      "Lutut sedikit ditekuk, dada tegak",
    ],
    commonMistakes: [
      "Bola memantul terlalu tinggi",
      "Tangan lemah kurang aktif",
    ],
    safetyNotes: "Beri jarak antar atlet minimal 2 meter.",
    tags: ["dribble", "warmup", "coordination"],
    favorite: true,
  },
  {
    id: "d2",
    title: "Form Shooting 1-Hand",
    category: "Fundamental",
    skillFocus: "Shooting",
    ageGroup: "KU-10",
    difficulty: "Beginner",
    duration: 10,
    equipment: ["1 Bola/atlet", "Ring"],
    objective: "Memperbaiki mekanika shooting dasar (BEEF: Balance, Eyes, Elbow, Follow-through).",
    description: "Shooting jarak 1-2m dengan satu tangan, fokus pada elbow tucked-in dan follow-through.",
    coachingPoints: [
      "Elbow di bawah bola (90°)",
      "Follow-through: gooseneck",
      "Kaki menghadap ring",
    ],
    commonMistakes: ["Elbow melebar", "Tangan lemah dominan", "Tidak follow-through"],
    tags: ["shooting", "form", "beef"],
    favorite: true,
  },
  {
    id: "d3",
    title: "Defensive Slide 5-Spot",
    category: "Skill Development",
    skillFocus: "Defense",
    ageGroup: "KU-14",
    difficulty: "Intermediate",
    duration: 12,
    equipment: ["5 Cone"],
    objective: "Meningkatkan footwork defensive dan konsistensi stance.",
    description: "Slide zig-zag antar 5 cone, pertahankan low stance sepanjang gerakan.",
    coachingPoints: [
      "Pantat rendah, dada tegak",
      "Jangan silangkan kaki",
      "Push off dari kaki belakang",
    ],
    commonMistakes: ["Berdiri terlalu tegak", "Cross-step di posisi defensif"],
    safetyNotes: "Hindari over-extension pada slide, jaga knee tracking.",
    tags: ["defense", "footwork", "conditioning"],
  },
  {
    id: "d4",
    title: "3v3 Half-court",
    category: "Small Side Game",
    skillFocus: "Basketball IQ",
    ageGroup: "KU-14",
    difficulty: "Intermediate",
    duration: 15,
    equipment: ["1 Bola", "Ring"],
    objective: "Menerapkan spacing dan decision making dalam situasi terbatas.",
    description: "3v3 half-court, ganti pemain setiap possession pertama yang dimenangkan.",
    coachingPoints: ["Spacing 4-5m", "Cut setelah pass", "Komunikasi verbal"],
    commonMistakes: ["Stand & watch", "Iso berlebihan"],
    tags: ["game", "iq", "teamwork"],
    favorite: true,
  },
  {
    id: "d5",
    title: "Suicides + Push-up",
    category: "Conditioning",
    skillFocus: "Athleticism",
    ageGroup: "KU-16",
    difficulty: "Advanced",
    duration: 10,
    equipment: ["Lapangan penuh"],
    objective: "Membangun kondisi anaerobik dan power ekstremitas atas.",
    description: "3 set suicide (baseline-FT-half-FT jauh-baseline), 10 push-up antar set.",
    coachingPoints: ["Touch garis dengan tangan", "Sprint 100% setiap set"],
    commonMistakes: ["Tidak menyentuh garis", "Pace inkonsisten"],
    safetyNotes: "Hidrasi wajib. Hentikan bila terjadi kram.",
    tags: ["conditioning", "anaerobic"],
  },
  {
    id: "d6",
    title: "Static Stretch Full Body",
    category: "Cool Down",
    skillFocus: "Recovery",
    ageGroup: "KU-8",
    difficulty: "Beginner",
    duration: 8,
    equipment: [],
    objective: "Menurunkan heart rate, meningkatkan fleksibilitas, mencegah cedera.",
    description: "Rangkaian 8 stretch: hamstring, quads, calves, shoulders, lower back, hips, triceps, neck.",
    coachingPoints: ["Tahan 20-30 detik per gerakan", "Napas dalam, jangan bouncing"],
    commonMistakes: ["Bouncing stretch", "Menahan napas"],
    tags: ["stretch", "recovery", "cooldown"],
  },
  {
    id: "d7",
    title: "Pick & Roll Read",
    category: "Skill Development",
    skillFocus: "Basketball IQ",
    ageGroup: "KU-16",
    difficulty: "Advanced",
    duration: 15,
    equipment: ["1 Bola", "Ring"],
    objective: "Membaca defense pada situasi PnR (drop, hedge, switch).",
    description: "PG dan Big menjalankan PnR, defender memberikan 3 varian defense secara random.",
    coachingPoints: ["Attack the hip screen", "Big roll hard atau pop"],
    commonMistakes: ["Bergegas menerima screen", "Big tidak seal defender"],
    tags: ["pnr", "iq", "advanced"],
  },
  {
    id: "d8",
    title: "Layup Line Both Hands",
    category: "Fundamental",
    skillFocus: "Finishing",
    ageGroup: "KU-10",
    difficulty: "Beginner",
    duration: 10,
    equipment: ["1 Bola/atlet"],
    safetyNotes: undefined,
    objective: "Konsistensi finishing tangan kiri dan kanan.",
    description: "Layup line dari 45° kanan (tangan kanan) dan kiri (tangan kiri), 2 set × 10 layup.",
    coachingPoints: ["Kaki dalam melompat", "Bola off backboard"],
    commonMistakes: ["Tangan dominan dari kedua sisi"],
    tags: ["layup", "finishing", "fundamental"],
  },
  {
    id: "d9",
    title: "Dynamic Warm-up Circuit",
    category: "Warm Up",
    skillFocus: "Mobility",
    ageGroup: "KU-12",
    difficulty: "Beginner",
    duration: 10,
    equipment: [],
    objective: "Mengaktifkan otot besar & mempersiapkan sendi sebelum latihan.",
    description: "High knees, butt kicks, lunges, side shuffles, carioca — 20m × 2 rounds.",
    coachingPoints: ["Range of motion penuh", "Progressive intensity"],
    commonMistakes: ["Stretching statis di awal"],
    tags: ["warmup", "mobility"],
  },
];

export type SessionBlock = {
  id: DrillCategory;
  targetMinutes: number;
  drillIds: string[];
};

export type SessionTemplate = {
  id: string;
  name: string;
  ageGroup: AgeCategory;
  focus: string;
  intensity: Intensity;
  totalMinutes: number;
  blocks: SessionBlock[];
  updatedAt: string;
};

export const SESSION_TEMPLATES: SessionTemplate[] = [
  {
    id: "t1",
    name: "U-12 Ball Handling Focus",
    ageGroup: "KU-12",
    focus: "Ball Handling",
    intensity: "Medium",
    totalMinutes: 90,
    updatedAt: "1 Jun 2026",
    blocks: [
      { id: "Warm Up", targetMinutes: 10, drillIds: ["d9"] },
      { id: "Fundamental", targetMinutes: 20, drillIds: ["d1", "d8"] },
      { id: "Skill Development", targetMinutes: 20, drillIds: ["d3"] },
      { id: "Small Side Game", targetMinutes: 20, drillIds: ["d4"] },
      { id: "Conditioning", targetMinutes: 10, drillIds: ["d5"] },
      { id: "Cool Down", targetMinutes: 10, drillIds: ["d6"] },
    ],
  },
  {
    id: "t2",
    name: "U-14 Defense Intensive",
    ageGroup: "KU-14",
    focus: "Defense",
    intensity: "High",
    totalMinutes: 100,
    updatedAt: "28 Mei 2026",
    blocks: [
      { id: "Warm Up", targetMinutes: 10, drillIds: ["d9"] },
      { id: "Fundamental", targetMinutes: 15, drillIds: ["d2"] },
      { id: "Skill Development", targetMinutes: 25, drillIds: ["d3", "d7"] },
      { id: "Small Side Game", targetMinutes: 25, drillIds: ["d4"] },
      { id: "Conditioning", targetMinutes: 15, drillIds: ["d5"] },
      { id: "Cool Down", targetMinutes: 10, drillIds: ["d6"] },
    ],
  },
  {
    id: "t3",
    name: "U-10 Fundamentals",
    ageGroup: "KU-10",
    focus: "Shooting & Layup",
    intensity: "Low",
    totalMinutes: 75,
    updatedAt: "25 Mei 2026",
    blocks: [
      { id: "Warm Up", targetMinutes: 10, drillIds: ["d9"] },
      { id: "Fundamental", targetMinutes: 25, drillIds: ["d2", "d8"] },
      { id: "Skill Development", targetMinutes: 15, drillIds: ["d1"] },
      { id: "Small Side Game", targetMinutes: 15, drillIds: ["d4"] },
      { id: "Cool Down", targetMinutes: 10, drillIds: ["d6"] },
    ],
  },
];

export type TrainingProgram = {
  id: string;
  name: string;
  ageCategory: AgeCategory;
  durationWeeks: number;
  totalSessions: number;
  coach: string;
  objectives: string[];
  sessionTemplateIds: string[];
  progress: number; // 0-100
  status: "Active" | "Draft" | "Completed";
};

export const TRAINING_PROGRAMS: TrainingProgram[] = [
  {
    id: "p1",
    name: "U-12 Ball Handling Foundation",
    ageCategory: "KU-12",
    durationWeeks: 8,
    totalSessions: 16,
    coach: "Coach Bayu",
    objectives: [
      "Improve dribbling consistency",
      "Improve passing accuracy",
      "Improve decision making",
    ],
    sessionTemplateIds: ["t1", "t3"],
    progress: 62,
    status: "Active",
  },
  {
    id: "p2",
    name: "U-14 Defensive Identity",
    ageCategory: "KU-14",
    durationWeeks: 6,
    totalSessions: 12,
    coach: "Coach Andre",
    objectives: [
      "Build 1-on-1 defensive habits",
      "Team rotation on help-side",
      "Rebound discipline",
    ],
    sessionTemplateIds: ["t2"],
    progress: 40,
    status: "Active",
  },
  {
    id: "p3",
    name: "U-10 Fun Fundamentals",
    ageCategory: "KU-10",
    durationWeeks: 10,
    totalSessions: 20,
    coach: "Coach Rangga",
    objectives: [
      "Learn proper shooting form",
      "Both-hand layup",
      "Introduction to 3v3 concepts",
    ],
    sessionTemplateIds: ["t3"],
    progress: 25,
    status: "Active",
  },
  {
    id: "p4",
    name: "U-16 Advanced PnR Series",
    ageCategory: "KU-16",
    durationWeeks: 4,
    totalSessions: 8,
    coach: "Coach Dito",
    objectives: ["Master PnR reads", "Roll vs Pop decisions", "Corner spacing"],
    sessionTemplateIds: ["t2"],
    progress: 0,
    status: "Draft",
  },
];

export const BLOCK_META: Record<DrillCategory, { color: string; description: string }> = {
  "Warm Up": { color: "bg-amber-100 text-amber-800 border-amber-200", description: "Persiapan tubuh, aktivasi otot." },
  "Fundamental": { color: "bg-primary-soft text-primary border-primary/30", description: "Teknik dasar berulang." },
  "Skill Development": { color: "bg-blue-100 text-blue-800 border-blue-200", description: "Pengembangan skill spesifik." },
  "Small Side Game": { color: "bg-purple-100 text-purple-800 border-purple-200", description: "Aplikasi game-like." },
  "Conditioning": { color: "bg-red-100 text-red-800 border-red-200", description: "Fisik & stamina." },
  "Cool Down": { color: "bg-slate-100 text-slate-800 border-slate-200", description: "Recovery & stretch." },
};
