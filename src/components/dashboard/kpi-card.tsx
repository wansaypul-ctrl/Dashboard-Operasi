"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface KpiCardData {
  code: string;
  title: string;
  value: number;
  unit: string;
  pct: number;
  trend: number;
  subtitle: string;
  accent?: string;
  isCurrency?: boolean;
}

export function KpiCard({ data, onClick, active }: { data: KpiCardData; onClick?: () => void; active?: boolean }) {
  const trendUp = data.trend > 0;
  const trendDown = data.trend < 0;
  const trendColor = trendUp ? "text-emerald-300" : trendDown ? "text-rose-300" : "text-slate-400";
  const accent = data.accent || "#0e8388";

  return (
    <button
      onClick={onClick}
      className={cn(
        "glass-card group relative overflow-hidden p-4 text-left sm:p-5",
        active && "glow-teal",
      )}
    >
      {/* Accent glow */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-30 blur-2xl transition-opacity group-hover:opacity-60"
        style={{ background: accent }}
      />

      <div className="relative">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[10px] font-semibold tracking-wider text-slate-400">
            {data.code}
          </span>
          <span
            className="rounded-md px-1.5 py-0.5 text-[10px] font-bold"
            style={{ background: `${accent}22`, color: accent }}
          >
            {data.pct}%
          </span>
        </div>

        <p className="mb-2 line-clamp-2 min-h-[34px] font-display text-[13px] font-semibold leading-tight text-slate-100">
          {data.title}
        </p>

        <div className="mb-1 flex items-baseline gap-1">
          <span className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-[28px]">
            {data.isCurrency ? "RM " : ""}
            {formatValue(data.value)}
          </span>
          <span className="text-xs text-slate-400">{data.unit}</span>
        </div>

        <p className="mb-3 line-clamp-1 text-[11px] text-slate-400">{data.subtitle}</p>

        {/* Mini progress bar */}
        <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(data.pct, 100)}%`,
              background: `linear-gradient(90deg, ${accent}, ${accent}99)`,
            }}
          />
        </div>

        <div className={cn("flex items-center gap-1 text-[11px] font-medium", trendColor)}>
          {trendUp && <ArrowUpRight className="h-3.5 w-3.5" />}
          {trendDown && <ArrowDownRight className="h-3.5 w-3.5" />}
          {!trendUp && !trendDown && <Minus className="h-3.5 w-3.5" />}
          <span>
            {trendUp ? "+" : ""}
            {data.trend}
            {data.isCurrency && trendUp ? "k" : ""}
          </span>
          <span className="text-slate-500">vs sebelum</span>
        </div>
      </div>
    </button>
  );
}

function formatValue(n: number): string {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(2) + "j";
  if (Math.abs(n) >= 10_000) return (n / 1000).toFixed(1) + "k";
  return n.toLocaleString("en-MY");
}
