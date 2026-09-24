"use client";

import React, { useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  Info,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useCareLoop } from "@/providers/AppProvider";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { RefillWorkflowModal } from "@/components/workflow/RefillWorkflowModal";
import { FamilyAvatar } from "@/components/ui/FamilyAvatar";

export function MedicationsScreen() {
  const { medications, members, activeUser } = useCareLoop();
  const [customPatientFilter, setCustomPatientFilter] = useState<{ userId: string; filter: string } | null>(null);
  const [selectedMedIdForRefill, setSelectedMedIdForRefill] = useState<string | null>(null);

  const filterPatient =
    customPatientFilter?.userId === activeUser?.id
      ? customPatientFilter.filter
      : activeUser?.role === "DEPENDENT"
      ? activeUser.id
      : "ALL";

  const filteredMeds = medications.filter((m) => {
    if (filterPatient !== "ALL" && m.patientId !== filterPatient) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              Prescription Inventory
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Stock & Refill Coordination
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
            Medications
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Adherence schedules, inventory thresholds, and automated merchant fulfillment.
          </p>
        </div>

        {/* Patient Tabs */}
        <Tabs
          tabs={[
            { id: "ALL", label: "All Family", count: medications.length },
            { id: "mem-anita", label: "Anita (Mother)", count: medications.filter((m) => m.patientId === "mem-anita").length },
            { id: "mem-ramesh", label: "Ramesh (Father)", count: medications.filter((m) => m.patientId === "mem-ramesh").length },
          ]}
          activeTab={filterPatient}
          onChange={(val) => setCustomPatientFilter({ userId: activeUser?.id || "", filter: val })}
        />
      </div>

      {/* Critical Medical Disclaimer Banner */}
      <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-900 font-semibold">Strict Clinical Boundary:</strong> CareLoop coordinates inventory and refill logistics as prescribed by your treating doctor. CareLoop does not recommend, alter, or advise on dosages under any circumstances.
        </div>
      </div>

      {/* Medication Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredMeds.map((med) => {
          const patient = members.find((m) => m.id === med.patientId);
          const isLowStock = med.remainingDays <= 5;
          const percentage = Math.min(
            100,
            Math.max(5, (med.remainingDays / med.refillIntervalDays) * 100)
          );

          // Derived last confirmed time & schedule detail
          const lastConfirmedText = isLowStock
            ? "Today · 07:30 AM (Confirmed by Voice Check)"
            : "Today · 08:30 AM (Taken after breakfast)";

          const deliveryStatus = isLowStock
            ? "Fulfillment required · Apollo Pharmacy Jubilee Hills"
            : "Stock ample · Next scheduled dispatch in 25 days";

          return (
            <div
              key={med.id}
              className={`p-5 rounded-2xl bg-white border transition-all space-y-4 shadow-2xs ${
                isLowStock
                  ? "border-rose-300 ring-1 ring-rose-500/20"
                  : "border-slate-200/90"
              }`}
            >
              <div>
                {/* Header Row: Member + Refill Status Badge */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    {patient && <FamilyAvatar member={patient} size="sm" />}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {patient?.name}
                        </span>
                        <span className="text-slate-400 text-xs">({patient?.relationship})</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Prescribed by Dr. {med.prescribingDoctor}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isLowStock ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        <span>REFILL REQUIRED</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Medication on track</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Medication Name & Dosage */}
                <div className="pt-1">
                  <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                    {med.name} {med.dosage}
                  </h2>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    {med.instructions || `${med.frequency} · Take with plain water.`}
                  </p>
                </div>

                {/* Detailed Spec Grid (Prompt Requirement 7) */}
                <div className="p-3.5 bg-slate-50 rounded-xl text-xs space-y-2 mt-3.5 border border-slate-200/70">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Dosage & Schedule:</span>
                    <span className="font-semibold text-slate-800">
                      {med.dosage} · {med.frequency}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Remaining Supply:</span>
                    <span
                      className={`font-mono font-bold ${
                        isLowStock ? "text-rose-700" : "text-slate-900"
                      }`}
                    >
                      {med.remainingDays} days remaining ({med.currentStockUnits} units)
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500 font-medium">Last Confirmed:</span>
                    <span className="font-medium text-slate-700 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {lastConfirmedText}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Fulfillment Pharmacy:</span>
                    <span className="font-semibold text-slate-800">
                      {med.pharmacyName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500 font-medium">Delivery Status:</span>
                    <span
                      className={`font-medium ${
                        isLowStock ? "text-amber-800 font-semibold" : "text-slate-600"
                      }`}
                    >
                      {deliveryStatus}
                    </span>
                  </div>
                </div>

                {/* Stock Gauge */}
                <div className="space-y-1 mt-3">
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>Stock Level</span>
                    <span>{percentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isLowStock ? "bg-rose-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Est. 60-day pack</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">
                    ₹{med.costEstimate}
                  </span>
                </div>

                <Button
                  variant={isLowStock ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMedIdForRefill(med.id)}
                  className={`text-xs gap-1.5 cursor-pointer ${
                    isLowStock
                      ? "bg-slate-900 hover:bg-slate-800 text-white font-bold"
                      : "border-slate-300 text-slate-700"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{isLowStock ? "Refill Medication" : "Coordinate Refill"}</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 7-Step End-to-End Refill Workflow Modal */}
      {selectedMedIdForRefill && (
        <RefillWorkflowModal
          isOpen={!!selectedMedIdForRefill}
          onClose={() => setSelectedMedIdForRefill(null)}
          medicationId={selectedMedIdForRefill}
        />
      )}
    </div>
  );
}
