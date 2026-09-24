"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  CheckCircle2,
  Truck,
  AlertTriangle,
  UserCheck,
} from "lucide-react";
import { useCareLoop } from "@/providers/AppProvider";
import { useCareContinuity } from "@/hooks/useCareContinuity";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { RefillWorkflowModal } from "@/components/workflow/RefillWorkflowModal";

export function CareScreen() {
  const {
    tasks,
    medications,
    members,
    records,
    approveTask,
    activeUser,
  } = useCareLoop();

  const {
    isAvailable,
    primaryCoordinator,
    toggleCoordinatorAvailability,
  } = useCareContinuity();

  const [refillModalOpen, setRefillModalOpen] = useState(false);
  const [selectedMedId, setSelectedMedId] = useState("med-thyronorm");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [customMemberFilter, setCustomMemberFilter] = useState<{ userId: string; filter: string } | null>(null);

  const filterMemberId =
    customMemberFilter?.userId === activeUser?.id
      ? customMemberFilter.filter
      : activeUser?.role === "DEPENDENT"
      ? activeUser.id
      : "ALL";

  const relevantTasks = tasks.filter(
    (t) => filterMemberId === "ALL" || t.familyMemberId === filterMemberId || t.ownerId === filterMemberId
  );
  const relevantMeds = medications.filter(
    (m) => filterMemberId === "ALL" || m.patientId === filterMemberId
  );

  // 1. NEEDS APPROVAL: E.g. Thyronorm refill, tasks requiring authorization
  const lowStockMeds = relevantMeds.filter((m) => m.remainingDays <= 5 && m.status === "ACTIVE");
  const needsApprovalTasks = relevantTasks.filter(
    (t) => t.status === "WAITING_FOR_APPROVAL" || (t.status === "NEEDS_ATTENTION" && t.requiresApproval)
  );

  // 2. IN PROGRESS: Active running tasks, deliveries
  const inProgressTasks = relevantTasks.filter(
    (t) =>
      t.status === "IN_PROGRESS" ||
      (t.status === "WAITING_FOR_EXTERNAL" && t.description.toLowerCase().includes("transit"))
  );

  // 3. WAITING: External dependencies (hospital reports, callbacks)
  const waitingTasks = relevantTasks.filter(
    (t) =>
      t.status === "WAITING_FOR_EXTERNAL" &&
      !t.description.toLowerCase().includes("transit")
  );
  const pendingRecords = records.filter(
    (r) => r.pipelineStatus !== "VERIFIED" && (filterMemberId === "ALL" || r.patientId === filterMemberId)
  );

  // 4. COMPLETED: Finished care pipelines
  const completedTasks = relevantTasks.filter((t) => t.status === "COMPLETED");

  const handleOpenRefill = (medId: string) => {
    setSelectedMedId(medId);
    setRefillModalOpen(true);
  };

  const handleQuickApprove = async (taskId: string) => {
    await approveTask(taskId);
    setToastMessage("Workflow approved and dispatched.");
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-8 max-w-5xl pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
            Care Coordination
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Active workflows, approvals, in-transit deliveries, and external dependencies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/continuity">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 border-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Continuity Protocol</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleCoordinatorAvailability()}
            className={`text-xs gap-1.5 ${
              isAvailable ? "text-slate-700" : "text-amber-800 border-amber-300 bg-amber-50"
            }`}
          >
            {isAvailable ? (
              <>
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Coordinator: Available</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Coordinator: Unavailable</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Perspective Filter Tabs */}
      <div className="flex items-center justify-between">
        <Tabs
          tabs={[
            { id: "ALL", label: "All Family Workflows", count: tasks.length },
            { id: "mem-anita", label: "Anita (Mother)", count: tasks.filter(t => t.familyMemberId === "mem-anita" || t.ownerId === "mem-anita").length },
            { id: "mem-ramesh", label: "Ramesh (Father)", count: tasks.filter(t => t.familyMemberId === "mem-ramesh" || t.ownerId === "mem-ramesh").length },
          ]}
          activeTab={filterMemberId}
          onChange={(val) => setCustomMemberFilter({ userId: activeUser?.id || "", filter: val })}
        />
      </div>

      {/* MONITORING CARD */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5 text-teal-700" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              All family care is monitored.
            </h2>
            <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
              CareLoop tracks prescriptions, appointments, courier deliveries, and authorizations
              across {members.length} family members. Any gap triggers an immediate notification.
            </p>
          </div>
        </div>

        <div className="px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-left md:text-right shrink-0">
          <div className="text-[10px] font-mono text-slate-500 uppercase">Primary Coordinator</div>
          <div className="text-xs font-bold text-slate-900">
            {primaryCoordinator?.name} ({primaryCoordinator?.location})
          </div>
        </div>
      </div>

      {/* 4 WORKFLOW STAGES (Columns / Sections) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* COLUMN 1: NEEDS APPROVAL */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b-2 border-amber-500">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                Needs Approval
              </h3>
            </div>
            <Badge variant="warning" className="text-[10px]">
              {lowStockMeds.length + needsApprovalTasks.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {/* Low stock medication needing approval */}
            {lowStockMeds.map((med) => {
              const patient = members.find((m) => m.id === med.patientId);
              return (
                <div
                  key={`appr-med-${med.id}`}
                  className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 shadow-xs space-y-3"
                >
                  <div>
                    <span className="text-[11px] font-bold text-amber-900 block">
                      Refill: {patient?.name}&apos;s {med.name}
                    </span>
                    <p className="text-xs text-slate-600 mt-1">
                      {med.currentStockUnits} tabs left ({med.remainingDays} days). Shortage detected.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-amber-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">₹{med.costEstimate}</span>
                    <Button
                      size="sm"
                      onClick={() => handleOpenRefill(med.id)}
                      className="h-7 text-xs bg-slate-900 hover:bg-slate-800 text-white px-2.5"
                    >
                      Review &amp; Approve
                    </Button>
                  </div>
                </div>
              );
            })}

            {/* Tasks requiring approval */}
            {needsApprovalTasks.map((t) => (
              <div
                key={`appr-task-${t.id}`}
                className="p-4 rounded-xl border border-amber-200 bg-white shadow-xs space-y-3"
              >
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{t.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{t.description}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">Due {t.dueDate}</span>
                  <Button
                    size="sm"
                    onClick={() => handleQuickApprove(t.id)}
                    className="h-7 text-xs bg-slate-900 hover:bg-slate-800 text-white px-2.5"
                  >
                    Approve
                  </Button>
                </div>
              </div>
            ))}

            {lowStockMeds.length === 0 && needsApprovalTasks.length === 0 && (
              <div className="p-6 text-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-500 space-y-2">
                <Image
                  src="/images/illustrations/all-caught-up.png"
                  alt="All caught up"
                  width={48}
                  height={48}
                  className="w-12 h-12 object-contain mx-auto opacity-90"
                />
                <p className="font-semibold text-slate-700">All caught up</p>
                <p className="text-[11px] text-slate-400">No approvals or refills pending human sign-off.</p>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 2: IN PROGRESS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b-2 border-sky-500">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                In Progress
              </h3>
            </div>
            <Badge variant="neutral" className="text-[10px]">
              {inProgressTasks.length + 1}
            </Badge>
          </div>

          <div className="space-y-3">
            {/* Active Pharmacy Courier */}
            <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/30 shadow-xs space-y-3">
              <div>
                <div className="flex items-center gap-1.5 text-sky-800 text-xs font-bold mb-0.5">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Delhivery Express Cold-Chain</span>
                </div>
                <p className="text-xs text-slate-600">
                  Anita Rao&apos;s Thyronorm 50 mcg (AWB: SANDBOX-AWB-DL-882190)
                </p>
              </div>
              <div className="pt-2 border-t border-sky-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 font-mono">In Transit</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setRefillModalOpen(true)}
                  className="h-7 text-xs border-sky-300 text-sky-900 hover:bg-sky-100 px-2.5"
                >
                  Track &amp; Advance
                </Button>
              </div>
            </div>

            {/* In Progress Tasks */}
            {inProgressTasks.map((t) => (
              <div
                key={`prog-task-${t.id}`}
                className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2"
              >
                <h4 className="font-bold text-xs text-slate-900">{t.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-2">{t.description}</p>
                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                  <span>Assigned to CareLoop</span>
                  <span className="text-sky-700 font-semibold">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 3: WAITING */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b-2 border-purple-500">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                Waiting
              </h3>
            </div>
            <Badge variant="neutral" className="text-[10px]">
              {waitingTasks.length + pendingRecords.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {/* Pending OCR Record Verification */}
            {pendingRecords.slice(0, 2).map((rec) => (
              <div
                key={`wait-rec-${rec.id}`}
                className="p-4 rounded-xl border border-purple-100 bg-purple-50/30 shadow-xs space-y-2"
              >
                <div className="text-[11px] font-bold text-purple-900">
                  Hospital Report Requested
                </div>
                <h4 className="font-bold text-xs text-slate-900">{rec.title}</h4>
                <p className="text-xs text-slate-500">{rec.hospital} • OCR extraction pending review</p>
                <div className="pt-2 border-t border-purple-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">Vault Staged</span>
                  <Link href="/records" className="text-xs font-semibold text-purple-800 hover:underline">
                    Verify →
                  </Link>
                </div>
              </div>
            ))}

            {waitingTasks.map((t) => (
              <div
                key={`wait-task-${t.id}`}
                className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2"
              >
                <h4 className="font-bold text-xs text-slate-900">{t.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-2">{t.description}</p>
                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                  Waiting on external system
                </div>
              </div>
            ))}

            {pendingRecords.length === 0 && waitingTasks.length === 0 && (
              <div className="p-6 text-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                No external tasks waiting.
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 4: COMPLETED */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b-2 border-emerald-500">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                Completed
              </h3>
            </div>
            <Badge variant="neutral" className="text-[10px]">
              {completedTasks.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {completedTasks.slice(0, 4).map((t) => (
              <div
                key={`comp-task-${t.id}`}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900">{t.title}</h4>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{t.description}</p>
                <div className="pt-2 border-t border-slate-100 text-[10px] text-emerald-700 font-semibold flex items-center justify-between">
                  <span>Done</span>
                  <span>{t.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Refill Workflow Modal */}
      <RefillWorkflowModal
        isOpen={refillModalOpen}
        onClose={() => setRefillModalOpen(false)}
        medicationId={selectedMedId}
      />
    </div>
  );
}
