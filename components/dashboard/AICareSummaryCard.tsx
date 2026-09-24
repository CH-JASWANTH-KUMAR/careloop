"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Bot, ShieldCheck } from "lucide-react";
import { useCoordinatorContext } from "@/hooks/useCoordinatorContext";

export function AICareSummaryCard() {
  const { aiSummary } = useCoordinatorContext();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-teal-950 text-white p-5 sm:p-6 shadow-sm border border-slate-800">
      {/* Background ambient medical glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-2.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-400/15 border border-teal-400/30 text-teal-300 text-[11px] font-semibold tracking-wide">
              <Sparkles className="w-3 h-3 text-teal-300" />
              <span>CARE SUMMARY · LIVE SYNTHESIS</span>
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              {aiSummary.lastUpdated}
            </span>
          </div>

          <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed">
            &ldquo;{aiSummary.text}&rdquo;
          </p>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Anti-diagnostic safety boundary verified · Coordination synthesis only</span>
          </div>
        </div>

        <div className="shrink-0 self-start sm:self-center">
          <Link
            href="/agent"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition-all shadow-sm group hover:scale-[1.02] cursor-pointer"
          >
            <Bot className="w-4 h-4 text-teal-600" />
            <span>Ask CareLoop</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
