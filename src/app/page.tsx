"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Overview } from "@/components/dashboard/overview";
import { ModuleView } from "@/components/dashboard/module-view";
import type { ModuleCode } from "@/lib/modules";

export default function Home() {
  const [active, setActive] = useState<ModuleCode>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleSelect(code: ModuleCode) {
    setActive(code);
    setMobileOpen(false);
    // scroll to top on module change
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden">
      {/* Animated background orbs */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="orb animate-float h-[420px] w-[420px] bg-[#0e8388]/35" style={{ top: "-8%", left: "-6%" }} />
        <div className="orb animate-float h-[480px] w-[480px] bg-[#1b4b91]/40" style={{ bottom: "-12%", right: "-8%", animationDelay: "4s" }} />
        <div className="orb animate-pulse-soft h-[300px] w-[300px] bg-[#2e9e6b]/20" style={{ top: "40%", left: "35%" }} />
      </div>

      <Sidebar
        active={active}
        onSelect={handleSelect}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <Header active={active} onOpenMobile={() => setMobileOpen(true)} />

        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div key={active} className="animate-slide-up mx-auto w-full max-w-[1500px]">
            {active === "overview" ? (
              <Overview onSelectModule={handleSelect} />
            ) : (
              <ModuleView key={active} code={active} />
            )}
          </div>
        </main>

        <footer className="mt-auto border-t border-white/10 bg-[#061427]/60 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1500px] flex-col items-center justify-between gap-2 text-[11px] text-slate-400 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-soft" />
              <span>
                Sistem Dashboard Pemantauan Bersepadu · JTM · Kementerian Sumber Manusia Malaysia
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded border border-amber-400/40 bg-amber-400/10 px-1.5 py-0.5 text-[10px] text-amber-200">
                Terhad — Kegunaan Dalaman
              </span>
              <span>v1.0 · Dikuasakan z.ai GLM 5.2</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
