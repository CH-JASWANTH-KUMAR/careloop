"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, History } from "lucide-react";
import { useCareLoop } from "@/providers/AppProvider";
import { RefillWorkflowModal } from "@/components/workflow/RefillWorkflowModal";
import { PersonalizedGreeting } from "@/components/dashboard/PersonalizedGreeting";
import { AICareSummaryCard } from "@/components/dashboard/AICareSummaryCard";
import { TodayCareSection } from "@/components/dashboard/TodayCareSection";
import { FamilyHealthPulse } from "@/components/dashboard/FamilyHealthPulse";
import { CareTimeline } from "@/components/dashboard/CareTimeline";
import { VoiceCareButton } from "@/components/voice/VoiceCareButton";

export function OverviewDashboard() {
  const { activity, approveTask } = useCareLoop();

  const [refillModalOpen, setRefillModalOpen] = useState(false);
  const [selectedMedId, setSelectedMedId] = useState<string>("med-thyronorm");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenRefill = (medId: string) => {
    setSelectedMedId(medId);
    setRefillModalOpen(true);
  };

  const handleQuickApproveTask = async (taskId: string) => {
    await approveTask(taskId);
    setToastMessage("Task approved and signed off.");
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Recent meaningful family activity
  const recentCompleted = activity
    .filter(
      (ev) =>
        ev.actionType.includes("DELIVERED") ||
        ev.actionType.includes("CAPTURED") ||
        ev.actionType.includes("VERIFIED") ||
        ev.actionType.includes("GRANTED") ||
        ev.actionType.includes("UPDATED") ||
        ev.actionType.includes("HANDOVER")
    )
    .slice(0, 4);

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. Personalized Greeting & Coordinator Context */}
      <PersonalizedGreeting onOpenRefillModal={handleOpenRefill} />

      {/* 2. AI Care Summary (Wow Factor #2) */}
      <AICareSummaryCard />

      {/* 3. Today's Care Situation (Phase 5 - Real Today Experience) */}
      <TodayCareSection
        onOpenRefillModal={handleOpenRefill}
        onQuickApproveTask={handleQuickApproveTask}
      />

      {/* 4. Family Health Pulse (Phase 6 - Visual Multigenerational Overview) */}
      <FamilyHealthPulse />

      {/* 5. Care Timeline (Phase 7 - Wow Factor #1) */}
      <CareTimeline />

      {/* 6. Voice Care Agent Entry Point (Phase 9 - Wow Factor #3) */}
      <div className="space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Native Voice Check-in
        </div>
        <VoiceCareButton variant="card" />
      </div>

      {/* 7. Recent Family Care Activity with 7-Tuple Provenance */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-teal-600 shrink-0" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Recent Family Activity
              </h2>
            </div>
            <p className="text-sm font-semibold text-slate-900 mt-0.5 font-display">
              Verified actions &amp; audit provenance
            </p>
          </div>

          <Link
            href="/activity"
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 group"
          >
            <span>Full audit journal</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="space-y-3">
          {recentCompleted.map((ev) => (
            <div
              key={ev.id}
              className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors hover:bg-slate-50"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{ev.actor.name}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-500">{new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-slate-700 font-medium">{ev.description}</p>
                {ev.whyExplanation && (
                  <p className="text-[11px] text-slate-500 italic">
                    Reason: {ev.whyExplanation}
                  </p>
                )}
              </div>

              <div className="shrink-0 self-start sm:self-center">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Verified</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Refill Workflow Modal */}
      <RefillWorkflowModal
        isOpen={refillModalOpen}
        onClose={() => setRefillModalOpen(false)}
        medicationId={selectedMedId}
      />
    </div>
  );
}
