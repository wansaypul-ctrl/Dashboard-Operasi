"use client";

import { useEffect, useState } from "react";
import { KpiCard, type KpiCardData } from "./kpi-card";
import { AiInsightPanel } from "./ai-insight-panel";
import { ChartCard, GroupedBarChart, DonutChart, GaugeChart, AreaChartMulti } from "./charts";
import { MODULES, type ModuleCode } from "@/lib/modules";
import { Activity, Database, ShieldCheck, Zap } from "lucide-react";

interface OverviewProps {
  onSelectModule: (code: ModuleCode) => void;
}

export function Overview({ onSelectModule }: OverviewProps) {
  const [data, setData] = useState<Record<string, KpiCardData> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setData(d.modules);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Hero stats strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <HeroStat
          icon={<Database className="h-5 w-5" />}
          label="Jumlah Modul"
          value="14"
          accent="#0e8388"
          sub="FR-01 → FR-14"
        />
        <HeroStat
          icon={<Activity className="h-5 w-5" />}
          label="Rekod Dipantau"
          value={loading ? "…" : "568"}
          accent="#1b4b91"
          sub="merentas semua modul"
        />
        <HeroStat
          icon={<ShieldCheck className="h-5 w-5" />}
          label="RLS Aktif"
          value="100%"
          accent="#2e9e6b"
          sub="Row Level Security"
        />
        <HeroStat
          icon={<Zap className="h-5 w-5" />}
          label="AI Insight"
          value="GLM 5.2"
          accent="#c79a3b"
          sub="z.ai enjin aktif"
        />
      </div>

      {/* AI Insight panel */}
      <AiInsightPanel />

      {/* KPI grid — 14 modules */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-jtm-navy">Ringkasan KPI 14 Modul</h2>
            <p className="text-xs text-slate-500">Klik mana-mana kad untuk butiran modul terperinci</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="glass-card h-44 p-5">
                <div className="shimmer mb-3 h-3 w-12 rounded" />
                <div className="shimmer mb-4 h-4 w-3/4 rounded" />
                <div className="shimmer mb-2 h-8 w-1/2 rounded" />
                <div className="shimmer h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {MODULES.map((m) => {
              const d = data?.[m.code];
              if (!d) return null;
              return (
                <KpiCard
                  key={m.code}
                  data={{ ...d, accent: m.accent }}
                  onClick={() => onSelectModule(m.code)}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Summary charts */}
      {data && (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ChartCard
            title="Trend Enrolmen Sepenuh Masa"
            subtitle="Sasaran vs Sebenar mengikut sesi (FR-01)"
            className="lg:col-span-2"
          >
            <GroupedBarChart
              data={(data["FR-01"] as any).sessions}
              xKey="session"
              bars={[
                { key: "target", name: "Sasaran", color: "#1b4b91" },
                { key: "enrolled", name: "Sebenar", color: "#0e8388" },
              ]}
            />
          </ChartCard>

          <ChartCard title="Status Aduan" subtitle="Pecahan kategori (FR-02)">
            <DonutChart
              data={Object.entries((data["FR-02"] as any).byCategory).map(([k, v]) => ({
                name: k,
                value: v as number,
              }))}
              colors={["#0e8388", "#1b4b91", "#c79a3b", "#d64545"]}
            />
          </ChartCard>

          <ChartCard title="Pematuhan SLA Aduan" subtitle="Sasaran ≥ 90%" className="lg:col-span-1">
            <GaugeChart value={data["FR-02"].pct} label="SLA Patuh" color="#2e9e6b" />
          </ChartCard>

          <ChartCard title="Keadaan Aset" subtitle="Pecahan keadaan fizikal (FR-13)" className="lg:col-span-1">
            <DonutChart
              data={Object.entries((data["FR-13"] as any).breakdown).map(([k, v]) => ({
                name: k,
                value: v as number,
              }))}
              colors={["#2e9e6b", "#c79a3b", "#d64545"]}
            />
          </ChartCard>

          <ChartCard title="Pengajar DV Mengikut Tahap Sijil" subtitle="SKM3 / DKM / DLKM (FR-04)" className="lg:col-span-1">
            <DonutChart
              data={Object.entries((data["FR-04"] as any).breakdown).map(([k, v]) => ({
                name: k,
                value: v as number,
              }))}
              colors={["#0e8388", "#1b4b91", "#c79a3b", "#d64545"]}
            />
          </ChartCard>
        </section>
      )}
    </div>
  );
}

function HeroStat({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <div className="glass-card relative overflow-hidden p-4">
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full opacity-30 blur-2xl"
        style={{ background: accent }}
      />
      <div className="relative flex items-center gap-3">
        <div
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg"
          style={{ background: `${accent}1f`, color: accent }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[11px] text-slate-500">{label}</p>
          <p className="font-display text-xl font-bold text-jtm-navy">{value}</p>
          <p className="truncate text-[10px] text-slate-400">{sub}</p>
        </div>
      </div>
    </div>
  );
}
