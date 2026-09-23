"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  Calendar,
  Pill,
  ArrowRight,
  ShieldCheck,
  Bot,
  Truck,
  ChevronRight,
  CreditCard,
} from "lucide-react";
import { useCareLoop } from "@/providers/AppProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";

export function OverviewDashboard() {
  const {
    family,
    activeUser,
    tasks,
    medications,
    appointments,
    members,
    refillMedication,
    approveTask,
  } = useCareLoop();

  const [refillModalMedId, setRefillModalMedId] = useState<string | null>(null);
  const [isRefilling, setIsRefilling] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Partition actionable state
  const urgentTasks = tasks.filter((t) => t.status === "NEEDS_ATTENTION");

  const waitingTasks = tasks.filter((t) => t.status === "WAITING_FOR_APPROVAL");

  const inProgressTasks = tasks.filter(
    (t) => t.status === "IN_PROGRESS" || t.status === "WAITING_FOR_EXTERNAL"
  );

  const upcomingAppointments = appointments
    .filter((a) => a.status === "UPCOMING")
    .slice(0, 2);

  const lowStockMeds = medications.filter(
    (m) => m.remainingDays <= 5 && m.status === "ACTIVE"
  );

  const handleQuickRefill = async (medId: string) => {
    setIsRefilling(true);
    try {
      const res = await refillMedication(medId);
      if (res) {
        setSuccessNotice(
          `Refill authorized via Pine Labs (₹${res.auth.amount}) & dispatched via Delhivery (AWB: ${res.shipment.awbNumber})`
        );
        setTimeout(() => setSuccessNotice(null), 6000);
      }
    } finally {
      setIsRefilling(false);
      setRefillModalMedId(null);
    }
  };

  const handleQuickApprove = async (taskId: string) => {
    await approveTask(taskId);
    setSuccessNotice("Approval recorded and signed off for The Rao Family.");
    setTimeout(() => setSuccessNotice(null), 5000);
  };

  const selectedRefillMed = medications.find((m) => m.id === refillModalMedId);
  const selectedRefillPatient = members.find(
    (m) => m.id === selectedRefillMed?.patientId
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Triage Headline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-teal-100/70 text-teal-800 border border-teal-200">
              Command Centre
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Live Health Graph
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Good morning, {activeUser.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Here is what needs your attention right now for{" "}
            <strong className="text-slate-700 font-semibold">{family?.name || "The Rao Family"}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/agent">
            <Button variant="primary" size="md" className="gap-2 bg-slate-900">
              <Bot className="w-4 h-4 text-teal-400" />
              <span>Ask Care Agent</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successNotice}</span>
          </div>
          <button
            onClick={() => setSuccessNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Primary Triage Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SECTION 1: TODAY / NEEDS ATTENTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Action Required Today
              </h2>
            </div>
            <Badge variant="urgent" showDot>
              {urgentTasks.length + lowStockMeds.length} items
            </Badge>
          </div>

          <div className="space-y-3">
            {/* Urgent Refill Item */}
            {lowStockMeds.map((med) => {
              const patient = members.find((m) => m.id === med.patientId);
              return (
                <div
                  key={med.id}
                  className="p-4 rounded-xl subtle-card border-l-4 border-l-red-500 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Badge variant="urgent">Refill Due in {med.remainingDays} days</Badge>
                        <span className="text-[11px] font-mono text-slate-400">
                          {med.currentStockUnits} tabs left
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {patient?.name}&apos;s {med.name}
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {med.dosage} • {med.frequency}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center shrink-0">
                      <Pill className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      Est. ₹{med.costEstimate} • Apollo Pharmacy
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setRefillModalMedId(med.id)}
                      className="bg-slate-900 text-xs h-7"
                    >
                      Coordinate Refill
                    </Button>
                  </div>
                </div>
              );
            })}

            {/* Other Urgent Tasks */}
            {urgentTasks.map((task) => {
              const member = members.find((m) => m.id === task.familyMemberId);
              return (
                <div
                  key={task.id}
                  className="p-4 rounded-xl subtle-card border-l-4 border-l-amber-500 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Badge variant="warning">{task.priority}</Badge>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Due {formatDate(task.dueDate)}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{task.title}</h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {task.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Patient: <strong className="text-slate-800">{member?.name}</strong>
                    </span>
                    <Link href="/tasks">
                      <span className="text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1">
                        View Task <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </Link>
                  </div>
                </div>
              );
            })}

            {urgentTasks.length === 0 && lowStockMeds.length === 0 && (
              <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                No critical actions required today.
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: WAITING FOR APPROVAL / IN PROGRESS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Pending Approvals & In Flight
              </h2>
            </div>
            <Badge variant="warning">{waitingTasks.length + inProgressTasks.length}</Badge>
          </div>

          <div className="space-y-3">
            {waitingTasks.map((task) => {
              const reqApprover = members.find(
                (m) => m.id === task.requiredApprovalFromId
              );
              return (
                <div
                  key={task.id}
                  className="p-4 rounded-xl subtle-card border-l-4 border-l-amber-500 bg-amber-50/20 space-y-2.5"
                >
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Badge variant="warning">Requires Approval</Badge>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Approver: {reqApprover?.name || "Family Member"}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{task.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {task.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500">
                      Requested by Meera Rao
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleQuickApprove(task.id)}
                      className="h-7 text-xs bg-emerald-700 hover:bg-emerald-800"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve Now
                    </Button>
                  </div>
                </div>
              );
            })}

            {inProgressTasks.map((task) => {
              const owner = members.find((m) => m.id === task.ownerId);
              return (
                <div key={task.id} className="p-4 rounded-xl subtle-card space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Badge variant="neutral">In Progress</Badge>
                        <span className="text-[11px] text-slate-400">
                          Owner: {owner?.name}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {task.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {task.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Target: {formatDate(task.dueDate)}
                    </span>
                    <Link
                      href="/appointments"
                      className="text-teal-700 hover:underline font-medium"
                    >
                      Open Prep Packet →
                    </Link>
                  </div>
                </div>
              );
            })}

            {waitingTasks.length === 0 && inProgressTasks.length === 0 && (
              <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                No items waiting for external action.
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: UPCOMING & LIVE LOGISTICS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Upcoming & Physical Rails
              </h2>
            </div>
            <Badge variant="info">{upcomingAppointments.length} events</Badge>
          </div>

          <div className="space-y-3">
            {/* Live Delhivery Delivery Card */}
            <div className="p-4 rounded-xl subtle-card border-sky-200 bg-sky-50/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-sky-900">
                  <Truck className="w-4 h-4 text-sky-700" /> Delhivery Healthcare Tracking
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-semibold">
                  AWB DL928374619
                </span>
              </div>
              <p className="text-xs text-slate-700 font-medium">
                Atorvastatin 20mg Monthly Replenishment
              </p>
              <div className="text-[11px] text-slate-500 space-y-1 bg-white p-2 rounded border border-sky-100">
                <div className="flex justify-between">
                  <span>Destination:</span>
                  <span className="font-semibold text-slate-800">
                    Jubilee Hills, Hyderabad
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-semibold text-emerald-700">Delivered</span>
                </div>
              </div>
            </div>

            {/* Upcoming Appointments */}
            {upcomingAppointments.map((apt) => {
              const patient = members.find((m) => m.id === apt.patientId);
              return (
                <div key={apt.id} className="p-4 rounded-xl subtle-card space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Badge variant="info">Upcoming Consultation</Badge>
                        <span className="text-[11px] font-mono text-slate-500">
                          {formatDate(apt.date)}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {apt.doctor}
                      </h3>
                      <p className="text-xs text-slate-600">
                        {apt.speciality} • {apt.hospital}
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-1">
                    <span className="text-[11px] text-slate-500 font-semibold block">
                      Patient: {patient?.name} ({patient?.relationship})
                    </span>
                    <p className="text-slate-600 line-clamp-2">{apt.notes}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">{apt.time}</span>
                    <Link
                      href="/appointments"
                      className="text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1"
                    >
                      Pre-visit Pack <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pine Labs Payment & Refill Confirmation Modal */}
      <Modal
        isOpen={!!refillModalMedId}
        onClose={() => setRefillModalMedId(null)}
        title="Coordinate Medication Refill"
        description="Pine Labs payment authorization and Delhivery cold-chain express dispatch."
        maxWidth="md"
      >
        {selectedRefillMed && (
          <div className="space-y-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">Patient:</span>
                <span className="text-slate-900 font-bold">
                  {selectedRefillPatient?.name} ({selectedRefillPatient?.relationship})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Prescription:</span>
                <span className="text-slate-900 font-semibold">
                  {selectedRefillMed.name} ({selectedRefillMed.dosage})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Stock:</span>
                <span className="text-red-700 font-bold font-mono">
                  {selectedRefillMed.currentStockUnits} tablets (3 days remaining)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fulfillment Store:</span>
                <span className="text-slate-800">{selectedRefillMed.pharmacyName}</span>
              </div>
            </div>

            {/* Pine Labs Authorization Card */}
            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-amber-900">
                  <CreditCard className="w-4 h-4 text-amber-700" /> Pine Labs Authorization
                </span>
                <span className="font-mono text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-semibold">
                  2FA Protected
                </span>
              </div>
              <p className="text-slate-600">
                You are authorizing a charge of{" "}
                <strong className="text-slate-900 font-bold">
                  ₹{selectedRefillMed.costEstimate}
                </strong>{" "}
                from the Rao Family health coordination limit (Cap: ₹1,500).
              </p>
              <div className="text-[11px] text-slate-500">
                Approver: <strong className="text-slate-700">{activeUser.name}</strong>
              </div>
            </div>

            <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-900 flex items-start gap-2">
              <Truck className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Automatic Logistics Integration:</span>
                <p className="text-[11px] text-sky-800 mt-0.5">
                  Upon authorization, Delhivery Healthcare Express will pick up the package from Apollo Begumpet Hub and deliver directly to Jubilee Hills tomorrow.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setRefillModalMedId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                isLoading={isRefilling}
                onClick={() => handleQuickRefill(selectedRefillMed.id)}
                className="bg-slate-900 text-white gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Authorize & Dispatch</span>
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
