"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Pill,
  ArrowRight,
  Clock,
} from "lucide-react";
import { useCareLoop } from "@/providers/AppProvider";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RefillWorkflowModal } from "@/components/workflow/RefillWorkflowModal";

export function OverviewDashboard() {
  const {
    activeUser,
    tasks,
    medications,
    appointments,
    records,
    activity,
    members,
    approveTask,
  } = useCareLoop();

  const [refillModalOpen, setRefillModalOpen] = useState(false);
  const [selectedMedId, setSelectedMedId] = useState<string>("med-thyronorm");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. NEEDS ATTENTION: Actions requiring user decision (Red / High Priority)
  // Low stock medications (<= 5 days) + tasks waiting for approval
  const lowStockMeds = medications.filter((m) => m.remainingDays <= 5 && m.status === "ACTIVE");
  const approvalTasks = tasks.filter(
    (t) => t.status === "WAITING_FOR_APPROVAL" || (t.status === "NEEDS_ATTENTION" && t.requiresApproval)
  );

  // 2. CARELOOP IS HANDLING: Automated workflows in flight (Green)
  const confirmedAppointments = appointments.filter((a) => a.status === "UPCOMING").slice(0, 2);

  // 3. UPCOMING: Next consultations & routine care (Grey / Blue)
  const upcomingAppointments = appointments.filter((a) => a.status === "UPCOMING");

  // 4. RECENTLY COMPLETED: Short confirmation list (Green / Neutral)
  const recentCompleted = activity
    .filter(
      (ev) =>
        ev.actionType.includes("DELIVERED") ||
        ev.actionType.includes("CAPTURED") ||
        ev.actionType.includes("VERIFIED") ||
        ev.actionType.includes("GRANTED") ||
        ev.actionType.includes("UPDATED")
    )
    .slice(0, 4);

  const handleOpenRefill = (medId: string) => {
    setSelectedMedId(medId);
    setRefillModalOpen(true);
  };

  const handleQuickApproveTask = async (taskId: string) => {
    await approveTask(taskId);
    setToastMessage("Task approved and signed off.");
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-8 max-w-5xl pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Primary Header */}
      <div className="space-y-1 pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Good morning, {activeUser.name.split(" ")[0]}.
        </h1>
        <p className="text-sm text-slate-600">
          What needs your attention today across the family.
        </p>
      </div>

      {/* Quick-Action Suggestions */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
        <div className="text-xs font-semibold text-slate-500">
          Common actions
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleOpenRefill("med-thyronorm")}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-100/70 text-xs font-medium text-slate-800 transition-colors shadow-2xs text-left"
          >
            &ldquo;Make sure Mum has enough medicine for next 10 days&rdquo; →
          </button>
          <Link
            href="/appointments"
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-100/70 text-xs font-medium text-slate-800 transition-colors shadow-2xs"
          >
            &ldquo;Prepare Dad&apos;s cardiology appointment&rdquo; →
          </Link>
          <Link
            href="/records"
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-100/70 text-xs font-medium text-slate-800 transition-colors shadow-2xs"
          >
            &ldquo;Find the latest thyroid lab report&rdquo; →
          </Link>
          <Link
            href="/continuity"
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-100/70 text-xs font-medium text-slate-800 transition-colors shadow-2xs"
          >
            &ldquo;Who is handling Mum&apos;s care while I&apos;m travelling?&rdquo; →
          </Link>
        </div>
      </div>

      {/* SECTION 1: NEEDS YOUR ATTENTION (Red / Amber) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Needs Your Attention
            </h2>
          </div>
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
            {lowStockMeds.length + approvalTasks.length} Action{lowStockMeds.length + approvalTasks.length !== 1 ? "s" : ""} Required
          </span>
        </div>

        {lowStockMeds.length === 0 && approvalTasks.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
            <div className="text-sm font-bold text-slate-800">You&apos;re all caught up.</div>
            <p className="text-xs text-slate-500">
              No pending approvals or medication shortages require human action right now.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Low Stock Medication Cards */}
            {lowStockMeds.map((med) => {
              const patient = members.find((m) => m.id === med.patientId);
              return (
                <div
                  key={med.id}
                  className="p-5 rounded-2xl border-2 border-red-200 bg-white shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-red-50 text-red-700 flex items-center justify-center font-bold text-xs">
                          <Pill className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-900">
                          {patient?.name}&apos;s thyroid medicine
                        </span>
                      </div>
                      <Badge variant="urgent" className="text-[10px]">
                        {med.currentStockUnits} Tablets Left
                      </Badge>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      Refill needed in {med.remainingDays} days
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      CareLoop found {patient?.name}&apos;s verified prescription for {med.name} and
                      prepared the refill order with cold-chain delivery.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 font-medium block">
                        ₹{med.costEstimate} • {med.pharmacyName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Pine Labs + Delhivery
                      </span>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenRefill(med.id)}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 h-8 gap-1"
                    >
                      <span>Review &amp; Approve</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}

            {/* Approval Tasks */}
            {approvalTasks.map((t) => {
              const patient = members.find((m) => m.id === t.familyMemberId);
              return (
                <div
                  key={t.id}
                  className="p-5 rounded-2xl border-2 border-amber-200 bg-white shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900">
                        {patient?.name} ({patient?.relationship})
                      </span>
                      <Badge variant="warning" className="text-[10px]">
                        Awaiting Signature
                      </Badge>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{t.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2">{t.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-mono">Due: {t.dueDate}</span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleQuickApproveTask(t.id)}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 h-8"
                    >
                      Approve Action
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: CARELOOP IS HANDLING (Green) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              CareLoop Is Handling
            </h2>
          </div>
          <span className="text-xs text-slate-400">Automated Family Workflows</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Confirmed Appointment */}
          {confirmedAppointments.map((apt) => {
            const patient = members.find((m) => m.id === apt.patientId);
            return (
              <div
                key={apt.id}
                className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{patient?.name}&apos;s Appointment</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      CONFIRMED
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{apt.doctor}</h4>
                  <p className="text-xs text-slate-600">
                    {apt.speciality} • {apt.hospital}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>{apt.date} at {apt.time}</span>
                  <Link href="/appointments" className="text-teal-700 hover:underline">
                    View
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Active Logistics Courier */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Pharmacy Courier</span>
                <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                  IN TRANSIT
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">Delhivery Express Cold-Chain</h4>
              <p className="text-xs text-slate-600">
                Plot 42, Jubilee Hills • Temp-controlled parcel
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span className="font-mono">AWB: SANDBOX-AWB-DL-882190</span>
              <button onClick={() => setRefillModalOpen(true)} className="text-teal-700 hover:underline">
                Track
              </button>
            </div>
          </div>

          {/* Records OCR Pipeline */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Clinical Vault</span>
                <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                  MONITORED
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">Prescriptions &amp; Lab Vault</h4>
              <p className="text-xs text-slate-600">
                {records.length} records organized • 0 missing documents
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>All parameters extracted</span>
              <Link href="/records" className="text-teal-700 hover:underline">
                Vault →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: UPCOMING (Grey / Blue) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Upcoming Care Events
            </h2>
          </div>
          <Link href="/appointments" className="text-xs text-slate-600 hover:text-slate-900 font-medium">
            View Calendar →
          </Link>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3">
          {upcomingAppointments.slice(0, 3).map((apt) => {
            const patient = members.find((m) => m.id === apt.patientId);
            return (
              <div
                key={`up-${apt.id}`}
                className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">
                      {apt.doctor} ({apt.speciality})
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {patient?.name} • {apt.hospital}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-medium text-slate-800">{apt.date}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{apt.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: RECENTLY COMPLETED */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Recently Completed
            </h2>
          </div>
          <Link href="/activity" className="text-xs text-slate-600 hover:text-slate-900 font-medium">
            Full Audit Log →
          </Link>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs divide-y divide-slate-100 text-xs">
          {recentCompleted.map((ev) => (
            <div key={ev.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-slate-900">{ev.description}</div>
                {ev.whyExplanation && (
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {ev.whyExplanation}
                  </div>
                )}
              </div>
              <span className="text-[10px] font-mono text-slate-400 shrink-0">
                {new Date(ev.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Unified Refill Workflow Modal */}
      <RefillWorkflowModal
        isOpen={refillModalOpen}
        onClose={() => setRefillModalOpen(false)}
        medicationId={selectedMedId}
      />
    </div>
  );
}
