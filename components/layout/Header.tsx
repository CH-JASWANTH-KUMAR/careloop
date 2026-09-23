"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  const { members, family, logActivity, addTask } = useCareLoop();
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isVoiceCalling, setIsVoiceCalling] = useState(false);
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

  const primaryCoord = members.find((m) => m.id === family?.primaryCoordinatorId);
  const isAvailable = family?.isCoordinatorAvailable ?? true;

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
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider">
              Family Circle
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-sm font-bold text-slate-900">{family?.name || "The Rao Family"}</span>
          </div>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            {family?.primaryCity || "Hyderabad & Bengaluru"} • {members.length} Family Members
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Care Coordinator Availability Status */}
        <Link
          href="/continuity"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
            isAvailable
              ? "bg-emerald-50/70 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
              : "bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200 animate-pulse"
          }`}
          title="Care Continuity Protocol: Coordinator availability status"
        >
          {isAvailable ? (
            <>
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">{primaryCoord?.name || "Coordinator"}: Available</span>
              <span className="md:hidden">Available</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden md:inline">{primaryCoord?.name || "Coordinator"}: Unavailable</span>
              <span className="md:hidden font-bold">Handover Needed</span>
            </>
          )}
        </Link>

        {/* Voice Coordination Check Trigger */}
        <div className="relative inline-block">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSimulateVoiceCheck(false)}
            isLoading={isVoiceCalling}
            className="text-xs border-slate-200 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300"
            title="Simulate outbound Gnani conversational voice check"
          >
            <PhoneCall className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">Voice Check (Gnani)</span>
          </Button>
        </div>

        {/* Emergency Info Modal Trigger */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEmergencyOpen(true)}
          className="text-xs border-red-200 bg-red-50/40 text-red-700 hover:bg-red-100 hover:border-red-300"
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

      {/* Voice Call Simulation Modal */}
      <Modal
        isOpen={!!voiceCallResult}
        onClose={() => setVoiceCallResult(null)}
        title="Gnani.ai Voice Coordination Session"
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
                Rail Ref: {voiceCallResult.callId}
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
                onClick={() => setVoiceCallResult(null)}
                className="text-xs"
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
