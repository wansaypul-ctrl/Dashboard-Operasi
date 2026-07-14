"use client";

import { useState, useMemo } from "react";
import { Search, ArrowUpDown, Download } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  format?: (val: any, row: any) => React.ReactNode;
  className?: string;
}

interface DataTableProps {
  columns: Column[];
  rows: Record<string, any>[];
  searchable?: boolean;
  searchKeys?: string[];
  maxHeight?: string;
  title?: string;
}

export function DataTable({
  columns,
  rows,
  searchable = true,
  searchKeys,
  maxHeight = "max-h-[460px]",
  title,
}: DataTableProps) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    let r = rows;
    if (query && searchable) {
      const q = query.toLowerCase();
      const keys = searchKeys || columns.map((c) => c.key);
      r = r.filter((row) => keys.some((k) => String(row[k] ?? "").toLowerCase().includes(q)));
    }
    if (sortKey) {
      r = [...r].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (typeof av === "number" && typeof bv === "number") {
          return sortDir === "asc" ? av - bv : bv - av;
        }
        return sortDir === "asc"
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      });
    }
    return r;
  }, [rows, query, sortKey, sortDir, searchable, searchKeys, columns]);

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function exportCsv() {
    const header = columns.map((c) => c.label).join(",");
    const body = filtered
      .map((row) => columns.map((c) => `"${String(row[c.key] ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "data"}-export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="glass-card flex flex-col p-4 sm:p-5">
      {(searchable || title) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            {title && (
              <h3 className="font-display text-sm font-semibold text-white">{title}</h3>
            )}
          </div>
          <div className="flex items-center gap-2">
            {searchable && (
              <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5">
                <Search className="h-3.5 w-3.5 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari…"
                  className="w-28 bg-transparent text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none sm:w-40"
                />
              </div>
            )}
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
              title="Eksport CSV"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">CSV</span>
            </button>
          </div>
        </div>
      )}

      <div className={cn("overflow-auto rounded-lg border border-white/10", maxHeight)}>
        <table className="glass-table">
          <thead className="sticky top-0 z-10">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  onClick={() => toggleSort(c.key)}
                  className={cn(
                    "cursor-pointer select-none whitespace-nowrap",
                    c.align === "right" && "text-right",
                    c.align === "center" && "text-center",
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {c.label}
                    <ArrowUpDown className="h-3 w-3 opacity-50" />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-sm text-slate-500">
                  Tiada data dijumpai.
                </td>
              </tr>
            ) : (
              filtered.map((row, i) => (
                <tr key={i}>
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        c.align === "right" && "text-right tabular-nums",
                        c.align === "center" && "text-center",
                        c.className,
                      )}
                    >
                      {c.format ? c.format(row[c.key], row) : String(row[c.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
        <span>{filtered.length} rekod</span>
        <span>JTM · Klasifikasi Terhad</span>
      </div>
    </div>
  );
}

// helpers exported for table cell formatting
export function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() || "";
  let cls = "badge-blue";
  if (
    s.includes("selesai") ||
    s.includes("siap") ||
    s.includes("aktif") ||
    s.includes("terkini") ||
    s.includes("berfungsi") ||
    s.includes("baik") ||
    s.includes("sepadan") ||
    s.includes("selamat") ||
    s.includes("patuh")
  ) {
    cls = "badge-green";
  } else if (
    s.includes("akan luput") ||
    s.includes("dalam tindakan") ||
    s.includes("dalam pelaksanaan") ||
    s.includes("perlu baiki") ||
    s.includes("penyelenggaraan") ||
    s.includes("amaran") ||
    s.includes("hampir")
  ) {
    cls = "badge-amber";
  } else if (
    s.includes("luput") ||
    s.includes("rosak") ||
    s.includes("percanggahan") ||
    s.includes("tertunggak") ||
    s.includes("kritikal") ||
    s.includes("belum") ||
    s.includes("berisiko")
  ) {
    cls = "badge-red";
  } else if (s.includes("income") || s.includes("bekerja") || s.includes("awam")) {
    cls = "badge-teal";
  }
  return (
    <span className={cn("inline-block rounded-md px-2 py-0.5 text-[11px] font-medium", cls)}>
      {status}
    </span>
  );
}

export function PctCell({ value }: { value: number }) {
  const v = Number(value) || 0;
  const color = v >= 80 ? "text-emerald-300" : v >= 60 ? "text-amber-300" : "text-rose-300";
  return <span className={cn("font-semibold tabular-nums", color)}>{v}%</span>;
}

export function MoneyCell({ value }: { value: number }) {
  const v = Number(value) || 0;
  return (
    <span className="tabular-nums text-slate-200">
      RM {v.toLocaleString("en-MY", { maximumFractionDigits: 0 })}
    </span>
  );
}
