"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Bot,
  User,
  CreditCard,
  Truck,
  PhoneCall,
  Calendar,
} from "lucide-react";
import { useCareLoop } from "@/providers/AppProvider";
import { ActivityEvent } from "@/types";
import { formatDate } from "@/lib/utils";

export function ActivityScreen() {
  const { activity } = useCareLoop();
  const [filterMode, setFilterMode] = useState<"ALL" | "REFILL" | "AUTHORIZATION" | "PROVIDER">("ALL");

  const filteredEvents = activity.filter((ev) => {
    if (filterMode === "REFILL") {
      return (
        ev.entityType === "MEDICATION" ||
        ev.entityType === "SHIPMENT" ||
        ev.description.toLowerCase().includes("refill") ||
        ev.description.toLowerCase().includes("thyronorm")
      );
    }
    if (filterMode === "AUTHORIZATION") {
      return ev.actionType.includes("APPROVAL") || ev.actionType.includes("AUTHORIZ");
    }
    if (filterMode === "PROVIDER") {
      return (
        ev.actor.type === "PROVIDER_GNANI" ||
        ev.actor.type === "PROVIDER_PINELABS" ||
        ev.actor.type === "PROVIDER_DELHIVERY"
      );
    }
    return true;
  });

  // Group events by day: TODAY, YESTERDAY, EARLIER
  const todayEvents = filteredEvents.slice(0, 4);
  const yesterdayEvents = filteredEvents.slice(4, 8);
  const earlierEvents = filteredEvents.slice(8);

  const getActorBadge = (type: ActivityEvent["actor"]["type"]) => {
    switch (type) {
      case "CARE_AGENT":
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
            <Bot className="w-3 h-3 text-teal-600" />
            CareLoop AI
          </span>
        );
      case "PROVIDER_PINELABS":
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <CreditCard className="w-3 h-3 text-amber-600" />
            Pine Labs [SANDBOX]
          </span>
        );
      case "PROVIDER_DELHIVERY":
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
            <Truck className="w-3 h-3 text-sky-600" />
            Delhivery [SANDBOX]
          </span>
        );
      case "PROVIDER_GNANI":
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
            <PhoneCall className="w-3 h-3 text-indigo-600" />
            Gnani Voice [SANDBOX]
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
            <User className="w-3 h-3 text-slate-600" />
            Family Member
          </span>
        );
    }
  };

  const renderEventCard = (ev: ActivityEvent) => {
    const timeString = new Date(ev.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div
        key={ev.id}
        className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-all space-y-2.5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-900">{timeString}</span>
            <span className="text-slate-300">•</span>
            {getActorBadge(ev.actor.type)}
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Ref: {ev.id.slice(0, 14)}
          </span>
        </div>

        <h4 className="font-bold text-sm text-slate-900 leading-snug">
          {ev.description}
        </h4>

        {/* Structured 7-Field Provenance Audit Trail */}
        <div className="rounded-lg bg-slate-50/80 border border-slate-200/80 p-3 space-y-2 text-[11px]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-2 border-b border-slate-200/60">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">WHO</span>
              <span className="text-slate-900 font-semibold">{ev.actor.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">WHAT</span>
              <span className="text-slate-900 font-semibold">{ev.actionType.replace(/_/g, " ")}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">WHEN</span>
              <span className="text-slate-900 font-mono">{timeString} ({formatDate(ev.timestamp.split("T")[0])})</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">SOURCE</span>
              <span className="text-slate-900 font-medium">{ev.source || "CareLoop Core"}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">WHY</span>
              <span className="text-slate-700 italic leading-snug">
                &ldquo;{ev.whyExplanation || "Proactive family healthcare coordination"}&rdquo;
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">AUTHORIZATION</span>
              <span className="text-emerald-800 font-medium">
                {ev.authorizationInfo || "Verified by authorized user"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">RESULT</span>
              <span className="text-slate-800 font-medium">
                {ev.resultSummary || ev.description}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-5xl pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
            Activity &amp; History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            What CareLoop and your family have done, why each action was taken, and what was confirmed.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs">
          {(
            [
              { id: "ALL", label: "All Activity" },
              { id: "REFILL", label: "Medication Refills" },
              { id: "AUTHORIZATION", label: "Authorizations" },
              { id: "PROVIDER", label: "Provider Actions" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterMode(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterMode === tab.id
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sections by Day */}
      <div className="space-y-8">
        {/* TODAY */}
        {todayEvents.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Today
              </h2>
            </div>
            <div className="space-y-3">
              {todayEvents.map(renderEventCard)}
            </div>
          </div>
        )}

        {/* YESTERDAY */}
        {yesterdayEvents.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Yesterday
              </h2>
            </div>
            <div className="space-y-3">
              {yesterdayEvents.map(renderEventCard)}
            </div>
          </div>
        )}

        {/* EARLIER */}
        {earlierEvents.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Earlier This Week
              </h2>
            </div>
            <div className="space-y-3">
              {earlierEvents.map(renderEventCard)}
            </div>
          </div>
        )}

        {filteredEvents.length === 0 && (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
            No activity events found for the selected filter.
          </div>
        )}
      </div>
    </div>
  );
}
