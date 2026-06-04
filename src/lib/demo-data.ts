export type Athlete = {
  id: string;
  name: string;
  age: number;
  position: string;
  team: string;
  progress: number;
  attendance: number;
  status: "Great" | "Good" | "Needs Focus";
  note: string;
  parent: { name: string; phone: string };
  skills: { name: string; value: number }[];
  achievements: string[];
};

export const ATHLETES: Athlete[] = [
  {
    id: "1", name: "Rafi Pratama", age: 12, position: "Forward", team: "U-12 A",
    progress: 86, attendance: 94, status: "Great",
    note: "Finishing semakin tajam, perlu kerja pada pergerakan tanpa bola.",
    parent: { name: "Bp. Andi Pratama", phone: "+62 812-1111-1111" },
    skills: [
      { name: "Passing", value: 82 }, { name: "Shooting", value: 90 },
      { name: "Dribbling", value: 85 }, { name: "Stamina", value: 84 },
    ],
    achievements: ["Top Scorer U-12 League", "MVP Friendly Cup"],
  },
  {
    id: "2", name: "Dimas Saputra", age: 11, position: "Midfielder", team: "U-12 A",
    progress: 78, attendance: 88, status: "Good",
    note: "Visi bermain bagus, perlu peningkatan kekuatan tendangan jarak jauh.",
    parent: { name: "Ibu Siti Rahayu", phone: "+62 812-2222-2222" },
    skills: [
      { name: "Passing", value: 88 }, { name: "Shooting", value: 70 },
      { name: "Dribbling", value: 78 }, { name: "Stamina", value: 80 },
    ],
    achievements: ["Best Playmaker U-12"],
  },
  {
    id: "3", name: "Aldi Setiawan", age: 13, position: "Defender", team: "U-14 B",
    progress: 91, attendance: 96, status: "Great",
    note: "Leader di lini belakang, komunikasi sangat baik.",
    parent: { name: "Bp. Hendro Setiawan", phone: "+62 812-3333-3333" },
    skills: [
      { name: "Tackling", value: 94 }, { name: "Heading", value: 90 },
      { name: "Positioning", value: 92 }, { name: "Stamina", value: 88 },
    ],
    achievements: ["Captain U-14 B", "Iron Wall Award"],
  },
  {
    id: "4", name: "Bagas Kurniawan", age: 10, position: "Goalkeeper", team: "U-10",
    progress: 72, attendance: 82, status: "Good",
    note: "Refleks bagus, perlu latihan distribusi bola.",
    parent: { name: "Ibu Lestari", phone: "+62 812-4444-4444" },
    skills: [
      { name: "Reflex", value: 86 }, { name: "Distribution", value: 60 },
      { name: "Positioning", value: 70 }, { name: "Catching", value: 78 },
    ],
    achievements: ["Best Save of the Month"],
  },
  {
    id: "5", name: "Reza Maulana", age: 13, position: "Forward", team: "U-14 A",
    progress: 88, attendance: 93, status: "Great",
    note: "Pemain cepat, finishing dengan kaki kiri perlu diasah.",
    parent: { name: "Bp. Maulana", phone: "+62 812-5555-5555" },
    skills: [
      { name: "Passing", value: 80 }, { name: "Shooting", value: 88 },
      { name: "Dribbling", value: 92 }, { name: "Stamina", value: 86 },
    ],
    achievements: ["Top Assist U-14"],
  },
  {
    id: "6", name: "Fajar Nugroho", age: 11, position: "Midfielder", team: "U-12 B",
    progress: 68, attendance: 74, status: "Needs Focus",
    note: "Perlu konsistensi latihan, attendance menurun bulan ini.",
    parent: { name: "Ibu Wulan", phone: "+62 812-6666-6666" },
    skills: [
      { name: "Passing", value: 70 }, { name: "Shooting", value: 65 },
      { name: "Dribbling", value: 72 }, { name: "Stamina", value: 60 },
    ],
    achievements: [],
  },
  {
    id: "7", name: "Iqbal Hakim", age: 14, position: "Defender", team: "U-14 A",
    progress: 84, attendance: 91, status: "Great",
    note: "Bek modern, naik membantu serangan dengan baik.",
    parent: { name: "Bp. Hakim", phone: "+62 812-7777-7777" },
    skills: [
      { name: "Tackling", value: 88 }, { name: "Passing", value: 82 },
      { name: "Stamina", value: 90 }, { name: "Positioning", value: 84 },
    ],
    achievements: ["Best Defender U-14"],
  },
  {
    id: "8", name: "Yoga Pratama", age: 10, position: "Forward", team: "U-10",
    progress: 75, attendance: 86, status: "Good",
    note: "Berbakat, perlu disiplin posisi saat bertahan.",
    parent: { name: "Ibu Maya", phone: "+62 812-8888-8888" },
    skills: [
      { name: "Passing", value: 72 }, { name: "Shooting", value: 80 },
      { name: "Dribbling", value: 82 }, { name: "Stamina", value: 70 },
    ],
    achievements: ["Rookie of the Month"],
  },
];

export const TEAMS = ["U-10", "U-12 A", "U-12 B", "U-14 A", "U-14 B"] as const;
export const POSITIONS = ["Goalkeeper", "Defender", "Midfielder", "Forward"] as const;
