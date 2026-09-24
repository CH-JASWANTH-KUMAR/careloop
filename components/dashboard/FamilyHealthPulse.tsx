"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Activity, Calendar } from "lucide-react";
import { useCoordinatorContext, FamilyPulseItem } from "@/hooks/useCoordinatorContext";
import { FamilyAvatar } from "@/components/ui/FamilyAvatar";
import { FamilyCarePlanModal } from "@/components/care/FamilyCarePlanModal";

interface FamilyHealthPulseProps {
  onOpenCarePlanModal?: (memberId: string) => void;
}

export function FamilyHealthPulse({ onOpenCarePlanModal }: FamilyHealthPulseProps) {
  const { familyPulse } = useCoordinatorContext();
  const [selectedCarePlanMemberId, setSelectedCarePlanMemberId] = useState<string | null>(null);

  const getStatusBadge = (status: FamilyPulseItem["status"], variant: FamilyPulseItem["variant"]) => {
    switch (variant) {
      case "urgent":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            <span>{status}</span>
          </span>
        );
      case "waiting":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            <span>{status}</span>
          </span>
        );
      case "info":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>{status}</span>
          </span>
        );
      case "healthy":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>{status}</span>
          </span>
        );
      case "neutral":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <span>{status}</span>
          </span>
        );
    }
  };

  const handleOpenPlan = (memberId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onOpenCarePlanModal) {
      onOpenCarePlanModal(memberId);
    } else {
      setSelectedCarePlanMemberId(memberId);
    }
  };

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600 shrink-0" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Family Health Pulse
            </h2>
          </div>
          <p className="text-sm font-semibold text-slate-900 mt-0.5 font-display">
            Live health indicators across all generations
          </p>
        </div>

        <Link
          href="/family"
          className="text-xs font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 group"
        >
          <span>All member dossiers</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {familyPulse.map((item) => (
          <div
            key={item.member.id}
            className={`p-4 rounded-2xl border transition-all hover:border-slate-300 hover:shadow-xs flex flex-col justify-between ${
              item.isSelf
                ? "bg-gradient-to-b from-teal-50/40 to-white border-teal-200/90 ring-1 ring-teal-500/20"
                : "bg-white border-slate-200/80 shadow-2xs"
            }`}
          >
            <div>
              {/* Member Avatar & Role Badge */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <FamilyAvatar
                    member={item.member}
                    size="md"
                    showStatusDot
                    statusVariant={item.variant}
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-sm">
                        {item.member.name}
                      </span>
                      {item.isSelf && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-semibold">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {item.member.relationship} · {item.member.location.split(",")[0]}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="mb-2.5">
                {getStatusBadge(item.status, item.variant)}
              </div>

              {/* Next Scheduled Event / Routine */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5 mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Next Focus
                </span>
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {item.nextEvent}
                </p>
              </div>

              {/* Medical Summary */}
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                {item.summary}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={(e) => handleOpenPlan(item.member.id, e)}
                className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Calendar className="w-3 h-3" />
                <span>Care Plan</span>
              </button>

              <Link
                href={`/family`}
                className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-0.5"
              >
                <span>Dossier</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Internal Modal fallback */}
      {selectedCarePlanMemberId && (
        <FamilyCarePlanModal
          isOpen={!!selectedCarePlanMemberId}
          onClose={() => setSelectedCarePlanMemberId(null)}
          defaultMemberId={selectedCarePlanMemberId}
        />
      )}
    </div>
  );
}
