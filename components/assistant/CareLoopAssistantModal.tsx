"use client";

import React, { useState } from "react";
import {
  PhoneCall,
  Bot,
  Sparkles,
  Send,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useCareLoop } from "@/providers/AppProvider";
import { useCoordinatorContext } from "@/hooks/useCoordinatorContext";
import { VoiceCareModal } from "@/components/voice/VoiceCareModal";
import { FamilyAvatar } from "@/components/ui/FamilyAvatar";

interface CareLoopAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CareLoopAssistantModal({
  isOpen,
  onClose,
}: CareLoopAssistantModalProps) {
  const { medications, appointments, members, family, activeUser } = useCareLoop();
  const { aiSummary } = useCoordinatorContext();

  const [activeTab, setActiveTab] = useState<"voice" | "ask" | "context">("voice");
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<"te-IN" | "en-IN">("te-IN");

  // Ask CareLoop Chat state
  const [queryInput, setQueryInput] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { sender: "user" | "careloop"; text: string; timestamp: string }[]
  >([
    {
      sender: "careloop",
      text: `Hello ${activeUser.name.split(" ")[0]}. I am CareLoop, your family healthcare coordination assistant. How can I assist you with Anita or Ramesh today?`,
      timestamp: "Just now",
    },
  ]);

  const targetMember =
    activeUser.role === "DEPENDENT"
      ? activeUser
      : members.find((m) => m.id === "mem-anita") || members[0];

  const primaryCoord = members.find((m) => m.id === family?.primaryCoordinatorId);
  const isAvailable = family?.isCoordinatorAvailable ?? true;

  const handleLaunchVoice = () => {
    setVoiceModalOpen(true);
  };

  const handleSendQuery = (textToSend?: string) => {
    const q = (textToSend || queryInput).trim();
    if (!q) return;

    const userMsg = {
      sender: "user" as const,
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setQueryInput("");

    // Generate grounded contextual response from live store state
    setTimeout(() => {
      let reply = "";
      const lower = q.toLowerCase();

      if (lower.includes("thyronorm") || lower.includes("mum's medication") || lower.includes("mum's medicine") || lower.includes("refill")) {
        const thyronorm = medications.find((m) => m.id === "med-thyronorm");
        if (thyronorm) {
          reply = `Anita Rao's Thyronorm 50 mcg currently has ${thyronorm.currentStockUnits} tablets remaining (${thyronorm.remainingDays} days). ${
            thyronorm.remainingDays <= 5
              ? "A refill request is awaiting coordinator sign-off with Apollo Pharmacy Jubilee Hills."
              : "Stock is sufficient for routine daily adherence at 06:30 AM."
          }`;
        } else {
          reply = "Thyronorm 50 mcg is tracked for Anita Rao. Refill order is in progress with Apollo Pharmacy.";
        }
      } else if (lower.includes("appointment") || lower.includes("cardiology") || lower.includes("dad's")) {
        const appt = appointments.find((a) => a.patientId === "mem-ramesh");
        if (appt) {
          reply = `Ramesh Rao has a ${appt.speciality} follow-up with ${appt.doctor} at ${appt.hospital} on ${appt.date} at ${appt.time}. His pre-visit vital dossier has been prepared.`;
        } else {
          reply = "Ramesh Rao's next cardiology review is scheduled at Apollo Hospitals Jubilee Hills.";
        }
      } else if (lower.includes("delivery") || lower.includes("delhivery") || lower.includes("courier")) {
        reply = "Delhivery cold-chain express dispatch is active for Anita Rao's medication parcel. Current temperature telemetry: 4.2°C, on schedule for doorstep Jubilee Hills handover.";
      } else if (lower.includes("arjun") || lower.includes("coordinator") || lower.includes("availability")) {
        reply = `${primaryCoord?.name || "Arjun Rao"} is ${
          isAvailable ? "currently available and actively coordinating family care" : "marked unavailable right now. Handover protocol is active for Meera or Anita"
        }.`;
      } else if (lower.includes("dizzy") || lower.includes("symptom") || lower.includes("fall") || lower.includes("pain")) {
        reply = "Clinical Safety Warning: If any family member is experiencing dizziness, chest discomfort, or sudden weakness, please seek immediate emergency medical care. CareLoop does not diagnose medical symptoms and alerts family caregivers immediately.";
      } else {
        reply = `All family workflows for ${family?.name || "The Rao Family"} are monitored. Anita's Thyronorm stock and Ramesh's cardiology follow-up are up to date. You can also start a native voice check-in anytime.`;
      }

      setChatHistory((prev) => [
        ...prev,
        {
          sender: "careloop",
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 400);
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !voiceModalOpen}
        onClose={onClose}
        title="CareLoop Assistant"
        description="Family healthcare coordination assistant for voice wellness checks, logistics queries, and care continuity."
        maxWidth="lg"
      >
        <div className="space-y-4">
          {/* Active Family Perspective Strip */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-2.5">
              <FamilyAvatar member={targetMember} size="sm" />
              <div>
                <span className="font-bold text-slate-900">{targetMember.name}</span>
                <span className="text-slate-500 ml-1.5 font-medium">
                  ({targetMember.relationship} · {targetMember.location})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-[10px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              <Sparkles className="w-3 h-3 text-teal-600" />
              <span>COORDINATION ASSISTANT</span>
            </div>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab("voice")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "voice"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
              <span>Voice Check-in</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("ask")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "ask"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-teal-600" />
              <span>Ask CareLoop</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("context")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "context"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
              <span>Recent Context</span>
            </button>
          </div>

          {/* TAB 1: VOICE CHECK-IN */}
          {activeTab === "voice" && (
            <div className="space-y-4 py-1">
              <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 text-teal-950 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900">
                    Native Outbound Voice Check-in
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-200/80 text-teal-900 font-bold">
                    Gnani.ai Speech Rail
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  CareLoop speaks in native Telugu or Indian English to verify morning medication adherence, stock levels, and comfort without requiring smartphone typing.
                </p>

                {/* Language Selector */}
                <div className="flex items-center gap-2 pt-1 text-xs">
                  <span className="font-semibold text-slate-700">Language:</span>
                  <button
                    type="button"
                    onClick={() => setSelectedLanguage("te-IN")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      selectedLanguage === "te-IN"
                        ? "bg-teal-700 text-white shadow-2xs"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    తెలుగు (Telugu)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedLanguage("en-IN")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      selectedLanguage === "en-IN"
                        ? "bg-teal-700 text-white shadow-2xs"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    English (Indian)
                  </button>
                </div>
              </div>

              {/* Start Call CTA Button */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Recipient: {targetMember.name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Phone: {targetMember.emergencyContact?.phone || "+91 98490 12345"}
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleLaunchVoice}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Start Voice Check-in</span>
                </Button>
              </div>
            </div>
          )}

          {/* TAB 2: ASK CARELOOP */}
          {activeTab === "ask" && (
            <div className="space-y-3">
              {/* Quick Questions Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Family Coordination Queries
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "When is Dad's next cardiology review?",
                    "Is Mum's Thyronorm delivery on time?",
                    "What tasks need approval today?",
                    "Is Arjun currently available?",
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleSendQuery(chip)}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-teal-50 hover:border-teal-200 border border-slate-200 text-slate-700 hover:text-teal-900 text-xs font-medium transition-colors text-left"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Thread */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 max-h-56 overflow-y-auto text-xs">
                {chatHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg leading-relaxed ${
                      item.sender === "careloop"
                        ? "bg-white border border-slate-200 text-slate-800"
                        : "bg-teal-700 text-white ml-6 font-medium"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                      <span className={item.sender === "careloop" ? "font-bold text-teal-800" : "text-teal-200"}>
                        {item.sender === "careloop" ? "CareLoop Assistant" : activeUser.name.split(" ")[0]}
                      </span>
                      <span>{item.timestamp}</span>
                    </div>
                    <div>{item.text}</div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendQuery();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder="Ask about medications, courier deliveries, or schedules..."
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="bg-slate-900 hover:bg-slate-800 text-white gap-1 text-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask</span>
                </Button>
              </form>
            </div>
          )}

          {/* TAB 3: RECENT CONTEXT */}
          {activeTab === "context" && (
            <div className="space-y-3 py-1 text-xs">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block">
                  Current Care Synthesis
                </span>
                <p className="text-slate-600 leading-relaxed italic">
                  &ldquo;{aiSummary.text}&rdquo;
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Coordinator Coverage
                  </span>
                  <div className="font-bold text-slate-800">
                    {primaryCoord?.name || "Arjun Rao"}
                  </div>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    isAvailable ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Attending Hospital
                  </span>
                  <div className="font-bold text-slate-800">
                    Apollo Hospitals
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Jubilee Hills, Hyderabad
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Safety Gate Note */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              Non-diagnostic healthcare coordination assistant
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Embedded Voice Care Modal */}
      <VoiceCareModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        targetMemberId={targetMember.id}
      />
    </>
  );
}
