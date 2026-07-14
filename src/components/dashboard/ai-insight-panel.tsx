"use client";

import { useState } from "react";
import { Sparkles, Send, RefreshCw, AlertCircle, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";

const SAMPLE_QUESTIONS = [
  "Apakah trend enrolmen 4 sesi terkini?",
  "Modul mana yang paling kritikal sekarang?",
  "Beri cadangan untuk meningkatkan pematuhan SLA aduan.",
];

export function AiInsightPanel() {
  const [insight, setInsight] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  async function generate(q?: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q || undefined }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Gagal menjana insight");
      setInsight(data.insight);
      setHasGenerated(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ralat tidak diketahui");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    generate(question.trim());
    setQuestion("");
  }

  return (
    <div className="glass-card relative overflow-hidden p-4 sm:p-5">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[#0e8388]/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-[#1b4b91]/25 blur-3xl" />

      <div className="relative">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#0e8388] to-[#1b4b91] shadow-lg shadow-teal-500/30">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-jtm-navy">AI Insight Generator</h3>
              <p className="text-[11px] text-teal-700">Dikuasakan oleh z.ai GLM 5.2 · Bahasa Malaysia</p>
            </div>
          </div>
          <button
            onClick={() => generate()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-teal-500/25 transition hover:brightness-110 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {loading ? "Menjana…" : hasGenerated ? "Jana Semula" : "Jana Insight"}
          </button>
        </div>

        {/* Question form */}
        <form onSubmit={onSubmit} className="mb-3 flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-900/10 bg-white/60 px-3 py-2 focus-within:border-teal-400/60">
            <Bot className="h-4 w-4 shrink-0 text-teal-600" />
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Tanya dalam bahasa semula jadi… cth: Apakah trend enrolmen?"
              className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="grid h-10 w-10 place-items-center rounded-xl bg-teal-500 text-white shadow-lg shadow-teal-500/25 transition hover:brightness-110 disabled:opacity-40"
            aria-label="Hantar soalan"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

        {/* Sample questions */}
        {!hasGenerated && !loading && (
          <div className="mb-3 flex flex-wrap gap-2">
            {SAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => generate(q)}
                className="rounded-full border border-slate-900/10 bg-white/60 px-3 py-1.5 text-[11px] text-slate-600 transition hover:border-teal-400/40 hover:bg-teal-500/10 hover:text-teal-700"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Output */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-xs text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading && !insight && (
          <div className="space-y-2">
            <div className="shimmer h-3 w-3/4 rounded" />
            <div className="shimmer h-3 w-full rounded" />
            <div className="shimmer h-3 w-5/6 rounded" />
            <div className="shimmer h-3 w-2/3 rounded" />
          </div>
        )}

        {insight && (
          <div className="animate-slide-up max-h-[420px] overflow-y-auto rounded-xl border border-slate-900/10 bg-white/40 p-4">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{insight}</ReactMarkdown>
            </div>
          </div>
        )}

        {!insight && !loading && !error && (
          <div className="rounded-xl border border-dashed border-slate-900/15 bg-white/40 p-6 text-center">
            <Sparkles className="mx-auto mb-2 h-8 w-8 text-teal-500/70" />
            <p className="text-sm text-slate-600">
              Klik <span className="font-semibold text-teal-700">"Jana Insight"</span> untuk mendapatkan
              ringkasan analitik automatik dashboard JTM oleh GLM 5.2.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
