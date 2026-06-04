import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import heroImg from "@/assets/hero-soccer.jpg";
import {
  Activity, BarChart3, CalendarCheck, ChartLine, CheckCircle2,
  CreditCard, Eye, GraduationCap, Heart, ShieldCheck, Sparkles,
  Star, Trophy, UsersRound,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SportAcademy — Digitalisasi Akademi Olahraga Anak" },
      { name: "description", content: "Platform manajemen akademi olahraga modern: pantau perkembangan atlet muda, evaluasi pelatih, dan transparansi untuk orang tua dalam satu sistem." },
      { property: "og:title", content: "SportAcademy — Digitalisasi Akademi Olahraga Anak" },
      { property: "og:description", content: "Track every athlete's growth. Build future champions." },
      { property: "og:image", content: heroImg },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <SocialProof />
      <Features />
      <Benefits />
      <ProgressShowcase />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="container mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Badge variant="secondary" className="mb-5 gap-1.5 rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-primary">
              <Sparkles className="h-3 w-3" />
              Platform #1 untuk SSB Modern
            </Badge>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Bangun calon juara
              <span className="block bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                dengan data, bukan asumsi.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
              SportAcademy membantu akademi olahraga mendigitalisasi pencatatan perkembangan atlet muda — transparan untuk orang tua, profesional untuk pelatih.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" className="h-12 px-6 text-base shadow-[var(--shadow-elevated)]" asChild>
                <Link to="/dashboard">Digitalisasi Akademi Anda</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-6 text-base">
                Lihat Demo Live
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Gratis 14 hari</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Tanpa kartu kredit</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Setup &lt; 10 menit</span>
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-elevated)]">
              <img
                src={heroImg}
                alt="Anak-anak berlatih sepak bola di akademi"
                width={1536}
                height={1024}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            {/* Floating stat cards */}
            <div className="absolute -left-4 -bottom-6 hidden rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <ChartLine className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Progress bulan ini</p>
                  <p className="font-display text-xl font-bold text-primary">+24%</p>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 top-8 hidden rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Best player week</p>
                  <p className="font-display text-sm font-semibold">Rafi Pratama</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SocialProof() {
  const stats = [
    { v: "120+", l: "Akademi terdaftar" },
    { v: "8.500+", l: "Atlet muda dipantau" },
    { v: "96%", l: "Orang tua puas" },
    { v: "4.9/5", l: "Rating pelatih" },
  ];
  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="container mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:grid-cols-4 sm:px-6">
        {stats.map((s) => (
          <div key={s.l} className="text-center">
            <p className="font-display text-2xl font-bold text-foreground sm:text-3xl">{s.v}</p>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: Activity, title: "Training Progress Tracking", desc: "Evaluasi per sesi: passing, dribbling, stamina, attitude. Visualisasi tren perkembangan." },
  { icon: CalendarCheck, title: "Attendance & Schedule", desc: "Absensi cepat, jadwal latihan & pertandingan, notifikasi otomatis." },
  { icon: UsersRound, title: "Athlete Management", desc: "Profil atlet lengkap dengan medical notes, tim, posisi, dan info orang tua." },
  { icon: BarChart3, title: "Academy Analytics", desc: "Dashboard real-time: revenue, attendance rate, dan growth atlet." },
  { icon: CreditCard, title: "Payment & Membership", desc: "Tagihan bulanan, status pembayaran, invoice — semuanya transparan." },
  { icon: Heart, title: "Parent Portal", desc: "Orang tua melihat progres, feedback pelatih, dan badge pencapaian anak." },
];

function Features() {
  return (
    <section id="features" className="py-20 sm:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="rounded-full bg-primary-soft text-primary">Fitur Lengkap</Badge>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Semua yang dibutuhkan akademi modern
          </h2>
          <p className="mt-4 text-muted-foreground">
            Satu platform untuk admin, pelatih, dan orang tua — dirancang untuk akademi olahraga anak.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="group border-border/70 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-[var(--shadow-elevated)]">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  const groups = [
    {
      icon: GraduationCap, tag: "Untuk Akademi",
      title: "Operasional akademi dalam satu sistem",
      points: ["Kelola atlet, pelatih & jadwal", "Laporan otomatis untuk owner", "Manajemen pembayaran transparan"],
    },
    {
      icon: ShieldCheck, tag: "Untuk Pelatih",
      title: "Evaluasi pemain tanpa ribet",
      points: ["Input rating slider 1 menit", "Catatan & feedback per sesi", "Riwayat performa setiap atlet"],
    },
    {
      icon: Heart, tag: "Untuk Orang Tua",
      title: "Transparansi perkembangan anak",
      points: ["Lihat progress real-time", "Feedback langsung dari pelatih", "Notifikasi jadwal & pencapaian"],
    },
  ];

  return (
    <section id="benefits" className="bg-secondary/40 py-20 sm:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Dibangun untuk semua stakeholder
          </h2>
          <p className="mt-4 text-muted-foreground">Setiap orang mendapat tampilan yang tepat untuk peran mereka.</p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {groups.map((g) => (
            <Card key={g.tag} className="border-border/70 bg-card">
              <CardContent className="p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <g.icon className="h-5 w-5" />
                </div>
                <p className="mt-5 text-xs font-medium uppercase tracking-wider text-primary">{g.tag}</p>
                <h3 className="mt-1 font-display text-xl font-semibold">{g.title}</h3>
                <ul className="mt-5 space-y-3">
                  {g.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {p}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProgressShowcase() {
  const skills = [
    { name: "Passing", value: 86 },
    { name: "Dribbling", value: 78 },
    { name: "Shooting", value: 72 },
    { name: "Stamina", value: 91 },
    { name: "Teamwork", value: 88 },
    { name: "Attitude", value: 95 },
  ];
  return (
    <section className="py-20 sm:py-24">
      <div className="container mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <Badge variant="secondary" className="rounded-full bg-primary-soft text-primary">Core Feature</Badge>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Visualisasi perkembangan yang dipahami orang tua
          </h2>
          <p className="mt-4 text-muted-foreground">
            Bukan sekadar angka. Tunjukkan kepada orang tua bagaimana anak mereka tumbuh — dengan tren, badge, dan catatan pelatih yang manusiawi.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex gap-2"><Eye className="h-5 w-5 text-primary" /> Timeline progress per kategori skill</li>
            <li className="flex gap-2"><Sparkles className="h-5 w-5 text-primary" /> Achievement badges untuk motivasi</li>
            <li className="flex gap-2"><Star className="h-5 w-5 text-primary" /> Rangkuman bulanan otomatis</li>
          </ul>
        </div>

        <Card className="border-border/70 shadow-[var(--shadow-elevated)]">
          <CardContent className="p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Atlet</p>
                <h3 className="font-display text-lg font-semibold">Rafi Pratama · U-12</h3>
              </div>
              <Badge className="bg-primary-soft text-primary hover:bg-primary-soft">Great improvement</Badge>
            </div>
            <div className="mt-6 space-y-4">
              {skills.map((s) => (
                <div key={s.name}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.name}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-all"
                      style={{ width: `${s.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-border bg-secondary/50 p-4">
              <p className="text-xs font-medium text-primary">Coach Note · 2 hari lalu</p>
              <p className="mt-1 text-sm">"Konsistensi Rafi semakin meningkat. Fokus pada akurasi shooting minggu depan."</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { name: "Bayu S.", role: "Head Coach, SSB Garuda", text: "Input evaluasi yang dulu makan 30 menit, sekarang 5 menit. Game changer." },
    { name: "Ibu Sari", role: "Orang tua atlet U-10", text: "Akhirnya saya tahu perkembangan anak saya secara real. Tidak menebak-nebak lagi." },
    { name: "Pak Adi", role: "Owner, Elite Football Academy", text: "Operasional akademi rapi, orang tua puas, retensi membership naik 40%." },
  ];
  return (
    <section className="bg-secondary/40 py-20 sm:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Dipercaya akademi di seluruh Indonesia
          </h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {items.map((t) => (
            <Card key={t.name} className="border-border/70">
              <CardContent className="p-6">
                <div className="flex gap-0.5 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed">"{t.text}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft font-semibold text-primary">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    { name: "Starter", price: "299rb", period: "/bulan", desc: "Untuk akademi kecil", features: ["Hingga 30 atlet", "2 pelatih", "Basic analytics", "Parent portal"], cta: "Mulai Gratis" },
    { name: "Pro", price: "699rb", period: "/bulan", desc: "Paling populer", features: ["Hingga 150 atlet", "10 pelatih", "Advanced analytics", "Payment management", "Priority support"], cta: "Coba 14 Hari", featured: true },
    { name: "Elite", price: "Custom", period: "", desc: "Multi-cabang akademi", features: ["Unlimited atlet", "Unlimited pelatih", "API access", "Dedicated manager", "Custom branding"], cta: "Hubungi Kami" },
  ];
  return (
    <section id="pricing" className="py-20 sm:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Harga sederhana, transparan</h2>
          <p className="mt-4 text-muted-foreground">Mulai gratis. Upgrade kapan saja.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <Card
              key={p.name}
              className={
                p.featured
                  ? "relative border-primary bg-card shadow-[var(--shadow-elevated)] md:scale-105"
                  : "border-border/70"
              }
            >
              {p.featured && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  Populer
                </Badge>
              )}
              <CardContent className="p-7">
                <h3 className="font-display text-lg font-semibold">{p.name}</h3>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold">{p.price}</span>
                  <span className="text-sm text-muted-foreground">{p.period}</span>
                </div>
                <Button className="mt-6 w-full" variant={p.featured ? "default" : "outline"}>
                  {p.cta}
                </Button>
                <ul className="mt-6 space-y-3 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" /> {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-20 sm:py-24">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        <div
          className="relative overflow-hidden rounded-3xl p-10 text-center text-primary-foreground sm:p-16"
          style={{ background: "var(--gradient-primary)" }}
        >
          <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 20% 20%, white, transparent 50%)" }} />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Digitalisasi Akademi Olahraga Anda
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/90">
              Bergabung dengan ratusan akademi yang sudah membangun calon juara dengan data.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" variant="secondary" className="h-12 px-6 text-base" asChild>
                <Link to="/dashboard">Lihat Demo Live</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 border-white/40 bg-transparent px-6 text-base text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
                Book a Call
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
