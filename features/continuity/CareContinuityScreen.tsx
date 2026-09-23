"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Calendar,
  Pill,
  FileText,
  Truck,
  ArrowRight,
  Clock,
  AlertTriangle,
  RotateCcw,
  Activity,
  CheckCircle2,
  AlertOctagon,
} from "lucide-react";
import { useCareLoop } from "@/providers/AppProvider";
import { useCareContinuity } from "@/hooks/useCareContinuity";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function CareContinuityScreen() {
  const {
    family,
    members,
    medications,
    tasks,
    appointments,
    records,
    activeUser,
    switchActiveUser,
    activity,
    resumeCareCoordination,
  } = useCareLoop();

  const {
    isAvailable,
    primaryCoordinator,
    tasksNeedingAttention,
    toggleCoordinatorAvailability,
    takeOverCareCoordination,
  } = useCareContinuity();

  const [activeTab, setActiveTab] = useState<"radar" | "handover">("radar");
  const [handoverReason, setHandoverReason] = useState("Traveling for work / Medical emergency");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Other members who can take over
  const eligibleSuccessors = members.filter(
    (m) => m.id !== family?.primaryCoordinatorId && m.role !== "DEPENDENT"
  );

  const handleTakeover = (newCoordinatorId: string) => {
    takeOverCareCoordination(newCoordinatorId, handoverReason);
    const newCoord = members.find((m) => m.id === newCoordinatorId);
    setSuccessMessage(
      `Care coordination successfully transferred to ${newCoord?.name || "new coordinator"}. All active tasks reassigned.`
    );
    setTimeout(() => setSuccessMessage(null), 6000);
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "MEDICATION":
      case "REFILL":
        return <Pill className="w-4 h-4 text-emerald-600" />;
      case "APPOINTMENT":
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case "RECORD":
      case "LAB":
        return <FileText className="w-4 h-4 text-purple-600" />;
      default:
        return <Truck className="w-4 h-4 text-amber-600" />;
    }
  };

  // Derive items for the 4 Continuity Radar buckets
  // 1. TODAY: Medicines due today, appointments today, urgent tasks
  const todayMeds = medications.filter((m) => m.currentStockUnits > 0);
  const todayTasks = tasks.filter((t) => t.dueDate === "Today" || t.priority === "URGENT");
  const todayAppointments = appointments.filter((a) => a.date.includes("2026-09-23") || a.date.includes("Today"));

  // 2. THIS WEEK: Refills needed (<= 7 remaining days), upcoming appointments, report reviews
  const thisWeekRefills = medications.filter((m) => m.remainingDays <= 7);
  const thisWeekAppointments = appointments.filter((a) => !a.date.includes("Today"));
  const pendingRecords = records.filter((r) => r.pipelineStatus !== "VERIFIED");

  // 3. WAITING: Family authorization, deliveries in transit, external callbacks
  const waitingTasks = tasks.filter(
    (t) =>
      t.status === "WAITING_FOR_APPROVAL" ||
      t.status === "WAITING_FOR_EXTERNAL" ||
      t.status === "IN_PROGRESS" ||
      t.description.toLowerCase().includes("transit") ||
      t.description.toLowerCase().includes("delhivery")
  );

  // 4. ESCALATED: Acute alerts, stock below safety threshold, coordinator unavailable
  const escalatedItems = [
    ...medications
      .filter((m) => m.currentStockUnits <= 3)
      .map((m) => ({
        id: `esc-med-${m.id}`,
        title: `${m.name} stock critically low (${m.currentStockUnits} units left)`,
        patientId: m.patientId,
        type: "MEDICATION",
        reason: "Below 7-day family safety threshold. Risk of treatment discontinuation.",
        actionUrl: "/agent",
        actionText: "Authorize Refill",
      })),
    ...(!isAvailable
      ? [
          {
            id: "esc-coord-unavailable",
            title: `Primary coordinator ${primaryCoordinator?.name} marked unavailable`,
            patientId: primaryCoordinator?.id || "mem-arjun",
            type: "CONTINUITY",
            reason: "Care coordination must be handed over to ensure pending tasks are not stalled.",
            actionUrl: "#handover",
            actionText: "Assign Successor",
          },
        ]
      : []),
    ...tasks
      .filter((t) => t.priority === "URGENT" && t.status !== "COMPLETED")
      .map((t) => ({
        id: `esc-task-${t.id}`,
        title: t.title,
        patientId: t.familyMemberId,
        type: "TASK",
        reason: t.description,
        actionUrl: "/tasks",
        actionText: "Resolve Task",
      })),
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Care Continuity Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">Anti-Fragile Family Health</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Care Continuity & Handover
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Care should not depend on one family member remembering everything. CareLoop guarantees
            that nothing important is waiting silently.
          </p>
        </div>

        {/* Current Active User Switcher for Testing Handover */}
        <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-xl border border-slate-200 text-xs">
          <span className="text-slate-500 font-medium">Viewing as:</span>
          <select
            value={activeUser.id}
            onChange={(e) => switchActiveUser(e.target.value)}
            className="font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.relationship} • {m.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center gap-3">
          <UserCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* REASSURANCE BANNER — Nothing important is waiting silently */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white rounded-2xl p-6 shadow-md border border-emerald-800/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-400">
                Coordination Heartbeat Active
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              &ldquo;Nothing important is waiting silently.&rdquo;
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              CareLoop continuously monitors prescription stocks, doctor appointments, logistics
              consignments, and pending authorizations across all {members.length} family members.
              Lapses trigger proactive prompts with auditable context.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-right">
            <div className="text-[10px] font-mono text-emerald-300 uppercase">Monitored Rails</div>
            <div className="text-xs font-bold text-white">
              {medications.length} Meds • {appointments.length} Consults • 3 Providers
            </div>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("radar")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === "radar"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Activity className="w-4 h-4" />
          Care Continuity Radar
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-mono ${
              activeTab === "radar" ? "bg-slate-800 text-slate-200" : "bg-slate-200 text-slate-700"
            }`}
          >
            4 Tracks
          </span>
        </button>
        <button
          onClick={() => setActiveTab("handover")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === "handover"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Single Point of Failure Protection & Handover
          {!isAvailable && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>
      </div>

      {activeTab === "radar" && (
        <div className="space-y-6">
          {/* 4 Categorized Continuity Radar Buckets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. TODAY */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">TODAY</h3>
                    <p className="text-[11px] text-slate-500">
                      Medicines due, consultations & immediate actions
                    </p>
                  </div>
                </div>
                <Badge variant="success" className="text-[10px]">
                  {todayMeds.length + todayTasks.length + todayAppointments.length} Items
                </Badge>
              </div>

              <div className="space-y-2.5">
                {/* Medicines Due Today */}
                {todayMeds.map((med) => {
                  const patient = members.find((m) => m.id === med.patientId);
                  return (
                    <div
                      key={`today-med-${med.id}`}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <Pill className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <div className="font-semibold text-slate-900">
                            {med.name} ({med.dosage})
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {patient?.name} • {med.instructions || med.frequency}
                          </div>
                        </div>
                      </div>
                      <Badge variant="neutral" className="text-[10px] shrink-0">
                        {med.currentStockUnits} left
                      </Badge>
                    </div>
                  );
                })}

                {/* Consultations Today */}
                {todayAppointments.map((apt) => (
                  <div
                    key={`today-apt-${apt.id}`}
                    className="p-3 rounded-xl border border-blue-100 bg-blue-50/40 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">{apt.doctor}</div>
                        <div className="text-[11px] text-slate-500">
                          {apt.speciality} • {apt.time}
                        </div>
                      </div>
                    </div>
                    <Badge variant="warning" className="text-[10px] shrink-0">
                      CONFIRMED
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. THIS WEEK */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">THIS WEEK</h3>
                    <p className="text-[11px] text-slate-500">
                      Refills needed, reviews & required reports
                    </p>
                  </div>
                </div>
                <Badge variant="neutral" className="text-[10px]">
                  {thisWeekRefills.length + thisWeekAppointments.length + pendingRecords.length} Items
                </Badge>
              </div>

              <div className="space-y-2.5">
                {/* Refills needed */}
                {thisWeekRefills.map((med) => {
                  const patient = members.find((m) => m.id === med.patientId);
                  return (
                    <div
                      key={`tw-refill-${med.id}`}
                      className="p-3 rounded-xl border border-amber-200 bg-amber-50/40 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <Pill className="w-4 h-4 text-amber-600 shrink-0" />
                        <div>
                          <div className="font-semibold text-slate-900">
                            Refill: {med.name}
                          </div>
                          <div className="text-[11px] text-amber-800 font-medium">
                            {patient?.name} • Stock for only {med.remainingDays} day(s)
                          </div>
                        </div>
                      </div>
                      <Link href="/agent">
                        <Button size="sm" variant="outline" className="text-[11px] h-7 px-2 border-amber-300 hover:bg-amber-100">
                          Order Refill
                        </Button>
                      </Link>
                    </div>
                  );
                })}

                {/* Upcoming appointments this week */}
                {thisWeekAppointments.map((apt) => {
                  const patient = members.find((m) => m.id === apt.patientId);
                  return (
                    <div
                      key={`tw-apt-${apt.id}`}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-slate-600 shrink-0" />
                        <div>
                          <div className="font-semibold text-slate-900">
                            {apt.doctor} ({apt.speciality})
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {patient?.name} • {apt.date} at {apt.time}
                          </div>
                        </div>
                      </div>
                      <Link href="/appointments">
                        <span className="text-slate-500 hover:text-slate-800 font-mono text-[11px]">
                          Details →
                        </span>
                      </Link>
                    </div>
                  );
                })}

                {/* Pending records verification */}
                {pendingRecords.slice(0, 2).map((rec) => (
                  <div
                    key={`tw-rec-${rec.id}`}
                    className="p-3 rounded-xl border border-purple-100 bg-purple-50/40 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">{rec.title}</div>
                        <div className="text-[11px] text-slate-500">
                          {rec.documentType.replace(/_/g, " ")} • Pending clinical verification
                        </div>
                      </div>
                    </div>
                    <Link href="/records">
                      <Badge variant="warning" className="text-[10px]">
                        Verify OCR
                      </Badge>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. WAITING */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">WAITING</h3>
                    <p className="text-[11px] text-slate-500">
                      Family authorization, deliveries & doctor feedback
                    </p>
                  </div>
                </div>
                <Badge variant="warning" className="text-[10px]">
                  {waitingTasks.length > 0 ? `${waitingTasks.length} Active` : "Clear"}
                </Badge>
              </div>

              <div className="space-y-2.5">
                {waitingTasks.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-100">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                    <div className="text-xs font-semibold text-slate-700">No Blocked Tasks</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      All authorizations and delivery dispatches have concluded.
                    </p>
                  </div>
                ) : (
                  waitingTasks.map((t) => {
                    const patient = members.find((m) => m.id === t.familyMemberId);
                    return (
                      <div
                        key={`wait-${t.id}`}
                        className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/30 flex flex-col gap-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{t.title}</span>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold">
                            {t.status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">{t.description}</p>
                        <div className="pt-2 border-t border-amber-100 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500">
                            Patient: <strong className="text-slate-700">{patient?.name}</strong>
                          </span>
                          <Link href="/agent">
                            <span className="text-xs font-semibold text-amber-900 hover:underline flex items-center gap-1">
                              Authorize in Agent <ArrowRight className="w-3 h-3" />
                            </span>
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* 4. ESCALATED */}
            <div className="p-5 rounded-2xl border border-red-200 bg-red-50/20 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-red-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-red-950">ESCALATED</h3>
                    <p className="text-[11px] text-red-700">
                      Items requiring immediate human attention & clinical safety gates
                    </p>
                  </div>
                </div>
                <Badge variant={escalatedItems.length > 0 ? "urgent" : "neutral"} className="text-[10px]">
                  {escalatedItems.length} Escalations
                </Badge>
              </div>

              <div className="space-y-2.5">
                {escalatedItems.length === 0 ? (
                  <div className="p-6 text-center bg-white rounded-xl border border-red-100">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                    <div className="text-xs font-semibold text-slate-800">All Safeguards Clear</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      No safety breaches, spending cap violations, or stalled items.
                    </p>
                  </div>
                ) : (
                  escalatedItems.map((item) => {
                    const patient = members.find((m) => m.id === item.patientId);
                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl border border-red-200 bg-white shadow-xs flex flex-col gap-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-red-950">
                            <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
                            <span>{item.title}</span>
                          </div>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                            URGENT
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">{item.reason}</p>
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500">
                            Impacts: <strong>{patient?.name || "Family Unit"}</strong>
                          </span>
                          <Link href={item.actionUrl}>
                            <Button size="sm" className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white px-2.5">
                              {item.actionText}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "handover" && (
        <div className="space-y-6">
          {/* Primary Coordinator Status Card */}
          <div
            className={`p-6 rounded-2xl border transition-all ${
              !isAvailable
                ? "bg-amber-50/60 border-amber-200 shadow-sm"
                : "bg-white border-slate-200 shadow-sm"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white shrink-0 ${
                    primaryCoordinator?.role === "OWNER"
                      ? "bg-slate-900"
                      : "bg-emerald-700"
                  }`}
                >
                  {primaryCoordinator?.name.charAt(0) || "C"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">
                      {primaryCoordinator?.name || "Arjun Rao"}
                    </h2>
                    <Badge
                      variant={isAvailable ? "success" : "warning"}
                      className="text-[11px]"
                    >
                      {isAvailable ? "AVAILABLE & ACTIVE" : "CURRENTLY UNAVAILABLE"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Primary Care Coordinator for {family?.name || "The Rao Family"} •{" "}
                    {primaryCoordinator?.relationship} • {primaryCoordinator?.location}
                  </p>
                  <div className="text-xs text-slate-600 mt-2 font-medium">
                    {isAvailable ? (
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Care tasks, pharmacy orders, and appointments are actively monitored by{" "}
                        {primaryCoordinator?.name}.
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-amber-800 font-semibold">
                        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                        {primaryCoordinator?.name} is unavailable. {tasksNeedingAttention.length} tasks
                        risk stalling without coverage.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {family?.primaryCoordinatorId !== "mem-arjun" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      resumeCareCoordination("mem-arjun");
                      setSuccessMessage("Arjun Rao resumed primary care coordination. Responsibilities restored.");
                      setTimeout(() => setSuccessMessage(null), 6000);
                    }}
                    className="text-xs border-teal-300 text-teal-800 hover:bg-teal-50 gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-teal-600" />
                    <span>Resume Arjun as Coordinator</span>
                  </Button>
                )}
                <Button
                  variant={isAvailable ? "outline" : "primary"}
                  size="sm"
                  onClick={() => toggleCoordinatorAvailability()}
                  className={`text-xs gap-1.5 ${
                    isAvailable
                      ? "text-amber-700 border-amber-300 hover:bg-amber-50"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {isAvailable ? (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Mark Coordinator Unavailable
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      Mark Coordinator Available
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Critical Tasks Needing Continuity */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Active Care Tasks at Risk of Stalling
                </h3>
                <p className="text-xs text-slate-500">
                  {tasksNeedingAttention.length} tasks currently assigned to {primaryCoordinator?.name}.
                </p>
              </div>
              <Link
                href="/tasks"
                className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                View all tasks <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {tasksNeedingAttention.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <div className="font-semibold text-slate-800 text-sm">All Tasks Up To Date</div>
                <p className="text-xs text-slate-500 mt-1">
                  No active tasks are pending coordinator action right now.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasksNeedingAttention.map((t) => {
                  const patient = members.find((m) => m.id === t.familyMemberId);
                  return (
                    <div
                      key={t.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getTaskIcon(t.source)}
                            <span className="text-xs font-semibold text-slate-700">
                              {patient?.name} ({patient?.relationship})
                            </span>
                          </div>
                          <Badge
                            variant={
                              t.priority === "URGENT"
                                ? "urgent"
                                : t.priority === "HIGH"
                                ? "warning"
                                : "neutral"
                            }
                            className="text-[10px]"
                          >
                            {t.priority}
                          </Badge>
                        </div>

                        <h4 className="font-bold text-sm text-slate-900">{t.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2">{t.description}</p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Clock className="w-3 h-3" /> Due {t.dueDate}
                        </span>
                        <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {t.status.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Handover Action Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Handover Care Responsibility
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Transfer operational authority to another verified family member. All active tasks will
                be reassigned immediately.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Reason for Handover (Audit Log Note)
                </label>
                <input
                  type="text"
                  value={handoverReason}
                  onChange={(e) => setHandoverReason(e.target.value)}
                  className="mt-1.5 w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="e.g., Primary coordinator traveling for 2 weeks"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Available Successors (Authorized Family Members)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {eligibleSuccessors.map((m) => {
                    const isCurrentViewer = activeUser.id === m.id;
                    return (
                      <div
                        key={m.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-sm">{m.name}</span>
                            {isCurrentViewer && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">
                            {m.relationship} • {m.role}
                          </div>
                          <div className="text-[11px] text-slate-600 mt-2 font-mono">
                            {m.permissions.categories.length} permissions authorized
                          </div>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleTakeover(m.id)}
                          className="w-full text-xs gap-1.5 bg-slate-900 hover:bg-slate-800 text-white"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Assign as Primary
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Handover Audit History */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Care Continuity Audit Log</h3>
            <p className="text-xs text-slate-500">
              Every coordinator status update and handover event is recorded immutably.
            </p>

            <div className="divide-y divide-slate-100">
              {activity
                .filter(
                  (a) =>
                    a.actionType === "CARE_CONTINUITY_HANDOVER" ||
                    a.description.toLowerCase().includes("coordinator")
                )
                .slice(0, 5)
                .map((act) => (
                  <div key={act.id} className="py-3 first:pt-0 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900">{act.description}</span>
                      <span className="font-mono text-slate-400 text-[11px]">
                        {new Date(act.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {act.whyExplanation && (
                      <p className="text-xs text-slate-500 italic">
                        Why: &ldquo;{act.whyExplanation}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
