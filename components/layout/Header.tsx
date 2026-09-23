"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PhoneCall,
  ShieldAlert,
  Phone,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useCareLoop } from "@/providers/AppProvider";
import { gnaniVoiceProvider } from "@/services/voice/VoiceProvider";

export function Header() {
  const pathname = usePathname();
  const { members, family, logActivity, addTask } = useCareLoop();
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isVoiceCalling, setIsVoiceCalling] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceCallResult, setVoiceCallResult] = useState<{
    callId: string;
    status: string;
    transcript?: { speaker: string; text: string; timestamp: string }[];
    extractedOutcome?: {
      confirmedStock?: boolean;
      needsRefill?: boolean;
      reportedSideEffects?: string;
      escalationTriggered?: boolean;
      symptomMentioned?: string;
    };
  } | null>(null);

  // Close any open header modals automatically when route changes
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsEmergencyOpen(false);
    setIsVoiceModalOpen(false);
  }

  const primaryCoord = members.find((m) => m.id === family?.primaryCoordinatorId);
  const isAvailable = family?.isCoordinatorAvailable ?? true;

  const getPageTitle = (path: string) => {
    if (path === "/") return "Home";
    if (path.startsWith("/family")) return "Family";
    if (path.startsWith("/care")) return "Care";
    if (path.startsWith("/activity")) return "Activity";
    if (path.startsWith("/settings")) return "Settings";
    if (path.startsWith("/continuity")) return "Care Continuity";
    if (path.startsWith("/appointments")) return "Appointments";
    if (path.startsWith("/records")) return "Health Records";
    if (path.startsWith("/medications")) return "Medications";
    if (path.startsWith("/tasks")) return "Tasks";
    return "Overview";
  };

  const pageTitle = getPageTitle(pathname);

  const handleSimulateVoiceCheck = async (simulateSymptom = false) => {
    setIsVoiceCalling(true);
    try {
      const res = await gnaniVoiceProvider.initiateCall({
        targetPhone: "+91 98490 12345",
        recipientName: "Anita Rao",
        language: "te-IN",
        contextPurpose: "MEDICATION_CHECK",
        patientId: "mem-anita",
        promptNotes: simulateSymptom
          ? "Check symptoms and morning condition."
          : "Check Thyronorm stock and morning dose compliance.",
        simulateSymptomConcern: simulateSymptom,
      });

      setVoiceCallResult({
        callId: res.callId,
        status: res.status,
        transcript: res.transcript,
        extractedOutcome: res.extractedOutcome,
      });
      setIsVoiceModalOpen(true);

      if (simulateSymptom && res.extractedOutcome?.escalationTriggered) {
        addTask({
          title: "URGENT: Review Acute Symptom Report (Anita Rao)",
          description:
            "Gnani Voice Check detected reported dizziness and lightheadedness. CareLoop blocked automated operations and escalated to human caregivers for clinical evaluation.",
          familyMemberId: "mem-anita",
          ownerId: family?.primaryCoordinatorId || "mem-arjun",
          priority: "URGENT",
          dueDate: "Today",
          status: "ESCALATED",
          source: "VOICE_ESCALATION",
          requiresApproval: true,
        });

        logActivity({
          actor: { id: "rail-gnani", name: "Gnani.ai Voice Rail", type: "PROVIDER_GNANI" },
          actionType: "VOICE_ESCALATION_TRIGGERED",
          entityType: "TASK",
          entityId: res.callId,
          description:
            "Voice check detected acute symptom concern (dizziness) reported by Anita Rao. CareLoop stopped automated workflows and escalated to family.",
          whyExplanation:
            "Clinical Safety Boundary Rule: AI agents must never diagnose or interpret symptoms. Any reported acute concern triggers immediate human caregiver escalation.",
        });
      }
    } finally {
      setIsVoiceCalling(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 lg:px-8 py-3 flex items-center justify-between">
      {/* Left: Page Context & Family Context */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">{pageTitle}</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-medium text-slate-600">{family?.name || "The Rao Family"}</span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            {family?.primaryCity || "Hyderabad & Bengaluru"} · {members.length} family members
          </p>
        </div>
      </div>

      {/* Right: Secondary Actions (Coordinator Availability, Voice Check, Emergency Access) */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Care Coordinator Availability Status */}
        <Link
          href="/continuity"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            isAvailable
              ? "bg-emerald-50/70 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
              : "bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200"
          }`}
          title="Care Continuity Protocol: Coordinator availability status"
        >
          {isAvailable ? (
            <>
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">{primaryCoord?.name?.split(" ")[0] || "Coordinator"}: Available</span>
              <span className="md:hidden">Available</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden md:inline">{primaryCoord?.name?.split(" ")[0] || "Coordinator"}: Unavailable</span>
              <span className="md:hidden font-bold">Handover Needed</span>
            </>
          )}
        </Link>

        {/* If Voice Check is active/completed, show small status indicator without covering the screen */}
        {voiceCallResult && !isVoiceModalOpen && (
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-sky-200 bg-sky-50 text-sky-800 text-xs font-medium hover:bg-sky-100 transition-colors"
            title="View Voice Check conversation details"
          >
            <PhoneCall className="w-3 h-3 text-sky-600" />
            <span>Voice Check:</span>
            <span className="font-semibold">
              {voiceCallResult.extractedOutcome?.escalationTriggered ? "Escalation" : "Stock Confirmed"}
            </span>
          </button>
        )}

        {/* Voice Coordination Check Trigger */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSimulateVoiceCheck(false)}
          isLoading={isVoiceCalling}
          className="text-xs border-slate-200 hover:bg-slate-50 text-slate-700 h-8"
          title="Simulate outbound Gnani conversational voice check"
        >
          <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Voice Check</span>
        </Button>

        {/* Emergency Info Modal Trigger */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEmergencyOpen(true)}
          className="text-xs border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 h-8"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
          <span className="hidden sm:inline">Emergency Access</span>
        </Button>
      </div>

      {/* Emergency Modal */}
      <Modal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        title="Emergency Medical Dossier"
        description="Immediate contacts, preferred hospitals, and critical blood group/allergy data for first responders."
        maxWidth="lg"
      >
        <div className="space-y-4">
          {members
            .filter((m) => m.role === "DEPENDENT")
            .map((member) => (
              <div
                key={member.id}
                className="p-4 rounded-xl border border-red-200 bg-red-50/30 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {member.name} ({member.relationship}, Age {member.age})
                    </h3>
                    <p className="text-xs text-slate-600">{member.location}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 rounded bg-red-100 text-red-800 text-xs font-bold font-mono">
                      Blood: {member.bloodGroup}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-3 rounded-lg border border-red-100">
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold uppercase block">
                      Preferred Hospital
                    </span>
                    <span className="font-medium text-slate-800">
                      {member.emergencyContact.preferredHospital}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold uppercase block">
                      Emergency Attendant
                    </span>
                    <span className="font-medium text-slate-800 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      {member.emergencyContact.name} ({member.emergencyContact.phone})
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold uppercase block">
                      Documented Allergies
                    </span>
                    <span className="font-semibold text-red-600">
                      {member.allergies.join(", ") || "None documented"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold uppercase block">
                      Insurance Policy
                    </span>
                    <span className="font-mono text-slate-700">{member.insuranceId || "On file"}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </Modal>

      {/* Voice Call Simulation Modal - ONLY open when isVoiceModalOpen is explicitly true */}
      <Modal
        isOpen={isVoiceModalOpen && !!voiceCallResult}
        onClose={() => setIsVoiceModalOpen(false)}
        title="Gnani Voice Coordination Session"
        description="Outbound conversational AI call in Telugu/English with Anita Rao."
        maxWidth="lg"
      >
        {voiceCallResult && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between p-3 rounded-lg bg-sky-50 border border-sky-200 text-xs text-sky-900 gap-2">
              <div className="flex items-center gap-2">
                {voiceCallResult.status === "ESCALATED_TO_HUMAN" ? (
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                )}
                <span className="font-semibold">
                  Status: {voiceCallResult.status.replace(/_/g, " ")}
                </span>
              </div>
              <span className="font-mono text-[11px] text-sky-700">
                Call ID: {voiceCallResult.callId}
              </span>
            </div>

            {/* Potential Health Concern Alert Banner */}
            {voiceCallResult.extractedOutcome?.escalationTriggered && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-red-900">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  Safety Escalate: Symptom Detected
                </div>
                <p className="text-xs text-red-800 leading-relaxed font-semibold">
                  &ldquo;Potential health concern mentioned. No medical conclusion was made. Human attention required.&rdquo;
                </p>
                <div className="text-[11px] text-red-700">
                  Reported: <strong>{voiceCallResult.extractedOutcome.symptomMentioned}</strong>. CareLoop has halted automated refill routines and dispatched an urgent escalation task to {primaryCoord?.name || "the family coordinator"}.
                </div>
              </div>
            )}

            <div className="space-y-2 border border-slate-200 rounded-lg p-3 bg-slate-50 max-h-60 overflow-y-auto">
              {voiceCallResult.transcript?.map((t, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                    t.speaker === "AGENT"
                      ? "bg-white border border-slate-200 text-slate-800 mr-4"
                      : "bg-teal-50 border border-teal-200 text-teal-900 ml-4 font-medium"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-semibold uppercase tracking-wider">
                      {t.speaker === "AGENT" ? "CareLoop Voice Agent" : "Anita Rao (Mother)"}
                    </span>
                    <span className="font-mono">{t.timestamp}</span>
                  </div>
                  <p>{t.text}</p>
                </div>
              ))}
            </div>

            {/* Test alternative button */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSimulateVoiceCheck(!voiceCallResult.extractedOutcome?.escalationTriggered)}
                isLoading={isVoiceCalling}
                className="text-xs text-slate-600"
              >
                {voiceCallResult.extractedOutcome?.escalationTriggered
                  ? "Test Routine Stock Check"
                  : "Test Symptom Concern Escalation"}
              </Button>

              <Button
                size="sm"
                onClick={() => setIsVoiceModalOpen(false)}
                className="text-xs bg-slate-900 text-white"
              >
                Close Session
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </header>
  );
}
