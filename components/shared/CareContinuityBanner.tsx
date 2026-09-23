"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldAlert, Users } from "lucide-react";
import { useCareLoop } from "@/providers/AppProvider";

export function CareContinuityBanner() {
  const { family, members, activeUser } = useCareLoop();

  if (!family || family.isCoordinatorAvailable) {
    return null;
  }

  const primaryCoord = members.find((m) => m.id === family.primaryCoordinatorId);

  return (
    <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.2 rounded bg-amber-200/60 text-amber-900">
              Care Continuity Alert
            </span>
            <span className="text-xs text-amber-800">
              Coordinator {primaryCoord?.name || "Arjun"} is currently unavailable
            </span>
          </div>
          <h2 className="text-sm font-bold text-slate-900 mt-0.5">
            Single Point of Failure Safeguard Active
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
            Healthcare coordination for Anita &amp; Ramesh requires an active family manager. As{" "}
            <strong>{activeUser.name}</strong>, you have permission to review pending actions and temporarily take over coordination responsibility.
          </p>
        </div>
      </div>

      <Link href="/continuity" className="shrink-0 self-end sm:self-center">
        <button className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer">
          <Users className="w-3.5 h-3.5 text-teal-400" />
          <span>Review &amp; Take Over</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </Link>
    </div>
  );
}
