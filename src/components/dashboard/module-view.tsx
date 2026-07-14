"use client";

import { useEffect, useState } from "react";
import {
  ChartCard,
  GroupedBarChart,
  HBarChart,
  LineChartMulti,
  AreaChartMulti,
  DonutChart,
  GaugeChart,
} from "./charts";
import { DataTable, StatusBadge, PctCell, MoneyCell, type Column } from "./data-table";
import { getModule, type ModuleCode } from "@/lib/modules";
import { Loader2 } from "lucide-react";

interface ModuleViewProps {
  code: ModuleCode;
}

export function ModuleView({ code }: ModuleViewProps) {
  const meta = getModule(code);
  const [state, setState] = useState<{
    status: "loading" | "ok" | "error";
    data: any;
    error: string | null;
  }>({ status: "loading", data: null, error: null });

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/modules/${code}`)
      .then((r) => {
        if (!r.ok) throw new Error("Gagal memuatkan data modul");
        return r.json();
      })
      .then((d) => {
        if (!cancelled) setState({ status: "ok", data: d, error: null });
      })
      .catch((e) => {
        if (!cancelled) setState({ status: "error", data: null, error: e.message });
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  const loading = state.status === "loading";
  const error = state.status === "error" ? state.error : null;
  const data = state.data;

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
          <p className="text-sm">Memuatkan data {code}…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-rose-600">{error || "Data tidak tersedia"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* KPI strip */}
      <KpiStrip kpi={data.kpi} accent={meta?.accent || "#0e8388"} />

      {/* Charts + Table per module */}
      <ModuleCharts code={code} data={data} />
    </div>
  );
}

function KpiStrip({ kpi, accent }: { kpi: Record<string, any>; accent: string }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {Object.entries(kpi).map(([key, val]) => (
        <div key={key} className="glass-card relative overflow-hidden p-3.5">
          <div
            className="pointer-events-none absolute -right-4 -top-4 h-14 w-14 rounded-full opacity-25 blur-2xl"
            style={{ background: accent }}
          />
          <p className="truncate text-[10px] uppercase tracking-wide text-slate-500">
            {formatKpiLabel(key)}
          </p>
          <p className="mt-1 font-display text-lg font-bold text-jtm-navy">
            {formatKpiValue(val)}
          </p>
        </div>
      ))}
    </div>
  );
}

function formatKpiLabel(key: string): string {
  const map: Record<string, string> = {
    totalTarget: "Sasaran",
    totalEnrolled: "Sebenar",
    pct: "Pencapaian",
    total: "Jumlah",
    resolved: "Selesai",
    open: "Belum Selesai",
    slaPct: "SLA Patuh",
    avgResponseHours: "Purata Jam",
    aktif: "Aktif",
    akanLuput: "Akan Luput",
    luput: "Luput",
    certified: "Bersijil",
    uncertified: "Belum Bersijil",
    compliant: "Patuh",
    atRisk: "Berisiko",
    avgHours: "Purata Jam",
    totalAllocation: "Peruntukan",
    totalSpent: "Belanja",
    totalBalance: "Baki",
    totalProjects: "Projek",
    inProgress: "Dalam Pelaksanaan",
    completed: "Siap",
    avgCompletion: "Purata Siap",
    match: "Sepadan",
    mismatch: "Percanggahan",
    accuracyPct: "Ketepatan",
    totalCourses: "Kursus",
    totalParticipants: "Peserta",
    totalCapacity: "Kapasiti",
    totalRevenue: "Hasil",
    fillPct: "Kadar Isi",
    employed: "Bekerja",
    further: "Melanjut",
    unemployed: "Tidak Bekerja",
    employabilityPct: "Kebolehpasaran",
    totalIncome: "Pendapatan",
    totalExpense: "Perbelanjaan",
    balance: "Baki Semasa",
    ratio: "Nisbah",
    totalAccounts: "Kod Akaun",
    over90: "Akaun >90%",
    baik: "Baik",
    perluBaiki: "Perlu Baiki",
    rosak: "Rosak",
    overdue: "Tertunggak",
    compliancePct: "Pematuhan",
    ok: "Berfungsi",
    maintenance: "Penyelenggaraan",
    broken: "Rosak",
    oldNeedsReplacement: "Perlu Ganti",
    okPct: "% Berfungsi",
  };
  return map[key] || key.replace(/([A-Z])/g, " $1").trim();
}

function formatKpiValue(val: any): string {
  if (typeof val !== "number") return String(val ?? "—");
  if (Math.abs(val) >= 1_000_000) return "RM " + (val / 1_000_000).toFixed(2) + "j";
  if (Math.abs(val) >= 10_000) return val.toLocaleString("en-MY");
  if (Number.isInteger(val)) return val.toLocaleString("en-MY");
  return val.toFixed(1);
}

// ====================== per-module charts ======================
function ModuleCharts({ code, data }: { code: ModuleCode; data: any }) {
  switch (code) {
    case "FR-01":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChartCard title="Sasaran vs Sebenar Mengikut Sesi" subtitle="Carta bar berkumpulan" className="lg:col-span-2">
              <GroupedBarChart
                data={data.charts.sessionTrend}
                xKey="session"
                bars={[{ key: "Sasaran", name: "Sasaran", color: "#1b4b91" }, { key: "Sebenar", name: "Sebenar", color: "#0e8388" }]}
              />
            </ChartCard>
            <ChartCard title="Jantina Pelajar" subtitle="Pecahan lelaki / perempuan">
              <DonutChart data={data.charts.gender} colors={["#1b4b91", "#c79a3b"]} />
            </ChartCard>
          </div>
          <ChartCard title="Enrolmen Mengikut Pusat Latihan" subtitle="Top pusat mengikut enrolmen sebenar">
            <HBarChart
              data={data.charts.byCenter}
              yKey="center"
              bars={[{ key: "Sasaran", name: "Sasaran", color: "#1b4b91" }, { key: "Sebenar", name: "Sebenar", color: "#0e8388" }]}
              height={300}
            />
          </ChartCard>
          <DataTable
            title="Rekod Enrolmen Terperinci"
            columns={[
              { key: "session", label: "Sesi" },
              { key: "center", label: "Pusat Latihan" },
              { key: "target", label: "Sasaran", align: "right" },
              { key: "enrolled", label: "Sebenar", align: "right" },
              { key: "pct", label: "%", align: "right", format: (v) => <PctCell value={v} /> },
              { key: "male", label: "L", align: "right" },
              { key: "female", label: "P", align: "right" },
            ]}
            rows={data.table}
            searchKeys={["session", "center"]}
          />
        </div>
      );
    case "FR-02":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChartCard title="Aduan Mengikut Kategori" subtitle="Pecahan donut">
              <DonutChart data={data.charts.byCategory} colors={["#0e8388", "#1b4b91", "#c79a3b", "#d64545"]} />
            </ChartCard>
            <ChartCard title="Status Aduan" subtitle="Baharu / Dalam Tindakan / Selesai">
              <DonutChart data={data.charts.byStatus} colors={["#c79a3b", "#1b4b91", "#2e9e6b"]} />
            </ChartCard>
            <ChartCard title="Pematuhan SLA" subtitle={`${data.kpi.slaPct}% aduan patuh SLA`}>
              <GaugeChart value={data.kpi.slaPct} label="SLA" color="#2e9e6b" />
            </ChartCard>
          </div>
          <ChartCard title="Trend Aduan Bulanan" subtitle="Bilangan aduan diterima setiap bulan">
            <AreaChartMulti data={data.charts.monthly} xKey="month" areas={[{ key: "aduan", name: "Aduan", color: "#0e8388" }]} />
          </ChartCard>
          <DataTable
            title="Senarai Aduan"
            columns={[
              { key: "ref", label: "Rujukan" },
              { key: "date", label: "Tarikh" },
              { key: "category", label: "Kategori" },
              { key: "complainantType", label: "Jenis Pengadu" },
              { key: "status", label: "Status", format: (v) => <StatusBadge status={v} /> },
              { key: "responseHours", label: "Masa (jam)", align: "right" },
              { key: "withinSla", label: "SLA", align: "center", format: (v) => (v ? <StatusBadge status="Sepadan" /> : <StatusBadge status="Melebihi SLA" />) },
            ]}
            rows={data.table}
            searchKeys={["ref", "category", "status"]}
          />
        </div>
      );
    case "FR-03":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Status Pentauliahan" subtitle="Mengikut tempoh luput">
              <DonutChart data={data.charts.byStatus} colors={["#d64545", "#c79a3b", "#1b4b91", "#2e9e6b"]} />
            </ChartCard>
            <ChartCard title="Badan Pentauliahan" subtitle="Pecahan mengikut badan">
              <DonutChart data={data.charts.byBody} colors={["#0e8388", "#1b4b91", "#2e9e6b"]} />
            </ChartCard>
          </div>
          <DataTable
            title="Senarai Pentauliahan Program"
            columns={[
              { key: "program", label: "Program" },
              { key: "body", label: "Badan" },
              { key: "certNo", label: "No. Sijil" },
              { key: "start", label: "Mula Sah" },
              { key: "expiry", label: "Tarikh Luput" },
              { key: "daysToExpiry", label: "Hari Lagi", align: "right", format: (v) => (v !== null ? <span className={v < 0 ? "text-rose-600" : v <= 90 ? "text-amber-600" : "text-emerald-600"}>{v}</span> : "—") },
              { key: "status", label: "Status", format: (v) => <StatusBadge status={v} /> },
            ]}
            rows={data.table}
            searchKeys={["program", "body", "status"]}
          />
        </div>
      );
    case "FR-04":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Tahap Sijil Pengajar" subtitle="SKM3 / DKM / DLKM / Tiada">
              <DonutChart data={data.charts.byLevel} colors={["#0e8388", "#1b4b91", "#2e9e6b", "#d64545"]} />
            </ChartCard>
            <ChartCard title="Pengajar Mengikut Jabatan" subtitle="Bilangan pengajar per jabatan">
              <HBarChart data={data.charts.byDept} yKey="name" bars={[{ key: "value", name: "Bilangan", color: "#0e8388" }]} />
            </ChartCard>
          </div>
          <DataTable
            title="Senarai Pengajar DV"
            columns={[
              { key: "name", label: "Nama" },
              { key: "department", label: "Jabatan" },
              { key: "certLevel", label: "Tahap", format: (v) => (v === "—" ? <StatusBadge status="Tiada Sijil" /> : <StatusBadge status={v} />) },
              { key: "certNo", label: "No. Sijil" },
              { key: "issue", label: "Dikeluarkan" },
              { key: "expiry", label: "Luput" },
            ]}
            rows={data.table}
            searchKeys={["name", "department", "certLevel"]}
          />
        </div>
      );
    case "FR-05":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Purata Jam Latihan Mengikut Jabatan" subtitle="Sasaran 40 jam/tahun">
              <HBarChart data={data.charts.byDepartment} yKey="department" bars={[{ key: "avgHours", name: "Purata Jam", color: "#0e8388" }]} />
            </ChartCard>
            <ChartCard title="Taburan Pematuhan" subtitle="Patuh / Hampir / Berisiko">
              <DonutChart data={data.charts.distribution} colors={["#2e9e6b", "#c79a3b", "#d64545"]} />
            </ChartCard>
          </div>
          <DataTable
            title="Rekod Latihan Kakitangan 2026"
            columns={[
              { key: "name", label: "Nama" },
              { key: "department", label: "Jabatan" },
              { key: "hours", label: "Jam Selesai", align: "right" },
              { key: "target", label: "Sasaran", align: "right" },
              { key: "pct", label: "%", align: "right", format: (v) => <PctCell value={v} /> },
              { key: "lastCourse", label: "Kursus Terkini" },
            ]}
            rows={data.table}
            searchKeys={["name", "department"]}
          />
        </div>
      );
    case "FR-06":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Peruntukan vs Perbelanjaan Mengikut Kod" subtitle="OS28000 & OS26000">
              <GroupedBarChart
                data={data.charts.byCode}
                xKey="code"
                bars={[{ key: "Peruntukan", name: "Peruntukan", color: "#1b4b91" }, { key: "Perbelanjaan", name: "Perbelanjaan", color: "#0e8388" }]}
              />
            </ChartCard>
            <ChartCard title="Trend Bulanan Bajet Mengurus" subtitle="Peruntukan vs Perbelanjaan">
              <AreaChartMulti
                data={data.charts.monthly}
                xKey="month"
                areas={[{ key: "Peruntukan", name: "Peruntukan", color: "#1b4b91" }, { key: "Perbelanjaan", name: "Perbelanjaan", color: "#0e8388" }]}
              />
            </ChartCard>
          </div>
          <DataTable
            title="Butiran Bajet Mengurus Bulanan"
            columns={[
              { key: "code", label: "Kod" },
              { key: "month", label: "Bulan" },
              { key: "allocation", label: "Peruntukan", align: "right", format: (v) => <MoneyCell value={v} /> },
              { key: "spent", label: "Belanja", align: "right", format: (v) => <MoneyCell value={v} /> },
              { key: "balance", label: "Baki", align: "right", format: (v) => <MoneyCell value={v} /> },
              { key: "pct", label: "%", align: "right", format: (v) => <PctCell value={v} /> },
            ]}
            rows={data.table}
            searchKeys={["code", "month"]}
          />
        </div>
      );
    case "FR-07":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Status Projek" subtitle="Belum Mula / Dalam Pelaksanaan / Siap">
              <DonutChart data={data.charts.byStatus} colors={["#c79a3b", "#1b4b91", "#2e9e6b"]} />
            </ChartCard>
            <ChartCard title="Kategori Projek" subtitle="Penyelenggaraan / Naik Taraf">
              <DonutChart data={data.charts.byCategory} colors={["#0e8388", "#1b4b91"]} />
            </ChartCard>
          </div>
          <DataTable
            title="Senarai Projek Pembangunan"
            columns={[
              { key: "name", label: "Projek" },
              { key: "category", label: "Kategori" },
              { key: "allocation", label: "Peruntukan", align: "right", format: (v) => <MoneyCell value={v} /> },
              { key: "spent", label: "Belanja", align: "right", format: (v) => <MoneyCell value={v} /> },
              { key: "financePct", label: "% Kew.", align: "right", format: (v) => <PctCell value={v} /> },
              { key: "physicalPct", label: "% Fizik", align: "right", format: (v) => <PctCell value={v} /> },
              { key: "status", label: "Status", format: (v) => <StatusBadge status={v} /> },
            ]}
            rows={data.table}
            searchKeys={["name", "category", "status"]}
          />
        </div>
      );
    case "FR-08":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Mengikut Kategori Stok" subtitle="Bilangan item disemak">
              <DonutChart data={data.charts.byCategory} colors={["#0e8388", "#1b4b91", "#c79a3b", "#2e9e6b", "#d64545", "#7c5cff"]} />
            </ChartCard>
            <ChartCard title="Status Verifikasi" subtitle="Sepadan / Percanggahan">
              <DonutChart data={data.charts.byStatus} colors={["#2e9e6b", "#d64545"]} />
            </ChartCard>
          </div>
          <DataTable
            title="Rekod Verifikasi Stok"
            columns={[
              { key: "code", label: "Kod" },
              { key: "name", label: "Nama Item" },
              { key: "category", label: "Kategori" },
              { key: "systemQty", label: "Sistem", align: "right" },
              { key: "physicalQty", label: "Fizik", align: "right" },
              { key: "variance", label: "Varians", align: "right", format: (v) => <span className={Math.abs(v) > 2 ? "font-bold text-rose-600" : "text-emerald-600"}>{v > 0 ? `+${v}` : v}</span> },
              { key: "status", label: "Status", format: (v) => <StatusBadge status={v} /> },
              { key: "verifyDate", label: "Tarikh Semak" },
            ]}
            rows={data.table}
            searchKeys={["code", "name", "category"]}
          />
        </div>
      );
    case "FR-09":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Kursus Terlaris" subtitle="Bilangan peserta & kapasiti">
              <HBarChart data={data.charts.topCourses} yKey="course" bars={[{ key: "participants", name: "Peserta", color: "#0e8388" }, { key: "capacity", name: "Kapasiti", color: "#1b4b91" }]} />
            </ChartCard>
            <ChartCard title="Jenis Peserta" subtitle="Awam / Korporat">
              <DonutChart data={data.charts.byCategory} colors={["#0e8388", "#1b4b91"]} />
            </ChartCard>
          </div>
          <ChartCard title="Trend Hasil Bulanan" subtitle="Hasil kutipan kursus jangka pendek">
            <AreaChartMulti data={data.charts.revenueMonthly} xKey="month" areas={[{ key: "hasil", name: "Hasil (RM)", color: "#2e9e6b" }]} />
          </ChartCard>
          <DataTable
            title="Senarai Kursus Jangka Pendek"
            columns={[
              { key: "course", label: "Kursus" },
              { key: "date", label: "Tarikh" },
              { key: "capacity", label: "Kapasiti", align: "right" },
              { key: "participants", label: "Peserta", align: "right" },
              { key: "fillPct", label: "% Isi", align: "right", format: (v) => <PctCell value={v} /> },
              { key: "category", label: "Jenis" },
              { key: "revenue", label: "Hasil", align: "right", format: (v) => <MoneyCell value={v} /> },
            ]}
            rows={data.table}
            searchKeys={["course", "category"]}
          />
        </div>
      );
    case "FR-10":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChartCard title="Graduan Mengikut Sesi" subtitle="Bilangan graduan">
              <GroupedBarChart data={data.charts.bySession} xKey="name" bars={[{ key: "value", name: "Graduan", color: "#0e8388" }]} />
            </ChartCard>
            <ChartCard title="Status Pekerjaan" subtitle="Kebolehpasaran">
              <DonutChart data={data.charts.byStatus} colors={["#2e9e6b", "#d64545", "#1b4b91", "#c79a3b"]} />
            </ChartCard>
            <ChartCard title="Gred Akhir" subtitle="Pecahan gred graduasi">
              <DonutChart data={data.charts.byGrade} colors={["#2e9e6b", "#0e8388", "#1b4b91", "#c79a3b", "#d64545"]} />
            </ChartCard>
          </div>
          <DataTable
            title="Senarai Graduan"
            columns={[
              { key: "name", label: "Nama" },
              { key: "session", label: "Sesi" },
              { key: "grade", label: "Gred" },
              { key: "graduation", label: "Tarikh Graduasi" },
              { key: "employment", label: "Status Pekerjaan", format: (v) => <StatusBadge status={v || "Tidak Diketahui"} /> },
            ]}
            rows={data.table}
            searchKeys={["name", "session", "employment"]}
          />
        </div>
      );
    case "FR-11":
      return (
        <div className="space-y-4">
          <ChartCard title="Aliran Tunai Akaun Amanah" subtitle="Pendapatan vs Perbelanjaan & Baki (bulanan)">
            <AreaChartMulti
              data={data.charts.monthly}
              xKey="month"
              areas={[
                { key: "Pendapatan", name: "Pendapatan", color: "#2e9e6b" },
                { key: "Perbelanjaan", name: "Perbelanjaan", color: "#d64545" },
                { key: "Baki", name: "Baki", color: "#0e8388" },
              ]}
              height={300}
            />
          </ChartCard>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Kategori Transaksi" subtitle="Pecahan mengikut kategori">
              <DonutChart data={data.charts.byCategory} colors={["#0e8388", "#1b4b91", "#c79a3b", "#2e9e6b", "#d64545", "#7c5cff"]} />
            </ChartCard>
            <DataTable
              title="Transaksi Terkini"
              columns={[
                { key: "date", label: "Tarikh" },
                { key: "type", label: "Jenis", format: (v) => <StatusBadge status={v} /> },
                { key: "category", label: "Kategori" },
                { key: "amount", label: "Jumlah", align: "right", format: (v) => <MoneyCell value={v} /> },
                { key: "balance", label: "Baki", align: "right", format: (v) => <MoneyCell value={v} /> },
              ]}
              rows={data.table}
              searchKeys={["type", "category"]}
              maxHeight="max-h-[300px]"
            />
          </div>
        </div>
      );
    case "FR-12":
      return (
        <div className="space-y-4">
          <ChartCard title="Peruntukan vs Perbelanjaan Mengikut Kod Akaun" subtitle="Kod objek am bajet mengurus">
            <GroupedBarChart
              data={data.charts.byAccount}
              xKey="code"
              bars={[{ key: "Peruntukan", name: "Peruntukan", color: "#1b4b91" }, { key: "Perbelanjaan", name: "Perbelanjaan", color: "#0e8388" }]}
              height={300}
            />
          </ChartCard>
          <DataTable
            title="Status Akaun Mengurus"
            columns={[
              { key: "code", label: "Kod" },
              { key: "name", label: "Nama Akaun" },
              { key: "allocation", label: "Peruntukan", align: "right", format: (v) => <MoneyCell value={v} /> },
              { key: "spent", label: "Belanja", align: "right", format: (v) => <MoneyCell value={v} /> },
              { key: "balance", label: "Baki", align: "right", format: (v) => <MoneyCell value={v} /> },
              { key: "pct", label: "%", align: "right", format: (v) => <PctCell value={v} /> },
              { key: "status", label: "Status", format: (v) => <StatusBadge status={v} /> },
            ]}
            rows={data.table}
            searchKeys={["code", "name", "status"]}
          />
        </div>
      );
    case "FR-13":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChartCard title="Keadaan Aset" subtitle="Baik / Perlu Baiki / Rosak">
              <DonutChart data={data.charts.byCondition} colors={["#2e9e6b", "#c79a3b", "#d64545"]} />
            </ChartCard>
            <ChartCard title="Aset Mengikut Lokasi" subtitle="Taburan aset">
              <DonutChart data={data.charts.byLocation} colors={["#0e8388", "#1b4b91", "#c79a3b", "#2e9e6b", "#d64545", "#7c5cff"]} />
            </ChartCard>
            <ChartCard title="Pematuhan Semakan" subtitle={`${data.kpi.compliancePct}% aset disemak tepat masa`}>
              <GaugeChart value={data.kpi.compliancePct} label="Pematuhan" color="#0e8388" />
            </ChartCard>
          </div>
          <DataTable
            title="Senarai Aset & Status Semakan"
            columns={[
              { key: "code", label: "Kod Aset" },
              { key: "name", label: "Nama Aset" },
              { key: "location", label: "Lokasi" },
              { key: "condition", label: "Keadaan", format: (v) => <StatusBadge status={v} /> },
              { key: "lastCheck", label: "Semakan Akhir" },
              { key: "nextCheck", label: "Semakan Seterusnya" },
              { key: "status", label: "Status", format: (v) => <StatusBadge status={v} /> },
            ]}
            rows={data.table}
            searchKeys={["code", "name", "location", "status"]}
          />
        </div>
      );
    case "FR-14":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChartCard title="Status Komputer" subtitle="Berfungsi / Penyelenggaraan / Rosak">
              <DonutChart data={data.charts.byStatus} colors={["#2e9e6b", "#c79a3b", "#d64545"]} />
            </ChartCard>
            <ChartCard title="Komputer Mengikut Makmal" subtitle="Taburan per lokasi">
              <DonutChart data={data.charts.byLab} colors={["#0e8388", "#1b4b91", "#c79a3b", "#2e9e6b", "#d64545", "#7c5cff"]} />
            </ChartCard>
            <ChartCard title="Umur Peralatan" subtitle="Mengikut kategori umur">
              <DonutChart data={data.charts.byAge} colors={["#2e9e6b", "#0e8388", "#c79a3b", "#d64545"]} />
            </ChartCard>
          </div>
          <DataTable
            title="Senarai Komputer Perlu Penggantian (> 5 Tahun)"
            columns={[
              { key: "tag", label: "Tag Aset" },
              { key: "location", label: "Lokasi" },
              { key: "brand", label: "Jenama & Model" },
              { key: "year", label: "Tahun Beli", align: "right" },
              { key: "age", label: "Umur (tahun)", align: "right", format: (v) => <span className={v >= 5 ? "font-bold text-rose-600" : "text-amber-600"}>{v}</span> },
              { key: "status", label: "Status", format: (v) => <StatusBadge status={v} /> },
              { key: "os", label: "OS" },
            ]}
            rows={data.table}
            searchKeys={["tag", "location", "brand"]}
          />
        </div>
      );
    default:
      return null;
  }
}
