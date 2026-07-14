import {
  Users,
  MessageSquareWarning,
  BadgeCheck,
  GraduationCap,
  Clock,
  Wallet,
  Building2,
  PackageCheck,
  BookOpen,
  Award,
  Landmark,
  PiggyBank,
  MonitorCog,
  Computer,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";

export type ModuleCode =
  | "overview"
  | "FR-01"
  | "FR-02"
  | "FR-03"
  | "FR-04"
  | "FR-05"
  | "FR-06"
  | "FR-07"
  | "FR-08"
  | "FR-09"
  | "FR-10"
  | "FR-11"
  | "FR-12"
  | "FR-13"
  | "FR-14";

export interface ModuleMeta {
  code: ModuleCode;
  shortTitle: string;
  fullTitle: string;
  icon: LucideIcon;
  group: "Akademik" | "Kewangan" | "Aset & Stor" | "Sumber Manusia";
  accent: string; // hex
}

export const MODULES: ModuleMeta[] = [
  {
    code: "FR-01",
    shortTitle: "Enrolmen Sepenuh Masa",
    fullTitle: "Pemantauan Pengambilan & Enrolmen Pelajar Sepenuh Masa",
    icon: Users,
    group: "Akademik",
    accent: "#0e8388",
  },
  {
    code: "FR-02",
    shortTitle: "Aduan Pelanggan",
    fullTitle: "Pemantauan Aduan Pelanggan",
    icon: MessageSquareWarning,
    group: "Akademik",
    accent: "#1b4b91",
  },
  {
    code: "FR-03",
    shortTitle: "Pentauliahan Program",
    fullTitle: "Pentauliahan Program Sepenuh Masa",
    icon: BadgeCheck,
    group: "Akademik",
    accent: "#2e9e6b",
  },
  {
    code: "FR-04",
    shortTitle: "Pengajar DV Bersijil",
    fullTitle: "Sijil Kemahiran Malaysia (SKM) Pengajar DV",
    icon: GraduationCap,
    group: "Sumber Manusia",
    accent: "#c79a3b",
  },
  {
    code: "FR-05",
    shortTitle: "Latihan Kakitangan 40j",
    fullTitle: "Pemantauan Kursus Tahunan Kakitangan (40 Jam Setahun)",
    icon: Clock,
    group: "Sumber Manusia",
    accent: "#0e8388",
  },
  {
    code: "FR-06",
    shortTitle: "Bajet Mengurus",
    fullTitle: "Pajet Mengurus (OS28000 & OS26000)",
    icon: Wallet,
    group: "Kewangan",
    accent: "#1b4b91",
  },
  {
    code: "FR-07",
    shortTitle: "Bajet Pembangunan",
    fullTitle: "Bajet Pembangunan (Penyelenggaraan/Naik Taraf)",
    icon: Building2,
    group: "Kewangan",
    accent: "#2e9e6b",
  },
  {
    code: "FR-08",
    shortTitle: "Verifikasi Stok",
    fullTitle: "Pemantauan Verifikasi Stok",
    icon: PackageCheck,
    group: "Aset & Stor",
    accent: "#c79a3b",
  },
  {
    code: "FR-09",
    shortTitle: "Kursus Jangka Pendek",
    fullTitle: "Enrolmen Peserta Kursus Jangka Pendek",
    icon: BookOpen,
    group: "Akademik",
    accent: "#0e8388",
  },
  {
    code: "FR-10",
    shortTitle: "Graduan",
    fullTitle: "Senarai Pelajar Sepenuh Masa Bergraduat",
    icon: Award,
    group: "Akademik",
    accent: "#1b4b91",
  },
  {
    code: "FR-11",
    shortTitle: "Akaun Amanah",
    fullTitle: "Pemantauan Akaun Amanah (Perbelanjaan vs Pendapatan)",
    icon: Landmark,
    group: "Kewangan",
    accent: "#2e9e6b",
  },
  {
    code: "FR-12",
    shortTitle: "Akaun Mengurus",
    fullTitle: "Pemantauan Akaun Mengurus (Peratus Perbelanjaan)",
    icon: PiggyBank,
    group: "Kewangan",
    accent: "#c79a3b",
  },
  {
    code: "FR-13",
    shortTitle: "Pemantauan Aset",
    fullTitle: "Pemantauan Aset (Semakan Aset)",
    icon: MonitorCog,
    group: "Aset & Stor",
    accent: "#0e8388",
  },
  {
    code: "FR-14",
    shortTitle: "Inventori Komputer",
    fullTitle: "Pemantauan Bilangan Komputer",
    icon: Computer,
    group: "Aset & Stor",
    accent: "#1b4b91",
  },
];

export const OVERVIEW_META: ModuleMeta = {
  code: "overview",
  shortTitle: "Ringkasan Eksekutif",
  fullTitle: "Ringkasan Eksekutif Dashboard Pemantauan Bersepadu JTM",
  icon: LayoutDashboard,
  group: "Akademik",
  accent: "#0e8388",
};

export const GROUPS = ["Akademik", "Sumber Manusia", "Kewangan", "Aset & Stor"] as const;

export function getModule(code: ModuleCode): ModuleMeta | undefined {
  if (code === "overview") return OVERVIEW_META;
  return MODULES.find((m) => m.code === code);
}
