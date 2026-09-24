"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Bot,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Pill,
  Calendar,
  Phone,
  FileText,
} from "lucide-react";
import { useCoordinatorContext, PriorityItem } from "@/hooks/useCoordinatorContext";
import { VoiceCareButton } from "@/components/voice/VoiceCareButton";

interface CareCommandCenterProps {
  onOpenRefillModal: (medId: string) => void;
  onOpenVoiceModal?: () => void;
}

export function CareCommandCenter({
  onOpenRefillModal,
  onOpenVoiceModal,
}: CareCommandCenterProps) {
  const {
    greeting,
    aiSummary,
    priorityItems,
    explainableRecords,
  } = useCoordinatorContext();

  const [showExplainability, setShowExplainability] = useState(false);

  const handlePriorityAction = (item: PriorityItem) => {
    if (item.actionType === "REFILL") {
      onOpenRefillModal(item.patientId === "mem-anita" ? "med-thyronorm" : "med-thyronorm");
    }
  };

  const getPriorityBadgeColor = (category: PriorityItem["category"]) => {
    switch (category) {
      case "SYMPTOM":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "MEDICATION":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "APPOINTMENT":
        return "bg-teal-100 text-teal-800 border-teal-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. AI Care Brief Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-teal-950 text-white p-5 sm:p-6 shadow-sm border border-slate-800">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-400/15 border border-teal-400/30 text-teal-300 text-[11px] font-semibold tracking-wide">
                <Sparkles className="w-3 h-3 text-teal-300" />
                <span>AI CARE BRIEF · DAILY SYNTHESIS</span>
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                {aiSummary.lastUpdated}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowExplainability((prev) => !prev)}
                className="inline-flex items-center gap-1 text-[11px] text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 transition-colors border border-white/10 cursor-pointer"
              >
                <span>Why am I seeing this?</span>
                {showExplainability ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              <Link
                href="/agent"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all shadow-xs"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Ask CareLoop</span>
              </Link>
            </div>
          </div>

          <div className="space-y-1 max-w-3xl">
            <p className="text-base sm:text-lg text-slate-100 font-medium leading-relaxed">
              &ldquo;{aiSummary.text}&rdquo;
            </p>
            <p className="text-xs text-slate-400 pt-0.5">
              {greeting.coordinatingSummary}
            </p>
          </div>

          {/* "Why am I seeing this?" Grounded Explainability Section */}
          {showExplainability && (
            <div className="mt-4 pt-4 border-t border-slate-700/80 animate-in fade-in duration-200">
              <div className="text-[11px] font-bold uppercase tracking-wider text-teal-300 mb-2 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                Grounded Clinical & Inventory Records
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                {explainableRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-semibold uppercase">{rec.sourceType}</span>
                      <span>{rec.lastVerified}</span>
                    </div>
                    <p className="font-semibold text-white text-xs">{rec.recordTitle}</p>
                    <p className="text-[11px] text-slate-300 leading-snug">{rec.fact}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-2 italic">
                CareLoop operates under strict Anti-Diagnostic Safety boundaries. It coordinates tasks, refills, and appointments, but never issues independent medical diagnoses.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 2. Structured Care Command Priorities */}
      {priorityItems.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Priorities Requiring Attention Today
            </h2>
            <span className="text-[11px] text-slate-400">
              Sorted by urgency & clinical safety
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {priorityItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  item.category === "SYMPTOM"
                    ? "bg-rose-50/50 border-rose-300 shadow-xs"
                    : item.category === "MEDICATION"
                    ? "bg-amber-50/40 border-amber-200/90 shadow-2xs"
                    : "bg-white border-slate-200/90 shadow-2xs"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityBadgeColor(
                        item.category
                      )}`}
                    >
                      Priority #{item.rank}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      {item.patientName}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">
                    {item.category}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {item.description}
                </p>

                {/* Explainability record preview */}
                <div className="mt-2.5 py-1.5 px-2.5 rounded-lg bg-slate-100/70 border border-slate-200/60 text-[11px] text-slate-600 flex items-center gap-1.5">
                  <span className="font-semibold text-slate-700 shrink-0">Reason:</span>
                  <span className="truncate">{item.whyRecord}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-slate-100">
                  {item.actionType === "REFILL" ? (
                    <button
                      type="button"
                      onClick={() => handlePriorityAction(item)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Pill className="w-3.5 h-3.5" />
                      <span>{item.actionLabel}</span>
                    </button>
                  ) : item.actionHref ? (
                    <Link
                      href={item.actionHref}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      {item.category === "APPOINTMENT" ? (
                        <Calendar className="w-3.5 h-3.5" />
                      ) : (
                        <FileText className="w-3.5 h-3.5" />
                      )}
                      <span>{item.actionLabel}</span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handlePriorityAction(item)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-semibold text-xs"
                    >
                      {item.actionLabel}
                    </button>
                  )}

                  {/* Secondary Action */}
                  {item.secondaryActionLabel && (
                    <>
                      {item.secondaryActionType === "VOICE_CHECK" ? (
                        <VoiceCareButton variant="header" />
                      ) : item.secondaryActionHref ? (
                        <Link
                          href={item.secondaryActionHref}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors border border-slate-200"
                        >
                          {item.secondaryActionLabel}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenVoiceModal) onOpenVoiceModal();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors border border-slate-200 flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{item.secondaryActionLabel}</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
