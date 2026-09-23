"use client";

import React, { useState } from "react";
import {
  Pill,
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  Info,
} from "lucide-react";
import { useCareLoop } from "@/providers/AppProvider";
import { Medication } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";

export function MedicationsScreen() {
  const { medications, members, activeUser, refillMedication } = useCareLoop();
  const [filterPatient, setFilterPatient] = useState<string>("ALL");
  const [selectedMedForRefill, setSelectedMedForRefill] = useState<Medication | null>(null);
  const [isProcessingRefill, setIsProcessingRefill] = useState(false);
  const [refillSuccessMsg, setRefillSuccessMsg] = useState<string | null>(null);

  const filteredMeds = medications.filter((m) => {
    if (filterPatient !== "ALL" && m.patientId !== filterPatient) return false;
    return true;
  });

  const handleRefillConfirm = async () => {
    if (!selectedMedForRefill) return;
    setIsProcessingRefill(true);
    try {
      const result = await refillMedication(selectedMedForRefill.id);
      if (result) {
        setRefillSuccessMsg(
          `Refill authorized for ${selectedMedForRefill.name}. Charged ₹${result.auth.amount} via Pine Labs. Dispatched via Delhivery (AWB: ${result.shipment.awbNumber}).`
        );
        setTimeout(() => setRefillSuccessMsg(null), 6000);
      }
    } finally {
      setIsProcessingRefill(false);
      setSelectedMedForRefill(null);
    }
  };

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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
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
          onChange={setFilterPatient}
        />
      </div>

      {/* Critical Medical Disclaimer Banner */}
      <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-900 font-semibold">Strict Clinical Boundary:</strong> CareLoop coordinates inventory and refill logistics as prescribed by your treating doctor. CareLoop does not recommend, alter, or advise on dosages under any circumstances.
        </div>
      </div>

      {/* Success Notification */}
      {refillSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{refillSuccessMsg}</span>
          </div>
          <button
            onClick={() => setRefillSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Medication Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredMeds.map((med) => {
          const patient = members.find((m) => m.id === med.patientId);
          const isLowStock = med.remainingDays <= 5;
          const percentage = Math.min(
            100,
            Math.max(5, (med.remainingDays / med.refillIntervalDays) * 100)
          );

          return (
            <div
              key={med.id}
              className={`p-5 rounded-xl subtle-card flex flex-col justify-between transition-all space-y-4 ${
                isLowStock ? "border-l-4 border-l-red-500" : ""
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-500">
                        {patient?.name} ({patient?.relationship})
                      </span>
                      <span>•</span>
                      <Badge variant={isLowStock ? "urgent" : "success"} showDot={isLowStock}>
                        {isLowStock
                          ? `Refill in ${med.remainingDays} days`
                          : `${med.remainingDays} days left`}
                      </Badge>
                    </div>

                    <h2 className="text-base font-bold text-slate-900">{med.name}</h2>
                    <p className="text-xs font-mono font-medium text-slate-600 mt-0.5">
                      Dosage: {med.dosage}
                    </p>
                  </div>

                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isLowStock ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    <Pill className="w-5 h-5" />
                  </div>
                </div>

                {/* Stock & Refill Details Grid */}
                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-2.5 mt-3 border border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Daily Regimen:</span>
                    <span className="font-semibold text-slate-800">{med.frequency}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 text-[11px]">
                    <div>
                      <span className="text-slate-400 block uppercase text-[10px]">Remaining Quantity</span>
                      <span className="font-mono font-bold text-slate-900">{med.currentStockUnits} tablets</span>
                      <span className="text-amber-700 block text-[10px] font-semibold">({med.remainingDays} days remaining)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase text-[10px]">Refill Threshold</span>
                      <span className="font-mono text-slate-700">&le; 5 days remaining</span>
                      <span className="text-slate-500 block text-[10px]">Next: {med.nextRefillDate || "Imminent"}</span>
                    </div>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Prescription Status:</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Verified on File (Dr. {med.prescribingDoctor})
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Responsible Person:</span>
                    <span className="font-semibold text-slate-800">
                      {activeUser.name} ({activeUser.role.replace(/_/g, " ")})
                    </span>
                  </div>
                </div>

                {/* Stock Gauge */}
                <div className="space-y-1 mt-2">
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isLowStock ? "bg-red-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Fulfillment Store */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Pharmacy: <strong className="text-slate-700">{med.pharmacyName}</strong></span>
                  <span className="text-slate-400 italic text-[10px]">Dosage changes prohibited</span>
                </div>
              </div>

              {/* Refill Button */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">
                  Est. ₹{med.costEstimate} (60-day supply)
                </span>
                <Button
                  variant={isLowStock ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMedForRefill(med)}
                  className={`text-xs gap-1.5 ${
                    isLowStock ? "bg-slate-900 text-white" : "border-slate-300"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Coordinate Refill</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pine Labs Refill Authorization Modal */}
      <Modal
        isOpen={!!selectedMedForRefill}
        onClose={() => setSelectedMedForRefill(null)}
        title="Authorize Medication Refill"
        description="Pine Labs payment verification & Delhivery courier scheduling."
        maxWidth="md"
      >
        {selectedMedForRefill && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-500">Medication:</span>
                <span className="text-slate-900">{selectedMedForRefill.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dosage & Frequency:</span>
                <span className="text-slate-800 font-mono">
                  {selectedMedForRefill.dosage} ({selectedMedForRefill.frequency})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fulfillment Store:</span>
                <span className="text-slate-800">{selectedMedForRefill.pharmacyName}</span>
              </div>
              <div className="flex justify-between font-bold pt-1 border-t border-slate-200">
                <span className="text-slate-700">Estimated Cost:</span>
                <span className="text-slate-900 font-mono text-sm">
                  ₹{selectedMedForRefill.costEstimate}
                </span>
              </div>
            </div>

            {/* Pine Labs Authorization Card */}
            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-amber-950">
                  <CreditCard className="w-4 h-4 text-amber-700" /> Pine Labs Authorization
                </span>
                <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold">
                  OTP / Biometric Protected
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Charge of <strong>₹{selectedMedForRefill.costEstimate}</strong> will be authorized against The Rao Family healthcare account. Monthly spending threshold limit: ₹1,500.
              </p>
              <div className="text-[11px] text-slate-500">
                Authorized signatory: <strong className="text-slate-800">{activeUser.name}</strong>
              </div>
            </div>

            {/* Delhivery Courier Notice */}
            <div className="p-3 rounded-xl border border-sky-200 bg-sky-50 text-sky-900 flex items-start gap-2">
              <Truck className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Delhivery Cold Chain Dispatch:</span>
                <p className="text-[11px] text-sky-800 mt-0.5">
                  Package will be picked up from Apollo Begumpet Hub and delivered within 24 hours to Jubilee Hills, Hyderabad.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setSelectedMedForRefill(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                isLoading={isProcessingRefill}
                onClick={handleRefillConfirm}
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
