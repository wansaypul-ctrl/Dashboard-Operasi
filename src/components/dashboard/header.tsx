"use client";

import { Menu, Bell, Search, Sun, Moon, ChevronDown } from "lucide-react";
import { useState } from "react";
import { getModule, type ModuleCode } from "@/lib/modules";

interface HeaderProps {
  active: ModuleCode;
  onOpenMobile: () => void;
}

export function Header({ active, onOpenMobile }: HeaderProps) {
  const meta = getModule(active);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="glass sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
      <button
        onClick={onOpenMobile}
        className="rounded-lg p-2 text-slate-200 hover:bg-white/10 lg:hidden"
        aria-label="Buka menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {meta && <meta.icon className="h-4 w-4 shrink-0 text-teal-300" />}
          <p className="font-display text-[13px] font-medium text-teal-200/90 sm:text-sm">
            {active === "overview" ? "Ringkasan Eksekutif" : meta?.code}
          </p>
        </div>
        <h1 className="truncate font-display text-[15px] font-bold text-white sm:text-lg">
          {meta?.fullTitle ?? "Dashboard"}
        </h1>
      </div>

      {/* Search */}
      <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 md:flex">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          placeholder="Cari modul, KPI…"
          className="w-32 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none lg:w-44"
        />
        <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-slate-400">⌘K</kbd>
      </div>

      <button
        className="rounded-xl p-2 text-slate-200 hover:bg-white/10"
        aria-label="Tukar tema"
      >
        <Sun className="h-5 w-5" />
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setNotifOpen((v) => !v)}
          className="relative rounded-xl p-2 text-slate-200 hover:bg-white/10"
          aria-label="Notifikasi"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-[#061427]" />
        </button>
        {notifOpen && (
          <div className="glass-strong absolute right-0 mt-2 w-72 rounded-xl p-3 shadow-2xl">
            <p className="mb-2 font-display text-sm font-semibold text-white">Notifikasi Terkini</p>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2 rounded-lg bg-white/5 p-2">
                <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                <span className="text-slate-200">2 program akan luput pentauliahan dalam 30 hari.</span>
              </li>
              <li className="flex items-start gap-2 rounded-lg bg-white/5 p-2">
                <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-400" />
                <span className="text-slate-200">3 aduan melebihi SLA 72 jam belum selesai.</span>
              </li>
              <li className="flex items-start gap-2 rounded-lg bg-white/5 p-2">
                <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-teal-400" />
                <span className="text-slate-200">Enrolmen Sesi Jun 2026 meningkat 6%.</span>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Profile */}
      <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-2 hover:bg-white/10 sm:pr-3">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-teal-500 to-blue-700 text-xs font-bold text-white">
          SA
        </div>
        <div className="hidden text-left sm:block">
          <p className="text-xs font-semibold leading-tight text-white">Super Admin</p>
          <p className="text-[10px] text-slate-400">Pengarah ICT</p>
        </div>
        <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
      </button>
    </header>
  );
}
