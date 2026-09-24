"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, History, AlertTriangle, Phone } from "lucide-react";
import { useCareLoop } from "@/providers/AppProvider";
import { RefillWorkflowModal } from "@/components/workflow/RefillWorkflowModal";
import { PersonalizedGreeting } from "@/components/dashboard/PersonalizedGreeting";
import { CareCommandCenter } from "@/components/dashboard/CareCommandCenter";
import { RoleActionsWorkspace } from "@/components/dashboard/RoleActionsWorkspace";
import { TodayCareSection } from "@/components/dashboard/TodayCareSection";
import { FamilyHealthPulse } from "@/components/dashboard/FamilyHealthPulse";
import { CareTimeline } from "@/components/dashboard/CareTimeline";
import { VoiceCareButton } from "@/components/voice/VoiceCareButton";
import { VoiceCareModal } from "@/components/voice/VoiceCareModal";
import { FamilyCarePlanModal } from "@/components/care/FamilyCarePlanModal";

export function OverviewDashboard() {
  const { activity, tasks, approveTask } = useCareLoop();

  const [refillModalOpen, setRefillModalOpen] = useState(false);
  const [selectedMedId, setSelectedMedId] = useState<string>("med-thyronorm");
  const [carePlanMemberId, setCarePlanMemberId] = useState<string | null>(null);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
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

  // Check for acute symptom escalation
  const symptomTask = tasks.find(
    (t) => t.status === "ESCALATED" || t.source === "VOICE_ESCALATION"
  );

  // Recent meaningful family activity
  const recentCompleted = activity
    .filter(
      (ev) =>
        ev.actionType.includes("DELIVERED") ||
        ev.actionType.includes("CAPTURED") ||
        ev.actionType.includes("VERIFIED") ||
        ev.actionType.includes("GRANTED") ||
        ev.actionType.includes("UPDATED") ||
        ev.actionType.includes("HANDOVER") ||
        ev.actionType.includes("VOICE")
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

      {/* Acute Symptom Alert Banner */}
      {symptomTask && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
              <span className="font-bold text-sm uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                POSSIBLE SYMPTOM REPORTED
              </span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-200/80 text-rose-900 font-bold">
              CLINICAL SAFETY ESCALATION
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-rose-900">
              Anita reported dizziness and lightheadedness during her medication wellness check-in.
            </p>
            <p className="text-xs text-rose-700 leading-relaxed">
              Automated routines have been paused for safety. CareLoop does not make medical diagnoses. Direct human evaluation and clinical follow-up are strongly recommended.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <a
              href="tel:+919849012345"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" /> Call Anita (+91 98490 12345)
            </a>
            <a
              href="tel:+919381188069"
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" /> Call Arjun (+91 93811 88069)
            </a>
            <Link
              href="/tasks"
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-rose-900 font-semibold text-xs transition-colors border border-rose-300"
            >
              View Escalation Details
            </Link>
          </div>
        </div>
      )}

      {/* 1. Personalized Greeting & Coordinator Context */}
      <PersonalizedGreeting onOpenRefillModal={handleOpenRefill} />

      {/* 2. Care Command Center & AI Care Brief */}
      <CareCommandCenter
        onOpenRefillModal={handleOpenRefill}
        onOpenVoiceModal={() => setVoiceModalOpen(true)}
      />

      {/* 3. Role-Specific Workspace Actions */}
      <RoleActionsWorkspace
        onOpenRefillModal={handleOpenRefill}
        onOpenCarePlanModal={(id) => setCarePlanMemberId(id)}
        onOpenVoiceModal={() => setVoiceModalOpen(true)}
      />

      {/* 4. Today's Care Situation */}
      <TodayCareSection
        onOpenRefillModal={handleOpenRefill}
        onQuickApproveTask={handleQuickApproveTask}
      />

      {/* 5. Family Health Pulse */}
      <FamilyHealthPulse onOpenCarePlanModal={(id) => setCarePlanMemberId(id)} />

      {/* 6. Care Timeline with Category Filtering */}
      <CareTimeline />

      {/* 7. Voice Care Agent Entry Point */}
      <div className="space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Native Voice Check-in
        </div>
        <VoiceCareButton variant="card" />
      </div>

      {/* 8. Recent Family Care Activity with 7-Tuple Provenance */}
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
                  <span className="text-slate-500">
                    {new Date(ev.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
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

      {/* Family Care Plan Modal */}
      {carePlanMemberId && (
        <FamilyCarePlanModal
          isOpen={!!carePlanMemberId}
          onClose={() => setCarePlanMemberId(null)}
          defaultMemberId={carePlanMemberId}
        />
      )}

      {/* Voice Care Modal */}
      <VoiceCareModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
      />
    </div>
  );
}
