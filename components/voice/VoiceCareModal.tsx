"use client";

import React, { useState } from "react";
import {
  PhoneCall,
  Phone,
  Volume2,
  Mic,
  ShieldAlert,
  Globe,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useCareLoop } from "@/providers/AppProvider";
import { gnaniVoiceProvider } from "@/services/voice/VoiceProvider";

type VoiceState =
  | "idle"
  | "connecting"
  | "listening"
  | "processing"
  | "responding"
  | "escalated"
  | "completed"
  | "error";

interface VoiceCareModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSimulateSymptom?: boolean;
  targetMemberId?: string;
}

export function VoiceCareModal({
  isOpen,
  onClose,
  defaultSimulateSymptom = false,
  targetMemberId = "mem-anita",
}: VoiceCareModalProps) {
  const { family, members, addTask, logActivity } = useCareLoop();

  const targetMember =
    members.find((m) => m.id === targetMemberId) ||
    members.find((m) => m.id === "mem-anita") ||
    members[0];
  const targetName = targetMember?.name || "Anita Rao";
  const targetPhone = targetMember?.emergencyContact?.phone || "+91 98490 12345";
  const targetLocation = targetMember?.location?.split(",")[0] || "Jubilee Hills";

  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [selectedLanguage, setSelectedLanguage] = useState<"te-IN" | "en-IN">("te-IN");
  const [simulateSymptom, setSimulateSymptom] = useState(defaultSimulateSymptom);
  const [transcript, setTranscript] = useState<{ speaker: string; text: string; timestamp: string }[]>([]);

  const handleCloseModal = () => {
    setVoiceState("idle");
    setTranscript([]);
    onClose();
  };

  const handleStartCall = async (symptomOverride?: boolean) => {
    const isSymptom = symptomOverride !== undefined ? symptomOverride : simulateSymptom;
    setVoiceState("connecting");
    setTranscript([]);

    try {
      // Small simulated telephony connection latency
      await new Promise((r) => setTimeout(r, 900));
      setVoiceState("listening");

      const res = await gnaniVoiceProvider.initiateCall({
        targetPhone: targetPhone,
        recipientName: targetName,
        language: selectedLanguage,
        contextPurpose: "MEDICATION_CHECK",
        patientId: targetMember?.id || "mem-anita",
        promptNotes: isSymptom
          ? `Check symptoms and morning condition for ${targetName}.`
          : `Check wellness and care compliance for ${targetName}.`,
        simulateSymptomConcern: isSymptom,
      });

      // Progressive playback of transcript to simulate real dialogue
      const transcriptData = res.transcript || [];
      if (transcriptData.length > 0) {
        setVoiceState("responding");
        setTranscript([transcriptData[0]]);
        
        await new Promise((r) => setTimeout(r, 1400));
        setVoiceState("listening");
        if (transcriptData[1]) {
          setTranscript((prev) => [...prev, transcriptData[1]]);
        }

        await new Promise((r) => setTimeout(r, 1600));
        setVoiceState("processing");

        await new Promise((r) => setTimeout(r, 1000));
        if (transcriptData[2]) {
          setTranscript((prev) => [...prev, transcriptData[2]]);
        }

        if (isSymptom) {
          setVoiceState("escalated");

          addTask({
            title: `URGENT: Review Acute Symptom Report (${targetName})`,
            description: `Gnani Voice Check detected reported dizziness and lightheadedness for ${targetName}. CareLoop blocked automated operations and escalated to human caregivers for clinical evaluation.`,
            familyMemberId: targetMember?.id || "mem-anita",
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
            description: `Voice check detected acute symptom concern (dizziness) reported by ${targetName}. CareLoop stopped automated workflows and escalated to family.`,
            whyExplanation:
              "Clinical Safety Boundary Rule: AI agents must never diagnose or interpret symptoms. Any reported acute concern triggers immediate human caregiver escalation.",
          });
        } else {
          setVoiceState("completed");
        }
      }
    } catch {
      setVoiceState("error");
    }
  };

  const getStateDescription = () => {
    switch (voiceState) {
      case "connecting":
        return `Connecting to ${targetName} in ${targetLocation} (${targetPhone})...`;
      case "listening":
        return `Listening... (Gnani.ai Speech Recognition active in ${selectedLanguage === "te-IN" ? "Telugu" : "Indian English"})`;
      case "processing":
        return "Understanding... CareLoop is analyzing conversation against family care plan...";
      case "responding":
        return `CareLoop is speaking with ${targetName}...`;
      case "escalated":
        return "CLINICAL SAFETY ESCALATION TRIGGERED: Physical symptom reported. Automated workflows stopped.";
      case "completed":
        return "Check-in completed. Medication stock logged and care plan verified.";
      case "error":
        return "Couldn't start the call. Network or provider unreachable.";
      case "idle":
      default:
        return `Ready to start voice check-in with ${targetName}.`;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} title="Gnani.ai Voice Care Agent" maxWidth="lg">
      <div className="space-y-6">
        {/* Sandbox Notice & Language Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
              SANDBOX SIMULATED
            </span>
            <span className="text-slate-600">Caller ID: +91 80 4719 0000</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <button
              onClick={() => setSelectedLanguage("te-IN")}
              className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                selectedLanguage === "te-IN"
                  ? "bg-teal-700 text-white shadow-2xs"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              తెలుగు (Telugu)
            </button>
            <button
              onClick={() => setSelectedLanguage("en-IN")}
              className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                selectedLanguage === "en-IN"
                  ? "bg-teal-700 text-white shadow-2xs"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              English (Indian)
            </button>
          </div>
        </div>

        {/* Central Voice Wave / Animation Arena */}
        <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 text-white text-center flex flex-col items-center justify-center space-y-4 relative overflow-hidden">
          {/* Animated concentric pulse rings */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            {voiceState === "connecting" && (
              <div className="absolute inset-0 rounded-full border-2 border-teal-500/40 animate-ping" />
            )}
            {(voiceState === "listening" || voiceState === "responding") && (
              <>
                <div className="absolute inset-0 rounded-full bg-teal-500/10 animate-pulse" />
                <div className="absolute -inset-3 rounded-full border border-teal-400/30 animate-pulse" />
                <div className="absolute -inset-6 rounded-full border border-teal-400/15 animate-ping duration-1000" />
              </>
            )}
            {voiceState === "escalated" && (
              <div className="absolute -inset-4 rounded-full border-2 border-rose-500/60 animate-pulse bg-rose-500/10" />
            )}

            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform ${
                voiceState === "escalated"
                  ? "bg-rose-600 text-white"
                  : voiceState === "idle"
                  ? "bg-slate-800 text-teal-400"
                  : "bg-teal-600 text-white scale-105"
              }`}
            >
              {voiceState === "escalated" ? (
                <ShieldAlert className="w-9 h-9" />
              ) : voiceState === "listening" ? (
                <Mic className="w-8 h-8 animate-bounce" />
              ) : voiceState === "responding" ? (
                <Volume2 className="w-8 h-8" />
              ) : (
                <PhoneCall className="w-8 h-8" />
              )}
            </div>
          </div>

          {/* State Text & Subtitle */}
          <div className="space-y-1 z-10 max-w-md">
            <div className="text-xs font-mono font-bold tracking-wider uppercase text-teal-400">
              State: {voiceState}
            </div>
            <h3 className="text-base font-bold text-white font-display">
              {getStateDescription()}
            </h3>
            <p className="text-xs text-slate-400">
              Target: {targetName} ({targetMember?.relationship || "Family Member"}) · {targetLocation}
            </p>
          </div>
        </div>

        {/* Live Audio Transcript Box */}
        {transcript.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Real-Time Call Transcript</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 max-h-56 overflow-y-auto">
              {transcript.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg text-xs leading-relaxed ${
                    item.speaker === "AGENT"
                      ? "bg-white border border-slate-200 text-slate-900"
                      : "bg-teal-50 border border-teal-200 text-teal-950 font-medium"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span className="font-bold">
                      {item.speaker === "AGENT" ? "CareLoop Voice Rail" : `${targetName} (Recipient)`}
                    </span>
                    <span className="font-mono">{item.timestamp}</span>
                  </div>
                  <div>{item.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clinical Safety Alert Box if Escalated */}
        {voiceState === "escalated" && (
          <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Clinical Safety Boundary Intercept Active
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {targetName} reported dizziness upon standing. CareLoop has halted all automated actions, logged a formal provenance incident, and dispatched an urgent task to family coordinators.
            </p>
          </div>
        )}

        {/* Call Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
          <div className="flex items-center gap-2 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={simulateSymptom}
                onChange={(e) => setSimulateSymptom(e.target.checked)}
                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <span className="font-medium text-slate-700">Simulate acute symptom concern (dizziness)</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>

            {voiceState === "idle" && (
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${targetPhone.replace(/\s+/g, "")}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Open phone dialer on desktop/mobile"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>Call from phone</span>
                </a>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleStartCall()}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold"
                >
                  <PhoneCall className="w-4 h-4 mr-1.5" />
                  <span>Start voice check-in</span>
                </Button>
              </div>
            )}

            {voiceState === "connecting" && (
              <Button variant="primary" size="sm" disabled className="bg-teal-700/80 text-white font-bold cursor-wait">
                <PhoneCall className="w-4 h-4 mr-1.5 animate-spin" />
                <span>Connecting...</span>
              </Button>
            )}

            {(voiceState === "listening" || voiceState === "processing" || voiceState === "responding") && (
              <Button variant="primary" size="sm" disabled className="bg-teal-700 text-white font-bold">
                <Volume2 className="w-4 h-4 mr-1.5 animate-pulse" />
                <span>CareLoop is speaking with {targetName.split(" ")[0]}</span>
              </Button>
            )}

            {voiceState === "completed" && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 mr-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Check-in completed
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setVoiceState("idle")}
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  <span>New check-in</span>
                </Button>
              </div>
            )}

            {voiceState === "error" && (
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${targetPhone.replace(/\s+/g, "")}`}
                  className="px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-300 text-teal-800 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  <span>Call from phone instead</span>
                </a>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleStartCall()}
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  <span>Couldn&apos;t start the call — Retry</span>
                </Button>
              </div>
            )}

            {voiceState === "escalated" && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setVoiceState("idle")}
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                <span>Reset Check-in</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
