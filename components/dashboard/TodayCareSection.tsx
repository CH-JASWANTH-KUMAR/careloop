"use client";

import React from "react";
import Link from "next/link";
import {
  Pill,
  Calendar,
  CheckCircle2,
  ArrowRight,
  User,
} from "lucide-react";
import { useCoordinatorContext } from "@/hooks/useCoordinatorContext";
import { useCareLoop } from "@/providers/AppProvider";

interface TodayCareSectionProps {
  onOpenRefillModal: (medId: string) => void;
  onQuickApproveTask?: (taskId: string) => void;
}

export function TodayCareSection({
  onOpenRefillModal,
  onQuickApproveTask,
}: TodayCareSectionProps) {
  const { urgentIssues } = useCoordinatorContext();
  const { appointments } = useCareLoop();

  // Find next upcoming appointment
  const nextAppointment = appointments.find((a) => a.status === "UPCOMING");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Today&apos;s Care Situation
            </h2>
          </div>
          <p className="text-sm font-semibold text-slate-900 mt-0.5 font-display">
            What matters right now for your family
          </p>
        </div>

        {urgentIssues.length > 0 ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            <span>{urgentIssues.length} {urgentIssues.length === 1 ? "item needs" : "items need"} attention</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>All routines on track</span>
          </span>
        )}
      </div>

      {/* 1. Urgent Care Needs Zone (if any) */}
      {urgentIssues.length > 0 && (
        <div className="space-y-3">
          {urgentIssues.map((issue) => (
            <div
              key={issue.id}
              className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200/80 text-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-rose-50/70"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5 border border-rose-300">
                  <Pill className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-200/80 text-rose-900">
                      {issue.badgeLabel}
                    </span>
                    <span className="text-xs text-rose-800 font-medium">
                      {issue.patientName}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {issue.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                    {issue.description}
                  </p>
                </div>
              </div>

              <div className="shrink-0 self-start sm:self-center">
                {issue.actionType === "REFILL_MODAL" ? (
                  <button
                    onClick={() => onOpenRefillModal(issue.entityId)}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer hover:scale-[1.02]"
                  >
                    <span>{issue.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => onQuickApproveTask && onQuickApproveTask(issue.entityId)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{issue.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Today's Structured Feed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Card A: Medication Adherence / Today's Doses */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-teal-600" />
                Medication Routine
              </span>
              <span className="text-[11px] font-semibold text-slate-400">Today</span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                Mum&apos;s Thyronorm 50 mcg
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Scheduled 07:30 AM · Empty stomach before tea.
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-medium text-[11px] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Morning dose confirmed
            </span>
            <Link
              href="/medications"
              className="text-slate-700 font-semibold hover:text-slate-900 hover:underline inline-flex items-center gap-0.5"
            >
              <span>View cabinet</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card B: Upcoming Appointment Preparation */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Upcoming Visit
              </span>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                Sep 28
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                {nextAppointment?.doctor || "Dr. K. S. Rao (Cardiology)"}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Dad&apos;s post-stent cardiac review · Apollo Jubilee Hills
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">Dossier assembled</span>
            <Link
              href="/appointments"
              className="text-blue-700 font-semibold hover:text-blue-800 hover:underline inline-flex items-center gap-0.5"
            >
              <span>Prepare packet</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card C: Family Coordination & Check-ins */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-600" />
                Family Check-in
              </span>
              <span className="text-[11px] text-slate-400">12 min ago</span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                Meera reviewed lab records
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Checked Dad&apos;s lipid panel from Chennai.
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">Active coordination</span>
            <Link
              href="/activity"
              className="text-slate-700 font-semibold hover:text-slate-900 hover:underline inline-flex items-center gap-0.5"
            >
              <span>Activity journal</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
