"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, UserCheck, Users } from "lucide-react";
import { useCareLoop } from "@/providers/AppProvider";

export function CareContinuityBanner() {
  const { family, members, activeUser, tasks } = useCareLoop();

  if (!family || family.isCoordinatorAvailable) {
    return null;
  }

  const primaryCoord = members.find((m) => m.id === family.primaryCoordinatorId);
  const pendingActionsCount = tasks.filter(
    (t) => t.status === "AWAITING_AUTHORIZATION" || t.status === "WAITING_FOR_APPROVAL" || t.priority === "URGENT"
  ).length;

  const coordinatorName = primaryCoord?.name?.split(" ")[0] || "Arjun";
  const successorName = activeUser.id !== family.primaryCoordinatorId ? activeUser.name.split(" ")[0] : "Meera";

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 shadow-2xs">
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
          <UserCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200 text-amber-900">
              Care Continuity Protocol
            </span>
            <span className="text-xs font-semibold text-amber-900">
              {coordinatorName} is currently unavailable
            </span>
          </div>

          <h2 className="text-sm font-bold text-slate-900">
            {successorName} can temporarily take over family coordination
          </h2>

          <p className="text-xs text-slate-700 max-w-2xl leading-relaxed">
            {pendingActionsCount > 0 ? `${pendingActionsCount} pending family care actions` : "Ongoing care workflows"}{" "}
            for Anita &amp; Ramesh will remain active. You can step in to authorize refills and appointment preparation while {coordinatorName} is away.
          </p>
        </div>
      </div>

      <Link href="/continuity" className="shrink-0 self-end sm:self-center">
        <button
          type="button"
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <Users className="w-3.5 h-3.5 text-teal-400" />
          <span>Review &amp; Accept Handover</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </Link>
    </div>
  );
}
