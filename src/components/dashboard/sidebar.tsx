"use client";

import { useState } from "react";
import { MODULES, GROUPS, OVERVIEW_META, type ModuleCode } from "@/lib/modules";
import { ChevronRight, ShieldCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  active: ModuleCode;
  onSelect: (code: ModuleCode) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ active, onSelect, mobileOpen, onCloseMobile }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "glass-sidebar fixed z-50 flex h-full w-[270px] flex-col transition-transform duration-300 lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Brand header */}
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#0e8388] to-[#1b4b91] text-white shadow-lg shadow-teal-500/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[15px] font-bold leading-tight text-white">Dashboard JTM</p>
            <p className="truncate text-[11px] text-slate-300/80">Pemantauan Bersepadu</p>
          </div>
          <button
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 lg:hidden"
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {/* Overview */}
          <NavButton
            label={OVERVIEW_META.shortTitle}
            icon={<OVERVIEW_META.icon className="h-[18px] w-[18px]" />}
            active={active === "overview"}
            onClick={() => onSelect("overview")}
          />

          {GROUPS.map((group) => {
            const items = MODULES.filter((m) => m.group === group);
            return (
              <div key={group} className="mt-5">
                <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400/80">
                  {group}
                </p>
                <div className="space-y-0.5">
                  {items.map((m) => (
                    <NavButton
                      key={m.code}
                      label={m.shortTitle}
                      code={m.code}
                      icon={<m.icon className="h-[18px] w-[18px]" />}
                      active={active === m.code}
                      onClick={() => onSelect(m.code)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 px-5 py-4">
          <div className="glass-subtle rounded-lg px-3 py-2.5">
            <p className="text-[11px] font-medium text-teal-200/90">v1.0 · GLM 5.2</p>
            <p className="mt-0.5 text-[10px] text-slate-400">© JTM · KSM Malaysia</p>
          </div>
        </div>
      </aside>
    </>
  );
}

function NavButton({
  label,
  icon,
  active,
  onClick,
  code,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  code?: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn("nav-item w-full", active && "active")}
    >
      <span className={cn("shrink-0 transition-colors", active ? "text-teal-300" : hover ? "text-teal-200" : "text-slate-400")}>
        {icon}
      </span>
      <span className="flex-1 truncate text-left">{label}</span>
      {code && (
        <span className={cn("text-[9px] font-mono tracking-wide", active ? "text-teal-200" : "text-slate-500")}>
          {code}
        </span>
      )}
      {active && <ChevronRight className="h-3.5 w-3.5 text-teal-300" />}
    </button>
  );
}
