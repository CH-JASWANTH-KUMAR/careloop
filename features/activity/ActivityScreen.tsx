"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Bot,
  User,
  CreditCard,
  Truck,
  PhoneCall,
  Hash,
} from "lucide-react";
import { useCareLoop } from "@/providers/AppProvider";
import { ActivityEvent } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { formatDateTime } from "@/lib/utils";

export function ActivityScreen() {
  const { activity } = useCareLoop();
  const [filterActor, setFilterActor] = useState<string>("ALL");

  const filteredEvents = activity.filter((ev) => {
    if (filterActor === "USER") return ev.actor.type === "USER";
    if (filterActor === "AGENT") return ev.actor.type === "CARE_AGENT";
    if (filterActor === "RAILS")
      return (
        ev.actor.type === "PROVIDER_GNANI" ||
        ev.actor.type === "PROVIDER_PINELABS" ||
        ev.actor.type === "PROVIDER_DELHIVERY"
      );
    if (filterActor === "REFILL")
      return (
        ev.entityType === "MEDICATION" ||
        ev.entityType === "SHIPMENT" ||
        ev.entityType === "AUTHORIZATION" ||
        ev.actionType.includes("PAYMENT") ||
        ev.actionType.includes("SHIPMENT")
      );
    return true;
  });

  const getActorIcon = (type: ActivityEvent["actor"]["type"]) => {
    switch (type) {
      case "CARE_AGENT":
        return <Bot className="w-4 h-4 text-teal-600" />;
      case "PROVIDER_PINELABS":
        return <CreditCard className="w-4 h-4 text-amber-600" />;
      case "PROVIDER_DELHIVERY":
        return <Truck className="w-4 h-4 text-sky-600" />;
      case "PROVIDER_GNANI":
        return <PhoneCall className="w-4 h-4 text-indigo-600" />;
      case "USER":
      default:
        return <User className="w-4 h-4 text-slate-700" />;
    }
  };

  const getActionBadgeVariant = (actionType: ActivityEvent["actionType"]) => {
    if (
      actionType.includes("APPROVAL_GRANTED") ||
      actionType.includes("PAYMENT_AUTHORIZED") ||
      actionType.includes("PAYMENT_CAPTURED") ||
      actionType.includes("DOCUMENT_VERIFIED") ||
      actionType.includes("DELIVERED") ||
      actionType.includes("INVENTORY")
    ) {
      return "success";
    }
    if (actionType.includes("REQUESTED") || actionType.includes("WAITING")) {
      return "warning";
    }
    if (actionType.includes("DECLINED") || actionType.includes("ESCALATED") || actionType.includes("FAILED")) {
      return "urgent";
    }
    if (actionType.includes("SHIPMENT")) {
      return "info";
    }
    return "neutral";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              Audit Provenance
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Immutable Action Journal
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Activity &amp; Explanations
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Every automated decision, payment approval, and physical shipment is transparent and auditable.
          </p>
        </div>

        <Tabs
          tabs={[
            { id: "ALL", label: "All Activity", count: activity.length },
            {
              id: "REFILL",
              label: "Refill & Logistics",
              count: activity.filter(
                (a) =>
                  a.entityType === "MEDICATION" ||
                  a.entityType === "SHIPMENT" ||
                  a.entityType === "AUTHORIZATION" ||
                  a.actionType.includes("PAYMENT") ||
                  a.actionType.includes("SHIPMENT")
              ).length,
            },
            {
              id: "AGENT",
              label: "Agent Actions",
              count: activity.filter((a) => a.actor.type === "CARE_AGENT").length,
            },
            {
              id: "USER",
              label: "Family Approvals",
              count: activity.filter((a) => a.actor.type === "USER").length,
            },
            {
              id: "RAILS",
              label: "External Rails",
              count: activity.filter((a) => a.actor.type.startsWith("PROVIDER")).length,
            },
          ]}
          activeTab={filterActor}
          onChange={setFilterActor}
        />
      </div>

      {/* Explanatory Note */}
      <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-900 font-semibold">Explainability Guarantee:</strong> Actions triggered autonomously by CareLoop document a clinical or operational rationale (e.g. why a medication threshold was flagged or why an appointment was prioritized).
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 space-y-5 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {filteredEvents.map((event) => (
          <div key={event.id} className="relative flex items-start gap-4">
            {/* Timeline Node Icon */}
            <div className="absolute -left-6 top-1.5 w-6 h-6 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center shadow-xs">
              {getActorIcon(event.actor.type)}
            </div>

            {/* Event Card */}
            <div className="flex-1 p-4 rounded-xl subtle-card space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs">
                    {event.actor.name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {event.actor.type}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <Badge variant={getActionBadgeVariant(event.actionType)}>
                    {event.actionType.replace(/_/g, " ")}
                  </Badge>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {formatDateTime(event.timestamp)}
                </span>
              </div>

              {/* WHAT */}
              <div className="text-xs text-slate-800 leading-relaxed font-semibold">
                {event.description}
              </div>

              {/* WHY DID CARELOOP DO THIS? */}
              {event.whyExplanation && (
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-950 space-y-1">
                  <span className="font-bold text-[10px] uppercase tracking-wider text-amber-800 block">
                    Why did CareLoop do this?
                  </span>
                  <p className="text-slate-700 leading-relaxed text-xs">
                    &ldquo;{event.whyExplanation}&rdquo;
                  </p>
                </div>
              )}

              {/* EXTERNAL REFERENCE & PROVENANCE METADATA */}
              <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-mono">
                <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-medium">
                  <Hash className="w-3 h-3 text-slate-400" />
                  <span>{event.entityType}: {event.entityId}</span>
                </span>
                {event.entityId.startsWith("SANDBOX-") && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200">
                    [SANDBOX]
                  </span>
                )}
                {event.metadata && (
                  <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                    {typeof event.metadata === "string"
                      ? event.metadata
                      : JSON.stringify(event.metadata)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
