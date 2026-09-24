"use client";

import React from "react";
import Link from "next/link";
import {
  MapPin,
  ShieldCheck,
  Heart,
  Pill,
} from "lucide-react";
import { useCoordinatorContext } from "@/hooks/useCoordinatorContext";

interface PersonalizedGreetingProps {
  onOpenRefillModal: (medId: string) => void;
}

export function PersonalizedGreeting({ onOpenRefillModal }: PersonalizedGreetingProps) {
  const {
    activeUser,
    locationLabel,
    responsibilitiesText,
    greeting,
    contextualShortcuts,
  } = useCoordinatorContext();

  return (
    <div className="space-y-4">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
            <span className="font-semibold text-slate-900">{activeUser.name}</span>
            <span className="text-slate-400">·</span>
            <span>{activeUser.relationship}</span>
          </span>

          <span className="hidden sm:inline-flex items-center gap-1 text-slate-500 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{locationLabel}</span>
          </span>
        </div>

        {/* Empathetic Family Posture Badge */}
        {greeting.attentionCount > 0 ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span>{greeting.attentionCount} {greeting.attentionCount === 1 ? "thing needs" : "things need"} your attention</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>All caught up · Family care is stable</span>
          </div>
        )}
      </div>

      {/* Primary Warm Headline */}
      <div className="space-y-1.5 pt-1">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-display">
          {greeting.salutation}
        </h1>
        <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed max-w-3xl">
          {greeting.headline}
        </p>
        <p className="text-xs sm:text-sm text-slate-500 leading-normal max-w-2xl">
          {greeting.subtext}
        </p>
      </div>

      {/* Role & Responsibility Strip */}
      <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
        <div className="w-5 h-5 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 mt-0.5 border border-teal-200/60">
          <Heart className="w-3 h-3 text-teal-600" />
        </div>
        <div className="flex-1">
          <span className="font-semibold text-slate-800">Your role today: </span>
          <span>{responsibilitiesText}</span>
        </div>
      </div>

      {/* Contextual Action Prompt Chips */}
      <div className="pt-1">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Recommended actions for {activeUser.name.split(" ")[0]}
        </div>
        <div className="flex flex-wrap gap-2">
          {contextualShortcuts.map((chip) => {
            if (chip.actionType === "REFILL_MODAL") {
              return (
                <button
                  key={chip.id}
                  onClick={() => onOpenRefillModal(chip.medId || "med-thyronorm")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 text-xs font-semibold text-slate-800 transition-all shadow-2xs cursor-pointer group"
                >
                  <Pill className="w-3.5 h-3.5 text-teal-600" />
                  <span>{chip.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={chip.id}
                href={chip.href || "/care"}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-100/70 text-xs font-semibold text-slate-800 transition-all shadow-2xs group"
              >
                <span>{chip.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
