"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  Calendar,
  Pill,
  Truck,
  PhoneCall,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import { useCoordinatorContext, CareTimelineEvent } from "@/hooks/useCoordinatorContext";

type FilterCategory = "ALL" | "MEDICATION" | "APPOINTMENT" | "VOICE" | "DELIVERY" | "TASK";

export function CareTimeline() {
  const { careTimeline } = useCoordinatorContext();
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>("ALL");

  // Extended timeline items including yesterday's diagnostic record upload
  const allEvents: (CareTimelineEvent & { dayGroup: "TODAY" | "YESTERDAY" })[] = useMemo(() => {
    const todayList = careTimeline.map((item) => ({
      ...item,
      dayGroup: "TODAY" as const,
    }));

    const yesterdayList: (CareTimelineEvent & { dayGroup: "TODAY" | "YESTERDAY" })[] = [
      {
        id: "tl-y1",
        time: "05:15 PM",
        patientId: "mem-anita",
        patientName: "Anita Rao",
        relationship: "Mother",
        category: "TASK",
        title: "Thyroid Blood Panel Uploaded & Verified",
        detail: "Lab report from Dr. Lal PathLabs auto-extracted and reviewed by Dr. Meera Rao (TSH: 2.4 mIU/L).",
        status: "COMPLETED",
        actionHref: "/records",
        actionLabel: "View Diagnostic Report",
        dayGroup: "YESTERDAY",
      },
      {
        id: "tl-y2",
        time: "02:30 PM",
        patientId: "mem-ramesh",
        patientName: "Ramesh Rao",
        relationship: "Father",
        category: "APPOINTMENT",
        title: "Cardiology Follow-Up Confirmed for Sep 28",
        detail: "Appointment confirmed with Dr. K.S. Rao at Apollo Hospitals Jubilee Hills.",
        status: "COMPLETED",
        actionHref: "/appointments",
        actionLabel: "View Confirmation",
        dayGroup: "YESTERDAY",
      },
    ];

    return [...todayList, ...yesterdayList];
  }, [careTimeline]);

  const filteredEvents = useMemo(() => {
    if (selectedFilter === "ALL") return allEvents;
    return allEvents.filter((item) => {
      if (selectedFilter === "VOICE") return item.category === "VOICE" || item.category === "CHECKIN";
      return item.category === selectedFilter;
    });
  }, [allEvents, selectedFilter]);

  const todayEvents = filteredEvents.filter((e) => e.dayGroup === "TODAY");
  const yesterdayEvents = filteredEvents.filter((e) => e.dayGroup === "YESTERDAY");

  const getCategoryIcon = (category: CareTimelineEvent["category"]) => {
    switch (category) {
      case "MEDICATION":
        return <Pill className="w-3.5 h-3.5 text-teal-600" />;
      case "DELIVERY":
        return <Truck className="w-3.5 h-3.5 text-sky-600" />;
      case "APPOINTMENT":
        return <Calendar className="w-3.5 h-3.5 text-indigo-600" />;
      case "VOICE":
      case "CHECKIN":
        return <PhoneCall className="w-3.5 h-3.5 text-amber-600" />;
      case "TASK":
      default:
        return <ClipboardList className="w-3.5 h-3.5 text-slate-500" />;
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

  const filterTabs: { id: FilterCategory; label: string }[] = [
    { id: "ALL", label: "All" },
    { id: "MEDICATION", label: "Medications" },
    { id: "APPOINTMENT", label: "Appointments" },
    { id: "VOICE", label: "Voice Checks" },
    { id: "DELIVERY", label: "Deliveries" },
    { id: "TASK", label: "Care Tasks" },
  ];

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-5">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600 shrink-0" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Family Care Timeline
            </h2>
          </div>
          <p className="text-sm font-semibold text-slate-900 mt-0.5 font-display">
            Chronological care events &amp; coordination milestones
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {filterTabs.map((tab) => {
            const isSelected = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white font-semibold shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline Section: TODAY */}
      {todayEvents.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              TODAY
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {todayEvents.map((event) => (
              <div key={event.id} className="relative group">
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
                    <div className="pt-0.5">
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
      )}

      {/* Timeline Section: YESTERDAY */}
      {yesterdayEvents.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              YESTERDAY
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {yesterdayEvents.map((event) => (
              <div key={event.id} className="relative group">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-slate-300 group-hover:border-teal-500 flex items-center justify-center transition-colors">
                  <div className="w-2 h-2 rounded-full bg-slate-300" />
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
                    <div className="pt-0.5">
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
      )}

      {filteredEvents.length === 0 && (
        <div className="text-center py-8 text-xs text-slate-500">
          No care events found for the selected category.
        </div>
      )}
    </div>
  );
}
