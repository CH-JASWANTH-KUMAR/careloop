"use client";

import React from "react";
import {
  FileText,
  Calendar,
  Pill,
  Truck,
  CreditCard,
  PhoneCall,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Task } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useCareLoop } from "@/providers/AppProvider";
import { formatDate } from "@/lib/utils";

interface TaskContextDrawerProps {
  task: Task | null;
  onClose: () => void;
  onSnooze?: (taskId: string) => void;
  onEscalate?: (taskId: string) => void;
}

export function TaskContextDrawer({
  task,
  onClose,
  onSnooze,
  onEscalate,
}: TaskContextDrawerProps) {
  const { members, records, medications, appointments } = useCareLoop();

  if (!task) return null;

  const patient = members.find((m) => m.id === task.familyMemberId);
  const owner = members.find((m) => m.id === task.ownerId);

  // Linked items
  const linkedRecord = records.find(
    (r) => r.id === task.relatedRecordId || r.patientId === task.familyMemberId
  );
  const linkedMed = medications.find(
    (m) =>
      m.id === task.relatedMedicationId ||
      (m.patientId === task.familyMemberId && task.title.toLowerCase().includes(m.name.toLowerCase()))
  );
  const linkedAppt = appointments.find(
    (a) =>
      a.id === task.relatedAppointmentId ||
      (a.patientId === task.familyMemberId &&
        task.title.toLowerCase().includes("appointment"))
  );

  return (
    <Modal
      isOpen={!!task}
      onClose={onClose}
      title="Task Context & Operational Dossier"
      description={`Task ID: ${task.id} • Source: ${task.source}`}
      maxWidth="lg"
    >
      <div className="space-y-5 text-xs">
        {/* Core Task Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-bold text-slate-500 uppercase">
              Operational Priority
            </span>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  task.priority === "URGENT"
                    ? "urgent"
                    : task.priority === "HIGH"
                    ? "warning"
                    : "neutral"
                }
              >
                {task.priority}
              </Badge>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-semibold">
                {task.status.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          <h3 className="text-base font-bold text-slate-900">{task.title}</h3>
          <p className="text-slate-600 leading-relaxed">{task.description}</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200/60">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                Patient
              </span>
              <span className="font-bold text-slate-900">
                {patient?.name} ({patient?.relationship})
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                Assigned Coordinator
              </span>
              <span className="font-medium text-slate-800">
                {owner?.name} ({owner?.role})
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                Due Date
              </span>
              <span className="font-mono text-slate-800">{task.dueDate}</span>
            </div>
          </div>

          {task.escalationReason && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong>Escalation Reason:</strong> {task.escalationReason}
              </div>
            </div>
          )}

          {task.snoozedUntil && (
            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>Snoozed until: {formatDate(task.snoozedUntil)}</span>
            </div>
          )}
        </div>

        {/* Linked External Rails */}
        {task.externalRailRef && (
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Active Provider Rail
            </h4>
            <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {task.externalRailRef.type === "DELHIVERY" && <Truck className="w-4 h-4 text-indigo-600" />}
                {task.externalRailRef.type === "PINE_LABS" && <CreditCard className="w-4 h-4 text-amber-600" />}
                {task.externalRailRef.type === "GNANI" && <PhoneCall className="w-4 h-4 text-sky-600" />}
                <div>
                  <span className="font-bold text-slate-900 block">{task.externalRailRef.type}</span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {task.externalRailRef.referenceId}
                  </span>
                </div>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                {task.externalRailRef.status}
              </span>
            </div>
          </div>
        )}

        {/* Linked Context: Medication */}
        {linkedMed && (
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-900">Linked Medication Inventory</span>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                {linkedMed.status}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 bg-white p-2.5 rounded-lg border border-emerald-100">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Medicine</span>
                <span className="font-bold text-slate-900">{linkedMed.name}</span>
                <span className="text-slate-500 block text-[11px]">{linkedMed.dosage}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Current Stock</span>
                <span className="font-mono font-bold text-slate-900">
                  {linkedMed.currentStockUnits} tablets
                </span>
                <span className="text-amber-700 block text-[11px] font-semibold">
                  ~{linkedMed.remainingDays} days left
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Schedule</span>
                <span className="text-slate-700 text-[11px] block">{linkedMed.frequency}</span>
                <span className="text-slate-500 block text-[10px]">
                  Refill at &le; 5 days
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Linked Context: Health Record */}
        {linkedRecord && (
          <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-slate-900">Linked Health Record</span>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-semibold">
                {linkedRecord.documentType.replace(/_/g, " ")}
              </span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-purple-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{linkedRecord.title}</span>
                <span className="font-mono text-[11px] text-slate-400">
                  {formatDate(linkedRecord.date)}
                </span>
              </div>
              <div className="text-slate-600 text-[11px]">
                Dr. {linkedRecord.doctor} • {linkedRecord.hospital}
              </div>
              {linkedRecord.extractedMetadata?.diagnosisSummary && (
                <p className="text-slate-600 text-[11px] bg-slate-50 p-1.5 rounded">
                  {linkedRecord.extractedMetadata.diagnosisSummary}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Linked Context: Appointment */}
        {linkedAppt && (
          <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-900">Linked Appointment</span>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                {linkedAppt.status}
              </span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>Dr. {linkedAppt.doctor} ({linkedAppt.speciality})</span>
                <span className="font-mono text-[11px] text-blue-700">
                  {linkedAppt.date} at {linkedAppt.time}
                </span>
              </div>
              <div className="text-slate-500 text-[11px] mt-0.5">
                {linkedAppt.hospital} • {linkedAppt.location}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons in Context Drawer */}
        <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {onSnooze && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSnooze(task.id)}
                className="text-xs gap-1 text-slate-600"
              >
                <Clock className="w-3.5 h-3.5" />
                Snooze Task
              </Button>
            )}
            {onEscalate && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEscalate(task.id)}
                className="text-xs gap-1 text-red-600 border-red-200 hover:bg-red-50"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Escalate
              </Button>
            )}
          </div>

          <Button variant="secondary" size="sm" onClick={onClose} className="text-xs">
            Close Dossier
          </Button>
        </div>
      </div>
    </Modal>
  );
}
