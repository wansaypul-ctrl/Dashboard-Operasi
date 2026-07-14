"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts";

const AXIS = { fill: "#9bb3d4", fontSize: 11 };
const GRID = "rgba(255,255,255,0.08)";

const PALETTE = ["#0e8388", "#1b4b91", "#c79a3b", "#2e9e6b", "#d64545", "#7c5cff"];

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function ChartCard({ title, subtitle, children, className, action }: ChartCardProps) {
  return (
    <div className={`glass-card flex flex-col p-4 sm:p-5 ${className ?? ""}`}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-display text-sm font-semibold text-white">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[11px] text-slate-400">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-xs shadow-xl">
      {label && <p className="mb-1 font-medium text-white">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="font-semibold text-white">
            {typeof p.value === "number" ? p.value.toLocaleString("en-MY") : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ---- Bar chart (grouped) ----
export function GroupedBarChart({
  data,
  xKey,
  bars,
  height = 260,
}: {
  data: any[];
  xKey: string;
  bars: { key: string; name: string; color?: string }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} tick={AXIS} tickLine={false} axisLine={false} interval={0} angle={-12} textAnchor="end" height={50} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" />
        {bars.map((b, i) => (
          <Bar
            key={b.key}
            dataKey={b.key}
            name={b.name}
            fill={b.color || PALETTE[i % PALETTE.length]}
            radius={[6, 6, 0, 0]}
            maxBarSize={42}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

// ---- Horizontal bar chart ----
export function HBarChart({
  data,
  yKey,
  bars,
  height = 260,
}: {
  data: any[];
  yKey: string;
  bars: { key: string; name: string; color?: string }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart layout="vertical" data={data} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
        <XAxis type="number" tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey={yKey} tick={AXIS} tickLine={false} axisLine={false} width={110} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" />
        {bars.map((b, i) => (
          <Bar key={b.key} dataKey={b.key} name={b.name} fill={b.color || PALETTE[i % PALETTE.length]} radius={[0, 6, 6, 0]} maxBarSize={26} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

// ---- Line chart ----
export function LineChartMulti({
  data,
  xKey,
  lines,
  height = 260,
}: {
  data: any[];
  xKey: string;
  lines: { key: string; name: string; color?: string }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} />
        <Tooltip content={<ChartTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" />
        {lines.map((l, i) => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.name}
            stroke={l.color || PALETTE[i % PALETTE.length]}
            strokeWidth={2.5}
            dot={{ r: 3, fill: l.color || PALETTE[i % PALETTE.length] }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// ---- Area chart ----
export function AreaChartMulti({
  data,
  xKey,
  areas,
  height = 260,
}: {
  data: any[];
  xKey: string;
  areas: { key: string; name: string; color?: string }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <defs>
          {areas.map((a, i) => {
            const c = a.color || PALETTE[i % PALETTE.length];
            return (
              <linearGradient key={a.key} id={`grad-${a.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c} stopOpacity={0.5} />
                <stop offset="100%" stopColor={c} stopOpacity={0.02} />
              </linearGradient>
            );
          })}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} />
        <Tooltip content={<ChartTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" />
        {areas.map((a, i) => {
          const c = a.color || PALETTE[i % PALETTE.length];
          return (
            <Area
              key={a.key}
              type="monotone"
              dataKey={a.key}
              name={a.name}
              stroke={c}
              strokeWidth={2.5}
              fill={`url(#grad-${a.key})`}
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ---- Donut / Pie chart ----
export function DonutChart({
  data,
  height = 260,
  colors,
  showLegend = true,
}: {
  data: { name: string; value: number }[];
  height?: number;
  colors?: string[];
  showLegend?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius="55%"
          outerRadius="82%"
          paddingAngle={3}
          stroke="none"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={(colors || PALETTE)[i % (colors || PALETTE).length]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
        {showLegend && <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" />}
      </PieChart>
    </ResponsiveContainer>
  );
}

// ---- Gauge (radial) ----
export function GaugeChart({
  value,
  label,
  color = "#0e8388",
  height = 220,
}: {
  value: number;
  label?: string;
  color?: string;
  height?: number;
}) {
  const data = [{ name: label || "value", value: Math.min(value, 100) }];
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadialBarChart
        cx="50%"
        cy="55%"
        innerRadius="65%"
        outerRadius="100%"
        barSize={14}
        data={data}
        startAngle={220}
        endAngle={-40}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
        <RadialBar background={{ fill: "rgba(255,255,255,0.08)" }} dataKey="value" cornerRadius={10} fill={color} />
        <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fill="#ffffff" fontSize="28" fontWeight="800" fontFamily="Poppins, sans-serif">
          {value}%
        </text>
        {label && (
          <text x="50%" y="72%" textAnchor="middle" dominantBaseline="middle" fill="#9bb3d4" fontSize="11">
            {label}
          </text>
        )}
      </RadialBarChart>
    </ResponsiveContainer>
  );
}
