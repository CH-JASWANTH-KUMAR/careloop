"use client";

import React from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  Calendar,
  Pill,
  Truck,
  PhoneCall,
  ArrowRight,
} from "lucide-react";
import { useCoordinatorContext, CareTimelineEvent } from "@/hooks/useCoordinatorContext";

export function CareTimeline() {
  const { careTimeline } = useCoordinatorContext();

  const getCategoryIcon = (category: CareTimelineEvent["category"]) => {
    switch (category) {
      case "MEDICATION":
        return <Pill className="w-3.5 h-3.5 text-teal-600" />;
      case "DELIVERY":
        return <Truck className="w-3.5 h-3.5 text-sky-600" />;
      case "APPOINTMENT":
        return <Calendar className="w-3.5 h-3.5 text-indigo-600" />;
      case "CHECKIN":
        return <PhoneCall className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getStatusBadge = (status: CareTimelineEvent["status"]) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
            <span>Completed</span>
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-pulse" />
            <span>In flight</span>
          </span>
        );
      case "UPCOMING":
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            <Clock className="w-2.5 h-2.5 text-slate-400" />
            <span>Scheduled</span>
          </span>
        );
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600 shrink-0" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Care Timeline
            </h2>
          </div>
          <p className="text-sm font-semibold text-slate-900 mt-0.5 font-display">
            Chronological care events &amp; coordination milestones
          </p>
        </div>

        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          Live coordination sync
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {careTimeline.map((event) => (
          <div key={event.id} className="relative group">
            {/* Timeline node */}
            <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-slate-300 group-hover:border-teal-500 flex items-center justify-center transition-colors">
              <div className="w-2 h-2 rounded-full bg-slate-400 group-hover:bg-teal-500 transition-colors" />
            </div>

            <div className="space-y-1.5 pl-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {event.time}
                  </span>
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    {getCategoryIcon(event.category)}
                    <span>{event.patientName} ({event.relationship})</span>
                  </span>
                </div>

                {getStatusBadge(event.status)}
              </div>

              <div className="text-xs font-bold text-slate-900">
                {event.title}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                {event.detail}
              </p>

              {event.actionHref && event.actionLabel && (
                <div className="pt-1">
                  <Link
                    href={event.actionHref}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-900 hover:underline"
                  >
                    <span>{event.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
